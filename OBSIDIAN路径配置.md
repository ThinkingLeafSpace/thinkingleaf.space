# Obsidian 路径配置说明

## 📍 当前配置的Obsidian路径

**Obsidian库路径：**
```
/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站
```

**注意事项：**
- ⚠️ 路径中包含空格，使用引号包裹: `"/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站"`
- ⚠️ 或者使用转义字符: `/Users/qianny/Nutstore\ Files/Qianny-obsidian/个人网站`
- 📁 "个人网站" 这个文件夹可能会移动位置
- 🔔 如果路径变化，需要更新 `blog_config.json` 中的配置

---

## 🔄 如果路径改变了怎么办？

### 方法1: 更新配置文件

编辑 `blog_config.json`，更新路径：

```json
{
  "obsidian_vault": "/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站",
  "obsidian_attachments": [
    "/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站/attachments"
  ]
}
```

### 方法2: 检查路径是否正确

运行检查脚本：
```bash
python3 scripts/check_obsidian_path.py
```

或者手动检查：
```bash
ls "/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站"
```

如果路径不存在，脚本会在运行时提示你更新配置。

---

## 📝 使用快捷方式

### 快速打开Obsidian库

创建一个别名（在 `~/.zshrc` 或 `~/.bashrc` 中添加）：

```bash
alias obsidian-blog='cd "/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站"'
```

然后就可以直接运行：
```bash
obsidian-blog
```

### 快速部署当前目录的文章

如果已经在Obsidian库目录中，可以使用相对路径：

```bash
cd "/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站"
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
./scripts/deploy_blog.sh "../Qianny-obsidian/个人网站/你的文章.md"
```

---

## 🎯 推荐的Obsidian工作流程

1. **在Obsidian中创建文章**
   - 使用模板快速开始（见 `scripts/obsidian-blog-template.md`）
   - 文章放在 "个人网站" 目录下

2. **部署到网站**
   ```bash
   cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
   ./scripts/deploy_blog.sh "/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站/文章名.md"
   ```

3. **或者使用相对路径**
   ```bash
   cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
   ./scripts/deploy_blog.sh "../Qianny-obsidian/个人网站/文章名.md"
   ```

---

## 🔍 路径验证

脚本会自动检查路径是否存在。如果路径改变了，你会看到：

```
⚠️ 警告: Obsidian库路径不存在: /Users/qianny/Nutstore Files/Qianny-obsidian/个人网站
请检查 blog_config.json 中的配置是否正确
```

---

## 📂 Obsidian库结构建议

推荐的目录结构：

```
个人网站/
├── attachments/          # 图片等附件（如果有）
├── 文章1.md
├── 文章2.md
└── ...
```

如果没有统一的attachments目录，图片可以放在每个文章的同目录下。

