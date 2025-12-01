#!/bin/bash

# PPT 助手 Docker 镜像构建脚本
# 用于构建生产环境的 Docker 镜像并导出为 tar 文件

set -e

IMAGE_NAME="presenton"
IMAGE_TAG="latest"
OUTPUT_FILE="presenton-image.tar"

echo "=========================================="
echo "PPT 助手 Docker 镜像构建脚本"
echo "=========================================="
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ 错误: Docker 未运行，请先启动 Docker Desktop"
    exit 1
fi

echo "📦 步骤 1: 清理旧的构建缓存..."
docker builder prune -f > /dev/null 2>&1 || true
echo "✅ 清理完成"
echo ""

echo "🔨 步骤 2: 构建 Docker 镜像..."
echo "   镜像名称: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "   这可能需要 10-20 分钟，请耐心等待..."
echo ""

docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -f Dockerfile .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi

echo ""
echo "✅ 镜像构建成功！"
echo ""

echo "💾 步骤 3: 导出镜像为 tar 文件..."
docker save -o ${OUTPUT_FILE} ${IMAGE_NAME}:${IMAGE_TAG}

if [ $? -ne 0 ]; then
    echo "❌ 镜像导出失败"
    exit 1
fi

# 获取文件大小
FILE_SIZE=$(du -h ${OUTPUT_FILE} | cut -f1)

echo ""
echo "=========================================="
echo "✅ 构建完成！"
echo "=========================================="
echo ""
echo "📦 镜像文件: ${OUTPUT_FILE}"
echo "📊 文件大小: ${FILE_SIZE}"
echo ""
echo "🚀 部署步骤:"
echo "   1. 将 ${OUTPUT_FILE} 复制到服务器"
echo "   2. 在服务器上执行: docker load -i ${OUTPUT_FILE}"
echo "   3. 使用 docker-compose.yml 启动服务"
echo ""
echo "📝 或者直接使用以下命令部署:"
echo "   docker load -i ${OUTPUT_FILE}"
echo "   docker run -d -p 5000:80 --name presenton ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

