/**
 * Whisper 组件使用示例
 * 
 * 这个文件展示了如何在项目中使用 Whisper 组件
 */

import { Whisper } from './Whisper';

// 示例 1: 基本用法
export function BasicExample() {
  return (
    <p>
      你在《存在与时间》
      <Whisper content="海德格尔的代表作。一本试图"搞懂我们是怎么存在"的烧脑天书。" />
      里找到了答案。
    </p>
  );
}

// 示例 2: 自定义图标
export function CustomEmojiExample() {
  return (
    <div>
      <p>
        这个哲学概念
        <Whisper content="存在主义的核心概念之一" emoji="💭" />
        值得深入思考。
      </p>
      
      <p>
        点击这里
        <Whisper content="了解更多关于禅修的信息" emoji="🧘" />
        了解更多。
      </p>
    </div>
  );
}

// 示例 3: 在文章中使用
export function ArticleExample() {
  return (
    <article>
      <h1>哲学思考</h1>
      <p>
        在阅读《存在与时间》
        <Whisper content="马丁·海德格尔于1927年出版的哲学著作，是20世纪最重要的哲学作品之一。" />
        时，我深深被其关于"此在"（Dasein）的论述所吸引。
      </p>
      
      <p>
        海德格尔认为，我们不应该将存在视为一个静态的概念
        <Whisper content="传统哲学往往将存在视为一个抽象的概念，但海德格尔强调存在的动态性和时间性。" emoji="📖" />
        ，而应该理解为我们与世界的关系。
      </p>
    </article>
  );
}

// 示例 4: 在列表中使用
export function ListExample() {
  return (
    <ul>
      <li>
        存在主义
        <Whisper content="20世纪哲学思潮，强调个体存在和自由选择的重要性。" />
      </li>
      <li>
        现象学
        <Whisper content="哲学方法，关注直接经验和意识的结构。" emoji="🔍" />
      </li>
      <li>
        诠释学
        <Whisper content="理解和解释文本与意义的理论。" emoji="📚" />
      </li>
    </ul>
  );
}

