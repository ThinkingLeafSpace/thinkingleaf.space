#!/bin/bash

# Obsidian到网站的自动化部署脚本
# 使用方法: ./deploy_blog.sh <markdown文件路径>

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}===== Obsidian博客部署工具 =====${NC}\n"

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}错误: 未找到python3，请先安装Python${NC}"
    exit 1
fi

# 检查Obsidian路径配置（如果存在配置文件）
CONFIG_FILE="$SITE_ROOT/blog_config.json"
if [ -f "$CONFIG_FILE" ]; then
    OBSIDIAN_VAULT=$(python3 -c "import json; f=open('$CONFIG_FILE'); d=json.load(f); print(d.get('obsidian_vault', ''))" 2>/dev/null || echo "")
    if [ -n "$OBSIDIAN_VAULT" ] && [ ! -d "$OBSIDIAN_VAULT" ]; then
        echo -e "${YELLOW}⚠️  警告: Obsidian库路径不存在: $OBSIDIAN_VAULT${NC}"
        echo -e "${YELLOW}请检查 blog_config.json 中的配置，或查看 OBSIDIAN路径配置.md${NC}\n"
    fi
fi

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${RED}错误: 请提供Markdown文件路径${NC}"
    echo ""
    echo "用法: $0 <markdown文件路径>"
    echo ""
    echo "示例:"
    echo "  $0 ~/Documents/Obsidian/我的博客/新文章.md"
    echo "  $0 /Users/qianny/Documents/Obsidian/笔记.md"
    echo ""
    echo -e "${YELLOW}提示:${NC}"
    echo "  • 在macOS上，你可以直接从Finder拖放文件到终端，自动获得完整路径"
    echo "  • 或者使用绝对路径：~/Documents/Obsidian/文件名.md"
    echo "  • 路径中包含空格时，需要用引号包裹"
    exit 1
fi

MARKDOWN_FILE="$1"

# 检查文件是否存在
if [ ! -f "$MARKDOWN_FILE" ]; then
    echo -e "${RED}错误: 文件不存在: $MARKDOWN_FILE${NC}"
    echo ""
    echo -e "${YELLOW}请检查:${NC}"
    echo "  1. 文件路径是否正确？"
    echo "  2. 文件是否存在？"
    echo "  3. 路径中是否包含特殊字符需要转义？"
    echo ""
    echo -e "${BLUE}提示:${NC}"
    echo "  • 在终端中，你可以输入文件路径的开头部分，然后按 Tab 键自动补全"
    echo "  • 或者从Finder拖放文件到终端窗口"
    echo "  • 使用绝对路径: ~/Documents/Obsidian/文件名.md"
    exit 1
fi

echo -e "${BLUE}1. 转换Markdown为HTML...${NC}"

# 转换Markdown
cd "$SITE_ROOT"

# 检查依赖（可选，如果失败会给出提示）
python3 "$SCRIPT_DIR/markdown_to_html.py" "$MARKDOWN_FILE" 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}转换失败！${NC}"
    echo -e "${YELLOW}提示: 如果提示缺少依赖，请运行:${NC}"
    echo "  pip3 install -r scripts/requirements.txt"
    exit 1
fi

echo -e "${GREEN}✓ Markdown转换完成${NC}\n"

echo -e "${BLUE}2. 更新博客列表...${NC}"
python3 "$SCRIPT_DIR/update_blogs_list.py"

echo -e "${GREEN}✓ 博客列表已更新${NC}\n"

echo -e "${BLUE}3. 检查Git状态...${NC}"
cd "$SITE_ROOT"

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}提示: 你可以运行以下命令提交更改:${NC}"
    echo "  git add ."
    echo "  git commit -m '添加新博客: $(basename "$MARKDOWN_FILE")'"
    echo "  git push"
else
    echo -e "${YELLOW}提示: 当前目录不是Git仓库${NC}"
fi

echo -e "\n${GREEN}✓ 部署完成！${NC}"
echo -e "${BLUE}你现在可以在浏览器中预览你的博客了。${NC}"

