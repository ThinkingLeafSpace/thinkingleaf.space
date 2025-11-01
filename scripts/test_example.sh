#!/bin/bash

# 测试脚本 - 使用示例文件测试转换功能

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_ROOT="$(dirname "$SCRIPT_DIR")"
EXAMPLE_FILE="$SCRIPT_DIR/example_blog.md"

echo "测试Obsidian部署工具..."
echo "使用示例文件: $EXAMPLE_FILE"
echo ""

cd "$SITE_ROOT"

if [ ! -f "$EXAMPLE_FILE" ]; then
    echo "错误: 示例文件不存在"
    exit 1
fi

# 运行转换脚本
python3 "$SCRIPT_DIR/markdown_to_html.py" "$EXAMPLE_FILE"

echo ""
echo "测试完成！检查 blogs/ 目录查看生成的HTML文件。"

