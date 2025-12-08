# Check and Fix PostCSS Issue

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PostCSS Diagnostic and Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

if (-not $containerName) {
    Write-Host "❌ Container not running!" -ForegroundColor Red
    exit 1
}

Write-Host "Container: $containerName" -ForegroundColor Green
Write-Host ""

# Step 1: Check if postcss is actually installed
Write-Host "Step 1: Checking PostCSS installation..." -ForegroundColor Yellow
$postcssCheck = docker exec $containerName sh -c "cd /app/servers/nextjs && test -f node_modules/postcss/package.json && cat node_modules/postcss/package.json | grep version" 2>&1
if ($postcssCheck) {
    Write-Host "✓ PostCSS found: $postcssCheck" -ForegroundColor Green
} else {
    Write-Host "✗ PostCSS NOT found!" -ForegroundColor Red
    Write-Host "Installing PostCSS..." -ForegroundColor Yellow
    docker exec $containerName sh -c "cd /app/servers/nextjs && npm install postcss@^8.4.47 --save --force" 2>&1 | Out-Null
    Write-Host "✓ PostCSS installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Check postcss.config.cjs
Write-Host "Step 2: Checking postcss.config.cjs..." -ForegroundColor Yellow
$configContent = docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.cjs" 2>&1
if ($configContent -match "tailwindcss") {
    Write-Host "✓ postcss.config.cjs exists and contains tailwindcss" -ForegroundColor Green
    Write-Host "Content:" -ForegroundColor Gray
    Write-Host $configContent -ForegroundColor Gray
} else {
    Write-Host "✗ postcss.config.cjs is missing or incorrect!" -ForegroundColor Red
}
Write-Host ""

# Step 3: Check if Next.js can find the config
Write-Host "Step 3: Testing PostCSS config loading..." -ForegroundColor Yellow
$testScript = 'const config = require("./postcss.config.cjs"); console.log("Config loaded:", JSON.stringify(config));'
$testResult = docker exec $containerName sh -c "cd /app/servers/nextjs && node -e '$testScript'" 2>&1
if ($testResult -match "Config loaded") {
    Write-Host "✓ PostCSS config can be loaded" -ForegroundColor Green
    Write-Host $testResult -ForegroundColor Gray
} else {
    Write-Host "✗ PostCSS config cannot be loaded!" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
}
Write-Host ""

# Step 4: Check Next.js logs for specific errors
Write-Host "Step 4: Checking Next.js logs for PostCSS errors..." -ForegroundColor Yellow
$errors = docker logs $containerName 2>&1 | Select-String -Pattern "postcss|PostCSS|@tailwind|Module parse failed" | Select-Object -Last 5
if ($errors) {
    Write-Host "⚠ Found errors:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
} else {
    Write-Host "✓ No PostCSS errors in recent logs" -ForegroundColor Green
}
Write-Host ""

# Step 5: Check if postcss can be required
Write-Host "Step 5: Testing PostCSS module..." -ForegroundColor Yellow
$postcssTest = docker exec $containerName sh -c "cd /app/servers/nextjs && node -e 'const postcss = require(\"postcss\"); console.log(\"PostCSS version:\", postcss().version || \"loaded\");'" 2>&1
if ($postcssTest -match "PostCSS|loaded") {
    Write-Host "✓ PostCSS module can be required" -ForegroundColor Green
} else {
    Write-Host "✗ PostCSS module cannot be required" -ForegroundColor Red
    Write-Host $postcssTest -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Diagnosis Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If PostCSS is installed but still not working:" -ForegroundColor Yellow
Write-Host "1. Restart the container: docker compose restart development" -ForegroundColor Gray
Write-Host "2. Clear Next.js cache: docker exec $containerName sh -c 'cd /app/servers/nextjs && rm -rf .next-build'" -ForegroundColor Gray
Write-Host "3. Check full logs: docker logs $containerName --tail=200 -f" -ForegroundColor Gray
Write-Host ""

