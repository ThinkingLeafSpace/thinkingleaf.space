#!/bin/bash
# 博客文章日期格式修复工具
# 此脚本会扫描所有博客文章，修复日期格式问题

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

print_green "开始修复博客文章中的日期格式问题..."
print_green "博客目录: $BLOGS_DIR"

# 计数器
fixed_count=0
skipped_count=0
error_count=0

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
    
    # 替换文件中的不完整日期
    sed -i '' "s/$incomplete_date/$complete_date/g" "$file"
    
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
  
  # 检查文件中是否有blog-date元素
  if grep -q '<span class="blog-date">' "$file"; then
    # 替换已存在但可能为空的blog-date
    sed -i '' 's/<span class="blog-date">.*<\/span>/<span class="blog-date">'$date_str'<\/span>/g' "$file"
  else
    # 在blog-meta div中添加日期span
    if grep -q '<div class="blog-meta">' "$file"; then
      sed -i '' 's/<div class="blog-meta">/<div class="blog-meta">\n            <span class="blog-date">'$date_str'<\/span>/g' "$file"
    fi
  fi
  
  # 检查文件中是否有"写于"段落
  if grep -q '写于' "$file"; then
    # 替换已存在的"写于"行
    sed -i '' 's/写于.*</写于 '$date_str'</g' "$file"
  else
    # 在blog-footer中添加"写于"段落
    if grep -q '<div class="blog-footer">' "$file"; then
      sed -i '' 's/<div class="blog-footer">/<div class="blog-footer">\n                        <p>写于 '$date_str'<\/p>/g' "$file"
    fi
  fi
  
  print_green "添加缺失的日期: $date_str (文件: $filename)"
  return 0
}

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

# 建议重新运行重命名脚本
echo ""
print_green "建议现在运行重命名脚本以使用修复后的日期信息:"
echo "./tools/rename_blog_files_bash.sh" 