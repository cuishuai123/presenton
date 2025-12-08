# Presenton PostCSS 修复指南

## 问题描述
浏览器无法访问，PostCSS 无法解析 `@tailwind` 指令。

## 快速修复步骤

### 方法 1：使用快速修复脚本（推荐）

在 PowerShell 中运行：

```powershell
cd G:\desk\tegongban\presenton
.\quick-fix.ps1
```

### 方法 2：手动修复

#### 步骤 1：完全重建容器

```powershell
cd G:\desk\tegongban\presenton
docker compose down development
docker compose up -d --build development
```

#### 步骤 2：等待依赖安装（3-5分钟）

查看日志确认安装完成：

```powershell
docker compose logs development --tail=100 -f
```

查找以下关键信息：
- "npm install completed successfully"
- "✓ Verified: postcss is installed"
- "Ready in X.Xs" (Next.js 启动成功)

#### 步骤 3：如果 PostCSS 未安装，手动安装

```powershell
docker exec presenton-development-1 sh -c "cd /app/servers/nextjs && npm install postcss@^8.4.47 tailwindcss@^3.4.1 autoprefixer@^10.4.20 --save --force"
```

#### 步骤 4：验证配置

```powershell
docker exec presenton-development-1 sh -c "cd /app/servers/nextjs && node verify-postcss.js"
```

#### 步骤 5：检查服务状态

```powershell
docker exec presenton-development-1 sh -c "ps aux | grep -E 'node|nginx|python' | grep -v grep"
```

## 当前配置状态

✅ **已修复的配置：**
- `postcss.config.cjs` - CommonJS 格式，正确配置
- `tailwind.config.cjs` - CommonJS 格式，正确配置
- `globals.css` - 已导入到 `layout.tsx`
- `package.json` - postcss、tailwindcss、autoprefixer 都在 dependencies 中
- `start.js` - 已修复启动顺序，会清理并重新安装依赖

## 常见问题排查

### 问题 1：容器无法启动
```powershell
docker compose ps
docker compose logs development --tail=50
```

### 问题 2：PostCSS 仍然报错
1. 检查容器内 postcss 是否安装：
   ```powershell
   docker exec presenton-development-1 sh -c "cd /app/servers/nextjs && ls -la node_modules/postcss"
   ```

2. 如果未安装，手动安装：
   ```powershell
   docker exec presenton-development-1 sh -c "cd /app/servers/nextjs && npm install postcss@^8.4.47 --save --force"
   ```

3. 重启 Next.js 服务（在容器内）：
   ```powershell
   docker exec presenton-development-1 sh -c "pkill -f 'next dev'"
   # 容器会自动重启服务
   ```

### 问题 3：浏览器无法访问
1. 检查端口映射：
   ```powershell
   docker ps | Select-String "presenton"
   ```
   应该看到 `0.0.0.0:5000->80/tcp`

2. 检查 nginx 是否运行：
   ```powershell
   docker exec presenton-development-1 sh -c "service nginx status"
   ```

3. 检查 Next.js 是否运行：
   ```powershell
   docker exec presenton-development-1 sh -c "curl http://localhost:3000"
   ```

## 验证修复

访问以下 URL 验证：
- 主应用：http://localhost:5000
- FastAPI 文档：http://localhost:5000/docs

如果看到页面（即使样式有问题），说明服务已启动。如果样式问题仍然存在，请检查浏览器控制台的错误信息。

## 需要帮助？

如果问题仍然存在，请提供：
1. `docker compose logs development --tail=200` 的输出
2. `docker exec presenton-development-1 sh -c "cd /app/servers/nextjs && node verify-postcss.js"` 的输出
3. 浏览器控制台的完整错误信息

