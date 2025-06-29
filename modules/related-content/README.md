# 相关内容推荐系统 (模块化版本)

这个模块化的相关内容推荐系统可以自动在每篇博客文章和newsletter的底部显示两篇相关内容，提高用户的阅读体验和页面停留时间。通过模块化设计和延迟加载策略，大大提升了网页加载速度。

## 功能特点

- 为每篇文章底部添加两篇相关内容推荐
- 相关性基于预定义的关系映射
- 响应式设计，在移动设备上垂直显示推荐内容
- 简洁优雅的卡片设计，与网站整体风格统一
- **模块化设计**，分离数据和逻辑
- **延迟加载**，提高页面加载速度
- **动态CSS加载**，减少初始CSS体积
- **优雅的动画效果**，提升用户体验

## 文件结构

```
modules/
└── related-content/
    ├── database.js     - 文章数据库
    ├── core.js         - 核心功能实现
    ├── index.js        - 主入口文件(延迟加载)
    ├── loader.js       - 资源加载器
    ├── styles.css      - 样式文件
    ├── updater.js      - 页面更新工具
    ├── update-pages.bat - Windows批处理文件
    ├── update-pages.sh  - Linux/Mac Shell脚本
    └── README.md       - 说明文档
```

## 性能优化

此模块化版本相比原版有以下性能优化：

1. **分离数据和逻辑**：数据库与核心功能分离，更易于维护
2. **延迟加载**：页面完全加载后再处理相关内容
3. **懒加载**：使用`requestIdleCallback`或`setTimeout`在浏览器空闲时执行
4. **动态CSS加载**：按需加载样式，减少初始CSS体积
5. **ES模块**：使用现代ES模块系统，实现更好的代码分割
6. **动画优化**：使用CSS动画和`will-change`属性优化性能

## 如何使用

### 1. 为单个页面添加相关内容功能

在HTML文件的`</body>`标签前添加以下代码：

```html
<script type="module" src="../modules/related-content/loader.js"></script>
```

### 2. 为所有页面添加相关内容功能

在Windows系统上，双击运行`modules/related-content/update-pages.bat`文件。

在Linux/Mac系统上，在终端中运行：

```bash
chmod +x modules/related-content/update-pages.sh
./modules/related-content/update-pages.sh
```

## 如何维护和更新

### 添加新文章

当添加新的博客文章或newsletter时，需要在`modules/related-content/database.js`文件中的`articlesDatabase`数组中添加新文章的信息。示例格式如下：

```javascript
{
    id: "article-id", // 文件名，不包含.html后缀
    title: "文章标题",
    path: "../blogs/article-id.html", // 文章路径，相对于网站根目录
    date: "YYYY-MM-DD", // 发布日期
    type: "blog", // 类型：blog或newsletter
    description: "文章描述",
    tags: ["标签1", "标签2"], // 相关标签
    related: ["related-article-1", "related-article-2"] // 相关文章的ID
}
```

### 更新相关性

如果需要更改文章之间的相关性，只需修改`database.js`文件中对应文章的`related`数组即可。

### 修改样式

要修改相关内容的样式，编辑`modules/related-content/styles.css`文件。

## 未来扩展

- **自动相关性算法**：基于标签匹配度、时间接近度和内容相似度自动推荐
- **查看统计**：跟踪用户点击相关内容的频率
- **A/B测试**：测试不同的相关内容展示方式
- **个性化推荐**：根据用户的阅读历史推荐内容

## 维护者

筑居思团队 