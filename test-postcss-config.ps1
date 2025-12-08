# Test PostCSS Config

$containerName = docker ps --filter "name=presenton" --format "{{.Names}}" | Select-Object -First 1

Write-Host "Testing PostCSS config in container..." -ForegroundColor Yellow

# Test if config can be loaded
docker exec $containerName sh -c "cd /app/servers/nextjs && node --input-type=module -e 'import config from \"./postcss.config.mjs\"; console.log(\"Config:\", JSON.stringify(config, null, 2));'" 2>&1

Write-Host ""
Write-Host "Testing if plugins can be imported..." -ForegroundColor Yellow
docker exec $containerName sh -c "cd /app/servers/nextjs && node --input-type=module -e 'import tailwindcss from \"tailwindcss\"; import autoprefixer from \"autoprefixer\"; console.log(\"tailwindcss:\", typeof tailwindcss); console.log(\"autoprefixer:\", typeof autoprefixer);'" 2>&1

