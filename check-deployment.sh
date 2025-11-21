#!/bin/bash

# Cloudflare Pages 部署诊断脚本
# 用于检查可能导致 "内部错误" 的常见问题

echo "🔍 Cloudflare Pages 部署诊断"
echo "================================"
echo ""

# 1. 检查 index.html
echo "1️⃣ 检查 index.html..."
if [ -f "index.html" ]; then
    echo "   ✅ index.html 存在"
else
    echo "   ❌ index.html 不存在！"
fi
echo ""

# 2. 检查大文件（>25MB）
echo "2️⃣ 检查大文件（>25MB）..."
LARGE_FILES=$(find . -type f ! -path './.git/*' ! -path './.github/*' -size +25M 2>/dev/null)
if [ -z "$LARGE_FILES" ]; then
    echo "   ✅ 没有超过 25MB 的文件"
else
    echo "   ❌ 发现超过 25MB 的文件："
    echo "$LARGE_FILES" | while read file; do
        SIZE=$(ls -lh "$file" | awk '{print $5}')
        echo "      - $file ($SIZE)"
    done
fi
echo ""

# 3. 检查图片文件大小
echo "3️⃣ 检查图片文件大小..."
LARGE_IMAGES=$(find . -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) ! -path './.git/*' -size +25M 2>/dev/null)
if [ -z "$LARGE_IMAGES" ]; then
    echo "   ✅ 没有超过 25MB 的图片文件"
else
    echo "   ❌ 发现超过 25MB 的图片："
    echo "$LARGE_IMAGES" | while read file; do
        SIZE=$(ls -lh "$file" | awk '{print $5}')
        echo "      - $file ($SIZE)"
    done
fi
echo ""

# 4. 检查输出目录配置
echo "4️⃣ 检查 Cloudflare Pages 配置..."
if [ -f "cloudflare-pages-config.json" ]; then
    echo "   ✅ cloudflare-pages-config.json 存在"
    OUTPUT_DIR=$(grep -o '"output":\s*"[^"]*"' cloudflare-pages-config.json | cut -d'"' -f4)
    echo "   📁 输出目录: $OUTPUT_DIR"
    if [ "$OUTPUT_DIR" = "." ] || [ "$OUTPUT_DIR" = "/" ]; then
        echo "   ✅ 输出目录配置正确"
    else
        echo "   ⚠️  输出目录可能需要设置为 '.' 或 '/'"
    fi
else
    echo "   ⚠️  cloudflare-pages-config.json 不存在（可选）"
fi
echo ""

# 5. 检查总文件数
echo "5️⃣ 检查文件统计..."
TOTAL_FILES=$(find . -type f ! -path './.git/*' ! -path './.github/*' 2>/dev/null | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh . 2>/dev/null | awk '{print $1}')
echo "   📊 总文件数: $TOTAL_FILES"
echo "   📊 总大小: $TOTAL_SIZE"
echo ""

# 6. 检查关键文件
echo "6️⃣ 检查关键文件..."
for file in "index.html" "_redirects" "404.html"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file 存在"
    else
        echo "   ⚠️  $file 不存在（可选）"
    fi
done
echo ""

echo "================================"
echo "✅ 诊断完成！"
echo ""
echo "💡 建议："
echo "   1. 如果所有检查都通过，问题可能在 Cloudflare Dashboard 配置"
echo "   2. 确保 Cloudflare Pages 设置中："
echo "      - Framework preset: None"
echo "      - Build command: (空)"
echo "      - Build output directory: . 或 /"
echo "   3. 如果仍然失败，检查 Deployment 日志获取详细错误信息"

