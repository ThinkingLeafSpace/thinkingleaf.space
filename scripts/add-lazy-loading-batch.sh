#!/bin/bash

# 批量添加懒加载CSS引用到所有博客文章和展品页面
# 使用方法: ./scripts/add-lazy-loading-batch.sh

echo "开始批量添加懒加载CSS引用..."

# 博客文章目录
BLOG_DIR="blogs"
# 展品目录
EXHIBIT_DIR="exhibits"

# 计数器
BLOG_COUNT=0
EXHIBIT_COUNT=0

# 处理博客文章
echo "处理博客文章..."
for file in "$BLOG_DIR"/*.html; do
    if [ -f "$file" ]; then
        # 检查是否已经包含懒加载CSS
        if ! grep -q "lazy-loading.css" "$file"; then
            # 查找 blog-post.css 或 float-music-icon.css 的位置
            if grep -q "blog-post.css" "$file"; then
                # 在 blog-post.css 后添加懒加载CSS
                sed -i '' 's|<link rel="stylesheet" href="../css/blog-post.css">|<link rel="stylesheet" href="../css/blog-post.css">\n    <link rel="stylesheet" href="../css/lazy-loading.css">|' "$file"
            elif grep -q "float-music-icon.css" "$file"; then
                # 在 float-music-icon.css 后添加懒加载CSS
                sed -i '' 's|<link rel="stylesheet" href="../css/float-music-icon.css">|<link rel="stylesheet" href="../css/float-music-icon.css">\n    <link rel="stylesheet" href="../css/lazy-loading.css">|' "$file"
            elif grep -q "styles.css" "$file"; then
                # 在 styles.css 后添加懒加载CSS
                sed -i '' 's|<link rel="stylesheet" href="../css/styles.css">|<link rel="stylesheet" href="../css/styles.css">\n    <link rel="stylesheet" href="../css/lazy-loading.css">|' "$file"
            fi
            echo "  ✓ 已添加懒加载CSS到: $file"
            ((BLOG_COUNT++))
        else
            echo "  - 已存在懒加载CSS: $file"
        fi
    fi
done

# 处理展品页面
echo ""
echo "处理展品页面..."
for file in "$EXHIBIT_DIR"/*.html; do
    if [ -f "$file" ]; then
        # 检查是否已经包含懒加载CSS
        if ! grep -q "lazy-loading.css" "$file"; then
            # 查找 style.css 的位置
            if grep -q "style.css" "$file"; then
                # 在 style.css 后添加懒加载CSS
                sed -i '' 's|<link rel="stylesheet" href="../style.css">|<link rel="stylesheet" href="../style.css">\n  <link rel="stylesheet" href="../css/lazy-loading.css">|' "$file"
            elif grep -q "styles.css" "$file"; then
                # 在 styles.css 后添加懒加载CSS
                sed -i '' 's|<link rel="stylesheet" href="../css/styles.css">|<link rel="stylesheet" href="../css/styles.css">\n  <link rel="stylesheet" href="../css/lazy-loading.css">|' "$file"
            fi
            echo "  ✓ 已添加懒加载CSS到: $file"
            ((EXHIBIT_COUNT++))
        else
            echo "  - 已存在懒加载CSS: $file"
        fi
    fi
done

echo ""
echo "完成！"
echo "博客文章: 添加了 $BLOG_COUNT 个文件的懒加载CSS"
echo "展品页面: 添加了 $EXHIBIT_COUNT 个文件的懒加载CSS"
