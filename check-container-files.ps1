# Check actual files in container

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "Checking PostCSS config files in container..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && ls -la postcss.config.* 2>&1"
Write-Host ""

Write-Host "Checking if postcss.config.js exists..." -ForegroundColor Yellow
$jsExists = docker exec $containerName sh -c "cd /app/servers/nextjs && test -f postcss.config.js && echo 'EXISTS' || echo 'NOT_EXISTS'" 2>&1
Write-Host "postcss.config.js: $jsExists" -ForegroundColor $(if ($jsExists -match "EXISTS") { "Red" } else { "Green" })
Write-Host ""

Write-Host "Checking if postcss.config.cjs exists..." -ForegroundColor Yellow
$cjsExists = docker exec $containerName sh -c "cd /app/servers/nextjs && test -f postcss.config.cjs && echo 'EXISTS' || echo 'NOT_EXISTS'" 2>&1
Write-Host "postcss.config.cjs: $cjsExists" -ForegroundColor $(if ($cjsExists -match "EXISTS") { "Green" } else { "Red" })
Write-Host ""

if ($jsExists -match "EXISTS") {
    Write-Host "⚠ WARNING: postcss.config.js exists and may be causing conflicts!" -ForegroundColor Red
    Write-Host "Removing postcss.config.js..." -ForegroundColor Yellow
    docker exec $containerName sh -c "cd /app/servers/nextjs && rm -f postcss.config.js" 2>&1 | Out-Null
    Write-Host "✓ Removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Current PostCSS config files:" -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && ls -la postcss.config.* 2>&1"

