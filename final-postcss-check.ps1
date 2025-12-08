# Final PostCSS Check and Fix

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Final PostCSS Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check all config files
Write-Host "Step 1: Checking PostCSS config files..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && ls -la postcss.config.* 2>&1"
Write-Host ""

# Step 2: Check postcss.config.cjs content
Write-Host "Step 2: Checking postcss.config.cjs content..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && cat postcss.config.cjs" 2>&1
Write-Host ""

# Step 3: Test if config can be loaded
Write-Host "Step 3: Testing config loading..." -ForegroundColor Yellow
$testScript = "const config = require('./postcss.config.cjs'); console.log('SUCCESS: Config loaded'); console.log(JSON.stringify(config));"
docker exec $containerName sh -c "cd /app/servers/nextjs && node -e `"$testScript`"" 2>&1
Write-Host ""

# Step 4: Check PostCSS package
Write-Host "Step 4: Checking PostCSS package..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && npm list postcss 2>/dev/null | head -2" 2>&1
Write-Host ""

# Step 5: Check tailwindcss package
Write-Host "Step 5: Checking TailwindCSS package..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && npm list tailwindcss 2>/dev/null | head -2" 2>&1
Write-Host ""

# Step 6: Check Next.js version
Write-Host "Step 6: Checking Next.js version..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && npm list next 2>/dev/null | head -2" 2>&1
Write-Host ""

# Step 7: Check file permissions
Write-Host "Step 7: Checking file permissions..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && ls -la postcss.config.cjs" 2>&1
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "If config cannot be loaded, try:" -ForegroundColor Yellow
Write-Host "1. Ensure postcss.config.cjs uses CommonJS format" -ForegroundColor Gray
Write-Host "2. Check that postcss and tailwindcss are installed" -ForegroundColor Gray
Write-Host "3. Clear cache and restart" -ForegroundColor Gray
Write-Host ""

