# 如何在Obsidian中使用博客模板

## 📝 设置Obsidian模板

### 第一步：启用模板插件

1. 打开Obsidian设置
2. 进入"核心插件"
3. 找到"模板"并启用
4. 点击"模板"进入模板设置

### 第二步：设置模板目录

1. 在"模板文件夹位置"中，选择模板文件存放的目录
2. 建议创建 `Templates` 文件夹专门存放模板

### 第三步：创建博客模板

1. 在模板目录中创建新文件：`博客文章模板.md`
2. 将 `scripts/obsidian-blog-template.md` 的内容复制进去
3. 或者直接使用项目中的模板文件

---

## 🚀 使用模板创建新文章

### 方法1: 使用模板命令

1. 在Obsidian中，按 `Cmd+P`（macOS）打开命令面板
2. 输入 "模板" 或 "Insert template"
3. 选择"插入模板: 博客文章模板"
4. 自动创建包含Front Matter的新文章

### 方法2: 手动复制模板

1. 打开模板文件
2. 全选复制（`Cmd+A`, `Cmd+C`）
3. 创建新文件，粘贴内容
4. 修改Front Matter中的信息

---

## ✏️ 模板内容说明

模板包含以下部分：

### Front Matter（文件开头）

```markdown
---
title: "文章标题"           # 必填：文章标题
date: 2025-01-15           # 必填：发布日期（自动填充）
description: "文章描述"     # 可选：简短描述
category: 博客             # 可选：文章分类
---
```

**注意：**
- `{{date:YYYY-MM-DD}}` 会被Obsidian自动替换为当前日期
- `{{title}}` 会被替换为文件名（如果启用）

### 正文部分

模板包含了常用的Markdown格式示例：
- 标题层级
- 插入图片的三种方式
- 代码块
- 列表
- 引用

你可以根据需要使用这些格式。

---

## 🎯 快速工作流程

1. **创建文章**
   - 使用模板创建新文件
   - 修改Front Matter（标题、日期、描述）

2. **编写内容**
   - 使用Markdown格式编写
   - 插入图片（拖拽或使用 `![[图片]]`）

3. **部署到网站**
   ```bash
   cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
   ./scripts/deploy_blog.sh "/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站/你的文章.md"
   ```

---

## 💡 模板使用技巧

### 自定义模板变量

Obsidian支持模板变量，你可以在模板中使用：

```markdown
---
title: "{{title}}"
date: {{date:YYYY-MM-DD}}
description: ""
---

创建于: {{date:YYYY-MM-DD HH:mm}}
```

### 创建多个模板

你可以创建不同用途的模板：
- `博客文章模板.md` - 普通博客文章
- `技术笔记模板.md` - 技术类文章
- `随笔模板.md` - 生活随笔

### 模板文件位置

建议将模板文件放在：
```
个人网站/
└── Templates/
    ├── 博客文章模板.md
    └── ...
```

然后在Obsidian中设置模板目录为 `Templates`。

---

## 📋 检查清单

使用模板创建文章后，确认：

- [ ] Front Matter格式正确（三个短横线包围）
- [ ] title已填写
- [ ] date格式为 YYYY-MM-DD
- [ ] 图片路径正确（如果使用了图片）
- [ ] 内容已保存

然后就可以运行部署脚本了！

