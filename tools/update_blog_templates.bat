@echo off
setlocal enabledelayedexpansion

echo 开始更新所有博客页面...

:: 进入博客目录
cd /d "%~dp0\..\blogs" || (
    echo 无法进入博客目录
    exit /b 1
)

:: 遍历所有HTML文件
for %%f in (*.html) do (
    echo 正在处理: %%f
    
    :: 创建临时文件
    type nul > temp.html
    
    :: 读取文件并进行替换
    for /f "tokens=*" %%l in (%%f) do (
        set "line=%%l"
        
        :: 1. 将 blog-date 类替换为 date-tag 类
        set "line=!line:class="blog-date"=class="date-tag"!"
        
        :: 输出到临时文件
        echo !line! >> temp.html
    )
    
    :: 替换原文件
    move /y temp.html %%f > nul
    
    :: 2. 添加版权声明（如果不存在）
    findstr /c:"copyright-notice" %%f > nul
    if errorlevel 1 (
        :: 创建临时文件
        type nul > temp.html
        
        :: 读取文件并在</article>前添加版权声明
        set "added=0"
        for /f "tokens=*" %%l in (%%f) do (
            set "line=%%l"
            
            if "!line!" == "                </article>" (
                if !added! equ 0 (
                    echo                     ^<div class="copyright-notice"^> >> temp.html
                    echo                         ^<p^>欢迎引用本文观点或图片，但请注明出处并附上本文链接。^</p^> >> temp.html
                    echo                     ^</div^> >> temp.html
                    set "added=1"
                )
            )
            
            echo !line! >> temp.html
        )
        
        :: 替换原文件
        move /y temp.html %%f > nul
    )
    
    :: 3. 添加标签系统脚本（如果不存在）
    findstr /c:"tag-system.js" %%f > nul
    if errorlevel 1 (
        :: 创建临时文件
        type nul > temp.html
        
        :: 读取文件并在main.js后添加脚本引用
        set "added=0"
        for /f "tokens=*" %%l in (%%f) do (
            set "line=%%l"
            echo !line! >> temp.html
            
            if "!line!" == "    <script src="../js/main.js"></script>" (
                if !added! equ 0 (
                    echo     ^<script src="../js/related-content.js"^>^</script^> >> temp.html
                    echo     ^<script src="../js/tag-system.js"^>^</script^> >> temp.html
                    set "added=1"
                )
            )
        )
        
        :: 替换原文件
        move /y temp.html %%f > nul
    )
    
    echo 完成: %%f
)

echo 所有博客页面更新完成!
endlocal 