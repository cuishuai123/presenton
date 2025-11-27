# 🐳 Docker Compose 部署指南

## 🚀 快速开始

### 步骤 1: 准备环境变量

在项目根目录创建 `.env` 文件：

```bash
# Windows PowerShell
New-Item -Path ".env" -ItemType File

# 或直接创建文件并编辑
```

### 步骤 2: 配置 `.env` 文件

复制以下内容到 `.env` 文件：

```env
# 基础配置
CAN_CHANGE_KEYS=true

# LLM 配置（选择一个）
LLM=openai
OPENAI_API_KEY=你的_OpenAI_API_Key
OPENAI_MODEL=gpt-4o-mini

# 或使用 Google Gemini
# LLM=google
# GOOGLE_API_KEY=你的_Google_API_Key
# GOOGLE_MODEL=gemini-2.0-flash-exp

# 或使用 Anthropic Claude
# LLM=anthropic
# ANTHROPIC_API_KEY=你的_Anthropic_API_Key
# ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# 图片 API（可选）
PEXELS_API_KEY=

# 其他配置
DISABLE_ANONYMOUS_TRACKING=false
TOOL_CALLS=true
WEB_GROUNDING=false
```

### 步骤 3: 清理并构建

```powershell
# 进入项目目录
cd E:\gitSpace\presenton-main

# 清理旧的构建缓存
docker-compose down
docker builder prune -f

# 构建并启动（生产模式）
docker-compose up production --build
```

---

## 📋 详细部署步骤

### 方案 1: 生产环境部署（推荐）

```powershell
# 1. 清理环境
docker-compose down
docker builder prune -f

# 2. 构建镜像并启动（前台运行，可以看到日志）
docker-compose up production --build

# 或者在后台运行
docker-compose up production --build -d

# 3. 查看日志（如果在后台运行）
docker-compose logs production -f
```

### 方案 2: 开发环境部署

```powershell
# 开发模式（支持热更新）
docker-compose up development --build
```

---

## 🌐 访问应用

构建完成后，在浏览器访问：

```
http://localhost:5000
```

---

## ⚙️ 配置说明

### 最小配置（只需要 LLM）

如果你只想快速测试，最少只需要配置：

```env
CAN_CHANGE_KEYS=true
LLM=openai
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4o-mini
```

### 完整配置

如果需要所有功能，参考以下配置：

```env
# 允许修改 API Keys
CAN_CHANGE_KEYS=true

# OpenAI 配置
LLM=openai
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4o-mini

# Google Gemini（可选）
GOOGLE_API_KEY=xxxxx
GOOGLE_MODEL=gemini-2.0-flash-exp

# Anthropic Claude（可选）
ANTHROPIC_API_KEY=xxxxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# 图片服务（可选）
PEXELS_API_KEY=xxxxx

# 功能开关
TOOL_CALLS=true
WEB_GROUNDING=false
DISABLE_ANONYMOUS_TRACKING=false
```

---

## 🛠️ 常用命令

### 启动和停止

```powershell
# 启动（前台）
docker-compose up production

# 启动（后台）
docker-compose up production -d

# 停止
docker-compose down

# 重启
docker-compose restart production
```

### 查看状态

```powershell
# 查看运行中的容器
docker-compose ps

# 查看日志
docker-compose logs production

# 实时查看日志
docker-compose logs production -f

# 查看最后 100 行日志
docker-compose logs production --tail=100
```

### 重新构建

```powershell
# 强制重新构建（不使用缓存）
docker-compose build --no-cache production

# 重新构建并启动
docker-compose up production --build
```

### 清理和维护

```powershell
# 停止并删除容器
docker-compose down

# 停止并删除容器和卷（会删除数据！）
docker-compose down -v

# 清理构建缓存
docker builder prune -f

# 清理未使用的镜像
docker image prune -f

# 完全清理 Docker 系统
docker system prune -af
```

---

## 🔍 故障排除

### 问题 1: 构建失败（网络问题）

**症状**: 下载依赖或 Ollama 失败

**解决方案**:
```powershell
# 1. 确保 VPN 正在运行
# 2. 清理缓存
docker builder prune -f

# 3. 重新构建
docker-compose up production --build
```

### 问题 2: 端口被占用

**症状**: `port 5000 already in use`

**解决方案**:
```powershell
# 方法 1: 修改端口
# 编辑 docker-compose.yml，将 "5000:80" 改为 "8080:80"

# 方法 2: 停止占用端口的进程
netstat -ano | findstr :5000
taskkill /PID <PID号> /F
```

### 问题 3: 容器无法启动

**症状**: 容器启动后立即退出

**解决方案**:
```powershell
# 查看详细日志
docker-compose logs production

# 检查环境变量配置
# 确保 .env 文件格式正确
```

### 问题 4: 中英文切换不生效

**症状**: 点击语言开关但文字没变化

**解决方案**:
```powershell
# 1. 清除浏览器缓存
# 2. 硬刷新页面 (Ctrl + Shift + R)
# 3. 或重新构建
docker-compose down
docker-compose up production --build
```

---

## 📊 部署检查清单

### 部署前
- [ ] Docker Desktop 已安装并运行
- [ ] 已创建 `.env` 文件
- [ ] 已配置至少一个 LLM API Key
- [ ] VPN 已开启（如果需要）

### 部署中
- [ ] 执行清理命令
- [ ] 执行构建命令
- [ ] 观察构建日志无错误

### 部署后
- [ ] 访问 http://localhost:5000
- [ ] 测试语言切换开关
- [ ] 测试创建演示文稿功能
- [ ] 测试导出功能

---

## 🎯 中英文切换功能

部署成功后，你会看到：

### Header 右侧的语言开关
```
EN  ⚪────  中文    (当前英文)
EN  ────⚪  中文    (当前中文)
```

### 所有已翻译的页面
1. ✅ Dashboard - 仪表板
2. ✅ Settings - 设置  
3. ✅ Upload - 创建演示文稿
4. ✅ Templates - 模板
5. ✅ Custom Template - 创建自定义模板
6. ✅ Outline - 大纲
7. ✅ Presentation - 演示文稿

---

## 🎊 完整部署命令（推荐）

```powershell
# 在项目根目录执行

# 1. 清理环境
docker-compose down
docker builder prune -f

# 2. 构建并启动
docker-compose up production --build

# 等待构建完成后，访问:
# http://localhost:5000
```

---

## 💡 提示

- 首次构建需要 10-20 分钟（下载依赖）
- 后续构建会快很多（使用缓存）
- 数据保存在 `./app_data` 目录
- 可以随时停止容器（Ctrl + C）

需要我帮你创建 `.env` 配置文件的具体内容吗？

