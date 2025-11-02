#!/bin/bash

# 批量添加懒加载CSS引用到所有HTML文件
# 此脚本会自动检测并添加懒加载CSS引用，避免重复添加

echo "开始批量添加懒加载CSS引用..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 计数器
added_count=0
skipped_count=0

# 函数：为博客文章添加懒加载CSS（在blogs目录下）
add_lazy_loading_to_blogs() {
    echo "处理 blogs/ 目录下的文章..."
    
    for file in blogs/*.html; do
        if [ -f "$file" ]; then
            # 检查是否已包含懒加载CSS
            if grep -q "lazy-loading.css" "$file"; then
                echo -e "${YELLOW}跳过:${NC} $file (已包含懒加载CSS)"
                ((skipped_count++))
            else
                # 查找 blog-post.css 或 styles.css 的位置，在其后添加
                if grep -q "blog-post.css" "$file"; then
                    # 在 blog-post.css 后添加
                    sed -i '' '/blog-post.css/a\
    <link rel="stylesheet" href="../css/lazy-loading.css">
' "$file"
                elif grep -q "../css/styles.css" "$file"; then
                    # 在 styles.css 后添加
                    sed -i '' '/\.\.\/css\/styles\.css/a\
    <link rel="stylesheet" href="../css/lazy-loading.css">
' "$file"
                elif grep -q "blog-post.css\|styles.css" "$file"; then
                    # 尝试在第一个CSS引用后添加
                    sed -i '' '0,/rel="stylesheet"/{/rel="stylesheet"/a\
    <link rel="stylesheet" href="../css/lazy-loading.css">
}' "$file"
                else
                    echo -e "${YELLOW}警告:${NC} $file 未找到合适的CSS引用位置，需要手动添加"
                    continue
                fi
                
                echo -e "${GREEN}已添加:${NC} $file"
                ((added_count++))
            fi
        fi
    done
}

# 函数：为展品页面添加懒加载CSS（在exhibits目录下）
add_lazy_loading_to_exhibits() {
    echo ""
    echo "处理 exhibits/ 目录下的页面..."
    
    for file in exhibits/*.html; do
        if [ -f "$file" ]; then
            # 检查是否已包含懒加载CSS
            if grep -q "lazy-loading.css" "$file"; then
                echo -e "${YELLOW}跳过:${NC} $file (已包含懒加载CSS)"
                ((skipped_count++))
            else
                # 查找CSS引用位置，在其后添加
                if grep -q "../style.css\|../css/styles.css" "$file"; then
                    # 在style.css或styles.css后添加
                    sed -i '' '0,/rel="stylesheet"/{/rel="stylesheet"/a\
  <link rel="stylesheet" href="../css/lazy-loading.css">
}' "$file"
                else
                    echo -e "${YELLOW}警告:${NC} $file 未找到合适的CSS引用位置"
                    continue
                fi
                
                echo -e "${GREEN}已添加:${NC} $file"
                ((added_count++))
            fi
        fi
    done
}

# 函数：为cabinet.html添加懒加载CSS
add_lazy_loading_to_cabinet() {
    echo ""
    echo "处理 cabinet.html..."
    
    if [ -f "cabinet.html" ]; then
        if grep -q "lazy-loading.css" "cabinet.html"; then
            echo -e "${YELLOW}跳过:${NC} cabinet.html (已包含懒加载CSS)"
            ((skipped_count++))
        else
            # 在 ui-principles.css 后添加
            if grep -q "ui-principles.css" "cabinet.html"; then
                sed -i '' '/ui-principles.css/a\
  <link rel="stylesheet" href="css/lazy-loading.css">
' "cabinet.html"
                echo -e "${GREEN}已添加:${NC} cabinet.html"
                ((added_count++))
            else
                echo -e "${YELLOW}警告:${NC} cabinet.html 未找到 ui-principles.css，需要手动添加"
            fi
        fi
    fi
}

# 函数：为其他根目录HTML文件添加懒加载CSS
add_lazy_loading_to_root() {
    echo ""
    echo "处理根目录下的其他HTML文件..."
    
    # 需要添加懒加载的根目录文件列表（排除已处理的）
    root_files=("portfolio.html" "newsletter.html" "mitsein.html")
    
    for file in "${root_files[@]}"; do
        if [ -f "$file" ]; then
            if grep -q "lazy-loading.css" "$file"; then
                echo -e "${YELLOW}跳过:${NC} $file (已包含懒加载CSS)"
                ((skipped_count++))
            else
                # 查找CSS引用位置
                if grep -q "ui-principles.css\|search.css\|dark-mode.css" "$file"; then
                    # 在最后一个CSS引用后添加
                    sed -i '' '/dark-mode.css\|search.css\|ui-principles.css/{ 
                        a\
  <link rel="stylesheet" href="css/lazy-loading.css">
                    }' "$file"
                    
                    # 使用更简单的方法
                    sed -i '' '/dark-mode\.css/a\
  <link rel="stylesheet" href="css/lazy-loading.css">
' "$file" 2>/dev/null || sed -i '' '/search\.css/a\
  <link rel="stylesheet" href="css/lazy-loading.css">
' "$file" 2>/dev/null || sed -i '' '/ui-principles\.css/a\
  <link rel="stylesheet" href="css/lazy-loading.css">
' "$file"
                    
                    echo -e "${GREEN}已添加:${NC} $file"
                    ((added_count++))
                else
                    echo -e "${YELLOW}警告:${NC} $file 未找到合适的CSS引用位置"
                fi
            fi
        fi
    done
}

# 主执行流程
echo "=========================================="
echo "批量添加懒加载CSS引用"
echo "=========================================="
echo ""

# 切换到脚本所在目录
cd "$(dirname "$0")"

# 执行各个函数
add_lazy_loading_to_blogs
add_lazy_loading_to_exhibits
add_lazy_loading_to_cabinet
add_lazy_loading_to_root

# 总结
echo ""
echo "=========================================="
echo "处理完成！"
echo "=========================================="
echo -e "${GREEN}已添加懒加载CSS: ${added_count} 个文件${NC}"
echo -e "${YELLOW}已跳过（已有）: ${skipped_count} 个文件${NC}"
echo ""
echo "提示：请检查修改后的文件，确保格式正确。"
