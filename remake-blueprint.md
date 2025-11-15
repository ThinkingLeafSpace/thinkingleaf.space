# 🔨 Remake排列组合模块 - 架构蓝图

> **哲学内核：** 从"现成状态"切换到"上手状态"（海德格尔）  
> **核心理念：** 有限选择里的无限组合，打破消费主义的单一用途限制

---

## 📐 模块定位

**"Remake排列组合"** 是"筑居思"网站的核心"增长引擎"，承载着"筑"（创造）的实践方法论。

它不是一个简单的"随机生成器"，而是一个**"有限游戏中的无限可能性"**的探索工具。

---

## 🎯 核心功能架构

### 1. 三大领域（Pillars）

```
设计 (Design)
├── 颜色 (Colors)
├── 材质 (Materials)
├── 形状 (Shapes)
├── 风格 (Styles)
└── 元素 (Elements)

穿搭 (Outfit)
├── 上装 (Tops)
├── 下装 (Bottoms)
├── 配饰 (Accessories)
├── 鞋履 (Footwear)
└── 特殊用途 (Special Uses) ← 核心创新点

食谱 (Recipe)
├── 主料 (Main Ingredients)
├── 调料 (Seasonings)
├── 烹饪方式 (Cooking Methods)
├── 搭配 (Pairings)
└── 创新组合 (Innovative Combinations)
```

### 2. 游戏规则（Game Rules）

#### 流程设计

```
Step 1: 选择领域
    ↓
Step 2: 随机抽取（可多选）
    ↓
Step 3: 组合生成
    ↓
Step 4: 记录与展示
```

#### 核心机制

- **有限选择池**：每个领域有固定的选项列表（存储在JSON配置中）
- **随机抽取**：支持"单次抽取"或"批量抽取"
- **组合展示**：以卡片/网格形式展示组合结果
- **历史记录**：保存每次组合，形成"Remake日志"

---

## 🏗️ 技术架构

### 数据层（Data Layer）

#### 配置文件：`remake-data.json`

```json
{
  "design": {
    "colors": ["朱红", "米白", "炭灰", "墨绿", "靛蓝"],
    "materials": ["宣纸", "棉麻", "竹", "陶", "金属"],
    "shapes": ["圆形", "方形", "不规则", "有机形态"],
    "styles": ["极简", "禅意", "马蒂斯式", "包豪斯"],
    "elements": ["留白", "纹理", "渐变", "几何"]
  },
  "outfit": {
    "tops": ["T恤", "衬衫", "毛衣", "外套"],
    "bottoms": ["长裤", "短裤", "裙子"],
    "accessories": ["围巾", "帽子", "腰带", "包"],
    "footwear": ["运动鞋", "皮鞋", "凉鞋"],
    "specialUses": {
      "围巾": ["颈部", "腰间", "头巾", "包带"],
      "腰带": ["腰部", "装饰", "包带"],
      "T恤": ["上装", "内搭", "外搭", "配饰"]
    }
  },
  "recipe": {
    "mainIngredients": ["米", "面", "蔬菜", "豆类"],
    "seasonings": ["盐", "酱油", "醋", "香料"],
    "cookingMethods": ["蒸", "煮", "炒", "烤"],
    "pairings": ["配菜", "汤", "小食"],
    "innovativeCombinations": []
  }
}
```

### 表现层（Presentation Layer）

#### HTML结构：`remake.html`

```html
<section class="remake-hero">
  <h2>Remake排列组合</h2>
  <p class="subtitle">有限选择里的无限组合</p>
</section>

<section class="remake-controls">
  <!-- 领域选择 -->
  <div class="pillar-selector">
    <button data-pillar="design">设计</button>
    <button data-pillar="outfit">穿搭</button>
    <button data-pillar="recipe">食谱</button>
  </div>
  
  <!-- 抽取控制 -->
  <div class="draw-controls">
    <button id="single-draw">单次抽取</button>
    <button id="batch-draw">批量抽取</button>
    <input type="number" id="batch-count" value="3" min="1" max="10">
  </div>
</section>

<section class="remake-results">
  <!-- 组合结果展示 -->
  <div class="combination-card" data-combination-id="xxx">
    <div class="combination-header">
      <span class="timestamp">2025-01-15 14:30</span>
      <span class="pillar-badge">设计</span>
    </div>
    <div class="combination-items">
      <!-- 动态生成 -->
    </div>
    <div class="combination-actions">
      <button class="save-btn">保存</button>
      <button class="share-btn">分享</button>
    </div>
  </div>
</section>

<section class="remake-history">
  <h3>Remake日志</h3>
  <!-- 历史组合列表 -->
</section>
```

### 交互层（Interaction Layer）

#### JavaScript：`js/remake-engine.js`

**核心功能：**

1. **数据加载**：从 `remake-data.json` 加载选项池
2. **随机抽取算法**：
   ```javascript
   function drawItems(pillar, category, count) {
     const pool = data[pillar][category];
     return shuffleArray(pool).slice(0, count);
   }
   ```
3. **组合生成**：将抽取的选项组合成卡片
4. **历史管理**：使用 `localStorage` 保存历史组合
5. **特殊用途处理**：对于"穿搭"领域，展示"特殊用途"选项

---

## 🎨 视觉设计原则

### 设计语言

- **禅意留白**：保持"筑居思"的极简美学
- **卡片式布局**：每个组合以独立卡片呈现
- **动态交互**：抽取时有"洗牌"动画效果
- **色彩语义**：不同领域使用不同的强调色
  - 设计：朱红
  - 穿搭：靛蓝
  - 食谱：墨绿

### 响应式设计

- **桌面端**：3列网格布局
- **平板端**：2列网格布局
- **移动端**：单列堆叠布局

---

## 🚀 实施路线图

### Phase 1: 基础架构（MVP）

- [ ] 创建 `remake-data.json` 配置文件
- [ ] 重构 `remake.html` 页面结构
- [ ] 实现 `js/remake-engine.js` 核心逻辑
- [ ] 添加基础样式（`css/remake.css`）

### Phase 2: 交互增强

- [ ] 添加抽取动画效果
- [ ] 实现历史记录功能（localStorage）
- [ ] 添加"保存组合"功能
- [ ] 实现"特殊用途"展示逻辑

### Phase 3: 内容扩展

- [ ] 扩展选项池（从Obsidian导入）
- [ ] 添加组合说明/笔记功能
- [ ] 实现组合分享功能（生成链接/图片）

### Phase 4: 高级功能

- [ ] 添加"组合评分"系统
- [ ] 实现"组合收藏"功能
- [ ] 添加"组合导出"（PDF/图片）
- [ ] 集成Obsidian同步（双向）

---

## 📝 内容管理策略

### Obsidian集成

**文件结构：**

```
Obsidian Vault/
└── Remake/
    ├── Design/
    │   ├── Colors.md
    │   ├── Materials.md
    │   └── ...
    ├── Outfit/
    │   ├── Tops.md
    │   ├── Accessories.md
    │   └── SpecialUses.md
    └── Recipe/
        └── ...
```

**同步机制：**

- 使用Python脚本从Obsidian Markdown文件提取选项
- 自动生成 `remake-data.json`
- 支持双向同步（网站修改 → Obsidian更新）

---

## 🎯 成功指标

### 用户体验指标

- **使用频率**：每周至少使用3次
- **组合生成数**：每月生成50+组合
- **历史记录**：保存100+历史组合

### 内容指标

- **选项池规模**：每个领域至少50个选项
- **组合多样性**：生成1000+种不同组合

---

## 💡 哲学思考

> **"谁规定了一种东西只有一种用途？那是消费主义！"**

这个模块的核心价值在于：

1. **打破固有思维**：通过随机组合，发现新的可能性
2. **实践"上手状态"**：将物品从"现成状态"转化为"上手状态"
3. **有限中的无限**：在有限的选项池中，创造无限的可能性
4. **记录与反思**：通过历史记录，观察自己的创造模式

---

## 🔮 未来愿景

**"Remake排列组合"** 不仅仅是一个工具，更是一个**"创造方法论"**的实践平台。

未来可以扩展：

- **社区功能**：分享组合，获得反馈
- **AI辅助**：基于历史数据，推荐更好的组合
- **跨领域组合**：设计+穿搭+食谱的跨界组合
- **可视化展示**：将组合转化为视觉作品

---

**创始人，这就是"Remake排列组合"模块的完整蓝图。**

**现在，请告诉我你的决策：**

1. 是否同意这个架构方向？
2. 是否需要调整功能优先级？
3. 是否要立即开始Phase 1的实施？

**等待你的指令。** 🚀

