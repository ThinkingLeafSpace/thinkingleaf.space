# Obsidian到网站快速部署指南

这个工具可以帮助你快速将Obsidian中的Markdown笔记转换为网站HTML格式，并自动处理图片路径。

## 📋 前置要求

1. **Python 3.7+** - 确保已安装Python
   ```bash
   python3 --version  # 检查版本
   ```

2. **安装Python依赖**:
   ```bash
   cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
   pip3 install -r scripts/requirements.txt
   ```
   
   如果pip3命令不可用，尝试使用:
   ```bash
   python3 -m pip install -r scripts/requirements.txt
   ```

## 🚀 快速开始

### 第一步：安装依赖（只需一次）

```bash
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
pip3 install -r scripts/requirements.txt
```

### 第二步：检查环境（可选但推荐）

```bash
python3 scripts/check_setup.py
```

这会检查Python版本、依赖包、目录结构等，确保一切就绪。

### 第三步：部署博客

#### 方法1: 使用一键部署脚本（推荐）

```bash
./scripts/deploy_blog.sh /path/to/your/obsidian/note.md
```

**重要提示**: 
- ⚠️ `/path/to/your/obsidian/note.md` 只是示例，请替换为你的实际文件路径！
- 💡 **在macOS上最简单的方法**: 从Finder直接拖放文件到终端，自动获得完整路径
- 📝 路径包含空格时，需要用引号包裹: `"./path/to/your file.md"`

**实际示例**:
```bash
# 方法1: 使用绝对路径
./scripts/deploy_blog.sh ~/Documents/Obsidian/我的博客/新文章.md

# 方法2: 使用相对路径（从项目目录）
./scripts/deploy_blog.sh ../Obsidian/笔记.md

# 方法3: 在Finder中拖放文件到终端（推荐，最简单）
./scripts/deploy_blog.sh [拖放文件到这里]
```

### 方法2: 手动转换

```bash
# 1. 转换Markdown为HTML
python3 scripts/markdown_to_html.py /path/to/your/note.md

# 2. 更新博客列表（可选）
python3 scripts/update_blogs_list.py
```

## 📝 在Obsidian中编写博客

### Front Matter格式

在你的Markdown文件开头添加YAML front matter:

```markdown
---
title: "文章标题"
date: 2025-01-15
description: "文章简短描述"
category: 博客
---

正文内容...
```

### 插入图片

#### 方式1: Obsidian标准格式
```markdown
![[图片名称.png]]
```

#### 方式2: Markdown标准格式
```markdown
![图片描述](图片名称.png)
```

#### 方式3: 使用附件目录
```markdown
![描述](attachments/图片.png)
```

**重要提示:**
- 图片会自动从Obsidian目录复制到网站的`images/blog/`目录
- 脚本会自动查找以下位置的图片:
  - Markdown文件同目录
  - `attachments/`子目录
  - `assets/`子目录
  - 配置文件中指定的Obsidian附件目录

## ⚙️ 配置

编辑 `blog_config.json` 文件来配置:

```json
{
  "obsidian_vault": "/path/to/your/obsidian/vault",
  "obsidian_attachments": [
    "/path/to/your/obsidian/vault/attachments",
    "/path/to/other/attachment/folder"
  ],
  "site_images_dir": "images"
}
```

## 🔄 完整工作流程

### 第一步：在Obsidian中编写文章

1. 在Obsidian中创建新的Markdown文件
2. 在文件开头添加Front Matter（YAML格式）:
   ```markdown
   ---
   title: "你的文章标题"
   date: 2025-01-15
   description: "文章简短描述，会显示在博客列表中"
   category: 博客
   ---
   ```

3. 编写正文内容
4. 插入图片（三种方式任选其一）:
   - Obsidian格式: `![[图片名.png]]`
   - Markdown格式: `![描述](图片名.png)`
   - 附件目录: `![描述](attachments/图片.png)`

### 第二步：运行部署脚本

在终端运行:
```bash
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
./scripts/deploy_blog.sh /path/to/your/article.md
```

**⚠️ 重要**: 必须将`/path/to/your/article.md`替换为你实际的Obsidian文件路径！

**三种获取路径的方法**:

1. **拖放文件（最简单）**:
   - 在Finder中找到你的Markdown文件
   - 直接拖放到终端窗口
   - 终端会自动显示完整路径
   - 然后在前面加上 `./scripts/deploy_blog.sh `

2. **手动输入路径**:
   ```bash
   # 使用绝对路径
   ./scripts/deploy_blog.sh ~/Documents/Obsidian/文章.md
   
   # 或者使用Tab键自动补全
   ./scripts/deploy_blog.sh ~/Documents/Obsid[按Tab键自动补全]
   ```

3. **在Obsidian中获取路径**:
   - 右键点击文件 → "显示文件位置"
   - 或者使用命令面板搜索"复制路径"

### 第三步：检查结果

脚本会：
- ✅ 将Markdown转换为HTML（保存在`blogs/`目录）
- ✅ 自动查找并复制图片到`images/blog/`目录
- ✅ 更新图片路径为网站相对路径
- ✅ 显示转换结果和图片复制信息

### 第四步：预览和提交

1. **本地预览**: 在浏览器中打开生成的HTML文件检查效果

2. **提交到Git**（可选）:
   ```bash
   git add .
   git commit -m "添加新博客: 文章标题"
   git push
   ```

## 📁 文件结构

```
ThinkingLeafSpace 20250924com/
├── blogs/              # 生成的HTML博客文件
├── images/
│   └── blog/          # 博客图片（自动创建）
├── scripts/
│   ├── markdown_to_html.py    # Markdown转换脚本
│   ├── update_blogs_list.py   # 更新博客列表
│   └── deploy_blog.sh         # 一键部署脚本
└── blog_config.json    # 配置文件
```

## 🐛 常见问题

### 图片显示不出来？

**可能的原因和解决方案:**

1. **图片文件不存在**
   - 检查图片文件是否在Markdown文件同目录
   - 或在`attachments/`、`assets/`子目录中
   - 或在`blog_config.json`配置的Obsidian附件目录中

2. **图片路径配置错误**
   - 编辑`blog_config.json`，添加你的Obsidian附件目录路径:
   ```json
   {
     "obsidian_attachments": [
       "/完整路径/to/你的/obsidian/vault/attachments"
     ]
   }
   ```

3. **查看脚本输出**
   - 脚本会显示图片查找和复制信息
   - 如果看到"已复制图片"消息，说明图片处理成功
   - 如果图片找不到，检查文件路径是否正确

### 转换后的HTML格式不对？

- **Front Matter格式错误**: 确保使用YAML格式，三个短横线`---`包围
- **日期格式错误**: 必须使用`YYYY-MM-DD`格式，例如`2025-01-15`
- **标题包含特殊字符**: 尽量避免在标题中使用特殊字符，或使用引号包裹

### Python依赖安装失败？

```bash
# macOS上如果pip3不可用，尝试:
python3 -m pip install --upgrade pip
python3 -m pip install -r scripts/requirements.txt

# 或者使用homebrew安装python（如果还没有）:
brew install python3
```

### 脚本权限问题？

```bash
chmod +x scripts/deploy_blog.sh
chmod +x scripts/markdown_to_html.py
chmod +x scripts/update_blogs_list.py
```

### 需要自定义HTML模板？

编辑 `scripts/markdown_to_html.py` 中的 `generate_html_template` 方法，修改HTML结构。

### 图片文件名冲突？

- 脚本会自动处理同名图片
- 建议在Obsidian中使用有意义的文件名，避免冲突
- 如果有多张同名图片，可以考虑重命名

## 💡 使用提示

### 最佳实践

1. **图片管理**
   - 图片名称建议使用英文、数字和连字符（避免空格和特殊字符）
   - 将图片放在Markdown文件同目录的`attachments/`文件夹中
   - 或统一放在Obsidian的附件目录中，并在`blog_config.json`中配置

2. **Front Matter模板**
   - 在Obsidian中创建模板，包含标准的Front Matter
   - 设置 > 核心插件 > 模板 > 启用
   - 创建模板文件，内容如下:
   ```markdown
   ---
   title: "{{title}}"
   date: {{date:YYYY-MM-DD}}
   description: ""
   category: 博客
   ---
   ```

3. **工作流程优化**
   - 创建一个Obsidian工作空间专门存放博客文章
   - 使用文件夹组织文章，便于管理
   - 定期运行部署脚本，保持网站内容更新

4. **文件命名**
   - Markdown文件可以使用中文名称（脚本会自动转换为安全的文件名）
   - 生成的HTML文件名格式: `YYYY-MM-DD-标题.html`

5. **图片路径**
   - 在Obsidian中插入图片后，图片路径会自动处理
   - 不需要手动修改图片路径
   - 脚本会智能查找图片并复制到正确位置

### 快速检查清单

部署前确认:
- [ ] Front Matter格式正确（包含title、date、description）
- [ ] 图片文件存在且路径正确
- [ ] Python依赖已安装（`pip3 install -r scripts/requirements.txt`）
- [ ] 脚本有执行权限（`chmod +x scripts/deploy_blog.sh`）

## 🧪 测试工具

如果你想先测试工具是否正常工作，可以运行：

```bash
./scripts/test_example.sh
```

这会使用示例文件测试转换功能，不会影响你的实际博客。

## 🔗 相关文件

- `scripts/markdown_to_html.py` - 核心转换脚本
- `scripts/update_blogs_list.py` - 博客列表更新（自动更新blogs.html）
- `scripts/deploy_blog.sh` - 一键部署脚本
- `scripts/check_obsidian_path.py` - 检查Obsidian路径配置
- `scripts/obsidian-blog-template.md` - Obsidian博客文章模板
- `blog_config.json` - 配置文件
- `OBSIDIAN路径配置.md` - Obsidian路径配置说明
- `使用Obsidian模板.md` - 如何使用Obsidian模板的详细指南
- `使用指南.md` - 详细使用指南
- `快速开始.txt` - 快速参考

