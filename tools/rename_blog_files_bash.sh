#!/bin/bash
# 博客文件重命名工具 (纯bash版本)
# 将博客文件名重命名为"年-月-日-原文件名"格式

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# 博客目录路径
BLOGS_DIR="$(dirname "$SCRIPT_DIR")/blogs"

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

# 检查博客目录是否存在
if [ ! -d "$BLOGS_DIR" ]; then
  print_red "错误: 博客目录 $BLOGS_DIR 不存在"
  exit 1
fi

print_green "开始重命名博客文件..."
print_green "博客目录: $BLOGS_DIR"

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