@echo off
title Hospital Management System
echo ===================================================
echo    Starting Hospital Management System (HMS)
echo ===================================================
echo.

echo [1/2] Starting Backend Server...
start "HMS Backend" cmd /k "cd backend && npm run dev"

echo [2/2] Starting Frontend Server...
start "HMS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Both servers are opening in new windows!
echo Once they finish loading, your app will be at:
echo http://localhost:5173
echo ===================================================
echo.
pause
