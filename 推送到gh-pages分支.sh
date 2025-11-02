#!/bin/bash

# 将master分支的更改推送到gh-pages分支（如果GitHub Pages使用gh-pages分支）

echo "=== 推送到gh-pages分支 ==="
echo ""

# 确保在项目目录
cd "$(dirname "$0")"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"
echo ""

if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "警告: 当前不在master分支，切换到master..."
    git checkout master
fi

# 显示待推送的提交
echo "待推送的提交:"
git log origin/master..HEAD --oneline
echo ""

# 询问是否继续
read -p "是否推送到gh-pages分支? (Y/N): " CONTINUE
if [[ "$CONTINUE" != "Y" && "$CONTINUE" != "y" ]]; then
    echo "操作取消"
    exit 0
fi

# 先推送master（如果有权限）
echo ""
echo "1. 尝试推送到master分支..."
git push origin master || echo "推送到master失败（可能是邮箱验证问题）"
echo ""

# 切换到gh-pages分支
echo "2. 切换到gh-pages分支..."
git checkout gh-pages || git checkout -b gh-pages origin/gh-pages

# 合并master的更改
echo ""
echo "3. 合并master的更改到gh-pages..."
git merge master

# 推送到gh-pages
echo ""
echo "4. 推送到gh-pages分支..."
git push origin gh-pages

# 切回master
echo ""
echo "5. 切回master分支..."
git checkout master

echo ""
echo "✓ 完成！"
echo ""
echo "提示: GitHub Pages可能需要几分钟才能更新网站"

