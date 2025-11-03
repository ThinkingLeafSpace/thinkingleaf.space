/* 推荐文章模块 - 网状思维（占位数据 + 优雅降级） */

(function () {
  const ACCENT_BLUE = getCssVar('--color-accent-blue') || getCssVar('--primary-color') || '#2f6fff';
  const ACCENT_YELLOW = getCssVar('--color-accent-yellow') || '#ffd400';
  const THEME_SECONDARY = getCssVar('--theme-secondary') || 'rgba(0,0,0,0.04)';
  const THEME_SUPPORT = getCssVar('--theme-support') || 'rgba(0,0,0,0.12)';

  function getCssVar(name) {
    try {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    } catch (e) {
      return '';
    }
  }

  // 模拟当前文章元数据（若页面未提供 window.currentArticleMeta，则使用占位）
  const currentArticle = (window.currentArticleMeta) || {
    title: '禅堂结缘：记第二次内观禅修的总结',
    tags: ['内观', '禅修', '思', '自我觉察'],
    pillar: '思',
    // 可选：image 如果有，优先使用
    image: null
  };

  // 推荐文章占位数据（至少5篇）
  const placeholderRecommendations = (window.placeholderRecommendations) || [
    { title: '💡 如何让思考获得安住', slug: '/blog/thinking-anchor', tags: ['内观', '思', '极简'], hasImage: true, pillar: '思', image: null },
    { title: '🔨 红靴子与花的蜕变日志', slug: '/cabinet/red-boot-remake', tags: ['造物', '筑', 'Remake'], hasImage: true, pillar: '筑', image: null },
    { title: '☕ 瓦尔登湖与当下的选择', slug: '/blog/walden-choice', tags: ['居', '安住', '文学'], hasImage: false, pillar: '居', image: null },
    { title: '🌿 日常里的微小修行', slug: '/blog/daily-micro-practice', tags: ['思', '内观', '日常'], hasImage: false, pillar: '思', image: null },
    { title: '🏡 空间的善意：居的五则练习', slug: '/blog/living-five-practices', tags: ['居', '空间', '安住'], hasImage: true, pillar: '居', image: null },
    { title: '🧱 手作与结构：筑的另一种温度', slug: '/blog/building-warmth', tags: ['筑', '结构', '造物'], hasImage: false, pillar: '筑', image: null }
  ];

  function getRecommendedArticles(current, candidates, maxCount = 3) {
    const tagSet = new Set((current.tags || []).map(String));
    const pillar = current.pillar || null;

    // 1) 标签重叠打分
    const scored = candidates.map(item => {
      const overlap = (item.tags || []).reduce((acc, t) => acc + (tagSet.has(String(t)) ? 1 : 0), 0);
      const pillarMatch = pillar && item.pillar === pillar ? 1 : 0;
      const freshness = 0; // 未来可加入基于时间的排序
      const score = overlap * 10 + pillarMatch * 3 + freshness;
      return { item, score, overlap, pillarMatch };
    });

    // 2) 优先依据标签重叠排序
    scored.sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      if (b.pillarMatch !== a.pillarMatch) return b.pillarMatch - a.pillarMatch;
      return b.score - a.score;
    });

    let picked = scored.filter(s => s.overlap > 0).slice(0, maxCount).map(s => s.item);

    // 3) 不足则补 pillar 相同
    if (picked.length < maxCount && pillar) {
      const remaining = candidates.filter(x => !picked.includes(x) && x.pillar === pillar);
      for (const r of remaining) {
        if (picked.length < maxCount) picked.push(r);
      }
    }

    // 4) 仍不足则补最新（此处按原顺序）
    if (picked.length < maxCount) {
      for (const c of candidates) {
        if (picked.length >= maxCount) break;
        if (!picked.includes(c)) picked.push(c);
      }
    }

    return picked.slice(0, maxCount);
  }

  function createPillarSVG(pillar, bgColor, fgColor) {
    const emojiMap = { '思': '🧭', '筑': '🧱', '居': '🏡' };
    const label = emojiMap[pillar] || '✨';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 120 80');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.width = '100%';
    svg.style.height = '120px';
    svg.style.display = 'block';

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '120');
    rect.setAttribute('height', '80');
    rect.setAttribute('rx', '10');
    rect.setAttribute('fill', bgColor || THEME_SUPPORT);
    svg.appendChild(rect);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '60');
    text.setAttribute('y', '50');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '36');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', fgColor || '#222');
    text.textContent = label;
    svg.appendChild(text);

    return svg;
  }

  function buildCard(rec) {
    const a = document.createElement('a');
    a.className = 'rec-card';
    a.href = rec.slug;
    a.setAttribute('aria-label', rec.title);

    // 媒体区域
    const media = document.createElement('div');
    media.className = 'rec-media';

    // 图片优先级：1) 文章自身 image；2) 有图标记 + 占位；3) pillar 占位；4) 无图
    const useImageUrl = rec.image || currentArticle.image || null;
    if (useImageUrl) {
      const img = document.createElement('img');
      img.src = useImageUrl;
      img.loading = 'lazy';
      img.alt = rec.title;
      img.decoding = 'async';
      media.appendChild(img);
    } else if (rec.hasImage === true) {
      // 提前占位（品牌降级：仍使用pillar色块）
      const svg = createPillarSVG(rec.pillar || currentArticle.pillar || '', THEME_SUPPORT, '#222');
      media.appendChild(svg);
    } else if (rec.pillar || currentArticle.pillar) {
      const svg = createPillarSVG(rec.pillar || currentArticle.pillar, THEME_SUPPORT, '#222');
      media.appendChild(svg);
    } // 否则不显示媒体，纯文字卡片

    const body = document.createElement('div');
    body.className = 'rec-body';

    const h3 = document.createElement('h3');
    h3.className = 'rec-title';
    h3.textContent = rec.title;

    const more = document.createElement('span');
    more.className = 'rec-more';
    more.textContent = '阅读更多 →';

    body.appendChild(h3);
    body.appendChild(more);

    a.appendChild(media);
    a.appendChild(body);
    return a;
  }

  function renderRecommendations(container) {
    if (!container) return;
    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'rec-header';
    header.innerHTML = '<h2>相关文章推荐</h2>';

    const grid = document.createElement('div');
    grid.className = 'rec-grid';

    const picks = getRecommendedArticles(currentArticle, placeholderRecommendations, 3);
    for (const rec of picks) {
      grid.appendChild(buildCard(rec));
    }

    container.appendChild(header);
    container.appendChild(grid);
  }

  function ensureStyles() {
    if (document.querySelector('link[href$="/css/recommendations.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../css/recommendations.css';
    document.head.appendChild(link);
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureStyles();
    const host = document.getElementById('recommended-articles');
    if (host) renderRecommendations(host);
  });
})();


