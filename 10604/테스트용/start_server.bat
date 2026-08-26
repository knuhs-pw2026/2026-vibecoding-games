@echo off
chcp 65001 > nul
title 경북대사대부고 축제 탈출 게임 로컬 서버
echo.
echo ========================================================
echo  경북대사대부고 축제 탈출 게임 [검은 그늘 속에서]
echo  로컬 서버를 시작합니다...
echo ========================================================
echo.

python "%~dp0server.py"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [오류] Python이 설치되어 있지 않거나 경로를 찾을 수 없습니다.
    pause
)
