#!/bin/sh
# Comprehensive debugging script for Presenton

echo "=========================================="
echo "Presenton Debug Script"
echo "=========================================="
echo ""

# 1. Check container status
echo "1. Checking container status..."
docker ps --filter "name=presenton" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. Check if container is running
CONTAINER_NAME=$(docker ps --filter "name=presenton" --format "{{.Names}}" | head -1)
if [ -z "$CONTAINER_NAME" ]; then
  echo "❌ ERROR: No Presenton container is running!"
  echo "Please run: docker compose up -d development"
  exit 1
fi

echo "✓ Container found: $CONTAINER_NAME"
echo ""

# 3. Check services inside container
echo "2. Checking services inside container..."
docker exec $CONTAINER_NAME sh -c "ps aux | grep -E 'node|nginx|python' | grep -v grep" || echo "No services found"
echo ""

# 4. Check Next.js port
echo "3. Checking if Next.js is listening on port 3000..."
docker exec $CONTAINER_NAME sh -c "netstat -tuln | grep 3000 || ss -tuln | grep 3000" && echo "✓ Next.js is listening" || echo "✗ Next.js is NOT listening"
echo ""

# 5. Check FastAPI port
echo "4. Checking if FastAPI is listening on port 8000..."
docker exec $CONTAINER_NAME sh -c "netstat -tuln | grep 8000 || ss -tuln | grep 8000" && echo "✓ FastAPI is listening" || echo "✗ FastAPI is NOT listening"
echo ""

# 6. Check nginx
echo "5. Checking nginx status..."
docker exec $CONTAINER_NAME sh -c "service nginx status 2>&1 || nginx -t 2>&1" || echo "nginx check failed"
echo ""

# 7. Check PostCSS installation
echo "6. Checking PostCSS installation..."
docker exec $CONTAINER_NAME sh -c "cd /app/servers/nextjs && if [ -d 'node_modules/postcss' ]; then echo '✓ postcss directory exists'; ls -la node_modules/postcss/package.json 2>/dev/null || echo '✗ postcss package.json not found'; else echo '✗ postcss NOT installed'; fi"
echo ""

# 8. Check Tailwind CSS installation
echo "7. Checking Tailwind CSS installation..."
docker exec $CONTAINER_NAME sh -c "cd /app/servers/nextjs && if [ -d 'node_modules/tailwindcss' ]; then echo '✓ tailwindcss installed'; else echo '✗ tailwindcss NOT installed'; fi"
echo ""

# 9. Check configuration files
echo "8. Checking configuration files..."
docker exec $CONTAINER_NAME sh -c "cd /app/servers/nextjs && echo 'postcss.config.cjs:' && ls -la postcss.config.cjs 2>/dev/null && cat postcss.config.cjs || echo '✗ postcss.config.cjs NOT found'"
echo ""
docker exec $CONTAINER_NAME sh -c "cd /app/servers/nextjs && echo 'tailwind.config.cjs:' && ls -la tailwind.config.cjs 2>/dev/null || echo '✗ tailwind.config.cjs NOT found'"
echo ""

# 10. Check recent logs
echo "9. Recent container logs (last 50 lines)..."
docker logs $CONTAINER_NAME --tail 50 2>&1 | tail -20
echo ""

# 11. Check Next.js logs specifically
echo "10. Checking for Next.js errors in logs..."
docker logs $CONTAINER_NAME 2>&1 | grep -i -E "error|postcss|tailwind|failed" | tail -10 || echo "No obvious errors found"
echo ""

# 12. Test internal connectivity
echo "11. Testing internal service connectivity..."
docker exec $CONTAINER_NAME sh -c "curl -s http://localhost:3000 > /dev/null && echo '✓ Next.js responds on port 3000' || echo '✗ Next.js does NOT respond on port 3000'"
docker exec $CONTAINER_NAME sh -c "curl -s http://localhost:8000/docs > /dev/null && echo '✓ FastAPI responds on port 8000' || echo '✗ FastAPI does NOT respond on port 8000'"
echo ""

# 13. Check port mapping
echo "12. Checking port mapping..."
docker ps --filter "name=presenton" --format "{{.Ports}}" | grep -E "5000|80" && echo "✓ Port 5000:80 is mapped" || echo "✗ Port mapping issue"
echo ""

echo "=========================================="
echo "Debug Summary"
echo "=========================================="
echo "Container: $CONTAINER_NAME"
echo "Access URL: http://localhost:5000"
echo ""
echo "If services are not running, check logs with:"
echo "  docker logs $CONTAINER_NAME --tail 100 -f"
echo ""

