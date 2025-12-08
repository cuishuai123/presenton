# Final Fix Script - Complete PostCSS Setup

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Final PostCSS Fix Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

if (-not $containerName) {
    Write-Host "❌ Container not running. Starting..." -ForegroundColor Red
    docker compose up -d --build development
    Start-Sleep -Seconds 10
    $containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1
}

if ($containerName) {
    Write-Host "✓ Container: $containerName" -ForegroundColor Green
    Write-Host ""
    
    # Step 1: Wait for npm install to complete
    Write-Host "Step 1: Waiting for npm install to complete..." -ForegroundColor Yellow
    $maxWait = 300  # 5 minutes
    $waited = 0
    while ($waited -lt $maxWait) {
        $npmRunning = docker exec $containerName sh -c "ps aux | grep 'npm install' | grep -v grep" 2>&1
        if (-not $npmRunning -or $npmRunning -match "not found") {
            Write-Host "✓ npm install completed" -ForegroundColor Green
            break
        }
        Start-Sleep -Seconds 5
        $waited += 5
        Write-Host "  Waiting... ($waited/$maxWait seconds)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Step 2: Verify PostCSS installation
    Write-Host "Step 2: Verifying PostCSS installation..." -ForegroundColor Yellow
    $postcssCheck = docker exec $containerName sh -c "cd /app/servers/nextjs && test -d node_modules/postcss && echo 'INSTALLED' || echo 'NOT_INSTALLED'" 2>&1
    
    if ($postcssCheck -match "NOT_INSTALLED") {
        Write-Host "✗ PostCSS not installed, installing now..." -ForegroundColor Red
        docker exec $containerName sh -c "cd /app/servers/nextjs && npm install postcss@^8.4.47 tailwindcss@^3.4.1 autoprefixer@^10.4.20 --save --force --no-audit" 2>&1 | Out-Null
        Write-Host "✓ PostCSS installed" -ForegroundColor Green
    } else {
        Write-Host "✓ PostCSS is installed" -ForegroundColor Green
    }
    Write-Host ""
    
    # Step 3: Verify configuration files
    Write-Host "Step 3: Verifying configuration files..." -ForegroundColor Yellow
    docker exec $containerName sh -c "cd /app/servers/nextjs && echo '=== postcss.config.cjs ===' && cat postcss.config.cjs 2>/dev/null || echo 'MISSING'"
    Write-Host ""
    docker exec $containerName sh -c "cd /app/servers/nextjs && echo '=== tailwind.config.cjs ===' && head -5 tailwind.config.cjs 2>/dev/null || echo 'MISSING'"
    Write-Host ""
    
    # Step 4: Run verification script
    Write-Host "Step 4: Running PostCSS verification..." -ForegroundColor Yellow
    docker exec $containerName sh -c "cd /app/servers/nextjs && node verify-postcss.cjs" 2>&1
    Write-Host ""
    
    # Step 5: Check Next.js status
    Write-Host "Step 5: Checking Next.js status..." -ForegroundColor Yellow
    $nextjsStatus = docker exec $containerName sh -c "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>&1" 2>&1
    if ($nextjsStatus -match "200|404") {
        Write-Host "✓ Next.js is responding (HTTP $nextjsStatus)" -ForegroundColor Green
    } else {
        Write-Host "✗ Next.js is NOT responding" -ForegroundColor Red
        Write-Host "Checking logs..." -ForegroundColor Yellow
        docker logs $containerName --tail 30 2>&1 | Select-String -Pattern "error|Error|ERROR|postcss|tailwind" | Select-Object -Last 10
    }
    Write-Host ""
    
    # Step 6: Check for PostCSS errors in logs
    Write-Host "Step 6: Checking for PostCSS errors..." -ForegroundColor Yellow
    $errors = docker logs $containerName 2>&1 | Select-String -Pattern "postcss|PostCSS|tailwind|@tailwind|Module parse failed" | Select-Object -Last 10
    if ($errors) {
        Write-Host "⚠ Found PostCSS-related messages:" -ForegroundColor Yellow
        $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    } else {
        Write-Host "✓ No PostCSS errors found" -ForegroundColor Green
    }
    Write-Host ""
    
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Diagnosis Complete" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Access: http://localhost:5000" -ForegroundColor White
    Write-Host ""
    Write-Host "If PostCSS errors persist:" -ForegroundColor Yellow
    Write-Host "1. View full logs: docker logs $containerName --tail 200 -f" -ForegroundColor Gray
    Write-Host "2. Restart container: docker compose restart development" -ForegroundColor Gray
    Write-Host "3. Check browser console for errors" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host "❌ Failed to start container" -ForegroundColor Red
}

