@echo off
cd /d "%~dp0"
title UNUM SAVDO STARTER

echo ==========================================
echo          UNUM SAVDO ISHGA TUSHMOQDA
echo ==========================================
echo.

if not exist ".venv\Scripts\python.exe" (
  echo [XATO] .venv topilmadi.
  echo Avval INSTALL_UNUM.bat ni bir marta ishga tushiring.
  pause
  exit /b 1
)

if not exist "backend\app\main.py" (
  echo [XATO] backend\app\main.py topilmadi.
  pause
  exit /b 1
)

if not exist "frontend\app\page.js" (
  echo [XATO] frontend\app\page.js topilmadi.
  pause
  exit /b 1
)

echo [1/2] Backend alohida oynada ishga tushmoqda...
start "UNUM Backend" cmd /k call "%~dp0backend\run_server.bat"

timeout /t 3 /nobreak >nul

echo [2/2] Frontend alohida oynada ishga tushmoqda...
start "UNUM Frontend" cmd /k call "%~dp0frontend\run_frontend.bat"

timeout /t 7 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo Frontend : http://localhost:3000
echo Backend  : http://127.0.0.1:8000
echo API Docs : http://127.0.0.1:8000/docs
echo.
echo Backend va Frontend oynalarini yopmang.
pause
