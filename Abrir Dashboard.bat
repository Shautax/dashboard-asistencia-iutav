@echo off
title Dashboard - Servidor de desarrollo
cd /d "%~dp0"

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
)

echo Iniciando el dashboard en http://localhost:5173 ...
echo Cierra esta ventana para detener el servidor.
call npm run dev -- --open
pause
