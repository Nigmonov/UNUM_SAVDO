@echo off
cd /d "%~dp0"
title UNUM Backend

set "PYTHON_EXE=%~dp0..\.venv\Scripts\python.exe"

if not exist "%PYTHON_EXE%" (
  echo [XATO] .venv topilmadi.
  echo Avval loyiha rootidagi INSTALL_UNUM.bat ni ishga tushiring.
  pause
  exit /b 1
)

"%PYTHON_EXE%" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
