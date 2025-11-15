# Whisper 组件使用指南

## 安装依赖

首先需要安装 `framer-motion`：

```bash
npm install framer-motion
```

## 使用方法

### 基本用法

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

### 自定义图标

```jsx
<Whisper 
  content="这是一个自定义图标的提示" 
  emoji="💡" 
/>
```

## 组件特性

- ✨ **流畅动画**：使用 framer-motion 实现弹性动画效果
- 🎨 **主题适配**：自动适配项目的深色/浅色模式
- ♿ **无障碍访问**：支持键盘导航和屏幕阅读器
- 📱 **响应式设计**：在移动设备上自动调整大小
- 🎯 **精确定位**：提示卡片自动定位在触发元素上方

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string` | 必填 | 要显示的提示内容 |
| `emoji` | `string` | `'🌱'` | 触发提示的图标 |

## 样式定制

组件使用 CSS Module，样式文件位于 `Whisper.module.css`。你可以通过修改 CSS 变量来调整样式：

- `--card-bg`: 卡片背景色
- `--card-border`: 卡片边框色
- `--card-shadow`: 卡片阴影
- `--text-primary`: 文字颜色

这些变量会自动适配项目的主题系统。

