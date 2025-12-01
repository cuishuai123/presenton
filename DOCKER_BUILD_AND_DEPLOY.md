# 🐳 PPT 助手 Docker 镜像构建与部署指南

## 📋 目录
- [本地构建镜像](#本地构建镜像)
- [导出镜像文件](#导出镜像文件)
- [服务器部署](#服务器部署)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

---

## 🏗️ 本地构建镜像

### Windows (PowerShell)

```powershell
# 进入项目目录
cd G:\desk\tegongban\presenton

# 执行构建脚本
.\build-docker-image.ps1
```

### ⚠️ 网络问题解决方案

如果遇到 `502 Bad Gateway` 或网络超时错误：

**方案 1: 使用国内镜像源版本（推荐，适用于中国用户）**

```powershell
# 使用 Dockerfile.cn（已配置国内镜像源）
docker build -t presenton:latest -f Dockerfile.cn .
```

**方案 2: 重试构建**

网络问题通常是临时的，可以：
```powershell
# 清理缓存后重试
docker builder prune -f
docker build -t presenton:latest -f Dockerfile .
```

**方案 3: 配置代理（如果有）**

```powershell
# 设置代理环境变量
$env:HTTP_PROXY="http://your-proxy:port"
$env:HTTPS_PROXY="http://your-proxy:port"
docker build -t presenton:latest -f Dockerfile .
```

### Linux/Mac

```bash
# 进入项目目录
cd /path/to/presenton

# 添加执行权限
chmod +x build-docker-image.sh

# 执行构建脚本
./build-docker-image.sh
```

### 手动构建

```bash
# 清理构建缓存
docker builder prune -f

# 构建镜像
docker build -t presenton:latest -f Dockerfile .

# 导出镜像
docker save -o presenton-image.tar presenton:latest
```

---

## 📦 导出镜像文件

构建完成后，会在项目根目录生成 `presenton-image.tar` 文件。

**文件大小**: 通常为 2-4 GB（取决于依赖）

---

## 🚀 服务器部署

### 步骤 1: 传输镜像文件到服务器

使用 `scp` 或其他工具将 `presenton-image.tar` 传输到服务器：

```bash
# 使用 scp
scp presenton-image.tar user@server:/path/to/destination/

# 或使用其他工具（如 WinSCP、FileZilla 等）
```

### 步骤 2: 在服务器上加载镜像

```bash
# SSH 登录服务器
ssh user@server

# 加载镜像
docker load -i presenton-image.tar

# 验证镜像已加载
docker images | grep presenton
```

### 步骤 3: 准备环境变量文件

在服务器上创建 `.env` 文件：

```bash
# 创建 .env 文件
nano .env
```

添加以下内容（根据实际情况修改）：

```env
# 基础配置
CAN_CHANGE_KEYS=true

# LLM 配置（选择一个）
LLM=openai
OPENAI_API_KEY=你的_OpenAI_API_Key
OPENAI_MODEL=gpt-4o-mini

# 数据库配置（如果使用问知的 PostgreSQL）
PG_URL=postgresql://username:password@host:port/database

# 或使用默认 SQLite（不需要配置）

# 其他配置
DISABLE_ANONYMOUS_TRACKING=false
TOOL_CALLS=true
WEB_GROUNDING=false
```

### 步骤 4: 启动服务

#### 方式 1: 使用 Docker Compose（推荐）

```bash
# 将 docker-compose.yml 和 .env 文件复制到服务器
# 然后执行：
docker-compose up production -d

# 查看日志
docker-compose logs -f production
```

#### 方式 2: 直接使用 Docker Run

```bash
docker run -d \
  --name presenton \
  -p 5000:80 \
  -v $(pwd)/app_data:/app_data \
  --env-file .env \
  presenton:latest
```

---

## ⚙️ 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `LLM` | LLM 提供商 | `openai`, `google`, `anthropic` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-xxxxx` |
| `OPENAI_MODEL` | OpenAI 模型 | `gpt-4o-mini` |

### 数据库配置（可选）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PG_URL` | PostgreSQL 连接字符串（问知数据库） | `postgresql://user:pass@host:5432/db` |
| `DATABASE_URL` | 备用数据库连接 | `postgresql://user:pass@host:5432/db` |

**注意**: 
- 如果设置了 `PG_URL`，PPT 助手会使用问知的 PostgreSQL 数据库
- 如果都不设置，会使用默认的 SQLite（数据存储在容器内的 `/app_data/fastapi.db`）

### 其他可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `CAN_CHANGE_KEYS` | 允许在界面修改 API Keys | `false` |
| `TOOL_CALLS` | 启用工具调用 | `false` |
| `WEB_GROUNDING` | 启用网络搜索 | `false` |
| `DISABLE_ANONYMOUS_TRACKING` | 禁用匿名追踪 | `false` |

---

## 🔍 常见问题

### 1. 镜像文件太大，传输慢

**解决方案**:
```bash
# 使用压缩传输
gzip presenton-image.tar
# 传输 .tar.gz 文件
# 在服务器上解压
gunzip presenton-image.tar.gz
```

### 2. 容器启动后立即退出

**检查日志**:
```bash
docker logs presenton
```

**常见原因**:
- 环境变量配置错误
- 端口被占用
- 数据库连接失败

### 3. 无法访问服务

**检查**:
```bash
# 检查容器是否运行
docker ps | grep presenton

# 检查端口映射
docker port presenton

# 检查防火墙
# Ubuntu/Debian
sudo ufw status
# CentOS/RHEL
sudo firewall-cmd --list-all
```

### 4. 数据库连接问题

**如果使用 PostgreSQL**:
```bash
# 检查连接字符串格式
# 格式: postgresql://username:password@host:port/database

# 测试连接
docker exec -it presenton python -c "
from utils.db_utils import get_database_url_and_connect_args
url, args = get_database_url_and_connect_args()
print(f'Database URL: {url}')
"
```

---

## 📝 快速部署命令总结

### 本地构建
```powershell
# Windows
.\build-docker-image.ps1

# Linux/Mac
./build-docker-image.sh
```

### 服务器部署
```bash
# 1. 加载镜像
docker load -i presenton-image.tar

# 2. 创建 .env 文件（编辑配置）
nano .env

# 3. 启动服务
docker-compose up production -d

# 4. 查看日志
docker-compose logs -f production
```

---

## 🎯 验证部署

部署成功后，访问：
```
http://your-server-ip:5000
```

应该能看到 PPT 助手的界面。

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. Docker 日志: `docker logs presenton`
2. 环境变量配置是否正确
3. 网络连接是否正常
4. 数据库连接是否正常（如果使用 PostgreSQL）

