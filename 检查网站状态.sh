#!/bin/bash

# 检查网站状态和配置

echo "🔍 检查网站配置状态..."
echo ""

cd "$(dirname "$0")"

echo "1️⃣  本地Git状态："
git branch --show-current
echo ""

echo "2️⃣  CNAME文件："
if [ -f "CNAME" ]; then
    echo "✅ CNAME文件存在"
    cat CNAME
else
    echo "❌ CNAME文件不存在！"
fi
echo ""

echo "3️⃣  index.html文件："
if [ -f "index.html" ]; then
    echo "✅ index.html文件存在"
    echo "   文件大小: $(ls -lh index.html | awk '{print $5}')"
else
    echo "❌ index.html文件不存在！"
fi
echo ""

echo "4️⃣  最近3次提交："
git log --oneline -3
echo ""

echo "========================================="
echo ""
echo "✅ 本地文件检查完成！"
echo ""
echo "📋 下一步操作："
echo "   1. 访问 https://github.com/ThinkingLeafSpace/thinkingleaf.space/settings/pages"
echo "   2. 确认 Source 设置为：master / (root)"
echo "   3. 查看页面顶部的构建状态"
echo "   4. 等待状态变成绿色勾勾"
echo "   5. 刷新网站"
echo ""
echo "🌐 网站地址：https://thinkingleaf.space"
echo ""
echo "⏳ 如果仍然404，可能是GitHub正在部署，请等待5-10分钟"

