@echo off
echo Starting Tetri Copilot...
pm2 delete tetri-backend 2>nul
pm2 start C:\tetri-copilot\backend\src\server.js --name "tetri-backend" --cwd "C:\tetri-copilot\backend"
start cmd /k "cd /d C:\tetri-copilot\frontend && npm run dev"
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
