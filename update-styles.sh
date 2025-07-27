#!/bin/bash

# 确保在脚本目录下执行
cd "$(dirname "$0")"

echo "开始更新博客样式..."

# 处理 blogs 目录下的文件
echo "正在处理 blogs 目录..."
for file in blogs/*.html; do
  echo "更新 $file..."
  
  # 1. 提取标题
  title=$(grep -o '<title>.*</title>' "$file" | sed 's/<title>\(.*\)<\/title>/\1/')
  
  # 2. 提取描述
  description=$(grep -o '<meta name="description" content=".*">' "$file" | sed 's/.*content="\(.*\)".*/\1/')
  
  # 3. 提取文章内容
  content=$(awk '/<div class="blog-body">/{flag=1;next} /<\/div>/{if (flag==1) {flag=0}} flag' "$file")
  
  # 4. 提取发布日期
  date=$(grep -o '<span class="blog-date">.*</span>' "$file" | sed 's/<span class="blog-date">\(.*\)<\/span>/\1/')
  
  # 5. 提取作者
  author=$(grep -o '<span class="blog-author">.*</span>' "$file" | sed 's/<span class="blog-author">\(.*\)<\/span>/\1/')
  
  # 创建新文件
  cat > "${file}.new" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="$description">
  <title>$title</title>
  
  <!-- 关键CSS内联，提高首屏渲染速度 -->
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
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="../style.css" as="style">
  <link rel="preload" href="../script.js" as="script">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- 主要样式表，非阻塞加载 -->
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
        <h1>$title</h1>
        <div class="meta">
          <span class="date">$date</span>
          <span class="author">$author</span>
        </div>
      </header>
      
      <!-- 自动生成的文章目录 -->
      <div class="table-of-contents" id="toc">
        <h3>目录</h3>
        <ul id="toc-list">
          <!-- 由JavaScript自动生成 -->
        </ul>
      </div>
      
      <div class="article-body">
$content
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <p id="footer-greeting">愿你在此找到片刻的安宁与灵感。</p>
    <p>© 2023 思考庇护所 | <a href="#" class="footer-link">关于</a> | <a href="#" class="footer-link">联系</a></p>
  </footer>

  <script src="../script.js" defer></script>
</body>
</html>
EOF

  # 替换原文件
  mv "${file}.new" "$file"
done

# 处理 newsletters 目录下的文件
echo "正在处理 newsletters 目录..."
for file in newsletters/*.html; do
  # 跳过空文件或占位文件
  if [ $(stat -f%z "$file") -lt 100 ]; then
    echo "跳过 $file (文件过小)..."
    continue
  fi
  
  echo "更新 $file..."
  
  # 1. 提取标题
  title=$(grep -o '<title>.*</title>' "$file" | sed 's/<title>\(.*\)<\/title>/\1/')
  
  # 2. 尝试提取描述或使用默认值
  description=$(grep -o '<meta name="description" content=".*">' "$file" | sed 's/.*content="\(.*\)".*/\1/')
  if [ -z "$description" ]; then
    description="$title - 思考庇护所"
  fi
  
  # 3. 提取文章内容 - Newsletters 可能结构不同，需要更复杂的提取逻辑
  # 这里简化处理，实际使用时可能需要更精确的提取方法
  content=$(awk '/<body/{flag=1;next} /<\/body>/{flag=0} flag' "$file")
  
  # 创建新文件
  cat > "${file}.new" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="$description">
  <title>$title</title>
  
  <!-- 关键CSS内联，提高首屏渲染速度 -->
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
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="../style.css" as="style">
  <link rel="preload" href="../script.js" as="script">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- 主要样式表，非阻塞加载 -->
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
        <h1>$title</h1>
      </header>
      
      <!-- 自动生成的文章目录 -->
      <div class="table-of-contents" id="toc">
        <h3>目录</h3>
        <ul id="toc-list">
          <!-- 由JavaScript自动生成 -->
        </ul>
      </div>
      
      <div class="article-body">
        <!-- 原始内容 -->
        $content
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <p id="footer-greeting">愿你在此找到片刻的安宁与灵感。</p>
    <p>© 2023 思考庇护所 | <a href="#" class="footer-link">关于</a> | <a href="#" class="footer-link">联系</a></p>
  </footer>

  <script src="../script.js" defer></script>
</body>
</html>
EOF

  # 替换原文件
  mv "${file}.new" "$file"
done

echo "样式更新完成！" 