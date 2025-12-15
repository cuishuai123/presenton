# 服务器部署问题排查指南

## 常见问题及解决方案

### 1. 网络问题（最常见）

#### 问题：无法访问外部镜像源或下载依赖失败

**检查方法：**
```bash
# 在服务器上测试网络连接
ping dl-cdn.alpinelinux.org
ping registry.npmmirror.com
ping pypi.tuna.tsinghua.edu.cn
```

**解决方案：**
- 如果服务器在国内，确保使用国内镜像源（已在 Dockerfile 中配置）
- 如果服务器在国外，可能需要改回官方源
- 检查防火墙设置，确保允许访问这些域名

### 2. 权限问题

#### 问题：文件创建/写入失败

**检查方法：**
```bash
# 检查目录权限
ls -la /app_data
ls -la /tmp/presenton
```

**解决方案：**
```bash
# 确保目录有正确的权限
sudo mkdir -p /app_data /tmp/presenton
sudo chmod -R 777 /app_data /tmp/presenton
```

### 3. 资源限制

#### 问题：内存或 CPU 不足导致构建失败

**检查方法：**
```bash
# 检查系统资源
free -h
df -h
nproc
```

**解决方案：**
- 增加 Docker 内存限制（至少 4GB）
- 清理磁盘空间
- 使用 `--memory` 和 `--cpus` 限制容器资源

### 4. 端口冲突

#### 问题：端口已被占用

**检查方法：**
```bash
# 检查端口占用
netstat -tulpn | grep -E ':(3000|8000|80)'
```

**解决方案：**
- 修改 docker-compose.yml 中的端口映射
- 或停止占用端口的服务

### 5. 环境变量未设置

#### 问题：缺少必要的环境变量

**检查方法：**
```bash
# 检查环境变量
docker exec <container_name> env | grep -E 'APP_DATA|PUPPETEER|FASTAPI'
```

**解决方案：**
在 docker-compose.yml 或启动命令中设置：
```yaml
environment:
  - APP_DATA_DIRECTORY=/app_data
  - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
  - FASTAPI_URL=http://localhost:8000
```

### 6. Docker 版本问题

#### 问题：Docker 版本过旧

**检查方法：**
```bash
docker --version
docker-compose --version
```

**解决方案：**
- 升级 Docker 到最新版本（建议 20.10+）
- 确保 Docker Compose V2 可用

### 7. 构建缓存问题

#### 问题：使用旧的缓存导致构建失败

**解决方案：**
```bash
# 清理构建缓存
docker system prune -a
docker builder prune

# 重新构建（不使用缓存）
docker build --no-cache -t presenton:latest -f Dockerfile.cn .
```

### 8. 依赖安装失败

#### 问题：npm 或 pip 安装失败

**检查方法：**
查看构建日志，找到具体的失败步骤

**解决方案：**
- 增加重试次数和超时时间
- 使用代理（如果服务器有）
- 手动安装失败的依赖

## 快速诊断脚本

创建 `check_server.sh`：

```bash
#!/bin/bash

echo "=== 系统信息 ==="
uname -a
free -h
df -h

echo "=== Docker 信息 ==="
docker --version
docker-compose --version

echo "=== 网络测试 ==="
ping -c 3 dl-cdn.alpinelinux.org
ping -c 3 registry.npmmirror.com

echo "=== 端口检查 ==="
netstat -tulpn | grep -E ':(3000|8000|80)'

echo "=== 目录权限 ==="
ls -la /app_data 2>/dev/null || echo "/app_data 不存在"
ls -la /tmp/presenton 2>/dev/null || echo "/tmp/presenton 不存在"
```

## 推荐的部署步骤

1. **准备环境**
```bash
# 创建必要目录
sudo mkdir -p /app_data /tmp/presenton
sudo chmod -R 777 /app_data /tmp/presenton
```

2. **构建镜像（不使用缓存）**
```bash
docker build --no-cache -t presenton:latest -f Dockerfile.cn .
```

3. **运行容器（带日志）**
```bash
docker run -d \
  --name presenton \
  -p 65010:80 \
  -v /app_data:/app_data \
  -v /tmp/presenton:/tmp/presenton \
  -e APP_DATA_DIRECTORY=/app_data \
  -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  presenton:latest

# 查看日志
docker logs -f presenton
```

4. **如果构建失败，分步构建**
```bash
# 只构建到某个阶段，检查问题
docker build --target <stage> -t presenton:debug -f Dockerfile.cn .
```

## 常见错误及解决方案

### 错误：`apk update failed`
- **原因**：网络问题或镜像源不可用
- **解决**：检查网络连接，或修改 Dockerfile 中的镜像源

### 错误：`npm install failed`
- **原因**：网络问题或依赖冲突
- **解决**：使用 `npm ci --force` 或清理 node_modules 后重试

### 错误：`pip install failed`
- **原因**：网络问题或依赖冲突
- **解决**：增加超时时间，或使用代理

### 错误：`Permission denied`
- **原因**：文件系统权限问题
- **解决**：检查目录权限，确保容器有写入权限

### 错误：`Port already in use`
- **原因**：端口被占用
- **解决**：修改端口映射或停止占用端口的服务

## 获取详细错误信息

如果问题仍然存在，请提供：

1. **完整的构建日志**
```bash
docker build -t presenton:latest -f Dockerfile.cn . 2>&1 | tee build.log
```

2. **容器运行日志**
```bash
docker logs presenton > container.log 2>&1
```

3. **系统信息**
```bash
./check_server.sh > server_info.txt
```

4. **Docker 信息**
```bash
docker info > docker_info.txt
```

