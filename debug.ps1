# Presenton Debug Script for PowerShell

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Presenton Debug Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check container status
Write-Host "1. Checking container status..." -ForegroundColor Yellow
$containers = docker ps --filter "name=presenton" --format "{{.Names}}"
if ($containers) {
    Write-Host "✓ Containers found:" -ForegroundColor Green
    docker ps --filter "name=presenton" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    $containerName = ($containers -split "`n")[0].Trim()
} else {
    Write-Host "❌ ERROR: No Presenton container is running!" -ForegroundColor Red
    Write-Host "Please run: docker compose up -d development" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 2. Check services inside container
Write-Host "2. Checking services inside container..." -ForegroundColor Yellow
docker exec $containerName sh -c "ps aux | grep -E 'node|nginx|python' | grep -v grep" 2>&1
Write-Host ""

# 3. Check PostCSS installation
Write-Host "3. Checking PostCSS installation..." -ForegroundColor Yellow
$postcssCheck = docker exec $containerName sh -c "cd /app/servers/nextjs && test -d node_modules/postcss && echo 'FOUND' || echo 'NOT_FOUND'" 2>&1
if ($postcssCheck -match "FOUND") {
    Write-Host "✓ postcss is installed" -ForegroundColor Green
} else {
    Write-Host "✗ postcss is NOT installed" -ForegroundColor Red
}
Write-Host ""

# 4. Check Tailwind CSS
Write-Host "4. Checking Tailwind CSS installation..." -ForegroundColor Yellow
$tailwindCheck = docker exec $containerName sh -c "cd /app/servers/nextjs && test -d node_modules/tailwindcss && echo 'FOUND' || echo 'NOT_FOUND'" 2>&1
if ($tailwindCheck -match "FOUND") {
    Write-Host "✓ tailwindcss is installed" -ForegroundColor Green
} else {
    Write-Host "✗ tailwindcss is NOT installed" -ForegroundColor Red
}
Write-Host ""

# 5. Check configuration files
Write-Host "5. Checking configuration files..." -ForegroundColor Yellow
$postcssConfig = docker exec $containerName sh -c "cd /app/servers/nextjs && test -f postcss.config.cjs && echo 'FOUND' || echo 'NOT_FOUND'" 2>&1
$tailwindConfig = docker exec $containerName sh -c "cd /app/servers/nextjs && test -f tailwind.config.cjs && echo 'FOUND' || echo 'NOT_FOUND'" 2>&1

if ($postcssConfig -match "FOUND") {
    Write-Host "✓ postcss.config.cjs exists" -ForegroundColor Green
    Write-Host "Content:" -ForegroundColor Gray
    docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.cjs" 2>&1
} else {
    Write-Host "✗ postcss.config.cjs NOT found" -ForegroundColor Red
}
Write-Host ""

if ($tailwindConfig -match "FOUND") {
    Write-Host "✓ tailwind.config.cjs exists" -ForegroundColor Green
} else {
    Write-Host "✗ tailwind.config.cjs NOT found" -ForegroundColor Red
}
Write-Host ""

# 6. Check service ports
Write-Host "6. Checking service ports..." -ForegroundColor Yellow
$nextjsPort = docker exec $containerName sh -c "netstat -tuln 2>/dev/null | grep 3000 || ss -tuln 2>/dev/null | grep 3000 || echo 'NOT_LISTENING'" 2>&1
$fastapiPort = docker exec $containerName sh -c "netstat -tuln 2>/dev/null | grep 8000 || ss -tuln 2>/dev/null | grep 8000 || echo 'NOT_LISTENING'" 2>&1

if ($nextjsPort -notmatch "NOT_LISTENING") {
    Write-Host "✓ Next.js is listening on port 3000" -ForegroundColor Green
} else {
    Write-Host "✗ Next.js is NOT listening on port 3000" -ForegroundColor Red
}

if ($fastapiPort -notmatch "NOT_LISTENING") {
    Write-Host "✓ FastAPI is listening on port 8000" -ForegroundColor Green
} else {
    Write-Host "✗ FastAPI is NOT listening on port 8000" -ForegroundColor Red
}
Write-Host ""

# 7. Check recent logs
Write-Host "7. Recent container logs (last 30 lines)..." -ForegroundColor Yellow
docker logs $containerName --tail 30 2>&1 | Select-Object -Last 20
Write-Host ""

# 8. Check for errors
Write-Host "8. Checking for errors in logs..." -ForegroundColor Yellow
$errors = docker logs $containerName 2>&1 | Select-String -Pattern "error|Error|ERROR|failed|Failed|FAILED|postcss|PostCSS" | Select-Object -Last 10
if ($errors) {
    Write-Host "Found errors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
} else {
    Write-Host "No obvious errors found" -ForegroundColor Green
}
Write-Host ""

# 9. Test connectivity
Write-Host "9. Testing service connectivity..." -ForegroundColor Yellow
$nextjsTest = docker exec $containerName sh -c "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>&1" 2>&1
$fastapiTest = docker exec $containerName sh -c "curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/docs 2>&1" 2>&1

if ($nextjsTest -match "200|404") {
    Write-Host "✓ Next.js responds (HTTP $nextjsTest)" -ForegroundColor Green
} else {
    Write-Host "✗ Next.js does NOT respond" -ForegroundColor Red
}

if ($fastapiTest -match "200|404") {
    Write-Host "✓ FastAPI responds (HTTP $fastapiTest)" -ForegroundColor Green
} else {
    Write-Host "✗ FastAPI does NOT respond" -ForegroundColor Red
}
Write-Host ""

# 10. Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Debug Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Container: $containerName" -ForegroundColor White
Write-Host "Access URL: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. View full logs: docker logs $containerName --tail 100 -f" -ForegroundColor Gray
Write-Host "2. Enter container: docker exec -it $containerName sh" -ForegroundColor Gray
Write-Host "3. Check PostCSS: docker exec $containerName sh -c 'cd /app/servers/nextjs && node verify-postcss.js'" -ForegroundColor Gray
Write-Host ""

