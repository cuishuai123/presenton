# Test PostCSS directly in container

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "Testing PostCSS configuration..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Check if config file exists
Write-Host "Test 1: Checking config file..." -ForegroundColor Cyan
docker exec $containerName sh -c "cd /app/servers/nextjs && ls -la postcss.config.*" 2>&1
Write-Host ""

# Test 2: Try to load config
Write-Host "Test 2: Testing config loading..." -ForegroundColor Cyan
$testScript = "import('./postcss.config.mjs').then(m => console.log('Config:', JSON.stringify(m.default))).catch(e => console.log('Error:', e.message));"
docker exec $containerName sh -c "cd /app/servers/nextjs && node --input-type=module -e `"$testScript`"" 2>&1
Write-Host ""

# Test 3: Check if plugins can be imported
Write-Host "Test 3: Testing plugin imports..." -ForegroundColor Cyan
docker exec $containerName sh -c "cd /app/servers/nextjs && node --input-type=module -e 'import tailwindcss from \"tailwindcss\"; import autoprefixer from \"autoprefixer\"; console.log(\"tailwindcss:\", typeof tailwindcss); console.log(\"autoprefixer:\", typeof autoprefixer);'" 2>&1
Write-Host ""

# Test 4: Check Next.js can find config
Write-Host "Test 4: Checking what Next.js sees..." -ForegroundColor Cyan
docker exec $containerName sh -c "cd /app/servers/nextjs && node -e 'const { findConfig } = require(\"next/dist/lib/find-config\"); findConfig(process.cwd(), \"postcss\").then(c => console.log(\"Found:\", c)).catch(e => console.log(\"Error:\", e.message));'" 2>&1
Write-Host ""

