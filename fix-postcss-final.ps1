# Final PostCSS Fix - Clear cache and restart

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Final PostCSS Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

if (-not $containerName) {
    Write-Host "❌ Container not running!" -ForegroundColor Red
    exit 1
}

Write-Host "Container: $containerName" -ForegroundColor Green
Write-Host ""

# Step 1: Clear Next.js cache
Write-Host "Step 1: Clearing Next.js cache..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build node_modules/.cache .next" 2>&1 | Out-Null
Write-Host "✓ Cache cleared" -ForegroundColor Green
Write-Host ""

# Step 2: Verify PostCSS installation
Write-Host "Step 2: Verifying PostCSS installation..." -ForegroundColor Yellow
$postcssVersion = docker exec $containerName sh -c "cd /app/servers/nextjs && npm list postcss 2>/dev/null | grep postcss" 2>&1
Write-Host "PostCSS: $postcssVersion" -ForegroundColor Gray
Write-Host ""

# Step 3: Verify config file
Write-Host "Step 3: Verifying postcss.config.cjs..." -ForegroundColor Yellow
$configExists = docker exec $containerName sh -c "cd /app/servers/nextjs && test -f postcss.config.cjs && echo 'EXISTS' || echo 'MISSING'" 2>&1
if ($configExists -match "EXISTS") {
    Write-Host "✓ postcss.config.cjs exists" -ForegroundColor Green
    docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.cjs" 2>&1 | Write-Host
} else {
    Write-Host "✗ postcss.config.cjs MISSING!" -ForegroundColor Red
}
Write-Host ""

# Step 4: Reinstall PostCSS to ensure it's in the right place
Write-Host "Step 4: Reinstalling PostCSS packages..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && npm install postcss@^8.4.47 tailwindcss@^3.4.1 autoprefixer@^10.4.20 --save --force --no-audit" 2>&1 | Select-String -Pattern "added|removed|postcss|tailwindcss|autoprefixer" | Select-Object -Last 5
Write-Host "✓ Packages reinstalled" -ForegroundColor Green
Write-Host ""

# Step 5: Restart container
Write-Host "Step 5: Restarting container..." -ForegroundColor Yellow
docker compose restart development
Write-Host "✓ Container restarted" -ForegroundColor Green
Write-Host ""

# Step 6: Wait and check logs
Write-Host "Step 6: Waiting for services to start (20 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20
Write-Host ""

Write-Host "Checking for PostCSS errors in logs..." -ForegroundColor Yellow
$errors = docker logs $containerName --tail 50 2>&1 | Select-String -Pattern "postcss|PostCSS|@tailwind|Module parse failed" | Select-Object -Last 5
if ($errors) {
    Write-Host "⚠ Still found errors:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
} else {
    Write-Host "✓ No PostCSS errors found!" -ForegroundColor Green
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Fix Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "If errors persist, check:" -ForegroundColor Yellow
Write-Host "  docker logs $containerName --tail=100 -f" -ForegroundColor Gray
Write-Host ""

