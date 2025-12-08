# Final PostCSS Fix - Create both .cjs and ensure Next.js can find it

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

if (-not $containerName) {
    Write-Host "❌ Container not running!" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Final PostCSS Configuration Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Ensure postcss.config.cjs exists and is correct
Write-Host "Step 1: Verifying postcss.config.cjs..." -ForegroundColor Yellow
$configContent = docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.cjs" 2>&1
if ($configContent -match "tailwindcss") {
    Write-Host "✓ postcss.config.cjs is correct" -ForegroundColor Green
} else {
    Write-Host "✗ postcss.config.cjs is incorrect!" -ForegroundColor Red
    Write-Host "Creating correct config..." -ForegroundColor Yellow
    docker exec $containerName sh -c "cd /app/servers/nextjs && echo 'module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };' > postcss.config.cjs" 2>&1 | Out-Null
    Write-Host "✓ Config created" -ForegroundColor Green
}
Write-Host ""

# Step 2: Verify PostCSS packages are installed
Write-Host "Step 2: Verifying PostCSS packages..." -ForegroundColor Yellow
$postcss = docker exec $containerName sh -c "cd /app/servers/nextjs && npm list postcss 2>/dev/null | head -1" 2>&1
$tailwind = docker exec $containerName sh -c "cd /app/servers/nextjs && npm list tailwindcss 2>/dev/null | head -1" 2>&1
$autoprefixer = docker exec $containerName sh -c "cd /app/servers/nextjs && npm list autoprefixer 2>/dev/null | head -1" 2>&1

Write-Host "PostCSS: $postcss" -ForegroundColor Gray
Write-Host "Tailwind: $tailwind" -ForegroundColor Gray
Write-Host "Autoprefixer: $autoprefixer" -ForegroundColor Gray
Write-Host ""

# Step 3: Test if PostCSS config can be loaded
Write-Host "Step 3: Testing PostCSS config loading..." -ForegroundColor Yellow
$testResult = docker exec $containerName sh -c "cd /app/servers/nextjs && node -e 'const config = require(\"./postcss.config.cjs\"); console.log(\"SUCCESS: Config loaded\");'" 2>&1
if ($testResult -match "SUCCESS") {
    Write-Host "✓ PostCSS config can be loaded" -ForegroundColor Green
} else {
    Write-Host "✗ PostCSS config cannot be loaded" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
}
Write-Host ""

# Step 4: Clear all caches
Write-Host "Step 4: Clearing all caches..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && rm -rf .next-build .next node_modules/.cache" 2>&1 | Out-Null
Write-Host "✓ Caches cleared" -ForegroundColor Green
Write-Host ""

# Step 5: Restart
Write-Host "Step 5: Restarting container..." -ForegroundColor Yellow
docker compose restart development
Write-Host "✓ Container restarted" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting 30 seconds for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host ""

# Step 6: Check for errors
Write-Host "Step 6: Checking for errors..." -ForegroundColor Yellow
$errors = docker logs $containerName --tail 30 2>&1 | Select-String -Pattern "postcss|PostCSS|@tailwind|Module parse failed" | Select-Object -Last 5
if ($errors) {
    Write-Host "⚠ Still found errors:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Trying alternative: Creating postcss.config.js with ESM format..." -ForegroundColor Yellow
    docker exec $containerName sh -c "cd /app/servers/nextjs && echo 'export default { plugins: { tailwindcss: {}, autoprefixer: {} } };' > postcss.config.mjs" 2>&1 | Out-Null
    docker exec $containerName sh -c "cd /app/servers/nextjs && rm -f postcss.config.cjs" 2>&1 | Out-Null
    Write-Host "✓ Created postcss.config.mjs" -ForegroundColor Green
    docker compose restart development
    Start-Sleep -Seconds 20
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

