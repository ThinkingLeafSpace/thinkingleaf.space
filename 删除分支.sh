#!/bin/bash

# 删除不需要的远程分支，只保留master

echo "=== 删除不需要的分支 ==="
echo ""

# 检查网络连接
if ! git ls-remote origin master &>/dev/null; then
    echo "❌ 无法连接到GitHub，请检查网络连接"
    exit 1
fi

# 要删除的分支列表
BRANCHES_TO_DELETE=("gh-pages" "main" "ThinkingLeafSpace-V1.1" "delete")

echo "准备删除以下分支："
for branch in "${BRANCHES_TO_DELETE[@]}"; do
    echo "  - $branch"
done
echo ""

read -p "确认删除? (Y/N): " CONFIRM
if [[ "$CONFIRM" != "Y" && "$CONFIRM" != "y" ]]; then
    echo "操作取消"
    exit 0
fi

# 删除分支
for branch in "${BRANCHES_TO_DELETE[@]}"; do
    echo ""
    echo "正在删除 $branch..."
    if git push origin --delete "$branch" 2>/dev/null; then
        echo "✅ 成功删除 $branch"
    else
        echo "⚠️  删除 $branch 失败（可能已不存在或网络问题）"
    fi
done

echo ""
echo "清理本地分支引用..."
git remote prune origin

echo ""
echo "=== 删除完成 ==="
echo ""
echo "当前远程分支："
git branch -r

