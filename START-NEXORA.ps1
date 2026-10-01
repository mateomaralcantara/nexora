$ErrorActionPreference = "Stop"
if (-not (Test-Path ".env.local")) { Copy-Item ".env.example" ".env.local"; Write-Host "Se creó .env.local. Configura tus credenciales." -ForegroundColor Yellow }
Write-Host "Nexora Realty OS -> http://localhost:3000" -ForegroundColor Cyan
npm run dev
