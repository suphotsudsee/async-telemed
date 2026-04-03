@echo off
echo ========================================
echo   Async Telemed - Development Startup
echo ========================================
echo.

:: Start PostgreSQL (assumes Docker)
echo [1/4] Starting PostgreSQL...
docker ps -a | Select-String "postgres" > $null
if ($LASTEXITCODE -ne 0) {
    docker run -d --name telemed-postgres -e POSTGRES_DB=telemed -e POSTGRES_USER=telemed -e POSTGRES_PASSWORD=telemed -p 5432:5432 postgres:16
}

:: Wait for PostgreSQL
echo [2/4] Waiting for PostgreSQL...
Start-Sleep -Seconds 3

:: Run database migrations
echo [3/4] Running database migrations...
$env:PGPASSWORD = "telemed"
Get-Content "..\database\migrations\001_init.sql" | psql -h localhost -U telemed -d telemed 2>$null
Get-Content "..\database\migrations\002_seed.sql" | psql -h localhost -U telemed -d telemed 2>$null

echo.
echo ========================================
echo   Starting Services
echo ========================================
echo.

:: Start Backend Node API
echo [4/4] Starting Node API (port 8080)...
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd ..\backend\node-api; npm run dev"

:: Start Frontends
echo Starting Patient Frontend (port 5173)...
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd ..\frontend-patient; npm run dev"

echo Starting Doctor Frontend (port 5174)...
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd ..\frontend-doctor; npm run dev"

echo Starting Admin Frontend (port 5175)...
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd ..\frontend-admin; npm run dev"

echo.
echo ========================================
echo   All services starting!
echo ========================================
echo.
echo Services:
echo   - Node API:      http://localhost:8080
echo   - Patient App:   http://localhost:5173
echo   - Doctor App:    http://localhost:5174
echo   - Admin App:     http://localhost:5175
echo.
echo Press any key to exit...
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
