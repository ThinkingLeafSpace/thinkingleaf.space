# Whisper 组件使用指南

## 概述

Whisper 是一个优雅的提示组件，可以在文本中插入解释性内容。当用户悬停或点击图标时，会显示一个带有动画效果的提示卡片。

本项目提供了两个版本的 Whisper：

1. **React 版本** (`components/Whisper.jsx`) - 适用于 React 项目
2. **纯 JavaScript 版本** (`js/whisper.js`) - 适用于静态 HTML 项目

---

## 纯 JavaScript 版本（推荐用于静态网站）

### 文件结构

```
js/whisper.js          # JavaScript 功能实现
css/whisper.css        # 样式文件
whisper-example.html   # 使用示例
```

### 快速开始

1. **引入样式文件**（在 `<head>` 中）：
```html
<link rel="stylesheet" href="css/whisper.css">
```

2. **引入 JavaScript 文件**（在 `</body>` 之前）：
```html
<script src="js/whisper.js"></script>
```

3. **在 HTML 中使用**：
```html
<p>
  你在《存在与时间》
  <span class="whisper" data-content="海德格尔的代表作。一本试图"搞懂我们是怎么存在"的烧脑天书。"></span>
  里找到了答案。
</p>
```

### 基本用法

#### 默认图标（🌱）
```html
<span class="whisper" data-content="这是提示内容"></span>
```

#### 自定义图标
```html
<span class="whisper" data-content="这是提示内容" data-emoji="💡"></span>
```

### 属性说明

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `data-content` | `string` | ✅ | - | 要显示的提示内容 |
| `data-emoji` | `string` | ❌ | `🌱` | 触发提示的图标 |

### 动态添加内容

如果你的内容是动态加载的，可以使用以下方法初始化新的 Whisper 元素：

```javascript
// 初始化单个元素
Whisper.initElement(document.querySelector('.whisper'));

// 或使用选择器
Whisper.initElement('.whisper');
```

### 特性

- ✨ **流畅动画**：使用 CSS 过渡实现弹性动画效果
- 🎨 **主题适配**：自动适配项目的深色/浅色模式
- ♿ **无障碍访问**：支持键盘导航和屏幕阅读器
- 📱 **响应式设计**：在移动设备上自动调整大小
- 🎯 **精确定位**：提示卡片自动定位在触发元素上方
- 🖱️ **多种交互**：支持鼠标悬停、键盘焦点、移动端点击

---

## React 版本

### 安装依赖

```bash
npm install framer-motion react react-dom
```

### 使用方法

```jsx
import { Whisper } from './components/Whisper';

function App() {
  return (
    <p>
      你在《存在与时间》
      <Whisper content="海德格尔的代表作。一本试图"搞懂我们是怎么存在"的烧脑天书。" />
      里找到了答案。
    </p>
  );
}
```

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `content` | `string` | ✅ | - | 要显示的提示内容 |
| `emoji` | `string` | ❌ | `🌱` | 触发提示的图标 |

---

## 样式定制

Whisper 组件使用项目的 CSS 变量，可以通过修改以下变量来调整样式：

- `--card-bg`: 卡片背景色
- `--card-border`: 卡片边框色
- `--card-shadow`: 卡片阴影
- `--text-primary`: 文字颜色
- `--accent`: 焦点颜色

这些变量会自动适配项目的主题系统（包括深色模式）。

---

## 浏览器兼容性

- ✅ Chrome/Edge (最新版本)
- ✅ Firefox (最新版本)
- ✅ Safari (最新版本)
- ✅ 移动端浏览器

---

## 示例文件

查看 `whisper-example.html` 获取更多使用示例。

---

## 注意事项

1. **内容长度**：提示内容建议控制在 100 字以内，过长可能影响阅读体验
2. **图标选择**：选择与内容相关的图标可以提升用户体验
3. **使用频率**：不要过度使用，避免干扰正常阅读
4. **移动端**：在移动设备上，用户需要点击图标才能查看提示

---

## 常见问题

**Q: 提示卡片显示位置不对？**  
A: 确保 `.whisper` 元素的父容器有 `position: relative` 或 `position: absolute`。

**Q: 深色模式下样式不对？**  
A: 确保页面有 `dark-theme` 类名，Whisper 会自动适配。

**Q: 动态添加的内容不显示提示？**  
A: 使用 `Whisper.initElement()` 手动初始化新元素。

