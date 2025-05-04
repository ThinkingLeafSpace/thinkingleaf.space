@echo off
chcp 65001 > nul
echo === ThinkingLeaf GitHub自动同步 ===
echo 正在同步文件到GitHub...

git add .
git commit -m "自动同步: %date% %time%"
git push

echo.
echo 同步完成!
echo.
pause 