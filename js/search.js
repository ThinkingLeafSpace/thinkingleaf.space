/**
 * 筑居思 - 全局搜索功能
 * 实现静态网站的内容搜索
 */

class SiteSearch {
  constructor() {
    this.searchIndex = null;
    this.searchResults = [];
    this.searchConfig = {
      // 需要搜索的页面类型和它们的权重
      contentTypes: [
        { type: 'blog', weight: 1.5, path: 'blogs/' },
        { type: 'exhibit', weight: 1.0, path: 'exhibits/' },
        { type: 'portfolio', weight: 1.0, path: 'portfolio.html' }
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
    }, 1000);
  }
  
  createSearchUI() {
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
            <div class="search-message">开始输入以搜索...</div>
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
    
    // 搜索输入
    searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });
  }
  
  closeSearch() {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    
    searchContainer.classList.remove('active');
    document.body.classList.remove('search-active');
    searchInput.value = '';
    
    // 重置搜索结果
    this.updateSearchResults([]);
  }
  
  async buildSearchIndex() {
    // 在真实实现中，我们会抓取站点内容来建立索引
    // 这里我们使用示例数据
    this.searchIndex = {
      pages: []
    };
    
    try {
      // 获取站点地图或主要页面列表
      const siteMapResponse = await fetch('/sitemap.xml').catch(() => null);
      
      if (siteMapResponse && siteMapResponse.ok) {
        // 解析站点地图XML
        const siteMapText = await siteMapResponse.text();
        const parser = new DOMParser();
        const siteMap = parser.parseFromString(siteMapText, "text/xml");
        const urls = Array.from(siteMap.querySelectorAll('url loc')).map(url => url.textContent);
        
        // 抓取每个页面的内容
        for (const url of urls) {
          try {
            const pageResponse = await fetch(url);
            if (!pageResponse.ok) continue;
            
            const html = await pageResponse.text();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 提取页面信息
            const title = doc.querySelector('title')?.textContent || '';
            const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
            const content = doc.querySelector('main, .article-body, .content, article')?.textContent || '';
            
            // 确定内容类型
            let type = 'page';
            let weight = 1.0;
            
            for (const contentType of this.searchConfig.contentTypes) {
              if (url.includes(contentType.path)) {
                type = contentType.type;
                weight = contentType.weight;
                break;
              }
            }
            
            // 添加到索引
            this.searchIndex.pages.push({
              url,
              title,
              description,
              content,
              type,
              weight
            });
          } catch (error) {
            console.error(`Error fetching ${url}:`, error);
          }
        }
      } else {
        // 如果没有站点地图，使用硬编码的页面
        await this.buildFallbackIndex();
      }
    } catch (error) {
      console.error('Error building search index:', error);
      // 失败时使用硬编码的页面
      await this.buildFallbackIndex();
    }
    
    console.log('搜索索引构建完成，共索引页面:', this.searchIndex.pages.length);
  }
  
  async buildFallbackIndex() {
    // 获取页面列表
    const pagesToIndex = [
      { path: 'index.html', type: 'page', weight: 1.0 },
      { path: 'blogs.html', type: 'blog', weight: 1.5 },
      { path: 'blogs/meditation-journey.html', type: 'blog', weight: 1.5 },
      { path: 'blogs/life-in-weeks.html', type: 'blog', weight: 1.5 },
      { path: 'blogs/creativity-thoughts.html', type: 'blog', weight: 1.5 },
      { path: 'blogs/24-things.html', type: 'blog', weight: 1.5 },
      { path: 'blogs/talking-to-19-yo-self.html', type: 'blog', weight: 1.5 },
      { path: 'exhibits/exhibit-001.html', type: 'exhibit', weight: 1.0 },
      { path: 'exhibits/exhibit-002.html', type: 'exhibit', weight: 1.0 },
      { path: 'exhibits/exhibit-003.html', type: 'exhibit', weight: 1.0 },
      { path: 'portfolio.html', type: 'portfolio', weight: 1.0 },
      { path: 'cabinet.html', type: 'page', weight: 1.0 },
      { path: 'newsletter.html', type: 'page', weight: 1.0 }
    ];
    
    // 抓取每个页面的内容
    for (const page of pagesToIndex) {
      try {
        const response = await fetch(page.path);
        if (!response.ok) continue;
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 提取页面信息
        const title = doc.querySelector('title')?.textContent || '';
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        let content = '';
        
        // 尝试提取主要内容
        const contentEls = doc.querySelectorAll('main, .article-body, .content, .article-container, article');
        if (contentEls.length > 0) {
          for (const el of contentEls) {
            content += el.textContent + ' ';
          }
        } else {
          // 如果找不到主要内容，使用body
          content = doc.body.textContent;
        }
        
        // 添加到索引
        this.searchIndex.pages.push({
          url: page.path,
          title,
          description,
          content,
          type: page.type,
          weight: page.weight
        });
      } catch (error) {
        console.error(`Error fetching ${page.path}:`, error);
      }
    }
  }
  
  handleSearch(query) {
    if (!query || query.trim().length < 2) {
      this.updateSearchResults([]);
      return;
    }
    
    if (!this.searchIndex || !this.searchIndex.pages) {
      this.showSearchMessage('搜索索引正在加载，请稍后...');
      return;
    }
    
    // 简单的搜索实现
    query = query.trim().toLowerCase();
    const terms = query.split(/\s+/);
    
    // 每个页面的匹配分数
    const results = this.searchIndex.pages
      .map(page => {
        // 对标题和内容进行评分
        let score = 0;
        const titleLower = page.title.toLowerCase();
        const descriptionLower = page.description.toLowerCase();
        const contentLower = page.content.toLowerCase();
        
        // 检查每个搜索词
        terms.forEach(term => {
          // 标题匹配权重高
          if (titleLower.includes(term)) {
            score += 10 * page.weight;
          }
          
          // 描述匹配
          if (descriptionLower.includes(term)) {
            score += 5 * page.weight;
          }
          
          // 内容匹配
          if (contentLower.includes(term)) {
            score += 1 * page.weight;
            
            // 找出包含该词的上下文
            const termIndex = contentLower.indexOf(term);
            if (termIndex !== -1) {
              // 提取上下文 (前后30个字符)
              const start = Math.max(0, termIndex - 30);
              const end = Math.min(contentLower.length, termIndex + term.length + 30);
              page.context = '...' + contentLower.substring(start, end).replace(term, `<mark>${term}</mark>`) + '...';
            }
          }
        });
        
        return {
          page,
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
    
    if (results.length === 0) {
      this.showSearchMessage('开始输入以搜索...');
      return;
    }
    
    if (results.length > 0) {
      let html = '<div class="search-results-list">';
      
      results.forEach(result => {
        const { page } = result;
        
        // 根据内容类型添加不同的图标
        let typeIcon = '';
        if (page.type === 'blog') {
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;
        } else if (page.type === 'exhibit') {
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
        } else if (page.type === 'portfolio') {
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m18.37 8.64 4.63.59-1.25 9.69-4.63-.59"></path><path d="M15.75 10 12 16l-3-4-4 7"></path></svg>`;
        } else {
          typeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        }
        
        html += `
          <a href="${page.url}" class="search-result-item">
            <div class="search-result-item-type">${typeIcon}</div>
            <div class="search-result-item-content">
              <h3>${page.title}</h3>
              ${page.context ? `<p class="search-context">${page.context}</p>` : 
                 `<p class="search-description">${page.description}</p>`}
            </div>
          </a>
        `;
      });
      
      html += '</div>';
      searchResultsInner.innerHTML = html;
    } else {
      this.showSearchMessage('没有找到匹配的结果');
    }
  }
  
  showSearchMessage(message) {
    const searchResultsInner = document.querySelector('.search-results-inner');
    searchResultsInner.innerHTML = `<div class="search-message">${message}</div>`;
  }
}

// 初始化搜索
document.addEventListener('DOMContentLoaded', function() {
  // 延迟初始化搜索以优先加载页面
  setTimeout(() => {
    new SiteSearch();
  }, 500);
});
