@echo off
chcp 65001 > nul
echo === ThinkingLeaf GitHub自动同步 ===

REM 检查Git状态
echo 检查Git状态...
git status

REM 询问用户是否继续
echo.
set /p CONTINUE=是否继续同步? (Y/N): 
if /i "%CONTINUE%" neq "Y" goto :end

echo.
echo 正在同步文件到GitHub...

REM 添加所有文件
git add .

REM 提交更改
git commit -m "自动同步: %date% %time%"
if %errorlevel% neq 0 (
    echo 提交失败，可能没有更改需要提交
    goto :push
)

:push
REM 推送到远程
echo 正在推送到GitHub...
git push
if %errorlevel% neq 0 (
    echo 推送失败，请检查网络连接或GitHub凭据
    goto :end
)

echo.
echo 同步完成!

:end
echo.
pause 