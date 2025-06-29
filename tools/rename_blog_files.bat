@echo off
rem 重命名博客文件的批处理脚本

echo 正在检查必要的Python包...

rem 检查是否安装了必要的Python包
python -c "import bs4" 2>nul
if %errorlevel% neq 0 (
    echo 正在安装必要的Python包: bs4...
    pip install bs4
    if %errorlevel% neq 0 (
        echo 无法安装bs4。请手动安装后再运行此脚本。
        echo 使用命令: pip install bs4
        pause
        exit /b 1
    )
)

echo 正在运行博客文件重命名工具...
python "%~dp0rename_blog_files.py"

if %errorlevel% equ 0 (
    echo 重命名操作完成！
) else (
    echo 重命名操作失败。
)

pause 