#!/bin/sh
# Quick service check script

echo "=== Checking services ==="
echo "1. Checking if Next.js is running on port 3000..."
curl -s http://localhost:3000 > /dev/null && echo "✓ Next.js is running" || echo "✗ Next.js is NOT running"

echo "2. Checking if FastAPI is running on port 8000..."
curl -s http://localhost:8000/docs > /dev/null && echo "✓ FastAPI is running" || echo "✗ FastAPI is NOT running"

echo "3. Checking if nginx is running..."
ps aux | grep nginx | grep -v grep && echo "✓ nginx is running" || echo "✗ nginx is NOT running"

echo "4. Checking postcss installation..."
cd /app/servers/nextjs
if [ -d "node_modules/postcss" ]; then
  echo "✓ postcss is installed"
else
  echo "✗ postcss is NOT installed"
fi

echo "5. Checking postcss.config.cjs..."
if [ -f "postcss.config.cjs" ]; then
  echo "✓ postcss.config.cjs exists"
  cat postcss.config.cjs
else
  echo "✗ postcss.config.cjs does NOT exist"
fi

