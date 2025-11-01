# 🚀 快速开始指南

## 三步快速开始

### 第一步：安装依赖（只需一次）

```bash
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
pip3 install -r scripts/requirements.txt
```

### 第二步：检查环境

```bash
python3 scripts/check_setup.py
```

如果看到 "✓ 所有检查通过！"，说明环境配置正确。

### 第三步：部署博客

```bash
./scripts/deploy_blog.sh /path/to/your/obsidian/article.md
```

就这么简单！脚本会自动：
- ✅ 转换Markdown为HTML
- ✅ 处理图片路径和复制
- ✅ 更新博客列表

## 📝 在Obsidian中编写文章

### 1. 创建新文章

在Obsidian中创建Markdown文件，开头添加：

```markdown
---
title: "你的文章标题"
date: 2025-01-15
description: "文章简短描述"
category: 博客
---

正文内容开始...

![图片描述](图片名.png)
或者
![[图片名.png]]
```

### 2. 插入图片

- 图片放在Markdown文件同目录
- 或放在 `attachments/` 子目录
- 脚本会自动找到并复制到网站

### 3. 部署

```bash
./scripts/deploy_blog.sh /完整路径/to/你的文章.md
```

## 💡 提示

- 第一次使用建议先运行 `python3 scripts/check_setup.py` 检查环境
- 图片路径会自动处理，不用担心
- 生成的HTML文件在 `blogs/` 目录
- 图片会自动复制到 `images/blog/` 目录

## 📚 更多信息

查看 `README_OBSIDIAN_DEPLOY.md` 获取详细文档。

