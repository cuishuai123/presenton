# Cleanup PostCSS config files in container

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

if (-not $containerName) {
    Write-Host "❌ Container not running!" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Cleaning up PostCSS config files" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# List all postcss config files
Write-Host "Step 1: Listing all PostCSS config files..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && ls -la postcss.config.* 2>&1 || echo 'No postcss config files found'"
Write-Host ""

# Remove all postcss config files except .cjs
Write-Host "Step 2: Removing conflicting config files..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -f postcss.config.js postcss.config.mjs postcss.config.json 2>&1" | Out-Null
Write-Host "✓ Removed conflicting files" -ForegroundColor Green
Write-Host ""

# Verify only .cjs exists
Write-Host "Step 3: Verifying only postcss.config.cjs exists..." -ForegroundColor Yellow
$files = docker exec $containerName sh -c "cd /app/servers/nextjs && ls -1 postcss.config.* 2>&1"
if ($files -match "postcss.config.cjs" -and $files -notmatch "postcss.config.js" -and $files -notmatch "postcss.config.mjs") {
    Write-Host "✓ Only postcss.config.cjs exists" -ForegroundColor Green
    Write-Host "Content:" -ForegroundColor Gray
    docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.cjs" 2>&1
} else {
    Write-Host "⚠ Found multiple config files:" -ForegroundColor Yellow
    Write-Host $files -ForegroundColor Gray
}
Write-Host ""

# Clear Next.js cache
Write-Host "Step 4: Clearing Next.js cache..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build .next node_modules/.cache" 2>&1 | Out-Null
Write-Host "✓ Cache cleared" -ForegroundColor Green
Write-Host ""

# Restart
Write-Host "Step 5: Restarting container..." -ForegroundColor Yellow
docker compose restart development
Write-Host "✓ Container restarted" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait 30 seconds and check logs:" -ForegroundColor Yellow
Write-Host "  docker compose logs development --tail=50" -ForegroundColor Gray
Write-Host ""

