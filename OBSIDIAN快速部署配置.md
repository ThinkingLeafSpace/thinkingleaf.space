# 🚀 Obsidian快速部署配置

> 在Obsidian中配置快速部署命令，无需手动打开终端

---

## 📋 方案1：使用Commander插件（推荐）

### 步骤1：安装Commander插件

1. 打开Obsidian设置
2. 进入"社区插件"
3. 搜索并安装 "Commander" 插件
4. 启用插件

### 步骤2：配置命令

1. 进入设置 → Commander
2. 点击"Commands"标签
3. 点击 "+ Add Command"
4. 配置如下：

**命令名称：** `部署到网站`  
**命令类型：** `Shell commands: Execute shell command`  
**命令内容：**

```bash
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com" && ./scripts/deploy_blog.sh "{{file.path:absolute}}"
```

5. 设置图标（可选）：📤 或 🚀
6. 保存

### 步骤3：添加到命令面板

1. 进入 Commander 的 "Commands" 标签
2. 找到刚添加的命令
3. 在 "Command Palette" 中启用
4. 可以设置快捷键（如 Cmd+Shift+D）

### 使用方法

1. 在Obsidian中打开要部署的文章
2. 按 `Cmd+P` 打开命令面板
3. 输入 "部署到网站" 或设置的快捷键
4. 等待部署完成！

---

## 📋 方案2：使用 Shell Commands 插件

### 步骤1：安装Shell Commands插件

1. 打开Obsidian设置
2. 进入"社区插件"
3. 搜索并安装 "Shell commands" 插件
4. 启用插件

### 步骤2：配置命令

1. 进入设置 → Shell commands
2. 点击 "Add shell command"
3. 配置：

**Command ID：** `deploy-blog`  
**Shell command：**

```bash
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com" && ./scripts/deploy_blog.sh "{{file_path}}"
```

**Icon：** 📤  
**Output location：** Notification balloon  
**Operating system：** macOS

4. 保存

### 步骤3：添加快捷键

1. 进入设置 → Hotkeys
2. 搜索 "deploy-blog"
3. 点击设置快捷键（如 Cmd+Shift+D）

### 使用方法

1. 打开要部署的文章
2. 按设置的快捷键
3. 查看右下角通知，等待完成

---

## 📋 方案3：手动添加到命令面板（简单但慢）

如果不想安装插件，可以通过文件别名：

### 在终端中创建别名

打开终端，运行：

```bash
echo 'alias blog-deploy="cd \"/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com\" && ./scripts/deploy_blog.sh"' >> ~/.zshrc

source ~/.zshrc
```

### 使用方法

1. 在Obsidian中复制文件路径
2. 打开终端
3. 运行：`blog-deploy "粘贴文件路径"`
4. 回车

---

## 🎯 对比三种方案

| 方案 | 安装难度 | 使用便利性 | 推荐度 |
|------|---------|-----------|--------|
| Commander插件 | ⭐⭐ 简单 | ⭐⭐⭐⭐⭐ 一键 | ⭐⭐⭐⭐⭐ |
| Shell Commands | ⭐⭐ 简单 | ⭐⭐⭐⭐ 快捷键 | ⭐⭐⭐⭐ |
| 终端别名 | ⭐ 最简单 | ⭐⭐ 手动 | ⭐⭐⭐ |

**推荐：** 方案1（Commander插件）- 最方便

---

## ⚠️ 注意事项

### 权限问题

首次运行时，系统可能要求授予终端访问权限：
1. 系统偏好设置 → 安全性与隐私
2. 允许终端访问文件

### 文件路径

脚本会自动处理文件路径，但要确保：
- 文件在 Obsidian vault 中
- 路径没有特殊字符问题

### 错误处理

如果命令执行失败：
1. 查看通知栏的错误信息
2. 在终端手动运行命令查看详细错误
3. 检查文件格式是否正确

---

## 🔧 高级配置

### 批量验证多篇文章

如果你想批量验证（但不部署）多篇文章，可以配置另一个命令：

```bash
find "/Users/qianny/Nutstore Files/Qianny-obsidian/个人网站" -name "*.md" -exec python3 "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com/scripts/validate_blog.py" {} \;
```

### 部署后自动打开浏览器

在部署命令后添加：

```bash
&& open "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com/blogs.html"
```

完整命令：

```bash
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com" && ./scripts/deploy_blog.sh "{{file.path:absolute}}" && open blogs.html
```

---

## 📝 完整示例（Commander配置）

**命令名称：** `部署并预览`  
**Shell命令：**

```bash
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com" && ./scripts/deploy_blog.sh "{{file.path:absolute}}" && echo "✅ 部署完成！正在打开博客列表..." && sleep 1 && open blogs.html
```

**快捷键：** `Cmd+Shift+D`  
**图标：** 🚀

这样配置后，一键部署并自动打开博客列表页面！

---

## 🆘 问题排查

### 问题1：命令执行但没有效果

**原因：** 权限问题  
**解决：** 授予终端文件访问权限

### 问题2：找不到脚本

**原因：** 路径配置错误  
**解决：** 检查 `blog_config.json` 中的路径

### 问题3：部署后文章没显示

**原因：** 文件格式问题  
**解决：** 手动运行验证脚本检查格式

---

**配置完成后，就可以在Obsidian中一键部署博客了！** 🎉

