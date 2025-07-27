#!/bin/bash

# 确保在脚本目录下执行
cd "$(dirname "$0")"

echo "开始准备样式文件..."

# 确保样式文件存在
if [ ! -f "style.css" ]; then
  echo "错误: style.css 文件不存在！"
  exit 1
fi

if [ ! -f "script.js" ]; then
  echo "错误: script.js 文件不存在！"
  exit 1
fi

# 查看是否有示例文件
if [ ! -f "blogs/22-years-old.html" ]; then
  echo "警告: 没有找到示例文件 blogs/22-years-old.html"
fi

echo "----------------------------------------------"
echo "样式文件已准备就绪！"
echo ""
echo "请按照以下步骤手动更新各博客页面:"
echo ""
echo "1. 使用 blogs/22-years-old.html 作为参考模板"
echo "2. 保留每个页面的原始内容"
echo "3. 更新页面的 <head> 部分，添加新的样式引用"
echo "4. 添加进度条、目录和页脚等新元素"
echo ""
echo "使用以下 HTML 结构:"
echo "----------------------------------------------"
cat << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="[页面描述]">
  <title>[页面标题]</title>
  
  <!-- 关键CSS内联 -->
  <style>
    :root {
      --color-bg: #F8F6F2;
      --color-text: #2D2D2D;
      --color-accent-lotus-red: #C84630;
      --font-family-serif: "source han serif sc", "思源宋体", "Songti SC", serif;
      --content-width: 720px;
      --spacing-unit: 8px;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: var(--font-family-serif);
      background-color: var(--color-bg);
      color: var(--color-text);
      font-size: 16px;
      line-height: 1.8;
    }
    .article-container {
      max-width: var(--content-width);
      margin: 0 auto;
      padding: calc(var(--spacing-unit) * 8) calc(var(--spacing-unit) * 2);
    }
    h1 {
      font-size: 36px;
      line-height: 1.3;
      color: var(--color-accent-lotus-red);
    }
  </style>
  
  <!-- 引用样式和字体 -->
  <link rel="stylesheet" href="../style.css">
  <link href="https://fonts.googleapis.com/css2?family=Kaiti+SC:wght@700&family=Source+Han+Serif+SC:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <!-- 无障碍跳过链接 -->
  <a href="#main-content" class="skip-link">跳到主要内容</a>

  <!-- 阅读进度指示器 -->
  <div class="progress-container">
    <div class="progress-bar" id="reading-progress"></div>
  </div>

  <main class="article-container" id="main-content">
    <article>
      <header>
        <h1>[标题]</h1>
        <div class="meta">
          <span class="date">[日期]</span>
          <span class="author">[作者]</span>
        </div>
      </header>
      
      <!-- 文章目录 -->
      <div class="table-of-contents" id="toc">
        <h3>目录</h3>
        <ul id="toc-list"></ul>
      </div>
      
      <div class="article-body">
        <!-- 原始内容 -->
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <p id="footer-greeting">愿你在此找到片刻的安宁与灵感。</p>
    <p>© 2023 思考庇护所 | <a href="../index.html" class="footer-link">首页</a></p>
  </footer>

  <script src="../script.js" defer></script>
</body>
</html>
EOF
echo "----------------------------------------------"
echo ""
echo "完成更新后，访问页面查看新样式效果。" 