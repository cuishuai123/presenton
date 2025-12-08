# Fix PostCSS Package Issue

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PostCSS Package Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if postcss package is installed
Write-Host "Step 1: Checking PostCSS package..." -ForegroundColor Yellow
$postcssCheck = docker exec $containerName sh -c "cd /app/servers/nextjs && npm list postcss 2>&1" 2>&1
if ($postcssCheck -match "postcss@") {
    Write-Host "✓ PostCSS is installed" -ForegroundColor Green
    Write-Host $postcssCheck -ForegroundColor Gray
} else {
    Write-Host "✗ PostCSS is NOT installed!" -ForegroundColor Red
    Write-Host "Installing PostCSS..." -ForegroundColor Yellow
    docker exec $containerName sh -c "cd /app/servers/nextjs && npm install postcss@8.4.47 --save --force" 2>&1 | Out-Null
    Write-Host "✓ PostCSS installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Verify all packages
Write-Host "Step 2: Verifying all required packages..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && npm list postcss tailwindcss autoprefixer 2>&1 | grep -E 'postcss@|tailwindcss@|autoprefixer@' | head -3" 2>&1
Write-Host ""

# Step 3: Ensure config file is correct
Write-Host "Step 3: Ensuring config file is correct..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.cjs" 2>&1
Write-Host ""

# Step 4: Clear cache
Write-Host "Step 4: Clearing cache..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build .next node_modules/.cache" 2>&1 | Out-Null
Write-Host "✓ Cache cleared" -ForegroundColor Green
Write-Host ""

# Step 5: Restart
Write-Host "Step 5: Restarting..." -ForegroundColor Yellow
docker compose restart development
Write-Host "✓ Restarted" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting 40 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

Write-Host ""
Write-Host "Checking logs for errors..." -ForegroundColor Cyan
docker compose logs development --tail=30 | Select-String -Pattern "postcss|@tailwind|error|Error|Ready" | Select-Object -Last 10

