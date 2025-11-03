#!/bin/bash

# Git推送重试脚本
# 解决网络不稳定导致的推送失败

set -e

MAX_RETRIES=5
RETRY_DELAY=5

echo "开始尝试推送到GitHub..."
echo "最多重试次数: $MAX_RETRIES"
echo "重试间隔: ${RETRY_DELAY}秒"
echo ""

for i in $(seq 1 $MAX_RETRIES); do
    echo "尝试 $i/$MAX_RETRIES ..."
    
    if git push 2>&1; then
        echo ""
        echo "✅ 推送成功！"
        exit 0
    else
        echo "❌ 推送失败，等待 ${RETRY_DELAY}秒后重试..."
        sleep $RETRY_DELAY
    fi
done

echo ""
echo "❌ 推送失败，已尝试 $MAX_RETRIES 次"
echo ""
echo "建议："
echo "1. 检查网络连接"
echo "2. 稍后再试"
echo "3. 或使用SSH方式：git remote set-url origin git@github.com:ThinkingLeafSpace/thinkingleaf.space.git"
exit 1

