@echo off
title EVERGREEN CHRONICLES — Medieval x Modern Fantasy RPG
color 0A
cls
echo ===============================================================================
echo     🌲 EVERGREEN CHRONICLES: MEDIEVAL x MODERN FANTASY RPG
echo ===============================================================================
echo  [+] Memulai server game & mesin simulasi pertanian...
echo  [+] Browser akan terbuka otomatis di: http://127.0.0.1:8082
echo  [+] Tekan Ctrl+C di terminal ini untuk mematikan server game kapan saja.
echo ===============================================================================
echo.

cd /d "%~dp0\backend"
python run.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Terjadi kesalahan saat menjalankan game engine.
    pause
)
