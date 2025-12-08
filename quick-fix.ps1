# Quick Fix Script for Presenton PostCSS Issues

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Presenton Quick Fix Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop container
Write-Host "Step 1: Stopping container..." -ForegroundColor Yellow
docker compose down development
Write-Host "✓ Container stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Remove old build cache
Write-Host "Step 2: Cleaning build cache..." -ForegroundColor Yellow
docker compose build --no-cache development 2>&1 | Out-Null
Write-Host "✓ Build cache cleaned" -ForegroundColor Green
Write-Host ""

# Step 3: Start container
Write-Host "Step 3: Starting container..." -ForegroundColor Yellow
docker compose up -d --build development
Write-Host "✓ Container started" -ForegroundColor Green
Write-Host ""

# Step 4: Wait for services
Write-Host "Step 4: Waiting for services to start (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host ""

# Step 5: Check container status
Write-Host "Step 5: Checking container status..." -ForegroundColor Yellow
$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1
if ($containerName) {
    Write-Host "✓ Container is running: $containerName" -ForegroundColor Green
    
    # Step 6: Verify PostCSS installation
    Write-Host ""
    Write-Host "Step 6: Verifying PostCSS installation..." -ForegroundColor Yellow
    $postcssCheck = docker exec $containerName sh -c "cd /app/servers/nextjs && test -d node_modules/postcss && echo 'INSTALLED' || echo 'NOT_INSTALLED'" 2>&1
    
    if ($postcssCheck -match "NOT_INSTALLED") {
        Write-Host "✗ PostCSS not found, installing..." -ForegroundColor Red
        docker exec $containerName sh -c "cd /app/servers/nextjs && npm install postcss@^8.4.47 tailwindcss@^3.4.1 autoprefixer@^10.4.20 --save --force --no-audit" 2>&1 | Out-Null
        Write-Host "✓ PostCSS installed" -ForegroundColor Green
    } else {
        Write-Host "✓ PostCSS is installed" -ForegroundColor Green
    }
    
    # Step 7: Check configuration files
    Write-Host ""
    Write-Host "Step 7: Checking configuration files..." -ForegroundColor Yellow
    $postcssConfig = docker exec $containerName sh -c "cd /app/servers/nextjs && test -f postcss.config.cjs && echo 'EXISTS' || echo 'MISSING'" 2>&1
    $tailwindConfig = docker exec $containerName sh -c "cd /app/servers/nextjs && test -f tailwind.config.cjs && echo 'EXISTS' || echo 'MISSING'" 2>&1
    
    if ($postcssConfig -match "EXISTS") {
        Write-Host "✓ postcss.config.cjs exists" -ForegroundColor Green
    } else {
        Write-Host "✗ postcss.config.cjs missing" -ForegroundColor Red
    }
    
    if ($tailwindConfig -match "EXISTS") {
        Write-Host "✓ tailwind.config.cjs exists" -ForegroundColor Green
    } else {
        Write-Host "✗ tailwind.config.cjs missing" -ForegroundColor Red
    }
    
    # Step 8: Check logs for errors
    Write-Host ""
    Write-Host "Step 8: Checking for errors in logs..." -ForegroundColor Yellow
    $errors = docker logs $containerName --tail 50 2>&1 | Select-String -Pattern "error|Error|ERROR|failed|Failed|postcss" | Select-Object -Last 5
    if ($errors) {
        Write-Host "⚠ Found potential errors:" -ForegroundColor Yellow
        $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    } else {
        Write-Host "✓ No obvious errors found" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Fix Complete!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Access your application at: http://localhost:5000" -ForegroundColor White
    Write-Host ""
    Write-Host "To view logs: docker logs $containerName --tail 100 -f" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host "✗ Container is not running!" -ForegroundColor Red
    Write-Host "Please check: docker compose ps" -ForegroundColor Yellow
}

