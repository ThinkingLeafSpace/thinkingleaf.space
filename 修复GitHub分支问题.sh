#!/bin/bash

# 修复GitHub分支配置问题
# 问题：默认分支是delete，导致GitHub Pages显示旧内容

echo "=== 修复GitHub分支配置问题 ==="
echo ""

# 确保在项目目录
cd "$(dirname "$0")"

# 显示当前状态
echo "📊 当前Git状态："
echo ""
git branch -a
echo ""

# 显示远程分支的提交数对比
echo "📈 分支提交对比："
echo ""
echo "delete分支的最后提交："
git log origin/delete -1 --oneline
echo ""
echo "master分支的最后提交："
git log origin/master -1 --oneline
echo ""

echo "⚠️  问题诊断："
echo "GitHub仓库的默认分支是 'delete'，但你的最新内容在 'master' 分支"
echo "所以GitHub Pages现在显示的是delete分支的旧内容"
echo ""

echo "🔧 解决方案："
echo "需要在GitHub网页上手动修改默认分支设置"
echo ""
echo "请按照以下步骤操作："
echo ""
echo "1️⃣  打开浏览器，访问："
echo "   https://github.com/ThinkingLeafSpace/thinkingleaf.space"
echo ""
echo "2️⃣  点击右上角的 ⚙️ Settings（设置）按钮"
echo ""
echo "3️⃣  在左侧菜单找到 'Branches'（分支）"
echo ""
echo "4️⃣  找到 'Default branch'（默认分支）部分"
echo ""
echo "5️⃣  点击 'Switch to another branch' 下拉菜单"
echo ""
echo "6️⃣  选择 'master' 分支"
echo ""
echo "7️⃣  点击确认按钮"
echo ""
echo "8️⃣  在左侧菜单找到 'Pages' 设置"
echo ""
echo "9️⃣  确认 Source 分支是 'master'"
echo ""
echo "🔟  点击 Save 保存"
echo ""

read -p "是否需要我帮你推送master分支确保同步? (Y/N): " PUSH
if [[ "$PUSH" == "Y" || "$PUSH" == "y" ]]; then
    echo ""
    echo "正在检查master分支状态..."
    git status
    
    echo ""
    read -p "确认推送master分支到远程? (Y/N): " CONFIRM
    if [[ "$CONFIRM" == "Y" || "$CONFIRM" == "y" ]]; then
        echo ""
        git push origin master
        echo ""
        echo "✅ master分支已推送"
    fi
fi

echo ""
echo "=================================="
echo "✅ 操作完成！"
echo ""
echo "📌 下一步："
echo "   1. 按照上面的步骤在GitHub网页上修改默认分支"
echo "   2. 等待5-10分钟后刷新你的网站"
echo "   3. 应该就能看到最新的内容了！"
echo ""
echo "💡 设置完成后，建议删除delete分支以避免混淆"
echo "   运行: bash 删除分支.sh"
echo ""

