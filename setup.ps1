# =================================================================
# Script de Configuracion Inicial - AuraDoc (Windows)
# =================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuracion de AuraDoc (Frontend Vite)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Verificar Docker
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) { throw }
} catch {
    Write-Host "ERROR: Docker no esta ejecutandose." -ForegroundColor Red
    Read-Host "Presiona Enter para salir..."
    exit 1
}

# 2. Pedir URLs de las APIs
Write-Host "`nConfiguracion de APIs:" -ForegroundColor Green

$apiDotnetUrl = Read-Host "Ingresa la URL de la API .NET (Enter para 'http://localhost:5000')"
if ([string]::IsNullOrWhiteSpace($apiDotnetUrl)) { $apiDotnetUrl = "http://localhost:5000" }

$apiBackendUrl = Read-Host "Ingresa la URL de la API Node.js (Enter para 'http://localhost:3000')"
if ([string]::IsNullOrWhiteSpace($apiBackendUrl)) { $apiBackendUrl = "http://localhost:3000" }

# 3. Guardar en .env
Write-Host "`nGenerando archivo .env..."
# Reemplazar localhost por host.docker.internal para que funcione dentro del contenedor
$apiDotnetUrl = $apiDotnetUrl -replace "localhost", "host.docker.internal"
$apiBackendUrl = $apiBackendUrl -replace "localhost", "host.docker.internal"

Set-Content -Path ".env" -Value "API_DOTNET_URL=$apiDotnetUrl" -Encoding ascii
Add-Content -Path ".env" -Value "API_BACKEND_URL=$apiBackendUrl" -Encoding ascii

# 4. Limpiar e Iniciar Docker
Write-Host "`nLimpiando contenedores anteriores..." -ForegroundColor Cyan
docker compose down -v
Write-Host "Levantando entorno de AuraDoc..." -ForegroundColor Cyan
docker compose up -d --build

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ¡Entorno configurado con exito!" -ForegroundColor Green
Write-Host "  AuraDoc disponible en: http://localhost:5173" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green

Read-Host "Presiona Enter para salir..."
