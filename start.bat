@echo off
docker compose up -d --build
echo.
echo =================================
echo   AI数字化卡牌应急推演系统 已启动
echo   访问地址: http://localhost:3001
echo   停止: docker compose down
echo =================================
pause
