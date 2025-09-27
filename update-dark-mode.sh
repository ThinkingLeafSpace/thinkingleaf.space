#!/bin/bash

# 更新深色模式到所有HTML文件
# 此脚本会将深色模式相关的样式表和脚本添加到所有HTML文件中

# 输出颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始更新深色模式到所有HTML文件...${NC}"

# 查找所有HTML文件
HTML_FILES=$(find . -type f -name "*.html")

# 文件计数
TOTAL_FILES=$(echo "$HTML_FILES" | wc -l)
UPDATED_FILES=0

for file in $HTML_FILES; do
  echo -e "处理文件: ${file}"
  
  # 检查文件是否已包含深色模式CSS
  if grep -q "dark-mode.css" "$file"; then
    echo -e "  ${GREEN}已包含深色模式CSS${NC}"
  else
    # 添加深色模式CSS链接
    sed -i '' 's/<link rel="stylesheet" href="css\/search.css">/<link rel="stylesheet" href="css\/search.css">\n  <link rel="stylesheet" href="css\/dark-mode.css">/' "$file"
    echo -e "  ${GREEN}添加了深色模式CSS${NC}"
    ((UPDATED_FILES++))
  fi
  
  # 检查文件是否已包含深色模式JS
  if grep -q "theme-switcher.js" "$file"; then
    echo -e "  ${GREEN}已包含深色模式JS${NC}"
  else
    # 检查是否有脚本标签区域
    if grep -q "<script src=" "$file"; then
      # 在最后一个脚本标签前添加深色模式JS
      sed -i '' 's/<script src="[^"]*" *[^>]*>/<script src="js\/theme-switcher.js"><\/script>\n  &/' "$file"
      echo -e "  ${GREEN}添加了深色模式JS${NC}"
      ((UPDATED_FILES++))
    else
      echo -e "  ${RED}未找到脚本区域，无法添加深色模式JS${NC}"
    fi
  fi
  
  # 检查是否有主题切换按钮
  if grep -q "theme-toggle" "$file"; then
    echo -e "  ${GREEN}已包含主题切换按钮${NC}"
  else
    # 在body标签后添加主题切换按钮
    THEME_TOGGLE='<button class="theme-toggle" id="theme-toggle" aria-label="切换深浅模式">\n    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sun-icon">\n      <circle cx="12" cy="12" r="5"></circle>\n      <line x1="12" y1="1" x2="12" y2="3"></line>\n      <line x1="12" y1="21" x2="12" y2="23"></line>\n      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>\n      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>\n      <line x1="1" y1="12" x2="3" y2="12"></line>\n      <line x1="21" y1="12" x2="23" y2="12"></line>\n      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>\n      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>\n    </svg>\n    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="moon-icon" style="display: none;">\n      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>\n    </svg>\n  </button>'
    sed -i '' "s/<body>/<body>\n  $THEME_TOGGLE/" "$file"
    echo -e "  ${GREEN}添加了主题切换按钮${NC}"
    ((UPDATED_FILES++))
  fi
done

echo -e "${GREEN}更新完成！共处理了 ${TOTAL_FILES} 个文件，更新了 ${UPDATED_FILES} 处内容。${NC}"
echo "现在所有页面都应支持深色模式。"
