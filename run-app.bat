@echo off
chcp 65001 > nul
title برنامج مصاريف بيتي
cd /d "%~dp0"
npm.cmd run dev
pause
