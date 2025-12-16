# 方案 B 配置说明（脚本已复制到项目内）

## ✅ 已完成的配置

### 1. 脚本文件
- ✅ `scripts/run_prompt.py` 已存在于项目内
- ✅ Dockerfile 已添加 `COPY scripts/ ./scripts/` 命令

### 2. 图片生成配置
- ✅ `userConfig.json` 中 `IMAGE_PROVIDER` 已设置为 `z-image-turbo`
- ✅ `Z_IMAGE_TURBO_HOST` 已设置为 `10.221.80.199`
- ✅ `Z_IMAGE_TURBO_PORT` 已设置为 `8187`

### 3. Docker 配置
- ✅ `docker-compose.yml` 已包含所有必要的环境变量
- ✅ Dockerfile 会复制 `scripts/` 目录到容器内的 `/app/scripts/`

## 📋 配置详情

### userConfig.json
```json
{
    "IMAGE_PROVIDER": "z-image-turbo",
    "Z_IMAGE_TURBO_HOST": "10.221.80.199",
    "Z_IMAGE_TURBO_PORT": "8187"
}
```

**注意**：不需要设置 `Z_IMAGE_TURBO_SCRIPT_PATH`，因为脚本已经在项目内的 `scripts/` 目录，代码会自动找到。

### Dockerfile 变更
```dockerfile
# Copy scripts directory (for Z-Image-Turbo)
COPY scripts/ ./scripts/
```

### 脚本查找顺序
代码会按以下顺序查找脚本：
1. 环境变量 `Z_IMAGE_TURBO_SCRIPT_PATH`（如果设置了）
2. `scripts/run_prompt.py` ✅ **当前使用这个**
3. `../pythondemo/run_prompt.py`（备用）

## 🚀 打包步骤

### 1. 确认脚本文件
```bash
# 确认脚本存在
ls scripts/run_prompt.py
```

### 2. 构建 Docker 镜像
```bash
docker build -t presenton:latest .
```

### 3. 使用 Docker Compose
```bash
# 确保 .env 文件存在（如果需要）
docker-compose up -d production
```

### 4. 验证配置
```bash
# 查看容器内的脚本
docker exec -it <container_name> ls -la /app/scripts/run_prompt.py

# 查看环境变量
docker exec -it <container_name> env | grep Z_IMAGE_TURBO
```

## ✅ 配置检查清单

- [x] `scripts/run_prompt.py` 文件存在
- [x] Dockerfile 包含 `COPY scripts/ ./scripts/`
- [x] `userConfig.json` 中 `IMAGE_PROVIDER` 为 `z-image-turbo`
- [x] `Z_IMAGE_TURBO_HOST` 和 `Z_IMAGE_TURBO_PORT` 已配置
- [ ] Docker 镜像构建成功
- [ ] 容器内脚本路径正确（`/app/scripts/run_prompt.py`）
- [ ] 网络连通性测试通过（容器能访问 `10.221.80.199:8187`）
- [ ] 图片生成功能测试通过

## 🔍 测试验证

### 1. 检查脚本路径
启动容器后，查看日志应该显示：
```
Using Z-Image-Turbo script from: /app/scripts/run_prompt.py
```

### 2. 测试图片生成
1. 访问应用：http://localhost:5000
2. 创建新的演示文稿
3. 检查后端日志，确认：
   - ✅ 脚本路径正确
   - ✅ 能连接到 ComfyUI 后端（`10.221.80.199:8187`）
   - ✅ 图片生成成功

### 3. 查看日志
```bash
# 查看图片生成相关日志
docker-compose logs -f production | grep -i "z-image-turbo\|image"
```

## 🐛 故障排查

### 问题 1：找不到脚本
**错误**：`Z-Image-Turbo script not found`

**解决**：
- 确认 Dockerfile 中已添加 `COPY scripts/ ./scripts/`
- 重新构建镜像：`docker build -t presenton:latest .`
- 检查容器内文件：`docker exec -it <container> ls /app/scripts/`

### 问题 2：连接被拒绝
**错误**：`Connection refused` 或 `cannot reach backend`

**解决**：
- 确认 ComfyUI 后端正在运行在 `10.221.80.199:8187`
- 测试网络连通性：`docker exec -it <container> curl http://10.221.80.199:8187`
- 检查防火墙设置

### 问题 3：Python 执行错误
**错误**：`python3: command not found`

**解决**：
- 容器使用 `python:3.11-slim-bookworm`，应该已有 Python
- 检查脚本的 shebang：`#!/usr/bin/env python3`
- 查看完整错误日志

## 📝 总结

**方案 B 配置已完成！**

- ✅ 脚本已复制到项目内：`scripts/run_prompt.py`
- ✅ Dockerfile 已更新：会复制 scripts 目录到容器
- ✅ 配置已更新：`userConfig.json` 包含必要的配置
- ✅ 不需要额外的环境变量：代码会自动找到脚本

**下一步**：直接构建 Docker 镜像并测试即可！

---

**最后更新**：2025-12-15
**状态**：✅ 方案 B 配置完成，可以打包


