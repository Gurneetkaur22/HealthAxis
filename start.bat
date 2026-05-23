@echo off
echo ==========================================
echo  Hospital Management System
echo ==========================================
echo.

echo [1/2] Installing backend dependencies...
cd /d "%~dp0backend"
npm install
if %errorlevel% neq 0 ( echo ERROR: Backend install failed & pause & exit /b 1 )

echo.
echo [2/2] Installing frontend dependencies...
cd /d "%~dp0frontend"
npm install
if %errorlevel% neq 0 ( echo ERROR: Frontend install failed & pause & exit /b 1 )

echo.
echo Starting servers...
echo   Backend  ^> http://localhost:5000
echo   Frontend ^> http://localhost:5173
echo.
echo NOTE: Make sure PostgreSQL is running and backend\.env has your DB password.
echo.

start "HMS Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 3 /nobreak >nul
start "HMS Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Both servers started in new windows.
pause
