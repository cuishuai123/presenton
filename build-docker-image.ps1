# PPT 助手 Docker 镜像构建脚本 (PowerShell)
# 用于构建生产环境的 Docker 镜像并导出为 tar 文件

$ErrorActionPreference = "Stop"

$IMAGE_NAME = "presenton"
$IMAGE_TAG = "latest"
$OUTPUT_FILE = "presenton-image.tar"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PPT 助手 Docker 镜像构建脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否运行
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ 错误: Docker 未运行，请先启动 Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host "📦 步骤 1: 清理旧的构建缓存..." -ForegroundColor Yellow
docker builder prune -f | Out-Null
Write-Host "✅ 清理完成" -ForegroundColor Green
Write-Host ""

Write-Host "🔨 步骤 2: 构建 Docker 镜像..." -ForegroundColor Yellow
Write-Host "   镜像名称: ${IMAGE_NAME}:${IMAGE_TAG}" -ForegroundColor Gray
Write-Host "   这可能需要 10-20 分钟，请耐心等待..." -ForegroundColor Gray
Write-Host ""

# 检查是否存在 Dockerfile.cn（国内镜像源版本）
$dockerfile = "Dockerfile"
if (Test-Path "Dockerfile.cn") {
    $useCN = Read-Host "检测到 Dockerfile.cn（国内镜像源版本），是否使用？(y/n)"
    if ($useCN -eq "y" -or $useCN -eq "Y") {
        $dockerfile = "Dockerfile.cn"
        Write-Host "使用国内镜像源版本: $dockerfile" -ForegroundColor Green
    }
}

docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" -f $dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 镜像构建失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ 镜像构建成功！" -ForegroundColor Green
Write-Host ""

Write-Host "💾 步骤 3: 导出镜像为 tar 文件..." -ForegroundColor Yellow
docker save -o $OUTPUT_FILE "${IMAGE_NAME}:${IMAGE_TAG}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 镜像导出失败" -ForegroundColor Red
    exit 1
}

# 获取文件大小
$fileInfo = Get-Item $OUTPUT_FILE
$fileSize = "{0:N2} MB" -f ($fileInfo.Length / 1MB)

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ 构建完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 镜像文件: $OUTPUT_FILE" -ForegroundColor Yellow
Write-Host "📊 文件大小: $fileSize" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 部署步骤:" -ForegroundColor Cyan
Write-Host "   1. 将 $OUTPUT_FILE 复制到服务器" -ForegroundColor Gray
Write-Host "   2. 在服务器上执行: docker load -i $OUTPUT_FILE" -ForegroundColor Gray
Write-Host "   3. 使用 docker-compose.yml 启动服务" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 或者直接使用以下命令部署:" -ForegroundColor Cyan
Write-Host "   docker load -i $OUTPUT_FILE" -ForegroundColor Gray
Write-Host "   docker run -d -p 5000:80 --name presenton ${IMAGE_NAME}:${IMAGE_TAG}" -ForegroundColor Gray
Write-Host ""

