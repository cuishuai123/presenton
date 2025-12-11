FROM python:3.11-slim-bookworm

# 配置 Debian 镜像源（可选，如果网络有问题可以取消注释使用国内镜像）
# RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources || \
#     sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list || true

# Install Node.js and npm (添加重试机制)
RUN for i in 1 2 3; do \
        apt-get update && break || sleep 5; \
    done && \
    apt-get install -y --no-install-recommends \
    nginx \
    curl \
    libreoffice \
    fontconfig \
    chromium \
    && rm -rf /var/lib/apt/lists/*


# Install Node.js 20 using NodeSource repository (添加重试机制)
RUN for i in 1 2 3; do \
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && break || sleep 10; \
    done && \
    apt-get install -y nodejs && \
    node -v && npm -v && \
    rm -rf /var/lib/apt/lists/*


# Create a working directory
WORKDIR /app  

# Set environment variables
ENV APP_DATA_DIRECTORY=/app_data
ENV TEMP_DIRECTORY=/tmp/presenton
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
# 跳过 Puppeteer 的 Chromium 下载（因为已安装系统 Chromium）
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true


# Install ollama (disabled)
# RUN curl -fsSL https://ollama.com/install.sh | sh

# Install dependencies for FastAPI (添加重试机制和国内镜像源支持)
# 如果需要使用国内镜像源，可以设置环境变量: PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
RUN pip install --no-cache-dir --retries 3 --timeout 100 \
    aiohttp aiomysql aiosqlite asyncpg fastapi[standard] \
    pathvalidate pdfplumber chromadb sqlmodel \
    anthropic google-genai openai fastmcp dirtyjson
RUN pip install --no-cache-dir --retries 3 --timeout 100 \
    docling --extra-index-url https://download.pytorch.org/whl/cpu

# Install dependencies for Next.js (添加重试机制)
WORKDIR /app/servers/nextjs
COPY servers/nextjs/package.json servers/nextjs/package-lock.json ./
# 如果需要使用国内镜像源，可以设置: npm config set registry https://registry.npmmirror.com
RUN npm ci --no-audit --no-fund || \
    (sleep 5 && npm ci --no-audit --no-fund) || \
    (sleep 10 && npm ci --no-audit --no-fund)


# Copy Next.js app
COPY servers/nextjs/ /app/servers/nextjs/

# Build the Next.js app
WORKDIR /app/servers/nextjs
RUN npm run build

WORKDIR /app

# Copy FastAPI
COPY servers/fastapi/ ./servers/fastapi/
COPY package.json ./
COPY start.js LICENSE NOTICE ./

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose the port
EXPOSE 80

# Start the servers
CMD ["node", "/app/start.js"]