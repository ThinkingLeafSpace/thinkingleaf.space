#!/bin/bash

# 快速安装和设置脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}===== Obsidian到网站部署工具 - 安装脚本 =====${NC}\n"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$SITE_ROOT"

# 1. 检查Python
echo -e "${BLUE}1. 检查Python环境...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ 找到: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ 未找到Python3，请先安装Python${NC}"
    exit 1
fi

# 2. 检查pip
echo -e "\n${BLUE}2. 检查pip...${NC}"
if command -v pip3 &> /dev/null; then
    echo -e "${GREEN}✓ pip3 已安装${NC}"
    PIP_CMD="pip3"
elif python3 -m pip --version &> /dev/null; then
    echo -e "${GREEN}✓ python3 -m pip 可用${NC}"
    PIP_CMD="python3 -m pip"
else
    echo -e "${RED}✗ 未找到pip，尝试安装...${NC}"
    exit 1
fi

# 3. 安装Python依赖
echo -e "\n${BLUE}3. 安装Python依赖...${NC}"
$PIP_CMD install -r scripts/requirements.txt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 依赖安装成功${NC}"
else
    echo -e "${RED}✗ 依赖安装失败${NC}"
    exit 1
fi

# 4. 设置脚本权限
echo -e "\n${BLUE}4. 设置脚本执行权限...${NC}"
chmod +x scripts/deploy_blog.sh
chmod +x scripts/markdown_to_html.py
chmod +x scripts/update_blogs_list.py
echo -e "${GREEN}✓ 权限设置完成${NC}"

# 5. 创建必要的目录
echo -e "\n${BLUE}5. 创建必要的目录...${NC}"
mkdir -p images/blog
echo -e "${GREEN}✓ 目录创建完成${NC}"

# 6. 检查配置文件
echo -e "\n${BLUE}6. 检查配置文件...${NC}"
if [ -f "blog_config.json" ]; then
    echo -e "${GREEN}✓ 配置文件已存在${NC}"
    echo -e "${YELLOW}提示: 记得在 blog_config.json 中配置你的Obsidian附件目录路径${NC}"
else
    echo -e "${YELLOW}⚠ 配置文件不存在，将创建默认配置${NC}"
fi

echo -e "\n${GREEN}===== 安装完成！ =====${NC}\n"
echo -e "下一步："
echo -e "1. 编辑 ${BLUE}blog_config.json${NC} 配置Obsidian附件目录"
echo -e "2. 使用以下命令部署博客："
echo -e "   ${BLUE}./scripts/deploy_blog.sh /path/to/your/article.md${NC}"
echo -e "\n查看完整文档: ${BLUE}README_OBSIDIAN_DEPLOY.md${NC}"

