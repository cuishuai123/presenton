# Switch to ESM format PostCSS config

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "Switching to ESM format PostCSS config..." -ForegroundColor Yellow
Write-Host ""

# Remove .cjs file
Write-Host "Step 1: Removing postcss.config.cjs..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -f postcss.config.cjs" 2>&1 | Out-Null
Write-Host "✓ Removed" -ForegroundColor Green
Write-Host ""

# Create .mjs file
Write-Host "Step 2: Creating postcss.config.mjs..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && echo 'export default { plugins: { tailwindcss: {}, autoprefixer: {} } };' > postcss.config.mjs" 2>&1 | Out-Null
Write-Host "✓ Created" -ForegroundColor Green
Write-Host ""

# Verify
Write-Host "Step 3: Verifying config..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.mjs" 2>&1
Write-Host ""

# Clear cache
Write-Host "Step 4: Clearing cache..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build .next node_modules/.cache" 2>&1 | Out-Null
Write-Host "✓ Cache cleared" -ForegroundColor Green
Write-Host ""

# Restart
Write-Host "Step 5: Restarting..." -ForegroundColor Yellow
docker compose restart development
Write-Host "✓ Restarted" -ForegroundColor Green
Write-Host ""

Write-Host "Wait 30 seconds and check logs..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
docker compose logs development --tail=30 | Select-String -Pattern "postcss|PostCSS|@tailwind|error|Error" | Select-Object -Last 10

