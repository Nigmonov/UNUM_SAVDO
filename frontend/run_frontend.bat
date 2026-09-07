@echo off
cd /d "%~dp0"
title UNUM Frontend

if not exist "node_modules" (
  echo Frontend paketlari topilmadi. npm install bajarilmoqda...
  call npm install
  if errorlevel 1 (
    echo [XATO] npm install bajarilmadi.
    pause
    exit /b 1
  )
)

if exist ".next" rmdir /s /q ".next"
call npm run dev
