@echo off
echo ========================================
echo    CodeVista Backend Startup Script
echo ========================================
echo.

echo [1/3] Checking Ballerina installation...
bal -v
if %errorlevel% neq 0 (
    echo ERROR: Ballerina is not installed or not in PATH
    echo Please install Ballerina 2201.12.7 or later
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Ballerina Backend...
echo Starting on http://localhost:3001
start "Ballerina Backend" cmd /k "cd /d %~dp0 && bal run"

echo.
echo [3/3] Starting CORS Proxy...
echo Starting on http://localhost:3002
start "CORS Proxy" cmd /k "cd /d %~dp0 && node working-cors-proxy.js"

echo.
echo ========================================
echo    Services Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo CORS Proxy:  http://localhost:3002
echo Frontend:    http://localhost:8080
echo.
echo Press any key to close this window...
pause > nul
