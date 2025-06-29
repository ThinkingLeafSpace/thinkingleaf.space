#!/bin/bash
echo "正在更新所有博客和newsletter页面为使用模块化结构..."
node modules/related-content/updater.js
echo ""
echo "更新完成！" 