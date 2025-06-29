#!/bin/bash

# 更新所有博客页面的脚本
# 添加标签系统和版权声明

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始更新所有博客页面...${NC}"

# 进入博客目录
cd "$(dirname "$0")/../blogs" || { echo -e "${RED}无法进入博客目录${NC}"; exit 1; }

# 遍历所有HTML文件
for file in *.html; do
    echo -e "${YELLOW}正在处理: ${file}${NC}"
    
    # 1. 将 blog-date 类替换为 date-tag 类
    sed -i '' 's/class="blog-date"/class="date-tag"/g' "$file"
    
    # 2. 添加版权声明（如果不存在）
    if ! grep -q "copyright-notice" "$file"; then
        # 在文章末尾添加版权声明
        sed -i '' '/<\/article>/i\
                    <div class="copyright-notice">\
                        <p>欢迎引用本文观点或图片，但请注明出处并附上本文链接。</p>\
                    </div>
' "$file"
    fi
    
    # 3. 添加标签系统脚本（如果不存在）
    if ! grep -q "tag-system.js" "$file"; then
        sed -i '' '/<script src="\.\.\/js\/main\.js"><\/script>/a\
    <script src="../js/related-content.js"></script>\
    <script src="../js/tag-system.js"></script>
' "$file"
    fi
    
    echo -e "${GREEN}完成: ${file}${NC}"
done

echo -e "${GREEN}所有博客页面更新完成!${NC}" 