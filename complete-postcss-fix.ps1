# Complete PostCSS Fix

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Complete PostCSS Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check PostCSS version
Write-Host "Step 1: Checking PostCSS version..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && npm list postcss tailwindcss autoprefixer 2>/dev/null | grep -E 'postcss|tailwindcss|autoprefixer' | head -3" 2>&1
Write-Host ""

# Step 2: Ensure correct versions
Write-Host "Step 2: Ensuring correct package versions..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && npm install postcss@8.4.47 tailwindcss@3.4.1 autoprefixer@10.4.20 --save-exact --force --no-audit" 2>&1 | Select-String -Pattern "added|removed|postcss" | Select-Object -Last 3
Write-Host ""

# Step 3: Ensure config file exists
Write-Host "Step 3: Ensuring postcss.config.mjs exists..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && test -f postcss.config.mjs && echo 'EXISTS' || echo 'MISSING'" 2>&1
docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.mjs" 2>&1
Write-Host ""

# Step 4: Remove all other config files
Write-Host "Step 4: Removing conflicting config files..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -f postcss.config.cjs postcss.config.js postcss.config.json" 2>&1 | Out-Null
Write-Host "✓ Removed" -ForegroundColor Green
Write-Host ""

# Step 5: Clear all caches
Write-Host "Step 5: Clearing all caches..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build .next node_modules/.cache .next-build/cache" 2>&1 | Out-Null
Write-Host "✓ Cleared" -ForegroundColor Green
Write-Host ""

# Step 6: Restart
Write-Host "Step 6: Restarting container..." -ForegroundColor Yellow
docker compose restart development
Write-Host "✓ Restarted" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting 40 seconds for services to fully start..." -ForegroundColor Yellow
Start-Sleep -Seconds 40
Write-Host ""

# Step 7: Check for errors
Write-Host "Step 7: Checking for errors..." -ForegroundColor Yellow
$errors = docker logs $containerName --tail=50 2>&1 | Select-String -Pattern "postcss|PostCSS|@tailwind|Module parse failed" | Select-Object -Last 10
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

