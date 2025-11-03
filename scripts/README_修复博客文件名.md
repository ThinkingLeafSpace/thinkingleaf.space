# 博客文件名修复工具

## 问题说明

之前博客文件名出现"日期-日期"的问题，例如：
- `2022-08-21-2022-08-21.html` ❌
- `2025-10-26-2025-10-26.html` ❌

正确的格式应该是：
- `2022-08-21-reading-philosophy.html` ✅
- `2025-10-26-meeting-everyone-in-the-meditation-hall.html` ✅

## 解决方案

创建了两个文件来修复这个问题：

### 1. 标题映射文件：`title_slug_mapping.json`

这个文件存储了中文标题到英文slug的映射关系：

```json
{
  "读书观": "reading-philosophy",
  "重新觉察自我": "reawakening-self-awareness",
  "好久不见，最近在外太空种下了小花": "hello-again-little-flowers-in-space",
  "一直游到海水变蓝": "swimming-till-the-sea-turns-blue",
  "半载观想小记：在大理、在内观禅修的路上": "half-year-mindfulness-journey-in-dali",
  "或许设计实验就是容易失败，对吗？": "design-experiments-tend-to-fail",
  "在禅堂里，我遇见了所有人——记第二次内观禅修的结缘": "meeting-everyone-in-the-meditation-hall"
}
```

**添加新映射的方法：**
- 打开 `title_slug_mapping.json`
- 添加新的 `"中文标题": "english-slug"`
- 保存文件

### 2. 修复脚本：`fix_blog_slugs.py`

这个脚本会：
1. 扫描所有博客文件
2. 检测"日期-日期"格式的文件
3. 从HTML中提取标题
4. 使用映射文件转换为英文slug
5. 重命名文件
6. 更新所有引用链接

## 使用方法

### 运行修复脚本

```bash
cd "/Users/qianny/Nutstore Files/ThinkingLeafSpace 20250704com/ThinkingLeafSpace 20250924com"
python3 scripts/fix_blog_slugs.py
```

### 添加新文章时需要

当你要添加一篇新博客时：

1. **直接在 Obsidian 中写文章**，标题保持中文
2. **如果标题需要英文slug，编辑 `title_slug_mapping.json`**，添加映射
3. 转换脚本会自动使用映射表中的slug

**如果没有在映射表中找到：**
- 脚本会尝试自动生成英文slug
- 但会输出警告，建议你手动添加到映射表

## 自动生成slug规则

如果脚本自动生成slug，会遵循以下规则：
1. 移除所有特殊字符（只保留字母、数字、空格、短横线）
2. 将空格和下划线转换为短横线
3. 多个连续的短横线合并为一个
4. 转换为小写
5. 去除首尾的短横线

## 未来使用建议

为了避免将来再出现"日期-日期"的问题：

1. **始终使用正确的转换流程**：Markdown → HTML 转换
2. **保持映射表更新**：新文章标题及时添加映射
3. **定期检查**：如果发现"日期-日期"格式，立即运行修复脚本

## 修复历史

- ✅ 2025-01-XX: 已修复 7 个博客文件名
- ✅ 已更新所有引用链接（index.html, blogs.html, sitemap.xml）

