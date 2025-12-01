import os


def get_can_change_keys_env():
    return os.getenv("CAN_CHANGE_KEYS")


def get_database_url_env():
    # PPT 助手需要关系型数据库（PostgreSQL/MySQL/SQLite）
    # 优先使用问知的 PostgreSQL 连接（如果设置了 PG_URL，问知用于向量库的 PostgreSQL）
    # 否则使用 PPT 助手自己的数据库配置
    return os.getenv("PG_URL") or os.getenv("DATABASE_URL")


def get_app_data_directory_env():
    return os.getenv("APP_DATA_DIRECTORY")


def get_temp_directory_env():
    return os.getenv("TEMP_DIRECTORY")


def get_user_config_path_env():
    return os.getenv("USER_CONFIG_PATH")


def get_llm_provider_env():
    return os.getenv("LLM")


def get_anthropic_api_key_env():
    return os.getenv("ANTHROPIC_API_KEY")


def get_anthropic_model_env():
    return os.getenv("ANTHROPIC_MODEL")


def get_ollama_url_env():
    return os.getenv("OLLAMA_URL")


def get_custom_llm_url_env():
    return os.getenv("CUSTOM_LLM_URL")


def get_openai_api_key_env():
    return os.getenv("OPENAI_API_KEY")


def get_openai_model_env():
    return os.getenv("OPENAI_MODEL")


def get_google_api_key_env():
    return os.getenv("GOOGLE_API_KEY")


def get_google_model_env():
    return os.getenv("GOOGLE_MODEL")


def get_custom_llm_api_key_env():
    return os.getenv("CUSTOM_LLM_API_KEY")


def get_ollama_model_env():
    return os.getenv("OLLAMA_MODEL")


def get_custom_model_env():
    return os.getenv("CUSTOM_MODEL")


def get_pexels_api_key_env():
    return os.getenv("PEXELS_API_KEY")


def get_image_provider_env():
    return os.getenv("IMAGE_PROVIDER")


def get_pixabay_api_key_env():
    return os.getenv("PIXABAY_API_KEY")


def get_tool_calls_env():
    return os.getenv("TOOL_CALLS")


def get_disable_thinking_env():
    return os.getenv("DISABLE_THINKING")


def get_extended_reasoning_env():
    return os.getenv("EXTENDED_REASONING")


def get_web_grounding_env():
    return os.getenv("WEB_GROUNDING")
