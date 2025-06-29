@echo off
rem 博客网站综合维护工具
rem 集成了路径修复、文件重命名和日期修复等功能

setlocal EnableDelayedExpansion

rem 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
rem 移除路径末尾的反斜杠
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
rem 博客目录路径
set "BLOGS_DIR=%SCRIPT_DIR%\blogs"

rem 彩色输出函数（Windows控制台代码）
call :define_colors

rem 主程序入口
if "%~1"=="" (
    rem 如果没有命令行参数，显示交互式菜单
    :menu_loop
    call :show_menu
    set /p choice="请输入选项(0-5): "
    
    if "%choice%"=="1" (
        call :update_related_content_and_paths
    ) else if "%choice%"=="2" (
        call :rename_blog_files
    ) else if "%choice%"=="3" (
        call :fix_blog_dates
    ) else if "%choice%"=="4" (
        call :update_blog_templates
    ) else if "%choice%"=="5" (
        call :update_related_content_and_paths
        call :fix_blog_dates
        call :rename_blog_files
        call :update_blog_templates
    ) else if "%choice%"=="0" (
        goto :eof
    ) else (
        echo %RED%无效选项，请重试%RESET%
    )
    
    echo.
    pause
    goto :menu_loop
) else (
    rem 如果有命令行参数，直接执行相应功能
    if "%~1"=="--update-paths" goto :update_paths
    if "%~1"=="-u" goto :update_paths
    if "%~1"=="--rename" goto :rename
    if "%~1"=="-r" goto :rename
    if "%~1"=="--fix-dates" goto :fix_dates
    if "%~1"=="-f" goto :fix_dates
    if "%~1"=="--update-templates" goto :update_templates
    if "%~1"=="-t" goto :update_templates
    if "%~1"=="--all" goto :all
    if "%~1"=="-a" goto :all
    if "%~1"=="--help" goto :help
    if "%~1"=="-h" goto :help
    
    echo %RED%未知选项: %~1%RESET%
    echo 使用 --help 查看可用选项
    exit /b 1
)

goto :eof

:update_paths
call :update_related_content_and_paths
goto :eof

:rename
call :rename_blog_files
goto :eof

:fix_dates
call :fix_blog_dates
goto :eof

:update_templates
call :update_blog_templates
goto :eof

:all
call :update_related_content_and_paths
call :fix_blog_dates
call :rename_blog_files
call :update_blog_templates
goto :eof

:help
echo 用法: %~nx0 [选项]
echo 选项:
echo   -u, --update-paths   更新相关内容和修复路径
echo   -r, --rename         重命名博客文件（添加日期前缀）
echo   -f, --fix-dates      修复博客日期格式
echo   -t, --update-templates 更新博客模板（添加标签系统和版权声明）
echo   -a, --all            执行所有维护任务
echo   -h, --help           显示此帮助信息
goto :eof

rem ===========================================
rem 功能函数定义
rem ===========================================

:show_menu
cls
echo =================================
echo     博客网站综合维护工具
echo =================================
echo 1. 更新相关内容和修复路径
echo 2. 重命名博客文件（添加日期前缀）
echo 3. 修复博客日期格式
echo 4. 更新博客模板（添加标签系统和版权声明）
echo 5. 执行所有维护任务
echo 0. 退出
echo =================================
goto :eof

:check_blogs_dir
if not exist "%BLOGS_DIR%" (
    echo %RED%错误: 博客目录 %BLOGS_DIR% 不存在%RESET%
    exit /b 1
)
goto :eof

:define_colors
for /f "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
  set "DEL=%%a"
)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RESET=[0m"
goto :eof

:print_green
echo %GREEN%%~1%RESET%
goto :eof

:print_red
echo %RED%%~1%RESET%
goto :eof

:print_yellow
echo %YELLOW%%~1%RESET%
goto :eof

rem 功能1: 更新相关内容和修复路径
:update_related_content_and_paths
call :print_green "正在更新所有博客和newsletter页面的相关内容功能..."

rem 检查node是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    call :print_red "错误: 未找到node命令。请安装Node.js后再试。"
    exit /b 1
)

rem 运行相关内容更新脚本
if exist "%SCRIPT_DIR%\js\related-content-updater.js" (
    node "%SCRIPT_DIR%\js\related-content-updater.js"
) else (
    call :print_yellow "警告: 找不到相关内容更新脚本，跳过此步骤。"
)

call :print_green "正在修复博客文件路径..."

rem 安装所需工具
if not exist "%PROGRAMFILES%\Git\usr\bin\sed.exe" (
  call :print_red "错误: 未找到sed工具，请安装Git for Windows后再运行此脚本"
  call :print_yellow "下载地址: https://git-scm.com/download/win"
  exit /b 1
)

set PATH=%PROGRAMFILES%\Git\usr\bin;%PATH%

rem 遍历blogs目录下的所有html文件
for %%f in ("%BLOGS_DIR%\*.html") do (
  echo 处理文件: %%f
  
  rem 修复CSS和JS路径
  sed -i "s/href=\"css\//href=\"..\/css\//g" "%%f"
  sed -i "s/href=\"images\//href=\"..\/images\//g" "%%f"
  sed -i "s/src=\"js\//src=\"..\/js\//g" "%%f"
  sed -i "s/src=\"images\//src=\"..\/images\//g" "%%f"
  
  rem 修复内部链接
  sed -i "s/href=\"index.html\"/href=\"..\/index.html\"/g" "%%f"
  sed -i "s/href=\"blogs.html\"/href=\"..\/blogs.html\"/g" "%%f"
  sed -i "s/href=\"newsletter.html\"/href=\"..\/newsletter.html\"/g" "%%f"
  sed -i "s/href=\"portfolio.html\"/href=\"..\/portfolio.html\"/g" "%%f"
  sed -i "s/href=\"rss.xml\"/href=\"..\/rss.xml\"/g" "%%f"
  
  rem 修复博客内部互相引用的链接，如meditation-journey.html改为带日期前缀
  sed -i "s/href=\"meditation-journey.html\"/href=\"2024-07-06-meditation-journey.html\"/g" "%%f"
  sed -i "s/href=\"24-things.html\"/href=\"2024-11-10-24-things.html\"/g" "%%f"
  sed -i "s/href=\"talking-to-19-yo-self.html\"/href=\"2024-11-13-talking-to-19-yo-self.html\"/g" "%%f"
  sed -i "s/href=\"design-experiment.html\"/href=\"2025-04-15-design-experiment.html\"/g" "%%f"
  sed -i "s/href=\"creativity-thoughts.html\"/href=\"2025-05-03-creativity-thoughts.html\"/g" "%%f"
  sed -i "s/href=\"life-in-weeks.html\"/href=\"2025-05-25-life-in-weeks.html\"/g" "%%f"
  sed -i "s/href=\"22-years-old.html\"/href=\"2022-09-01-22-years-old.html\"/g" "%%f"
  sed -i "s/href=\"life-management-system-99-things.html\"/href=\"2022-08-24-life-management-system-99-things.html\"/g" "%%f"
  sed -i "s/href=\"high-school-advice.html\"/href=\"2019-06-07-high-school-advice.html\"/g" "%%f"
)

rem 特殊处理blogs.html文件中的链接，添加日期前缀
echo 修复blogs.html中的链接...
sed -i "s/href=\"blogs\/life-in-weeks.html\"/href=\"blogs\/2025-05-25-life-in-weeks.html\"/g" "%SCRIPT_DIR%\blogs.html"
sed -i "s/href=\"blogs\/creativity-thoughts.html\"/href=\"blogs\/2025-05-03-creativity-thoughts.html\"/g" "%SCRIPT_DIR%\blogs.html"
sed -i "s/href=\"blogs\/design-experiment.html\"/href=\"blogs\/2025-04-15-design-experiment.html\"/g" "%SCRIPT_DIR%\blogs.html"
sed -i "s/href=\"blogs\/talking-to-19-yo-self.html\"/href=\"blogs\/2024-11-13-talking-to-19-yo-self.html\"/g" "%SCRIPT_DIR%\blogs.html"
sed -i "s/href=\"blogs\/meditation-journey.html\"/href=\"blogs\/2024-07-06-meditation-journey.html\"/g" "%SCRIPT_DIR%\blogs.html"
sed -i "s/href=\"blogs\/24-things.html\"/href=\"blogs\/2024-11-10-24-things.html\"/g" "%SCRIPT_DIR%\blogs.html"
sed -i "s/href=\"blogs\/22-years-old.html\"/href=\"blogs\/2022-09-01-22-years-old.html\"/g" "%SCRIPT_DIR%\blogs.html"
sed -i "s/href=\"blogs\/life-management-system-99-things.html\"/href=\"blogs\/2022-08-24-life-management-system-99-things.html\"/g" "%SCRIPT_DIR%\blogs.html"
sed -i "s/href=\"blogs\/high-school-advice.html\"/href=\"blogs\/2019-06-07-high-school-advice.html\"/g" "%SCRIPT_DIR%\blogs.html"

call :print_green "路径修复完成！"
goto :eof

rem 功能2: 重命名博客文件（添加日期前缀）
:rename_blog_files
call :print_green "开始重命名博客文件..."
call :check_blogs_dir

rem 检查Python是否安装
where python >nul 2>nul
if %errorlevel% neq 0 (
    call :print_yellow "未找到Python，将使用纯批处理方式重命名文件（功能有限）"
    goto :rename_with_batch
)

rem 检查bs4是否安装
python -c "import bs4" 2>nul
if %errorlevel% neq 0 (
    call :print_yellow "正在安装必要的Python包: bs4..."
    pip install bs4
    if %errorlevel% neq 0 (
        call :print_red "无法安装bs4。将使用纯批处理方式重命名文件。"
        goto :rename_with_batch
    )
)

rem 创建临时Python脚本
set "TEMP_PY=%TEMP%\rename_blogs_temp.py"
echo import os > "%TEMP_PY%"
echo import re >> "%TEMP_PY%"
echo import sys >> "%TEMP_PY%"
echo from bs4 import BeautifulSoup >> "%TEMP_PY%"
echo from datetime import datetime >> "%TEMP_PY%"
echo. >> "%TEMP_PY%"
echo # 博客文件目录 >> "%TEMP_PY%"
echo BLOGS_DIR = r'%BLOGS_DIR%' >> "%TEMP_PY%"
echo. >> "%TEMP_PY%"
echo # 日期格式转换：从中文日期（如"2022年9月1日"）到"2022-09-01" >> "%TEMP_PY%"
echo def format_date(date_str): >> "%TEMP_PY%"
echo     # 使用正则表达式提取年、月、日 >> "%TEMP_PY%"
echo     match = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', date_str) >> "%TEMP_PY%"
echo     if match: >> "%TEMP_PY%"
echo         year, month, day = match.groups() >> "%TEMP_PY%"
echo         # 确保月和日是两位数 >> "%TEMP_PY%"
echo         return f"{year}-{month.zfill(2)}-{day.zfill(2)}" >> "%TEMP_PY%"
echo     return None >> "%TEMP_PY%"
echo. >> "%TEMP_PY%"
echo # 从HTML文件中提取日期 >> "%TEMP_PY%"
echo def extract_date_from_html(file_path): >> "%TEMP_PY%"
echo     try: >> "%TEMP_PY%"
echo         with open(file_path, 'r', encoding='utf-8') as file: >> "%TEMP_PY%"
echo             content = file.read() >> "%TEMP_PY%"
echo             soup = BeautifulSoup(content, 'html.parser') >> "%TEMP_PY%"
echo             >> "%TEMP_PY%"
echo             # 尝试从 blog-date span 中提取日期 >> "%TEMP_PY%"
echo             date_span = soup.select_one('span.blog-date') >> "%TEMP_PY%"
echo             if date_span and date_span.text: >> "%TEMP_PY%"
echo                 return format_date(date_span.text) >> "%TEMP_PY%"
echo             >> "%TEMP_PY%"
echo             # 尝试从文章底部的"写于"段落中提取日期 >> "%TEMP_PY%"
echo             footer_date = soup.select_one('div.blog-footer p') >> "%TEMP_PY%"
echo             if footer_date and '写于' in footer_date.text: >> "%TEMP_PY%"
echo                 return format_date(footer_date.text.replace('写于', '').strip()) >> "%TEMP_PY%"
echo             >> "%TEMP_PY%"
echo             # 如果以上方法都失败，返回None >> "%TEMP_PY%"
echo             return None >> "%TEMP_PY%"
echo     except Exception as e: >> "%TEMP_PY%"
echo         print(f"处理文件 {file_path} 时出错: {e}") >> "%TEMP_PY%"
echo         return None >> "%TEMP_PY%"
echo. >> "%TEMP_PY%"
echo # 重命名文件 >> "%TEMP_PY%"
echo def rename_blog_files(): >> "%TEMP_PY%"
echo     # 获取所有HTML文件 >> "%TEMP_PY%"
echo     html_files = [f for f in os.listdir(BLOGS_DIR) if f.endswith('.html')] >> "%TEMP_PY%"
echo     renamed_count = 0 >> "%TEMP_PY%"
echo     skipped_count = 0 >> "%TEMP_PY%"
echo     error_count = 0 >> "%TEMP_PY%"
echo     >> "%TEMP_PY%"
echo     for filename in html_files: >> "%TEMP_PY%"
echo         file_path = os.path.join(BLOGS_DIR, filename) >> "%TEMP_PY%"
echo         >> "%TEMP_PY%"
echo         # 如果文件名已经是日期格式，跳过 >> "%TEMP_PY%"
echo         if re.match(r'\d{4}-\d{2}-\d{2}-', filename): >> "%TEMP_PY%"
echo             print(f"跳过已重命名的文件: {filename}") >> "%TEMP_PY%"
echo             skipped_count += 1 >> "%TEMP_PY%"
echo             continue >> "%TEMP_PY%"
echo         >> "%TEMP_PY%"
echo         # 从文件中提取日期 >> "%TEMP_PY%"
echo         date_str = extract_date_from_html(file_path) >> "%TEMP_PY%"
echo         >> "%TEMP_PY%"
echo         if date_str: >> "%TEMP_PY%"
echo             # 创建新文件名 >> "%TEMP_PY%"
echo             new_filename = f"{date_str}-{filename}" >> "%TEMP_PY%"
echo             new_file_path = os.path.join(BLOGS_DIR, new_filename) >> "%TEMP_PY%"
echo             >> "%TEMP_PY%"
echo             # 重命名文件 >> "%TEMP_PY%"
echo             try: >> "%TEMP_PY%"
echo                 os.rename(file_path, new_file_path) >> "%TEMP_PY%"
echo                 print(f"重命名: {filename} -> {new_filename}") >> "%TEMP_PY%"
echo                 renamed_count += 1 >> "%TEMP_PY%"
echo             except Exception as e: >> "%TEMP_PY%"
echo                 print(f"重命名文件 {filename} 时出错: {e}") >> "%TEMP_PY%"
echo                 error_count += 1 >> "%TEMP_PY%"
echo         else: >> "%TEMP_PY%"
echo             # 使用当前日期 >> "%TEMP_PY%"
echo             today = datetime.now().strftime("%%Y-%%m-%%d") >> "%TEMP_PY%"
echo             new_filename = f"{today}-{filename}" >> "%TEMP_PY%"
echo             new_file_path = os.path.join(BLOGS_DIR, new_filename) >> "%TEMP_PY%"
echo             >> "%TEMP_PY%"
echo             print(f"无法从文件 {filename} 中提取日期，使用当前日期: {today}") >> "%TEMP_PY%"
echo             >> "%TEMP_PY%"
echo             try: >> "%TEMP_PY%"
echo                 os.rename(file_path, new_file_path) >> "%TEMP_PY%"
echo                 print(f"重命名(使用当前日期): {filename} -> {new_filename}") >> "%TEMP_PY%"
echo                 renamed_count += 1 >> "%TEMP_PY%"
echo             except Exception as e: >> "%TEMP_PY%"
echo                 print(f"重命名文件 {filename} 时出错: {e}") >> "%TEMP_PY%"
echo                 error_count += 1 >> "%TEMP_PY%"
echo     >> "%TEMP_PY%"
echo     print(f"\n完成! 统计信息:") >> "%TEMP_PY%"
echo     print(f"- 重命名文件数: {renamed_count}") >> "%TEMP_PY%"
echo     print(f"- 已跳过文件数: {skipped_count}") >> "%TEMP_PY%"
echo     print(f"- 处理失败文件数: {error_count}") >> "%TEMP_PY%"
echo. >> "%TEMP_PY%"
echo if __name__ == "__main__": >> "%TEMP_PY%"
echo     print("开始重命名博客文件...") >> "%TEMP_PY%"
echo     rename_blog_files() >> "%TEMP_PY%"

rem 运行Python脚本
python "%TEMP_PY%"
del "%TEMP_PY%"
goto :eof

:rename_with_batch
rem 使用纯批处理方式重命名文件（功能有限）
call :print_yellow "使用批处理方式重命名文件..."

set renamed_count=0
set skipped_count=0
set error_count=0

rem 遍历博客目录中的所有HTML文件
for %%f in ("%BLOGS_DIR%\*.html") do (
    set "filename=%%~nxf"
    
    rem 如果文件名已经是日期格式，跳过
    echo !filename! | findstr /r "^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-" >nul
    if !errorlevel! equ 0 (
        call :print_yellow "跳过已重命名的文件: !filename!"
        set /a skipped_count+=1
    ) else (
        rem 如果文件名是 24-things.html 格式，尝试将其解释为2024年的文章
        echo !filename! | findstr /r "^[0-9][0-9]-" >nul
        if !errorlevel! equ 0 (
            for /f "tokens=1 delims=-" %%a in ("!filename!") do set "year_suffix=%%a"
            set "year=20!year_suffix!"
            set "month=01"
            set "day=01"
            
            set "new_filename=!year!-!month!-!day!-!filename!"
            
            rem 重命名文件
            ren "%BLOGS_DIR%\!filename!" "!new_filename!"
            if !errorlevel! equ 0 (
                call :print_green "重命名(根据文件名推断): !filename! -> !new_filename!"
                set /a renamed_count+=1
            ) else (
                call :print_red "重命名文件 !filename! 时出错"
                set /a error_count+=1
            )
        ) else (
            rem 使用当前日期
            for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (
                set "today=%%c-%%a-%%b"
            )
            set "new_filename=!today!-!filename!"
            
            call :print_yellow "无法从文件 !filename! 中提取日期，使用当前日期: !today!"
            
            rem 重命名文件
            ren "%BLOGS_DIR%\!filename!" "!new_filename!"
            if !errorlevel! equ 0 (
                call :print_green "重命名(使用当前日期): !filename! -> !new_filename!"
                set /a renamed_count+=1
            ) else (
                call :print_red "重命名文件 !filename! 时出错"
                set /a error_count+=1
            )
        )
    )
)

rem 打印统计信息
echo.
call :print_green "完成! 统计信息:"
echo - 重命名文件数: %renamed_count%
echo - 已跳过文件数: %skipped_count%
echo - 处理失败文件数: %error_count%
goto :eof

rem 功能3: 修复博客日期格式
:fix_blog_dates
call :print_green "开始修复博客文章中的日期格式问题..."
call :check_blogs_dir

rem 由于Windows批处理限制，这部分功能较为简单
call :print_yellow "在Windows环境下，日期格式修复功能有限。"
call :print_yellow "建议在修复文件路径和重命名文件后，使用Python脚本进行更复杂的日期格式修复。"

rem 主要检查有无日期的文件并基于文件名添加日期
set fixed_count=0
set skipped_count=0
set error_count=0

rem 安装所需工具
if not exist "%PROGRAMFILES%\Git\usr\bin\sed.exe" (
  call :print_red "错误: 未找到sed工具，请安装Git for Windows后再运行此脚本"
  call :print_yellow "下载地址: https://git-scm.com/download/win"
  exit /b 1
)

set PATH=%PROGRAMFILES%\Git\usr\bin;%PATH%

rem 遍历博客目录中的所有HTML文件
for %%f in ("%BLOGS_DIR%\*.html") do (
    set "filename=%%~nxf"
    
    echo 处理文件: !filename!
    
    rem 检查文件是否有日期元素
    findstr /C:"<span class=\"blog-date\">" "%%f" >nul
    if !errorlevel! neq 0 (
        rem 没有找到日期元素，检查文件名是否包含日期
        echo !filename! | findstr /r "^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-" >nul
        if !errorlevel! equ 0 (
            rem 从文件名提取日期
            for /f "tokens=1-3 delims=-" %%a in ("!filename!") do (
                set "year=%%a"
                set "month=%%b"
                set "day=%%c"
            )
            
            rem 移除前导零
            set "month=!month:~0,1!"
            if "!month!"=="0" set "month=!month:~1!"
            set "day=!day:~0,1!"
            if "!day!"=="0" set "day=!day:~1!"
            
            rem 创建中文格式的日期
            set "date_str=!year!年!month!月!day!日"
            
            rem 尝试添加日期元素
            sed -i "s/<div class=\"blog-meta\">/<div class=\"blog-meta\">\n            <span class=\"blog-date\">!date_str!<\/span>/g" "%%f"
            
            rem 检查是否有"写于"段落
            findstr /C:"写于" "%%f" >nul
            if !errorlevel! neq 0 (
                rem 添加"写于"段落
                sed -i "s/<div class=\"blog-footer\">/<div class=\"blog-footer\">\n                        <p>写于 !date_str!<\/p>/g" "%%f"
            )
            
            call :print_green "添加缺失的日期: !date_str! (文件: !filename!)"
            set /a fixed_count+=1
        ) else (
            call :print_yellow "文件 !filename! 没有日期信息，且文件名不包含日期格式"
            set /a error_count+=1
        )
    ) else (
        call :print_yellow "文件已有日期元素，跳过: !filename!"
        set /a skipped_count+=1
    )
)

rem 打印统计信息
echo.
call :print_green "完成! 统计信息:"
echo - 修复的文件数: %fixed_count%
echo - 已跳过文件数: %skipped_count%
echo - 处理失败文件数: %error_count%
goto :eof

:update_blog_templates
call :print_green "开始更新博客模板（添加标签系统和版权声明）..."
call :check_blogs_dir

rem 检查是否安装了Python
where python >nul 2>nul || where python3 >nul 2>nul
if %ERRORLEVEL% equ 0 (
    REM 优先使用Python工具
    python "%SCRIPT_DIR%\blog_utils.py" update-templates
    if %ERRORLEVEL% neq 0 (
        python3 "%SCRIPT_DIR%\blog_utils.py" update-templates
    )
) else (
    REM 如果没有Python，使用内置的模板更新脚本
    call :run_update_templates_script
)
exit /b 0

:run_update_templates_script
REM 使用批处理实现的模板更新功能
call :print_yellow "使用内置脚本更新博客模板..."

REM 计数器
set updated_date_count=0
set added_copyright_count=0
set added_scripts_count=0
set error_count=0

REM 遍历博客目录中的所有HTML文件
for %%F in ("%BLOGS_DIR%\*.html") do (
    set "filename=%%~nxF"
    echo %YELLOW%处理文件: !filename!%RESET%
    
    REM 1. 将 blog-date 类替换为 date-tag 类
    call :replace_in_file "%%F" "class=\"blog-date\"" "class=\"date-tag\""
    if !ERRORLEVEL! equ 0 (
        set /a updated_date_count+=1
    )
    
    REM 2. 添加版权声明（如果不存在）
    findstr /c:"copyright-notice" "%%F" >nul
    if !ERRORLEVEL! neq 0 (
        REM 创建临时文件
        set "tempfile=%TEMP%\blog_temp.html"
        
        REM 将文件内容复制到临时文件，并在</article>之前添加版权声明
        type nul > "!tempfile!"
        for /f "usebackq delims=" %%L in ("%%F") do (
            echo %%L | findstr /c:"</article>" >nul
            if !ERRORLEVEL! equ 0 (
                echo                     ^<div class="copyright-notice"^> >> "!tempfile!"
                echo                         ^<p^>欢迎引用本文观点或图片，但请注明出处并附上本文链接。^</p^> >> "!tempfile!"
                echo                     ^</div^> >> "!tempfile!"
                echo %%L >> "!tempfile!"
            ) else (
                echo %%L >> "!tempfile!"
            )
        )
        
        REM 用临时文件替换原文件
        copy /y "!tempfile!" "%%F" >nul
        del "!tempfile!"
        set /a added_copyright_count+=1
    )
    
    REM 3. 添加标签系统脚本（如果不存在）
    findstr /c:"tag-system.js" "%%F" >nul
    if !ERRORLEVEL! neq 0 (
        REM 创建临时文件
        set "tempfile=%TEMP%\blog_temp.html"
        
        REM 将文件内容复制到临时文件，并在main.js脚本后添加标签系统脚本
        type nul > "!tempfile!"
        for /f "usebackq delims=" %%L in ("%%F") do (
            echo %%L >> "!tempfile!"
            echo %%L | findstr /c:"<script src=\"../js/main.js\"></script>" >nul
            if !ERRORLEVEL! equ 0 (
                echo     ^<script src="../js/related-content.js"^>^</script^> >> "!tempfile!"
                echo     ^<script src="../js/tag-system.js"^>^</script^> >> "!tempfile!"
            )
        )
        
        REM 用临时文件替换原文件
        copy /y "!tempfile!" "%%F" >nul
        del "!tempfile!"
        set /a added_scripts_count+=1
    )
)

REM 打印统计信息
echo.
echo %GREEN%完成! 统计信息:%RESET%
echo - 更新日期标签类名的文件数: %updated_date_count%
echo - 添加版权声明的文件数: %added_copyright_count%
echo - 添加标签系统脚本的文件数: %added_scripts_count%
echo - 处理失败文件数: %error_count%
exit /b 0

:replace_in_file
REM 替换文件中的文本
REM 参数: %1 - 文件路径, %2 - 要替换的文本, %3 - 替换为的文本
set "file=%~1"
set "find=%~2"
set "replace=%~3"

REM 创建临时文件
set "tempfile=%TEMP%\replace_temp.txt"

REM 替换内容并写入临时文件
type nul > "%tempfile%"
for /f "usebackq delims=" %%i in ("%file%") do (
    set "line=%%i"
    set "line=!line:%find%=%replace%!"
    echo !line! >> "%tempfile%"
)

REM 用临时文件替换原文件
copy /y "%tempfile%" "%file%" >nul
del "%tempfile%"
exit /b 0 