# Direct PostCSS Fix

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "Direct PostCSS Fix" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current files
Write-Host "Step 1: Current PostCSS config files..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && ls -la postcss.config.* 2>&1"
Write-Host ""

# Step 2: Create correct config
Write-Host "Step 2: Creating postcss.config.mjs..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && cat > postcss.config.mjs" <<'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF
Write-Host "✓ Created" -ForegroundColor Green
Write-Host ""

# Step 3: Remove other config files
Write-Host "Step 3: Removing other config files..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -f postcss.config.cjs postcss.config.js" 2>&1 | Out-Null
Write-Host "✓ Removed" -ForegroundColor Green
Write-Host ""

# Step 4: Verify
Write-Host "Step 4: Verifying config..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.mjs" 2>&1
Write-Host ""

# Step 5: Clear cache
Write-Host "Step 5: Clearing cache..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build .next node_modules/.cache" 2>&1 | Out-Null
Write-Host "✓ Cleared" -ForegroundColor Green
Write-Host ""

# Step 6: Restart
Write-Host "Step 6: Restarting..." -ForegroundColor Yellow
docker compose restart development
Write-Host "✓ Restarted" -ForegroundColor Green
Write-Host ""

Write-Host "Wait 30 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Check logs:" -ForegroundColor Cyan
docker compose logs development --tail=20 | Select-String -Pattern "postcss|@tailwind|error|Error|Ready" | Select-Object -Last 10








