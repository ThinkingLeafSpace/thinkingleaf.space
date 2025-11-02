# Obsidian 模板使用说明

## 📝 正确的 Front Matter 格式

Obsidian 中的 Front Matter 应该使用以下格式：

### ✅ 正确格式

```yaml
---
title: "文章标题"
date: "{{date:YYYY-MM-DD}}"
description: "文章简短描述"
category: 博客
---
```

### ❌ 错误格式

以下格式会导致解析错误：

```yaml
---
title: 文章标题（缺少引号，如果标题有特殊字符会出错）
date:
  "{{date:YYYY-MM-DD}}": （多行格式，会被解析为字典）
description: （空值应该是 "" 或直接省略）
category:
  - 博客（列表格式也可以，但建议直接用字符串）
---
```

## 🔧 Obsidian 模板变量的处理

### 方式一：使用 Obsidian 模板功能（推荐）

1. 在 Obsidian 设置中启用"模板"插件
2. 将模板文件放在模板目录中
3. 使用命令面板（Cmd+P）选择"插入模板"
4. Obsidian 会自动将 `{{date:YYYY-MM-DD}}` 替换为实际日期

**插入模板后的实际内容：**
```yaml
---
title: "我的新文章"
date: "2025-01-15"  # Obsidian 自动替换为当前日期
description: "这是文章描述"
category: 博客
---
```

### 方式二：手动填写日期

如果你不使用模板功能，可以直接填写日期：

```yaml
---
title: "我的新文章"
date: "2025-01-15"  # 直接写日期，格式：YYYY-MM-DD
description: "这是文章描述"
category: 博客
---
```

### 方式三：使用模板变量（脚本会自动处理）

如果模板变量没有被替换，转换脚本会自动将其替换为当前日期：

```yaml
---
title: "我的新文章"
date: "{{date:YYYY-MM-DD}}"  # 脚本会自动替换为今天日期
description: "这是文章描述"
category: 博客
---
```

## 📋 字段说明

| 字段 | 是否必需 | 格式 | 说明 |
|------|---------|------|------|
| `title` | 是 | 字符串（建议用引号） | 文章标题 |
| `date` | 是 | YYYY-MM-DD 或 `{{date:YYYY-MM-DD}}` | 发布日期 |
| `description` | 否 | 字符串 | 文章简短描述（用于博客列表） |
| `category` | 否 | 字符串或列表 | 文章分类，默认"博客" |

## 💡 最佳实践

### 1. 标题使用引号

```yaml
title: "我的文章标题"  # ✅ 推荐
title: 我的文章标题    # ⚠️ 如果标题有特殊字符可能出错
```

### 2. 日期格式统一

```yaml
date: "2025-01-15"           # ✅ 标准格式
date: "{{date:YYYY-MM-DD}}"  # ✅ 模板变量（Obsidian会自动替换）
date: 2025-1-15              # ❌ 格式不正确
```

### 3. 空字段处理

```yaml
description: ""      # ✅ 空字符串
description:         # ⚠️ 也可以，但建议用 ""
```

### 4. 分类字段

```yaml
category: 博客       # ✅ 推荐：简单字符串
category: "博客"     # ✅ 也可以
category:
  - 博客             # ✅ 列表格式也可以
```

## 🔍 常见问题

### Q: 为什么我的日期显示为当前日期而不是我写的日期？

**A:** 可能的原因：
1. 日期格式不正确（应该是 YYYY-MM-DD）
2. 日期字段被解析为字典而不是字符串
3. 日期字段包含模板变量没有被替换

**解决方法：**
- 检查 Front Matter 格式是否正确
- 确保日期是字符串格式：`date: "2025-01-15"`
- 如果使用模板变量，确保 Obsidian 已正确替换

### Q: 模板变量 `{{date:YYYY-MM-DD}}` 没有被替换怎么办？

**A:** 有两种方式：
1. **使用 Obsidian 模板功能**：通过命令面板插入模板，Obsidian 会自动替换
2. **手动替换**：直接写日期 `date: "2025-01-15"`
3. **脚本会自动处理**：如果模板变量没有被替换，转换脚本会自动使用当前日期

### Q: category 字段可以是列表吗？

**A:** 可以，但建议使用字符串。如果使用列表，脚本会取第一个值。

```yaml
category:
  - 技术
  - 编程
# 脚本会使用 "技术"
```

## 📝 完整示例

### 示例 1：使用模板变量

```yaml
---
title: "5202年了！为什么我还是推荐用RSS订阅内容"
date: "{{date:YYYY-MM-DD}}"
description: "介绍RSS的使用方法和优势"
category: RSS
---

正文内容...
```

### 示例 2：直接填写日期

```yaml
---
title: "我的技术博客"
date: "2025-01-15"
description: "这是我的第一篇技术文章"
category: 技术
---

正文内容...
```

### 示例 3：最小格式

```yaml
---
title: "简单文章"
date: "2025-01-15"
---

正文内容...
```

（description 和 category 可以省略，会使用默认值）

## 🔗 相关文件

- `scripts/obsidian-blog-template.md` - Obsidian 模板文件
- `scripts/markdown_to_html.py` - 转换脚本（已支持模板变量）
- `README_OBSIDIAN_DEPLOY.md` - 完整部署指南

