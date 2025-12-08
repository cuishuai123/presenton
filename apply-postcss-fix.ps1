# Apply PostCSS fix to container

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "Applying PostCSS fix..." -ForegroundColor Yellow
Write-Host ""

# Update config in container
Write-Host "Step 1: Updating postcss.config.mjs in container..." -ForegroundColor Cyan
$configContent = @"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@

docker exec $containerName sh -c "cd /app/servers/nextjs && cat > postcss.config.mjs" <<< $configContent 2>&1 | Out-Null
Write-Host "✓ Config updated" -ForegroundColor Green
Write-Host ""

# Verify
Write-Host "Step 2: Verifying config..." -ForegroundColor Cyan
docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.mjs" 2>&1
Write-Host ""

# Remove any .cjs or .js files
Write-Host "Step 3: Removing conflicting files..." -ForegroundColor Cyan
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -f postcss.config.cjs postcss.config.js" 2>&1 | Out-Null
Write-Host "✓ Removed" -ForegroundColor Green
Write-Host ""

# Clear cache
Write-Host "Step 4: Clearing cache..." -ForegroundColor Cyan
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build .next node_modules/.cache" 2>&1 | Out-Null
Write-Host "✓ Cache cleared" -ForegroundColor Green
Write-Host ""

# Restart
Write-Host "Step 5: Restarting..." -ForegroundColor Cyan
docker compose restart development
Write-Host "✓ Restarted" -ForegroundColor Green
Write-Host ""

Write-Host "Wait 30 seconds and check if it works..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Checking logs for errors..." -ForegroundColor Cyan
docker compose logs development --tail=30 | Select-String -Pattern "postcss|PostCSS|@tailwind|error|Error" | Select-Object -Last 5

