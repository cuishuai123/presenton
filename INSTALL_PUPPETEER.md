# 安装 Puppeteer 依赖

如果 `node_modules` 中没有 `puppeteer` 包，请按照以下步骤安装：

## 在 Docker 容器内安装

### 方法1：重新构建 Docker 镜像（推荐）

```bash
# 停止当前容器
docker-compose down

# 重新构建镜像（会安装所有依赖）
docker-compose build development

# 启动容器
docker-compose up -d development
```

### 方法2：在运行中的容器内手动安装

```bash
# 进入容器
docker-compose exec development bash

# 进入 Next.js 目录
cd /app/servers/nextjs

# 设置环境变量（跳过 Chromium 下载，因为 Docker 中已安装系统 Chromium）
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 安装依赖
npm install

# 验证安装
ls node_modules | grep puppeteer
```

### 方法3：在本地开发环境安装

```bash
cd servers/nextjs

# 设置环境变量（如果本地没有 Chromium）
export PUPPETEER_SKIP_DOWNLOAD=false  # 或者不设置，让 Puppeteer 自动下载

# 安装依赖
npm install

# 验证安装
ls node_modules | grep puppeteer
```

## 验证安装

安装完成后，检查 Puppeteer 是否正确安装：

```bash
# 在容器内或本地
cd servers/nextjs
node -e "console.log(require('puppeteer'))"
```

如果输出 `[object Object]` 或类似内容，说明安装成功。

## 注意事项

1. **Docker 环境**：Docker 镜像中已经安装了系统 Chromium（`/usr/bin/chromium`），所以设置 `PUPPETEER_SKIP_DOWNLOAD=true` 可以加快安装速度
2. **本地环境**：如果本地没有 Chromium，Puppeteer 会自动下载（可能需要一些时间）
3. **网络问题**：如果安装失败，可能是网络问题，可以配置 npm 使用国内镜像源：
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

## 当前解决方案

即使 Puppeteer 没有安装，当前的 PPTX 导出功能仍然可以工作，因为：
- **方法1（优先）**：直接从数据库获取数据并创建 PPTX，完全绕过 Puppeteer
- **方法2（回退）**：如果方法1失败，才会尝试使用 Puppeteer

所以即使 Puppeteer 没有安装，导出功能也应该能正常工作。


