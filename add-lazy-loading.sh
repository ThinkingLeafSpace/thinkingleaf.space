#!/bin/bash

# 添加懒加载CSS引用到所有HTML文件
echo "Adding lazy-loading CSS to HTML files..."
find . -name "*.html" -type f -exec sed -i '' 's/<link rel="stylesheet" href="css\/dark-mode.css">/<link rel="stylesheet" href="css\/dark-mode.css">\n  <link rel="stylesheet" href="css\/lazy-loading.css">/' {} \;
find . -name "*.html" -type f -exec sed -i '' 's/<link rel="stylesheet" href="..\/css\/dark-mode.css">/<link rel="stylesheet" href="..\/css\/dark-mode.css">\n  <link rel="stylesheet" href="..\/css\/lazy-loading.css">/' {} \;

# 添加懒加载JS到所有HTML文件
echo "Adding lazy-loading JS to HTML files..."
find . -name "*.html" -type f -exec sed -i '' 's/<script src="js\/theme-switcher.js"><\/script>/<script src="js\/theme-switcher.js"><\/script>\n  <script src="js\/lazy-loading.js"><\/script>/' {} \;
find . -name "*.html" -type f -exec sed -i '' 's/<script src="..\/js\/theme-switcher.js"><\/script>/<script src="..\/js\/theme-switcher.js"><\/script>\n  <script src="..\/js\/lazy-loading.js"><\/script>/' {} \;

# 为所有img标签添加loading="lazy"属性
echo "Adding loading='lazy' attribute to all images..."
find . -name "*.html" -type f -exec sed -i '' 's/<img src=/<img loading="lazy" src=/' {} \;

# 为图片添加data-src属性（同时保留src属性，确保兼容性）
echo "Adding data-src attribute to images..."
find . -name "*.html" -type f -exec sed -i '' 's/<img loading="lazy" src=\(.*\)>/<img loading="lazy" src=\1 data-src=\1>/' {} \;

# 对于特定的、可能非常大的图片，使用占位符
echo "Adding placeholder for large images..."
find . -name "*.html" -type f -exec sed -i '' 's/<img loading="lazy" src=\(".*unsplash\.com.*"\) data-src=\1>/<img loading="lazy" src="images\/placeholder-image.jpg" data-src=\1>/' {} \;

echo "Lazy loading has been added to all images!"
