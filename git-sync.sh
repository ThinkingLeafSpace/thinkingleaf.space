#!/bin/bash

echo "=== Git Sync Tool ==="

# 显示当前Git状态
git status
echo ""

# 询问是否继续
read -p "Continue? (Y/N): " CONTINUE
if [[ "$CONTINUE" != "Y" && "$CONTINUE" != "y" ]]; then
    echo "Operation cancelled."
    exit 0
fi

# 添加所有更改
git add .

# 提交更改，使用当前日期时间作为提交信息
COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"

# 先拉取最新代码（使用rebase避免不必要的合并提交）
git pull --rebase

# 推送更改到远程仓库
git push

echo ""
echo "Done!"
