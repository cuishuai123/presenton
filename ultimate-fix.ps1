# Ultimate PostCSS Fix

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Ultimate PostCSS Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

if (-not $containerName) {
    Write-Host "❌ Container not running!" -ForegroundColor Red
    exit 1
}

Write-Host "Container: $containerName" -ForegroundColor Green
Write-Host ""

# Step 1: Check current PostCSS config
Write-Host "Step 1: Checking PostCSS config file..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && ls -la postcss.config.* 2>/dev/null || echo 'No postcss config found'"
Write-Host ""

# Step 2: Verify PostCSS packages
Write-Host "Step 2: Verifying PostCSS packages..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && npm list postcss tailwindcss autoprefixer 2>/dev/null | grep -E 'postcss|tailwindcss|autoprefixer'" 2>&1
Write-Host ""

# Step 3: Test PostCSS config loading
Write-Host "Step 3: Testing PostCSS config loading..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && node -e 'const config = require(\"./postcss.config.cjs\"); console.log(JSON.stringify(config, null, 2));'" 2>&1
Write-Host ""

# Step 4: Clear all caches
Write-Host "Step 4: Clearing all caches..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build .next node_modules/.cache" 2>&1 | Out-Null
Write-Host "✓ Caches cleared" -ForegroundColor Green
Write-Host ""

# Step 5: Reinstall PostCSS packages
Write-Host "Step 5: Reinstalling PostCSS packages..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && npm install postcss@^8.4.47 tailwindcss@^3.4.1 autoprefixer@^10.4.20 --save --force --no-audit" 2>&1 | Select-String -Pattern "added|removed|postcss" | Select-Object -Last 3
Write-Host "✓ Packages reinstalled" -ForegroundColor Green
Write-Host ""

# Step 6: Restart
Write-Host "Step 6: Restarting container..." -ForegroundColor Yellow
docker compose restart development
Write-Host "✓ Container restarted" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting 30 seconds for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host ""

# Step 7: Check for errors
Write-Host "Step 7: Checking for errors..." -ForegroundColor Yellow
$errors = docker logs $containerName --tail 50 2>&1 | Select-String -Pattern "postcss|PostCSS|@tailwind|Module parse failed|error|Error" | Select-Object -Last 10
if ($errors) {
    Write-Host "⚠ Found errors:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
} else {
    Write-Host "✓ No errors found!" -ForegroundColor Green
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Fix Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access: http://localhost:5000" -ForegroundColor White
Write-Host ""

