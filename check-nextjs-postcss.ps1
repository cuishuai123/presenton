# Check how Next.js finds PostCSS config

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "Checking Next.js PostCSS configuration..." -ForegroundColor Cyan
Write-Host ""

# Check what config files exist
Write-Host "1. PostCSS config files:" -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && ls -la postcss.config.* 2>&1"
Write-Host ""

# Check package.json type
Write-Host "2. Package.json type:" -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && grep '\"type\"' package.json" 2>&1
Write-Host ""

# Check if Next.js can find the config
Write-Host "3. Testing Next.js config finder..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && node -e 'const path = require(\"path\"); const fs = require(\"fs\"); const dir = process.cwd(); const files = [\"postcss.config.js\", \"postcss.config.mjs\", \"postcss.config.cjs\", \"postcss.config.json\"]; files.forEach(f => { const p = path.join(dir, f); if (fs.existsSync(p)) console.log(\"Found:\", f); });'" 2>&1
Write-Host ""

# Check PostCSS package
Write-Host "4. PostCSS package location:" -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && test -d node_modules/postcss && echo 'PostCSS dir exists' && ls node_modules/postcss/package.json 2>&1 | head -1 || echo 'PostCSS NOT found'" 2>&1
Write-Host ""

# Check tailwindcss package
Write-Host "5. TailwindCSS package:" -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && test -d node_modules/tailwindcss && echo 'TailwindCSS exists' || echo 'TailwindCSS NOT found'" 2>&1
Write-Host ""

Write-Host "If postcss.config.mjs exists but Next.js can't find it, try creating postcss.config.js" -ForegroundColor Yellow
Write-Host ""

