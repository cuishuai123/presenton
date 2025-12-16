# Dockerfile.cn 打包检查清单

## ✅ 配置检查结果

### 1. 脚本文件 ✅
- **文件路径**：`scripts/run_prompt.py`
- **文件大小**：12,881 字节
- **最后修改**：2025/12/12 15:31:26
- **状态**：✅ 文件存在且完整

### 2. Dockerfile.cn 配置 ✅
- **第 73 行**：`COPY scripts/ ./scripts/` ✅ 已包含
- **状态**：✅ 脚本目录会被复制到容器内

### 3. userConfig.json 配置 ✅
```json
{
    "IMAGE_PROVIDER": "z-image-turbo",        ✅
    "Z_IMAGE_TURBO_HOST": "10.221.80.199",   ✅
    "Z_IMAGE_TURBO_PORT": "8187"             ✅
}
```
- **状态**：✅ 所有必要配置已设置

### 4. 代码配置 ✅
- **默认 host**：已设置为 `10.221.80.199`
- **脚本查找逻辑**：会优先查找 `scripts/run_prompt.py`
- **状态**：✅ 代码已更新

## 📋 打包命令

```bash
docker build -t presenton:latest -f Dockerfile.cn .
```

## 🔍 打包后验证步骤

### 1. 检查镜像是否构建成功
```bash
docker images | grep presenton
```

### 2. 检查容器内脚本文件
```bash
# 启动容器（临时测试）
docker run --rm -it presenton:latest ls -la /app/scripts/run_prompt.py

# 或使用 docker-compose
docker-compose up -d production
docker exec -it <container_name> ls -la /app/scripts/run_prompt.py
```

### 3. 检查环境变量
```bash
docker exec -it <container_name> env | grep Z_IMAGE_TURBO
```

**预期输出**：
```
Z_IMAGE_TURBO_HOST=10.221.80.199
Z_IMAGE_TURBO_PORT=8187
```

### 4. 测试网络连通性
```bash
# 测试能否访问 ComfyUI 后端
docker exec -it <container_name> curl -v http://10.221.80.199:8187
```

### 5. 查看启动日志
```bash
docker-compose logs -f production
```

**预期日志**（图片生成时）：
```
Using Z-Image-Turbo script from: /app/scripts/run_prompt.py
Running Z-Image-Turbo command: python3 /app/scripts/run_prompt.py --prompt ... --host 10.221.80.199 --port 8187 ...
```

## ✅ 完整检查清单

### 打包前
- [x] `scripts/run_prompt.py` 文件存在
- [x] `Dockerfile.cn` 包含 `COPY scripts/ ./scripts/`
- [x] `userConfig.json` 中 `IMAGE_PROVIDER` 为 `z-image-turbo`
- [x] `Z_IMAGE_TURBO_HOST` 和 `Z_IMAGE_TURBO_PORT` 已配置
- [x] 代码中默认 host 已更新为 `10.221.80.199`

### 打包后
- [ ] Docker 镜像构建成功
- [ ] 容器内 `/app/scripts/run_prompt.py` 文件存在
- [ ] 环境变量正确传递
- [ ] 网络连通性测试通过（容器能访问 `10.221.80.199:8187`）
- [ ] 应用启动正常
- [ ] 图片生成功能测试通过

## 🐛 常见问题排查

### 问题 1：构建失败
**检查**：
- 确认 `scripts/run_prompt.py` 文件存在
- 检查 Dockerfile.cn 语法是否正确
- 查看构建日志中的错误信息

### 问题 2：容器内找不到脚本
**检查**：
```bash
docker exec -it <container> ls -la /app/scripts/
```
**解决**：
- 确认 Dockerfile.cn 第 73 行存在
- 重新构建镜像

### 问题 3：连接被拒绝
**检查**：
```bash
# 在容器内测试
docker exec -it <container> curl http://10.221.80.199:8187
```
**解决**：
- 确认 ComfyUI 后端正在运行
- 检查防火墙和网络设置
- 确认 IP 地址和端口正确

### 问题 4：环境变量未传递
**检查**：
```bash
docker exec -it <container> env | grep IMAGE_PROVIDER
```
**解决**：
- 检查 `docker-compose.yml` 中的环境变量配置
- 确认 `.env` 文件存在（如果使用）
- 检查 `userConfig.json` 配置

## 📝 配置摘要

### 当前配置
- **镜像文件**：`Dockerfile.cn`
- **脚本位置**：`scripts/run_prompt.py` → 容器内 `/app/scripts/run_prompt.py`
- **ComfyUI 后端**：`10.221.80.199:8187`
- **图片提供商**：`z-image-turbo`

### 脚本查找顺序
1. 环境变量 `Z_IMAGE_TURBO_SCRIPT_PATH`（如果设置）
2. `/app/scripts/run_prompt.py` ✅ **当前使用**
3. `/app/../pythondemo/run_prompt.py`（备用）

## 🚀 快速开始

```bash
# 1. 构建镜像
docker build -t presenton:latest -f Dockerfile.cn .

# 2. 启动服务（使用 docker-compose）
docker-compose up -d production

# 3. 查看日志
docker-compose logs -f production

# 4. 测试图片生成
# 访问 http://localhost:5000 创建演示文稿
```

## ✅ 结论

**所有配置检查通过！可以开始打包。**

- ✅ 脚本文件存在
- ✅ Dockerfile.cn 配置正确
- ✅ userConfig.json 配置完整
- ✅ 代码已更新

**下一步**：执行 `docker build -t presenton:latest -f Dockerfile.cn .` 开始构建

---

**检查时间**：2025-12-15
**状态**：✅ 所有检查通过，可以打包


