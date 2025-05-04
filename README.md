# 筑居思

一个精美的个人博客网站，并收集优质设计资源和精选Newsletter。网站设计灵感来自Apple的UI设计风格，具有响应式布局，支持暗黑模式。

## 功能特性

- 基于HTML、CSS和JavaScript的现代静态网站
- 响应式设计，适配PC和移动端
- 暗黑模式支持，可自动根据系统设置或手动切换
- 简洁优雅的卡片布局，展示链接资源
- 分类整理的导航资源
- 光滑的交互动效

## 文件结构

```
.
├── index.html         # 主HTML文件
├── css/               # 样式文件目录
│   └── styles.css     # 主样式文件
├── js/                # JavaScript文件目录
│   └── main.js        # 主脚本文件
└── README.md          # 项目说明文件
```

## 使用方法

直接将所有文件复制到您的Web服务器即可使用。这是一个纯静态网站，无需任何后端支持。

### 本地测试

只需在浏览器中打开`index.html`文件即可预览网站效果。

### 部署到Netlify/Vercel等平台

网站完全兼容Netlify、Vercel和GitHub Pages等静态网站托管服务，可以直接部署。

## 自定义

### 添加新链接

编辑`index.html`文件，按照现有的链接卡片结构添加新的链接：

```html
<a href="你的链接URL" class="link-card" target="_blank">
    <div class="link-content">
        <h5>链接标题</h5>
        <p>链接描述</p>
    </div>
</a>
```

### 修改颜色主题

在`css/styles.css`文件中，可以修改`:root`和`[data-theme="dark"]`部分的CSS变量来自定义亮色和暗色主题的颜色。

## 授权

MIT许可证

---

如有问题或建议，欢迎贡献或提交issue。 
