a@echo off
cd /d "%~dp0"
title UNUM SAVDO INSTALL

echo ==========================================
echo        UNUM SAVDO - BIR MARTALIK SETUP
echo ==========================================
echo.

if not exist ".venv\Scripts\python.exe" (
  echo [1/3] Python virtual environment yaratilmoqda...
  py -3.11 -m venv .venv
  if errorlevel 1 (
    echo [XATO] Python 3.11 topilmadi.
    echo Kompyuterda Python 3.11 o'rnatilganini tekshiring.
    pause
    exit /b 1
  )
) else (
  echo [1/3] .venv mavjud.
)

echo [2/3] Backend paketlari o'rnatilmoqda...
".venv\Scripts\python.exe" -m pip install --upgrade pip
".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
if errorlevel 1 (
  echo [XATO] Backend paketlari o'rnatilmadi.
  pause
  exit /b 1
)

echo [3/3] Frontend paketlari o'rnatilmoqda...
pushd frontend
call npm install
if errorlevel 1 (
  popd
  echo [XATO] Frontend paketlari o'rnatilmadi.
  pause
  exit /b 1
)
popd

echo.
echo [OK] UNUM SAVDO tayyor.
echo Endi START_UNUM.bat ni ishga tushiring.
pause
