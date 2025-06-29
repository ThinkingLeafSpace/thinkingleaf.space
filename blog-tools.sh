#!/bin/bash
# 博客网站综合维护工具
# 集成了路径修复、文件重命名和日期修复等功能

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# 博客目录路径
BLOGS_DIR="$SCRIPT_DIR/blogs"

# 打印彩色输出
print_green() {
  printf "\033[0;32m%s\033[0m\n" "$1"
}

print_red() {
  printf "\033[0;31m%s\033[0m\n" "$1"
}

print_yellow() {
  printf "\033[0;33m%s\033[0m\n" "$1"
}

# 显示菜单
show_menu() {
  clear
  echo "================================="
  echo "    博客网站综合维护工具"
  echo "================================="
  echo "1. 更新相关内容和修复路径"
  echo "2. 重命名博客文件（添加日期前缀）"
  echo "3. 修复博客日期格式"
  echo "4. 更新博客模板（添加标签系统和版权声明）"
  echo "5. 执行所有维护任务"
  echo "0. 退出"
  echo "================================="
  echo "请输入选项(0-5):"
}

# 检查博客目录是否存在
check_blogs_dir() {
  if [ ! -d "$BLOGS_DIR" ]; then
    print_red "错误: 博客目录 $BLOGS_DIR 不存在"
    exit 1
  fi
}

# 功能1: 更新相关内容和修复路径
update_related_content_and_paths() {
  print_green "正在更新所有博客和newsletter页面的相关内容功能..."
  
  # 检查node是否安装
  if ! command -v node &> /dev/null; then
    print_red "错误: 未找到node命令。请安装Node.js后再试。"
    return 1
  fi

  # 运行相关内容更新脚本
  if [ -f "$SCRIPT_DIR/js/related-content-updater.js" ]; then
    node "$SCRIPT_DIR/js/related-content-updater.js"
  else
    print_yellow "警告: 找不到相关内容更新脚本，跳过此步骤。"
  fi

  print_green "正在修复博客文件路径..."

  # 检测操作系统类型，针对macOS和Linux使用不同的sed参数
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    SED_INPLACE=(-i '')
  else
    # Linux和其他类Unix系统
    SED_INPLACE=(-i)
  fi

  # 遍历blogs目录下的所有html文件
  for file in "$BLOGS_DIR"/*.html; do
    echo "处理文件: $file"
    
    # 修复CSS和JS路径
    sed "${SED_INPLACE[@]}" 's/href="css\//href="..\/css\//g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="images\//href="..\/images\//g' "$file"
    sed "${SED_INPLACE[@]}" 's/src="js\//src="..\/js\//g' "$file"
    sed "${SED_INPLACE[@]}" 's/src="images\//src="..\/images\//g' "$file"
    
    # 修复内部链接
    sed "${SED_INPLACE[@]}" 's/href="index.html"/href="..\/index.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="blogs.html"/href="..\/blogs.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="newsletter.html"/href="..\/newsletter.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="portfolio.html"/href="..\/portfolio.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="rss.xml"/href="..\/rss.xml"/g' "$file"
    
    # 修复博客内部互相引用的链接，如meditation-journey.html改为带日期前缀
    sed "${SED_INPLACE[@]}" 's/href="meditation-journey.html"/href="2024-07-06-meditation-journey.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="24-things.html"/href="2024-11-10-24-things.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="talking-to-19-yo-self.html"/href="2024-11-13-talking-to-19-yo-self.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="design-experiment.html"/href="2025-04-15-design-experiment.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="creativity-thoughts.html"/href="2025-05-03-creativity-thoughts.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="life-in-weeks.html"/href="2025-05-25-life-in-weeks.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="22-years-old.html"/href="2022-09-01-22-years-old.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="life-management-system-99-things.html"/href="2022-08-24-life-management-system-99-things.html"/g' "$file"
    sed "${SED_INPLACE[@]}" 's/href="high-school-advice.html"/href="2019-06-07-high-school-advice.html"/g' "$file"
  done

  # 特殊处理blogs.html文件中的链接，添加日期前缀
  echo "修复blogs.html中的链接..."
  sed "${SED_INPLACE[@]}" 's/href="blogs\/life-in-weeks.html"/href="blogs\/2025-05-25-life-in-weeks.html"/g' "$SCRIPT_DIR/blogs.html"
  sed "${SED_INPLACE[@]}" 's/href="blogs\/creativity-thoughts.html"/href="blogs\/2025-05-03-creativity-thoughts.html"/g' "$SCRIPT_DIR/blogs.html"
  sed "${SED_INPLACE[@]}" 's/href="blogs\/design-experiment.html"/href="blogs\/2025-04-15-design-experiment.html"/g' "$SCRIPT_DIR/blogs.html"
  sed "${SED_INPLACE[@]}" 's/href="blogs\/talking-to-19-yo-self.html"/href="blogs\/2024-11-13-talking-to-19-yo-self.html"/g' "$SCRIPT_DIR/blogs.html"
  sed "${SED_INPLACE[@]}" 's/href="blogs\/meditation-journey.html"/href="blogs\/2024-07-06-meditation-journey.html"/g' "$SCRIPT_DIR/blogs.html"
  sed "${SED_INPLACE[@]}" 's/href="blogs\/24-things.html"/href="blogs\/2024-11-10-24-things.html"/g' "$SCRIPT_DIR/blogs.html"
  sed "${SED_INPLACE[@]}" 's/href="blogs\/22-years-old.html"/href="blogs\/2022-09-01-22-years-old.html"/g' "$SCRIPT_DIR/blogs.html"
  sed "${SED_INPLACE[@]}" 's/href="blogs\/life-management-system-99-things.html"/href="blogs\/2022-08-24-life-management-system-99-things.html"/g' "$SCRIPT_DIR/blogs.html"
  sed "${SED_INPLACE[@]}" 's/href="blogs\/high-school-advice.html"/href="blogs\/2019-06-07-high-school-advice.html"/g' "$SCRIPT_DIR/blogs.html"

  print_green "路径修复完成！"
}

# 功能2: 重命名博客文件（添加日期前缀）
rename_blog_files() {
  print_green "开始重命名博客文件..."
  check_blogs_dir
  
  # 检查是否安装了Python
  if command -v python3 &> /dev/null; then
    # 优先使用Python工具
    python3 "$SCRIPT_DIR/blog_utils.py" rename
  else
    # 计数器
    renamed_count=0
    skipped_count=0
    error_count=0

    # 遍历博客目录中的所有HTML文件
    for file_path in "$BLOGS_DIR"/*.html; do
      # 获取文件名（不包含路径）
      filename=$(basename "$file_path")
      
      # 如果文件名已经是日期格式，跳过
      if [[ $filename =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}- ]]; then
        print_yellow "跳过已重命名的文件: $filename"
        ((skipped_count++))
        continue
      fi
      
      # 尝试多种方式从文件中提取日期
      date_found=false
      
      # 方法1: 检查 <span class="blog-date"> 标签
      date_str=$(grep -o '<span class="blog-date">[^<]*' "$file_path" | sed 's/<span class="blog-date">//')
      
      # 方法2: 检查 "写于" 的文本
      if [ -z "$date_str" ]; then
        date_str=$(grep -o '写于[^<]*' "$file_path" | sed 's/写于//' | sed 's/^[ \t]*//')
      fi
      
      # 方法3: 寻找符合"YYYY年MM月DD日"格式的任何文本
      if [ -z "$date_str" ]; then
        date_str=$(grep -o '[0-9]\{4\}年[0-9]\{1,2\}月[0-9]\{1,2\}日' "$file_path" | head -1)
      fi
      
      # 方法4: 尝试从meta标签中提取日期
      if [ -z "$date_str" ]; then
        date_str=$(grep -o 'content="[^"]*[0-9]\{4\}年[0-9]\{1,2\}月[0-9]\{1,2\}日[^"]*"' "$file_path" | sed 's/content="//' | sed 's/"$//' | grep -o '[0-9]\{4\}年[0-9]\{1,2\}月[0-9]\{1,2\}日' | head -1)
      fi
      
      # 方法5: 检查HTML注释中的日期
      if [ -z "$date_str" ]; then
        date_str=$(grep -o '<!--.*[0-9]\{4\}年[0-9]\{1,2\}月[0-9]\{1,2\}日.*-->' "$file_path" | grep -o '[0-9]\{4\}年[0-9]\{1,2\}月[0-9]\{1,2\}日' | head -1)
      fi
      
      # 方法6: 检查任何包含"日期"、"发布"、"创建"等关键词附近的日期
      if [ -z "$date_str" ]; then
        date_context=$(grep -i -e '日期' -e '发布' -e '创建' -e 'date' -e 'publish' -e 'create' "$file_path")
        if [ ! -z "$date_context" ]; then
          potential_date=$(echo "$date_context" | grep -o '[0-9]\{4\}年[0-9]\{1,2\}月[0-9]\{1,2\}日' | head -1)
          if [ ! -z "$potential_date" ]; then
            date_str="$potential_date"
          fi
        fi
      fi

      # 从文件名中尝试提取日期（如果文件名包含数字和年月标识）
      if [ -z "$date_str" ]; then
        # 如果文件名是 24-things.html 格式，尝试将其解释为2024年的文章
        if [[ $filename =~ ^([0-9]{2})-.*\.html$ ]]; then
          year_prefix="20"  # 假设都是21世纪的文章
          year_suffix="${BASH_REMATCH[1]}"
          
          # 创建一个默认日期：年份-01-01（1月1日）
          year="${year_prefix}${year_suffix}"
          month="01"
          day="01"
          
          formatted_date="$year-$month-$day"
          new_filename="$formatted_date-$filename"
          new_file_path="$BLOGS_DIR/$new_filename"
          
          # 重命名文件
          mv "$file_path" "$new_file_path"
          if [ $? -eq 0 ]; then
            print_green "重命名(根据文件名推断): $filename -> $new_filename"
            ((renamed_count++))
            date_found=true
          else
            print_red "重命名文件 $filename 时出错"
            ((error_count++))
          fi
        fi
      fi
      
      # 如果已经处理过文件（通过文件名推断），跳过后续处理
      if [ "$date_found" = true ]; then
        continue
      fi

      # 如果找到了日期字符串，提取年月日并重命名文件
      if [[ $date_str =~ ([0-9]{4})年([0-9]{1,2})月([0-9]{1,2})日 ]]; then
        year="${BASH_REMATCH[1]}"
        month=$(printf "%02d" "${BASH_REMATCH[2]}")
        day=$(printf "%02d" "${BASH_REMATCH[3]}")
        
        formatted_date="$year-$month-$day"
        new_filename="$formatted_date-$filename"
        new_file_path="$BLOGS_DIR/$new_filename"
        
        # 重命名文件
        mv "$file_path" "$new_file_path"
        if [ $? -eq 0 ]; then
          print_green "重命名: $filename -> $new_filename"
          ((renamed_count++))
        else
          print_red "重命名文件 $filename 时出错"
          ((error_count++))
        fi
      else
        # 为找不到日期的文件使用当前日期
        if [ -z "$date_str" ]; then
          today=$(date +"%Y-%m-%d")
          new_filename="$today-$filename"
          new_file_path="$BLOGS_DIR/$new_filename"
          
          print_yellow "无法从文件 $filename 中提取日期，使用当前日期: $today"
          
          # 重命名文件
          mv "$file_path" "$new_file_path"
          if [ $? -eq 0 ]; then
            print_green "重命名(使用当前日期): $filename -> $new_filename"
            ((renamed_count++))
          else
            print_red "重命名文件 $filename 时出错"
            ((error_count++))
          fi
        else
          print_yellow "无法解析日期字符串: $date_str (文件: $filename)"
          ((error_count++))
        fi
      fi
    done

    # 打印统计信息
    echo ""
    print_green "完成! 统计信息:"
    echo "- 重命名文件数: $renamed_count"
    echo "- 已跳过文件数: $skipped_count"
    echo "- 处理失败文件数: $error_count"
  fi
}

# 功能3: 修复博客日期格式
fix_blog_dates() {
  print_green "开始修复博客文章中的日期格式问题..."
  check_blogs_dir
  
  # 检查是否安装了Python
  if command -v python3 &> /dev/null; then
    # 优先使用Python工具
    python3 "$SCRIPT_DIR/blog_utils.py" fix-dates
  else
    # 处理不完整日期（如"2024年12月"）的函数
    fix_incomplete_date() {
      local file=$1
      local incomplete_date=$2
      
      # 提取已有的年份和月份
      if [[ $incomplete_date =~ ([0-9]{4})年([0-9]{1,2})月 ]]; then
        year="${BASH_REMATCH[1]}"
        month="${BASH_REMATCH[2]}"
        
        # 使用月份的第1天作为默认日期
        day="01"
        
        # 创建完整的日期字符串
        complete_date="${year}年${month}月${day}日"
        
        # 检测操作系统类型，针对macOS和Linux使用不同的sed参数
        if [[ "$OSTYPE" == "darwin"* ]]; then
          # macOS
          sed -i "" "s/$incomplete_date/$complete_date/g" "$file"
        else
          # Linux和其他类Unix系统
          sed -i "s/$incomplete_date/$complete_date/g" "$file"
        fi
        
        print_green "修复不完整日期: $incomplete_date -> $complete_date (文件: $(basename "$file"))"
        return 0
      fi
      
      return 1
    }

    # 为没有日期的文章添加日期的函数
    add_missing_date() {
      local file=$1
      local filename=$(basename "$file")
      local today=$(date +"%Y年%-m月%-d日")
      
      # 提取文件名中可能存在的日期信息
      if [[ $filename =~ ^([0-9]{4})-([0-9]{2})-([0-9]{2})- ]]; then
        year="${BASH_REMATCH[1]}"
        month="${BASH_REMATCH[2]}"
        day="${BASH_REMATCH[3]}"
        
        # 移除前导零
        month=$(echo "$month" | sed 's/^0//')
        day=$(echo "$day" | sed 's/^0//')
        
        # 创建中文格式的日期
        date_str="${year}年${month}月${day}日"
      else
        # 如果文件名中没有日期，使用当前日期
        date_str="$today"
      fi
      
      # 检测操作系统类型，针对macOS和Linux使用不同的sed参数
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        SED_INPLACE=(-i "")
      else
        # Linux和其他类Unix系统
        SED_INPLACE=(-i)
      fi
      
      # 检查文件中是否有blog-date元素
      if grep -q '<span class="blog-date">' "$file"; then
        # 替换已存在但可能为空的blog-date
        sed "${SED_INPLACE[@]}" 's/<span class="blog-date">.*<\/span>/<span class="blog-date">'$date_str'<\/span>/g' "$file"
      else
        # 在blog-meta div中添加日期span
        if grep -q '<div class="blog-meta">' "$file"; then
          sed "${SED_INPLACE[@]}" 's/<div class="blog-meta">/<div class="blog-meta">\n            <span class="blog-date">'$date_str'<\/span>/g' "$file"
        fi
      fi
      
      # 检查文件中是否有"写于"段落
      if grep -q '写于' "$file"; then
        # 替换已存在的"写于"行
        sed "${SED_INPLACE[@]}" 's/写于.*</写于 '$date_str'</g' "$file"
      else
        # 在blog-footer中添加"写于"段落
        if grep -q '<div class="blog-footer">' "$file"; then
          sed "${SED_INPLACE[@]}" 's/<div class="blog-footer">/<div class="blog-footer">\n                        <p>写于 '$date_str'<\/p>/g' "$file"
        fi
      fi
      
      print_green "添加缺失的日期: $date_str (文件: $filename)"
      return 0
    }

    # 计数器
    fixed_count=0
    skipped_count=0
    error_count=0

    # 遍历博客目录中的所有HTML文件
    for file_path in "$BLOGS_DIR"/*.html; do
      filename=$(basename "$file_path")
      
      print_yellow "处理文件: $filename"
      
      # 检查文件中是否有不完整的日期格式
      incomplete_date=$(grep -o '[0-9]\{4\}年[0-9]\{1,2\}月[^日]*' "$file_path" | grep -v "日" | head -1)
      
      if [ ! -z "$incomplete_date" ]; then
        # 修复不完整的日期
        if fix_incomplete_date "$file_path" "$incomplete_date"; then
          ((fixed_count++))
          continue
        fi
      fi
      
      # 检查文件是否缺少日期信息
      has_date=false
      
      # 检查是否有完整的日期格式
      if grep -q '[0-9]\{4\}年[0-9]\{1,2\}月[0-9]\{1,2\}日' "$file_path"; then
        has_date=true
      fi
      
      # 检查是否有blog-date但内容为空
      empty_date=$(grep -o '<span class="blog-date">.*</span>' "$file_path" | grep -v '[0-9]')
      if [ ! -z "$empty_date" ]; then
        has_date=false
      fi
      
      if [ "$has_date" = false ]; then
        # 添加缺失的日期
        if add_missing_date "$file_path" "$filename"; then
          ((fixed_count++))
        else
          print_red "无法修复日期问题: $filename"
          ((error_count++))
        fi
      else
        print_yellow "文件已有有效日期，跳过: $filename"
        ((skipped_count++))
      fi
    done

    # 打印统计信息
    echo ""
    print_green "完成! 统计信息:"
    echo "- 修复的文件数: $fixed_count"
    echo "- 已跳过文件数: $skipped_count"
    echo "- 处理失败文件数: $error_count"
  fi
}

# 功能4: 更新博客模板（添加标签系统和版权声明）
update_blog_templates() {
  print_green "开始更新博客模板（添加标签系统和版权声明）..."
  check_blogs_dir
  
  # 检查是否安装了Python
  if command -v python3 &> /dev/null; then
    # 优先使用Python工具
    python3 "$SCRIPT_DIR/blog_utils.py" update-templates
  else
    # 计数器
    updated_date_count=0
    added_copyright_count=0
    added_scripts_count=0
    error_count=0
    
    # 检测操作系统类型，针对macOS和Linux使用不同的sed参数
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      SED_INPLACE=(-i "")
    else
      # Linux和其他类Unix系统
      SED_INPLACE=(-i)
    fi
    
    # 遍历博客目录中的所有HTML文件
    for file_path in "$BLOGS_DIR"/*.html; do
      filename=$(basename "$file_path")
      print_yellow "处理文件: $filename"
      
      # 1. 将 blog-date 类替换为 date-tag 类
      sed "${SED_INPLACE[@]}" 's/class="blog-date"/class="date-tag"/g' "$file_path"
      if [ $? -eq 0 ]; then
        ((updated_date_count++))
      fi
      
      # 2. 添加版权声明（如果不存在）
      if ! grep -q "copyright-notice" "$file_path"; then
        # 在文章末尾添加版权声明
        sed "${SED_INPLACE[@]}" '/<\/article>/i\
                    <div class="copyright-notice">\
                        <p>欢迎引用本文观点或图片，但请注明出处并附上本文链接。</p>\
                    </div>
' "$file_path"
        if [ $? -eq 0 ]; then
          ((added_copyright_count++))
        fi
      fi
      
      # 3. 添加标签系统脚本（如果不存在）
      if ! grep -q "tag-system.js" "$file_path"; then
        sed "${SED_INPLACE[@]}" '/<script src="\.\.\/js\/main\.js"><\/script>/a\
    <script src="../js/related-content.js"></script>\
    <script src="../js/tag-system.js"></script>
' "$file_path"
        if [ $? -eq 0 ]; then
          ((added_scripts_count++))
        fi
      fi
    done
    
    # 打印统计信息
    echo ""
    print_green "完成! 统计信息:"
    echo "- 更新日期标签类名的文件数: $updated_date_count"
    echo "- 添加版权声明的文件数: $added_copyright_count"
    echo "- 添加标签系统脚本的文件数: $added_scripts_count"
    echo "- 处理失败文件数: $error_count"
  fi
}

# 主程序
main() {
  if [ $# -eq 0 ]; then
    # 如果没有命令行参数，显示交互式菜单
    while true; do
      show_menu
      read -r choice
      
      case $choice in
        1) update_related_content_and_paths ;;
        2) rename_blog_files ;;
        3) fix_blog_dates ;;
        4) update_blog_templates ;;
        5)
          update_related_content_and_paths
          fix_blog_dates
          rename_blog_files
          update_blog_templates
          ;;
        0) exit 0 ;;
        *) print_red "无效选项，请重试" ;;
      esac
      
      echo ""
      read -p "按Enter键继续..." dummy
    done
  else
    # 如果有命令行参数，直接执行相应功能
    case $1 in
      --update-paths | -u) update_related_content_and_paths ;;
      --rename | -r) rename_blog_files ;;
      --fix-dates | -f) fix_blog_dates ;;
      --update-templates | -t) update_blog_templates ;;
      --all | -a)
        update_related_content_and_paths
        fix_blog_dates
        rename_blog_files
        update_blog_templates
        ;;
      --help | -h)
        echo "用法: $0 [选项]"
        echo "选项:"
        echo "  -u, --update-paths   更新相关内容和修复路径"
        echo "  -r, --rename         重命名博客文件（添加日期前缀）"
        echo "  -f, --fix-dates      修复博客日期格式"
        echo "  -t, --update-templates 更新博客模板（添加标签系统和版权声明）"
        echo "  -a, --all            执行所有维护任务"
        echo "  -h, --help           显示此帮助信息"
        ;;
      *)
        print_red "未知选项: $1"
        echo "使用 --help 查看可用选项"
        exit 1
        ;;
    esac
  fi
}

# 执行主程序
main "$@" 