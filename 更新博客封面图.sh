#!/bin/bash
# 更新博客列表页封面图脚本
# 使用方法：在项目根目录运行 ./更新博客封面图.sh

cd "$(dirname "$0")/.."

echo "🔄 正在更新博客列表页封面图..."
python3 "ThinkingLeafSpace 20250924com/scripts/update_blogs_pages.py"

echo ""
echo "✅ 更新完成！"
echo "💡 提示：如果你修改了博客HTML文件中的图片，运行此脚本即可同步更新封面图。"

