@echo off
echo === Git Sync Tool ===

git status
echo.

set /p CONTINUE=Continue? (Y/N): 
if /i "%CONTINUE%" neq "Y" goto :end

git add .
git commit -m "Update: %date% %time%"
git pull --rebase
git push

echo.
echo Done!

:end
pause 