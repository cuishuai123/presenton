# Try postcss.config.js (without extension in name)

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "Trying postcss.config.js (CommonJS format)..." -ForegroundColor Cyan
Write-Host ""

# Create postcss.config.js
Write-Host "Step 1: Creating postcss.config.js..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && echo 'module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };' > postcss.config.js" 2>&1 | Out-Null
Write-Host "✓ Created" -ForegroundColor Green
Write-Host ""

# Remove .cjs file
Write-Host "Step 2: Removing postcss.config.cjs..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -f postcss.config.cjs" 2>&1 | Out-Null
Write-Host "✓ Removed" -ForegroundColor Green
Write-Host ""

# Verify
Write-Host "Step 3: Verifying config..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.js" 2>&1
Write-Host ""

# Clear cache
Write-Host "Step 4: Clearing cache..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build .next node_modules/.cache" 2>&1 | Out-Null
Write-Host "✓ Cleared" -ForegroundColor Green
Write-Host ""

# Restart
Write-Host "Step 5: Restarting..." -ForegroundColor Yellow
docker compose restart development
Write-Host "✓ Restarted" -ForegroundColor Green
Write-Host ""

Write-Host "Wait 40 seconds and check logs..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

Write-Host ""
Write-Host "Checking for errors..." -ForegroundColor Cyan
docker compose logs development --tail=30 | Select-String -Pattern "postcss|@tailwind|error|Error|Ready|Compiling" | Select-Object -Last 10








