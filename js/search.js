/**
 * 筑居思 - 全局搜索功能
 * 实现静态网站的内容搜索，支持关键词全文检索和按类型分组展示
 */

class SiteSearch {
  constructor() {
    this.searchIndex = null;
    this.searchResults = [];
    this.isIndexing = false;
    this.indexProgress = 0;
    this.searchConfig = {
      // 需要搜索的页面类型和它们的权重
      contentTypes: [
        { type: 'blog', weight: 1.5, label: '博客文章', path: 'blogs/' },
        { type: 'exhibit', weight: 1.0, label: '展品', path: 'exhibits/' },
        { type: 'portfolio', weight: 1.0, label: '作品集', path: 'portfolio.html' },
        { type: 'page', weight: 1.0, label: '页面', path: '' }
      ]
    };
    
    // 初始化
    this.init();
  }
  
  async init() {
    // 创建搜索UI
    this.createSearchUI();
    
    // 事件绑定
    this.bindEvents();
    
    // 构建搜索索引 (延迟加载)
    setTimeout(() => {
      this.buildSearchIndex();
    }, 500);
  }
  
  createSearchUI() {
    // 检查是否已经创建了搜索按钮
    if (document.querySelector('.search-toggle')) {
      return;
    }
    
    // 创建搜索按钮
    const searchButton = document.createElement('button');
    searchButton.classList.add('search-toggle');
    searchButton.setAttribute('aria-label', '全局搜索');
    searchButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;
    document.body.appendChild(searchButton);
    
    // 创建搜索容器
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('search-container');
    searchContainer.innerHTML = `
      <div class="search-modal">
        <div class="search-header">
          <div class="search-input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" class="search-input" placeholder="输入关键词搜索..." aria-label="搜索">
          </div>
          <button class="search-close" aria-label="关闭搜索">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="search-results">
          <div class="search-results-inner">
            <div class="search-message">正在构建搜索索引...</div>
          </div>
        </div>
        <div class="search-footer">
          <span>按 ESC 键关闭</span>
        </div>
      </div>
    `;
    document.body.appendChild(searchContainer);
  }
  
  bindEvents() {
    // 搜索按钮点击事件
    const searchButton = document.querySelector('.search-toggle');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    const searchClose = document.querySelector('.search-close');
    
    if (!searchButton || !searchContainer || !searchInput) {
      console.error('Search UI elements not found');
      return;
    }
    
    // 打开搜索
    searchButton.addEventListener('click', () => {
      searchContainer.classList.add('active');
      searchInput.focus();
      document.body.classList.add('search-active');
    });
    
    // 关闭搜索
    searchClose.addEventListener('click', () => {
      this.closeSearch();
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
        this.closeSearch();
      }
    });
    
    // 点击背景关闭
    searchContainer.addEventListener('click', (e) => {
      if (e.target === searchContainer) {
        this.closeSearch();
      }
    });
    
    // 搜索输入 - 使用防抖
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.handleSearch(e.target.value);
      }, 200);
    });
  }
  
  closeSearch() {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    
    if (searchContainer) {
      searchContainer.classList.remove('active');
    }
    if (searchInput) {
      searchInput.value = '';
    }
    document.body.classList.remove('search-active');
    
    // 重置搜索结果
    this.updateSearchResults([]);
  }
  
  async buildSearchIndex() {
    if (this.isIndexing) {
      console.log('索引构建已在进行中');
      return;
    }
    
    this.isIndexing = true;
    this.showSearchMessage('正在构建搜索索引...');
    
    this.searchIndex = {
      pages: []
    };
    
    try {
      // 首先尝试从blogs.html获取所有博客文章
      await this.indexBlogsFromBlogsPage();
      
      // 索引其他页面
      await this.indexOtherPages();
      
      console.log('搜索索引构建完成，共索引页面:', this.searchIndex.pages.length);
      console.log('索引的页面:', this.searchIndex.pages.map(p => p.title));
      
      if (this.searchIndex.pages.length > 0) {
        this.showSearchMessage('搜索索引已就绪，开始输入以搜索...');
      } else {
        this.showSearchMessage('索引构建失败，请刷新页面重试');
      }
    } catch (error) {
      console.error('Error building search index:', error);
      this.showSearchMessage('索引构建出错: ' + error.message);
    } finally {
      this.isIndexing = false;
    }
  }
  
  async indexBlogsFromBlogsPage() {
    try {
      const basePath = this.getBasePath();
      const blogsPagePath = basePath + 'blogs.html';
      
      console.log('尝试获取:', blogsPagePath);
      const response = await fetch(blogsPagePath);
      
      if (!response.ok) {
        console.warn('无法获取blogs.html，将使用备用方法');
        await this.indexBlogsFallback();
        return;
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 从blogs.html中提取所有博客文章链接
      const blogLinks = doc.querySelectorAll('a[href*="blogs/"]');
      const blogUrls = new Set();
      
      blogLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('.html')) {
          // 处理相对路径
          let fullPath = href;
          if (!href.startsWith('http') && !href.startsWith('/')) {
            if (href.startsWith('blogs/')) {
              fullPath = basePath + href;
            } else {
              fullPath = basePath + 'blogs/' + href.replace(/^.*?blogs\//, '');
            }
          } else if (href.startsWith('/')) {
            fullPath = href;
          }
          blogUrls.add(fullPath);
        }
      });
      
      console.log('找到博客链接:', blogUrls.size);
      
      // 索引每个博客文章
      const blogArray = Array.from(blogUrls);
      for (let i = 0; i < blogArray.length; i++) {
        const url = blogArray[i];
        try {
          await this.indexPage(url, 'blog', 1.5);
        } catch (error) {
          console.error(`Error indexing blog ${url}:`, error);
        }
      }
      
      console.log(`已索引 ${this.searchIndex.pages.filter(p => p.type === 'blog').length} 篇博客文章`);
    } catch (error) {
      console.error('Error indexing blogs:', error);
      await this.indexBlogsFallback();
    }
  }
  
  async indexBlogsFallback() {
    // 备用方法：直接列出所有博客文件
    const blogFiles = [
      '2019-06-10-talking-to-19-yo-self.html',
      '2022-07-22-如果在夏夜一个旅人.html',
      '2022-08-21-reading-philosophy.html',
      '2022-08-27-寻找Study-Work-life-Balence.html',
      '2022-09-03-听山风.html',
      '2022-09-17-reawakening-self-awareness.html',
      '2022-10-02-永远不要停止想象.html',
      '2022-11-08-hello-again-little-flowers-in-space.html',
      '2022-11-15-好文分享丨停下来休息一下.html',
      '2022-11-26-如何面对重大人生决定.html',
      '2023-01-15-swimming-till-the-sea-turns-blue.html',
      '2024-07-06-half-year-mindfulness-journey-in-dali.html',
      '2024-11-30-24岁学会的24件事.html',
      '2025-04-17-design-experiments-tend-to-fail.html',
      '2025-05-03-creativity-thoughts.html',
      '2025-08-28-2025年了为什么我还是推荐用RSS订阅内容.html',
      '2025-10-26-meeting-everyone-in-the-meditation-hall.html'
    ];
    
    const basePath = this.getBasePath();
    console.log('使用备用方法索引博客，基础路径:', basePath);
    
    for (const file of blogFiles) {
      const url = basePath + 'blogs/' + file;
      try {
        await this.indexPage(url, 'blog', 1.5);
      } catch (error) {
        console.error(`Error indexing blog ${url}:`, error);
      }
    }
  }
  
  async indexOtherPages() {
    const basePath = this.getBasePath();
    const otherPages = [
      { path: 'index.html', type: 'page', weight: 1.0 },
      { path: 'blogs.html', type: 'page', weight: 1.0 },
      { path: 'exhibits/exhibit-001.html', type: 'exhibit', weight: 1.0 },
      { path: 'exhibits/exhibit-002.html', type: 'exhibit', weight: 1.0 },
      { path: 'exhibits/exhibit-003.html', type: 'exhibit', weight: 1.0 },
      { path: 'portfolio.html', type: 'portfolio', weight: 1.0 },
      { path: 'cabinet.html', type: 'page', weight: 1.0 }
    ];
    
    for (const page of otherPages) {
      const url = basePath + page.path;
      try {
        await this.indexPage(url, page.type, page.weight);
      } catch (error) {
        console.error(`Error indexing page ${url}:`, error);
      }
    }
  }
  
  async indexPage(url, type, weight) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`无法获取页面: ${url} (${response.status})`);
        return;
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 提取页面信息
      const titleEl = doc.querySelector('title');
      const h1El = doc.querySelector('h1');
      const title = (titleEl && titleEl.textContent ? titleEl.textContent : '') || 
                    (h1El && h1El.textContent ? h1El.textContent : '') || 
                    '';
      const metaDescEl = doc.querySelector('meta[name="description"]');
      const description = (metaDescEl && metaDescEl.getAttribute('content') ? metaDescEl.getAttribute('content') : '') || '';
      
      // 提取keywords
      const metaKeywordsEl = doc.querySelector('meta[name="keywords"]');
      const keywords = (metaKeywordsEl && metaKeywordsEl.getAttribute('content') ? metaKeywordsEl.getAttribute('content') : '') || '';
      
      // 提取正文内容 - 尝试多个选择器
      let content = '';
      const contentSelectors = [
        '.post-content',
        '.article-body',
        '.content',
        'article .post-content',
        'article',
        'main article',
        'main',
        '.blog-post',
        '.post-body'
      ];
      
      for (const selector of contentSelectors) {
        const elements = doc.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => {
            // 移除script和style标签
            const clone = el.cloneNode(true);
            const scripts = clone.querySelectorAll('script, style, nav, .sidebar, .nav, footer, .footer, header, .header');
            scripts.forEach(s => s.remove());
            const text = clone.textContent || '';
            if (text.trim().length > 50) { // 只添加有实际内容的
              content += text + ' ';
            }
          });
          if (content.trim().length > 50) {
            break;
          }
        }
      }
      
      // 如果还没找到内容，使用body（排除导航等）
      if (!content.trim() || content.trim().length < 50) {
        const body = doc.body.cloneNode(true);
        // 移除导航、侧边栏、页脚等
        body.querySelectorAll('nav, .sidebar, .nav, footer, .footer, header, .header, script, style').forEach(el => el.remove());
        content = body.textContent || '';
      }
      
      // 清理内容：去除多余空白
      content = content.replace(/\s+/g, ' ').trim();
      
      // 如果内容太短，跳过
      if (content.length < 20) {
        console.warn(`页面内容太短，跳过: ${title} (${url})`);
        return;
      }
      
      // 处理URL - 确保是相对路径
      let pageUrl = url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const urlObj = new URL(url);
          pageUrl = urlObj.pathname;
        } catch (e) {
          // 如果解析失败，尝试提取路径部分
          pageUrl = url.replace(/^https?:\/\/[^/]+/, '');
        }
      }
      
      // 添加到索引
      this.searchIndex.pages.push({
        url: pageUrl,
        title: title.replace(' - 筑居思', '').trim(),
        description,
        keywords,
        content,
        type,
        weight,
        fullUrl: url
      });
      
      console.log(`已索引: ${title} (${type})`);
    } catch (error) {
      console.error(`Error indexing page ${url}:`, error);
    }
  }
  
  getBasePath() {
    // 获取当前页面的基础路径
    const path = window.location.pathname;
    const origin = window.location.origin;
    
    // 如果是根路径
    if (path === '/' || path === '') {
      return '';
    }
    
    // 如果在blogs目录下
    if (path.includes('/blogs/')) {
      const index = path.indexOf('/blogs/');
      return path.substring(0, index + 1);
    }
    
    // 如果路径以.html结尾
    if (path.endsWith('.html')) {
      const lastSlash = path.lastIndexOf('/');
      if (lastSlash > 0) {
        return path.substring(0, lastSlash + 1);
      }
      return '';
    }
    
    // 如果路径以/结尾
    if (path.endsWith('/')) {
      return path;
    }
    
    // 默认返回根路径
    return '';
  }
  
  handleSearch(query) {
    const trimmedQuery = query.trim();
    
    // 允许单字符搜索（特别是中文）
    if (!trimmedQuery) {
      this.updateSearchResults([]);
      return;
    }
    
    if (!this.searchIndex || !this.searchIndex.pages || this.searchIndex.pages.length === 0) {
      this.showSearchMessage('搜索索引正在加载，请稍后...');
      return;
    }
    
    // 搜索实现 - 支持中文单字符
    const queryLower = trimmedQuery.toLowerCase();
    const terms = queryLower.split(/\s+/).filter(term => term.length > 0);
    
    if (terms.length === 0) {
      this.updateSearchResults([]);
      return;
    }
    
    // 每个页面的匹配分数
    const results = this.searchIndex.pages
      .map(page => {
        // 对标题、描述、关键词和内容进行评分
        let score = 0;
        const titleLower = (page.title || '').toLowerCase();
        const descriptionLower = (page.description || '').toLowerCase();
        const keywordsLower = (page.keywords || '').toLowerCase();
        const contentLower = (page.content || '').toLowerCase();
        
        // 检查每个搜索词
        terms.forEach(term => {
          // 关键词匹配权重最高
          if (keywordsLower && keywordsLower.includes(term)) {
            score += 15 * page.weight;
          }
          
          // 标题匹配权重高
          if (titleLower.includes(term)) {
            score += 10 * page.weight;
          }
          
          // 描述匹配
          if (descriptionLower.includes(term)) {
            score += 5 * page.weight;
          }
          
          // 内容匹配 - 计算匹配次数
          const contentMatches = (contentLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          if (contentMatches > 0) {
            score += Math.min(contentMatches, 10) * page.weight; // 最多10次匹配
            
            // 找出第一个包含该词的上下文
            const termIndex = contentLower.indexOf(term);
            if (termIndex !== -1 && !page.context) {
              // 提取上下文 (前后50个字符)
              const start = Math.max(0, termIndex - 50);
              const end = Math.min(contentLower.length, termIndex + term.length + 50);
              let context = contentLower.substring(start, end);
              // 高亮匹配的词
              context = context.replace(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), `<mark>$&</mark>`);
              page.context = '...' + context + '...';
            }
          }
        });
        
        return {
          page: { ...page }, // 复制页面对象
          score
        };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);
    
    // 更新搜索结果
    this.updateSearchResults(results);
  }
  
  updateSearchResults(results) {
    const searchResultsInner = document.querySelector('.search-results-inner');
    
    if (!searchResultsInner) {
      return;
    }
    
    if (results.length === 0) {
      this.showSearchMessage('没有找到匹配的结果');
      return;
    }
    
    // 按类型分组
    const groupedResults = {};
    results.forEach(result => {
      const type = result.page.type || 'page';
      if (!groupedResults[type]) {
        groupedResults[type] = [];
      }
      groupedResults[type].push(result);
    });
    
    // 构建HTML - 按类型分组显示为卡片
    let html = '';
    
    // 获取类型标签
    const getTypeLabel = (type) => {
      const config = this.searchConfig.contentTypes.find(c => c.type === type);
      return config ? config.label : '其他';
    };
    
    // 获取类型图标
    const getTypeIcon = (type) => {
      if (type === 'blog') {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;
      } else if (type === 'exhibit') {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
      } else if (type === 'portfolio') {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m18.37 8.64 4.63.59-1.25 9.69-4.63-.59"></path><path d="M15.75 10 12 16l-3-4-4 7"></path></svg>`;
      } else {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
      }
    };
    
    // 遍历每个类型组
    Object.keys(groupedResults).forEach(type => {
      const typeResults = groupedResults[type];
      const typeLabel = getTypeLabel(type);
      const typeIcon = getTypeIcon(type);
      
      html += `
        <div class="search-results-group">
          <div class="search-results-group-header">
            ${typeIcon}
            <span class="search-results-group-title">${typeLabel}</span>
            <span class="search-results-group-count">(${typeResults.length})</span>
          </div>
          <div class="search-results-group-content">
      `;
      
      typeResults.forEach(result => {
        const { page } = result;
        
        html += `
          <a href="${page.url}" class="search-result-item">
            <div class="search-result-item-type">${typeIcon}</div>
            <div class="search-result-item-content">
              <h3>${this.escapeHtml(page.title)}</h3>
              ${page.context ? `<p class="search-context">${page.context}</p>` : 
                 (page.description ? `<p class="search-description">${this.escapeHtml(page.description)}</p>` : '')}
            </div>
          </a>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    searchResultsInner.innerHTML = html;
  }
  
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  showSearchMessage(message) {
    const searchResultsInner = document.querySelector('.search-results-inner');
    if (searchResultsInner) {
      searchResultsInner.innerHTML = `<div class="search-message">${message}</div>`;
    }
  }
}

// 初始化搜索
document.addEventListener('DOMContentLoaded', function() {
  // 延迟初始化搜索以优先加载页面
  setTimeout(() => {
    try {
      new SiteSearch();
    } catch (error) {
      console.error('Error initializing search:', error);
    }
  }, 500);
});
