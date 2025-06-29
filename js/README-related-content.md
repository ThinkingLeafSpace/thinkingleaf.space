# 相关内容推荐系统

这个系统可以自动在每篇博客文章和newsletter的底部显示两篇相关内容，提高用户的阅读体验和页面停留时间。

## 功能特点

- 为每篇文章底部添加两篇相关内容推荐
- 相关性基于预定义的关系映射
- 响应式设计，在移动设备上垂直显示推荐内容
- 简洁优雅的卡片设计，与网站整体风格统一

## 文件结构

- `js/related-content.js` - 主要功能实现
- `js/related-content-updater.js` - 自动更新工具
- `update-related-content.bat` - Windows系统运行更新工具的批处理文件
- `update-related-content.sh` - Linux/Mac系统运行更新工具的Shell脚本

## 如何使用

### 1. 为单个页面添加相关内容功能

在HTML文件的`</body>`标签前添加以下代码：

```html
<script src="../js/related-content.js"></script>
```

### 2. 为所有页面添加相关内容功能

在Windows系统上，双击运行`update-related-content.bat`文件。

在Linux/Mac系统上，在终端中运行：

```bash
chmod +x update-related-content.sh
./update-related-content.sh
```

## 如何维护和更新

### 添加新文章

当添加新的博客文章或newsletter时，需要在`js/related-content.js`文件中的`articlesDatabase`数组中添加新文章的信息。示例格式如下：

```javascript
{
    id: "article-id", // 文件名，不包含.html后缀
    title: "文章标题",
    path: "/blogs/article-id.html", // 文章路径，相对于网站根目录
    date: "YYYY-MM-DD", // 发布日期
    type: "blog", // 类型：blog或newsletter
    description: "文章描述",
    tags: ["标签1", "标签2"], // 相关标签
    related: ["related-article-1", "related-article-2"] // 相关文章的ID
}
```

### 更新相关性

如果需要更改文章之间的相关性，只需修改`articlesDatabase`数组中对应文章的`related`数组即可。

## 自动相关性算法

未来可以考虑实现自动相关性算法，基于以下因素：

1. 标签匹配度 - 共同标签越多，相关度越高
2. 时间接近度 - 发布日期接近的文章可能更相关
3. 内容相似度 - 通过关键词提取分析内容相似度

## 维护者

筑居思团队 