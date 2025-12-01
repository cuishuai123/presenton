from collections.abc import AsyncGenerator
import os
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlmodel import SQLModel

from models.sql.async_presentation_generation_status import (
    AsyncPresentationGenerationTaskModel,
)
from models.sql.image_asset import ImageAsset
from models.sql.key_value import KeyValueSqlModel
from models.sql.ollama_pull_status import OllamaPullStatus
from models.sql.presentation import PresentationModel
from models.sql.slide import SlideModel
from models.sql.presentation_layout_code import PresentationLayoutCodeModel
from models.sql.template import TemplateModel
from models.sql.webhook_subscription import WebhookSubscription
from utils.db_utils import get_database_url_and_connect_args


database_url, connect_args = get_database_url_and_connect_args()

sql_engine: AsyncEngine = create_async_engine(database_url, connect_args=connect_args)
async_session_maker = async_sessionmaker(sql_engine, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


# Container DB (Lives inside the container)
container_db_url = "sqlite+aiosqlite:////app/container.db"
container_db_engine: AsyncEngine = create_async_engine(
    container_db_url, connect_args={"check_same_thread": False}
)
container_db_async_session_maker = async_sessionmaker(
    container_db_engine, expire_on_commit=False
)


async def get_container_db_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with container_db_async_session_maker() as session:
        yield session


# Create Database and Tables
async def create_db_and_tables():
    async with sql_engine.begin() as conn:
        # 先创建所有表
        await conn.run_sync(
            lambda sync_conn: SQLModel.metadata.create_all(
                sync_conn,
                tables=[
                    PresentationModel.__table__,
                    SlideModel.__table__,
                    KeyValueSqlModel.__table__,
                    ImageAsset.__table__,
                    PresentationLayoutCodeModel.__table__,
                    TemplateModel.__table__,
                    WebhookSubscription.__table__,
                    AsyncPresentationGenerationTaskModel.__table__,
                ],
            )
        )
    
    # 检查并添加 user_id 列（如果表已存在但列不存在）
    # 支持 PostgreSQL、SQLite 和 MySQL
    try:
        async with sql_engine.begin() as conn:
            await conn.run_sync(
                lambda sync_conn: _add_user_id_column_if_needed(sync_conn, sql_engine.url)
            )
    except Exception as e:
        # 如果列已存在或其他错误，继续执行（不影响服务启动）
        print(f"Note: user_id column check: {e}")

    # Container DB tables
    async with container_db_engine.begin() as conn:
        await conn.run_sync(
            lambda sync_conn: SQLModel.metadata.create_all(
                sync_conn,
                tables=[OllamaPullStatus.__table__],
            )
        )


def _add_user_id_column_if_needed(sync_conn, database_url):
    """检查并添加 user_id 列（如果不存在）"""
    try:
        from sqlalchemy import text, inspect
        inspector = inspect(sync_conn)
        if "presentations" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("presentations")]
            if "user_id" not in columns:
                # 根据数据库类型使用不同的 SQL 语法
                db_type = str(database_url).lower()
                if "sqlite" in db_type:
                    # SQLite 使用 TEXT 类型
                    sync_conn.execute(text("ALTER TABLE presentations ADD COLUMN user_id TEXT"))
                elif "postgresql" in db_type:
                    # PostgreSQL 使用 VARCHAR
                    sync_conn.execute(text("ALTER TABLE presentations ADD COLUMN user_id VARCHAR"))
                elif "mysql" in db_type:
                    # MySQL 使用 VARCHAR
                    sync_conn.execute(text("ALTER TABLE presentations ADD COLUMN user_id VARCHAR(255)"))
                else:
                    # 默认使用 VARCHAR
                    sync_conn.execute(text("ALTER TABLE presentations ADD COLUMN user_id VARCHAR"))
                print("Added user_id column to existing presentations table")
            else:
                print("user_id column already exists in presentations table")
        else:
            print("presentations table does not exist yet, will be created with user_id column")
    except Exception as e:
        error_str = str(e).lower()
        # 如果列已存在，这是正常的
        if "already exists" in error_str or "duplicate" in error_str or "duplicate column" in error_str:
            print("user_id column already exists (this is expected)")
        else:
            print(f"Warning: Could not add user_id column: {e}")
            import traceback
            traceback.print_exc()
