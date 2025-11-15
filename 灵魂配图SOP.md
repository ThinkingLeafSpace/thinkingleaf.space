# 筑居思："灵魂配图SOP" (V2.0)
## 兼顾"灵魂Vibe"与"性能洁癖"

---

## 📸 (HOW) 怎么配图："灵魂策展"SOP (半自动)

这是我们的 **"Vibe Coding"** 工作流。

### 1. 灵魂策展 (Curation) - [你负责]

#### Vibe 100% 优先
100% 优先使用你自己的"灵魂照片"（例如：你在南京工作坊、威海禅修、旅行中拍摄的"故事性"照片）。

#### Vibe 100% 备选
如果必须用图库，只能用 **Unsplash** / **Pexels**。必须选择"电影感"、"故事感"、"极简"、"留白"、"温暖治愈"的"Vibe 照片"（例如：一杯咖啡的蒸汽、一束光打在墙上、一个孤独的背影）。

---

### 2. 性能洁癖 (Performance) - ["自动"优化]

这是我们的"自动化"环节。在你"Vibe Coding" (上传) 之前，**必须**把这张"灵魂照片"拖拽到 **Squoosh.app** (Google 出品) 或 **TinyPNG.com**。

#### SOP:
1. **Compress (压缩)**: 拖拽图片
2. **Format (格式)**: 在右下角，选择 **WebP** (我们的"灵魂格式")
3. **Quality (质量)**: 拖动滑块，确保图片小于 **150KB**
4. **Download (下载)**: 下载这张"性能洁癖"版的 `.webp` 图片

---

### 3. Vibe Coding (Placement) - [你的"代码块"]

在 Cursor (HTML) 中，100% 复制并粘贴下面的"灵魂代码块"：

```html
<!-- === 灵魂配图 (Vibe Coding 模板) === -->
<figure>
    <img 
        src="[...粘贴你的 .webp 图片路径...]" 
        alt="[...这里写图注，用于SEO和无障碍...]"
        width="1280" 
        height="720"
        loading="lazy"
    >
    <figcaption>
        [...这里写你的"灵魂图注"，例如：威海的海边，一个人的"灵魂考古"...]
    </figcaption>
</figure>
<!-- ================================== -->
```

#### 【架构师笔记】：
- **`figure` / `figcaption`**: 这是"灵魂美学"。它把"图"和"图注"在"语义"上"打包"。
- **`width="1280" height="720"`**: 这是"性能洁癖"。它（即使使用 16:9 的比例）100% 防止了"页面跳动"(CLS)。
- **`loading="lazy"`**: 这是"性能洁癖"。它 100% 保证了"LCP < 2.5s"，因为浏览器只会"懒加载"它。

---

## 📍 (WHERE) 在哪里配图："灵魂架构"SOP

这是我们的"页面信息架构"。"配图"是"呼吸点"，不是"装饰品"。

### 位置 A: "灵魂定调图" (The Vibe Setter)

**位置**: 100% 放在 `p.whisper-intro` (即 🌱 叶芽之下... 那段话) 之后，第一章 `<h2>` 之前。

**使命**: 在"同路人"开始"深度阅读"前，用"视觉" 100% "锚定"我们"温暖、治愈"的"第一秒情绪"。

**示例结构**:
```html
<p class="whisper-intro">叶芽之下，别有根系。</p>

<!-- === 灵魂定调图 === -->
<figure>
    <img 
        src="../images/blog/your-soul-image.webp" 
        alt="威海的海边，一个人的灵魂考古"
        width="1280" 
        height="720"
        loading="lazy"
    >
    <figcaption>
        威海的海边，一个人的"灵魂考古"
    </figcaption>
</figure>

<h2 id="_1">第一章：...</h2>
```

---

### 位置 B: "灵魂呼吸点" (The Soulful Breathing Room)

**位置**: 100% 放在"关键章节" (`<h2>`) 之后，和"下一段正文" (`<p>`) 之前。

**使命**:
- **(Vibe)**: 你的"内容资产"充满了"哲思"。"呼吸点"给"同路人"一个"暂停"、"感受"、"消化"的"灵魂空间"。
- **(Growth)**: "打断"纯文字，指数级提升"页面停留时间"，100% 助力我们的"SEO复利"。

**示例结构**:
```html
<h2 id="_2">第二章：关于内观的思考</h2>

<!-- === 灵魂呼吸点 === -->
<figure>
    <img 
        src="../images/blog/meditation-breath.webp" 
        alt="大理禅修中心的清晨，一束光透过窗户"
        width="1280" 
        height="720"
        loading="lazy"
    >
    <figcaption>
        大理禅修中心的清晨，一束光透过窗户
    </figcaption>
</figure>

<p>内观，是一种观察事物本质的方法...</p>
```

---

### 位置 C: "灵魂印记" (The Soulful Signature)

**位置**: （可选）放在 **后记 (Postscript)** 或"彩蛋"(Easter Egg) 部分。

**使命**: 作为"布道者"的"签名"，留下一个"温暖的背影"。

**示例结构**:
```html
<h2 id="_final">后记</h2>
<p>感谢你读到这里...</p>

<!-- === 灵魂印记 === -->
<figure>
    <img 
        src="../images/blog/signature-image.webp" 
        alt="南京工作坊的最后一个下午，阳光洒在桌上"
        width="1280" 
        height="720"
        loading="lazy"
    >
    <figcaption>
        南京工作坊的最后一个下午，阳光洒在桌上
    </figcaption>
</figure>

<hr />
<div class="whisper-intro-section">
    <div class="whisper-intro-card">
        <h3 id="_1">🌱 灵感私语</h3>
        <p class="whisper-intro">叶芽之下，别有根系。</p>
    </div>
</div>
```

---

## 🎨 样式说明

所有"灵魂配图"都会自动应用以下样式（已在 `css/styles.css` 中定义）：

- **响应式设计**: 图片自动适配移动端
- **淡入动画**: 图片加载时平滑淡入
- **图注样式**: 居中、优雅、符合"禅意美学"
- **性能优化**: 懒加载、WebP格式、尺寸预设

---

## ✅ 检查清单

在发布前，请确认：

- [ ] 图片已压缩为 WebP 格式，且小于 150KB
- [ ] 已设置 `width` 和 `height` 属性（防止 CLS）
- [ ] 已添加 `loading="lazy"` 属性
- [ ] `alt` 属性已填写（SEO + 无障碍）
- [ ] `figcaption` 已填写"灵魂图注"
- [ ] 图片路径正确（相对路径，从 HTML 文件位置出发）
- [ ] 图片已放置在正确的位置（A/B/C）

---

## 📚 相关资源

- **Squoosh.app**: https://squoosh.app/
- **TinyPNG.com**: https://tinypng.com/
- **Unsplash**: https://unsplash.com/
- **Pexels**: https://www.pexels.com/

---

**最后更新**: 2025-01-XX  
**版本**: V2.0  
**维护者**: 筑居思团队

