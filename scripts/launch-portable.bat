@echo off
setlocal
set "NODE_DIR=%~dp0node"
set "APP_DIR=%~dp0standalone"
set "DATA_DIR=%LOCALAPPDATA%\FinControl\data"

if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"

set FINCONTROL_DATA_DIR=%DATA_DIR%
set FINCONTROL_MIGRATIONS_DIR=%APP_DIR%\lib\db\migrations
set NODE_ENV=production
set PORT=38472
set HOSTNAME=127.0.0.1

cd /d "%APP_DIR%"
start "" "%NODE_DIR%\node.exe" server.js

timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:38472"
