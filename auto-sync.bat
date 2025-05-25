@echo off
chcp 65001 > nul
echo === ThinkingLeaf GitHub自动同步 ===

REM 检查Git状态
echo Checking Git Status...
git status

REM 询问用户是否继续
echo.
set /p CONTINUE=Continue sync? (Y/N): 
if /i "%CONTINUE%" neq "Y" goto :end

echo.
echo Syncing to GitHub...

REM 拉取最新更改
echo Fetching remote changes...
git pull
if %errorlevel% neq 0 (
    echo Pull failed, you might need to resolve conflicts first.
    set /p CONTINUE_ANYWAY=Continue anyway? (Y/N): 
    if /i "%CONTINUE_ANYWAY%" neq "Y" goto :end
)

REM 添加所有文件
git add .

REM 提交更改
git commit -m "Auto Sync: %date% %time%"
if %errorlevel% neq 0 (
    echo Commit failed, there might be no changes to commit.
    goto :push
)

:push
REM 推送到远程
echo Pushing to GitHub...
git push
if %errorlevel% neq 0 (
    echo Push failed, please check your network connection or GitHub credentials.
    goto :end
)

echo.
echo Sync completed!

:end
echo.
pause 