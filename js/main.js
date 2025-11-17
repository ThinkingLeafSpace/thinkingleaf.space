document.addEventListener('DOMContentLoaded', () => {
    // 主题切换功能
    const themeToggle = document.getElementById('theme-toggle');
    
    // 如果找到了主题切换按钮，则设置其功能
    if (themeToggle) {
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        
        // 检查本地存储中的主题设置
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (sunIcon && moonIcon) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            }
        }
        
        // 切换主题
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            // 切换图标
            if (sunIcon && moonIcon) {
                if (document.body.classList.contains('dark-theme')) {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                    localStorage.setItem('theme', 'dark');
                } else {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                    localStorage.setItem('theme', 'light');
                }
            } else {
                // 如果没有找到图标，只切换主题类
                if (document.body.classList.contains('dark-theme')) {
                    localStorage.setItem('theme', 'dark');
                } else {
                    localStorage.setItem('theme', 'light');
                }
            }
        });
    }
    
    // 添加平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 根据当前页面高亮导航链接
    function setActiveNavLink() {
        const currentPath = window.location.pathname.replace(/index\.html$/, '') || '/';
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        
        // 先清除所有导航链接的 active 类
        navLinks.forEach(link => link.classList.remove('active'));
        
        // 根路径匹配主页
        if (currentPath === '/') {
            const homeLink = document.querySelector('.sidebar-nav a[href="/"]') || 
                           document.querySelector('.sidebar-nav a[href="index.html"]');
            if (homeLink) homeLink.classList.add('active');
            return;
        }
        
        // 博客文章页：任何 /blogs/ 下的页面都高亮"个人博客"
        if (currentPath.includes('/blogs/')) {
            const blogLink = Array.from(navLinks).find(link => {
                const href = link.getAttribute('href') || '';
                return href === '/blog' || href === 'blogs.html' || href.includes('blog');
            });
            if (blogLink) blogLink.classList.add('active');
            return;
        }

        // 其他页面：匹配当前路径（仅比较文件名，兼容 ../xxx.html 相对路径）
        const route = currentPath.replace(/\.html$/, '');
        const mapping = [
            { path: '/what-is-zhu-ju-si.html', selector: 'a[href="/what-is-zhu-ju-si.html"], a[href="what-is-zhu-ju-si.html"]' },
            { path: '/blog', selector: 'a[href="/blog"], a[href="blogs.html"]' },
            { path: '/cabinet', selector: 'a[href="/cabinet"], a[href="cabinet.html"]' }
        ];
        // 兼容旧文件路径
        const legacy = [
            { test: /what-is-zhu-ju-si\.html$/, selector: 'a[href="/what-is-zhu-ju-si.html"], a[href="what-is-zhu-ju-si.html"]' },
            { test: /blogs\.html$/, selector: 'a[href="/blog"], a[href="blogs.html"]' },
            { test: /cabinet\.html$/, selector: 'a[href="/cabinet"], a[href="cabinet.html"]' }
        ];

        let activated = false;
        for (const m of mapping) {
            if (route === m.path) {
                const selectors = m.selector.split(',');
                for (const selector of selectors) {
                    const el = document.querySelector(`.sidebar-nav ${selector.trim()}`);
                    if (el) { 
                        el.classList.add('active'); 
                        activated = true;
                        break;
                    }
                }
            }
        }
        if (!activated) {
            for (const l of legacy) {
                if (l.test.test(currentPath)) {
                    const selectors = l.selector.split(',');
                    for (const selector of selectors) {
                        const el = document.querySelector(`.sidebar-nav ${selector.trim()}`);
                        if (el) { 
                            el.classList.add('active'); 
                            activated = true;
                            break;
                        }
                    }
                }
            }
        }
    }
    
    // 为导航链接添加点击事件处理，确保点击时立即更新 active 状态
    function setupNavLinkClickHandlers() {
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // 清除所有导航链接的 active 类
                navLinks.forEach(l => l.classList.remove('active'));
                // 为当前点击的链接添加 active 类
                this.classList.add('active');
            });
        });
    }
    
    // 初始化活动导航链接
    setActiveNavLink();
    
    // 设置导航链接点击事件处理器
    setupNavLinkClickHandlers();

    // 特定页面与博客页面：移除面包屑
    if (window.location.pathname.endsWith('mitsein.html') || window.location.pathname.includes('/blogs/')) {
        document.querySelectorAll('.breadcrumb, .breadcrumbs').forEach(el => el.remove());
    }

    // ========== 博客页面：仅修正中文标题显示（不再注入面包屑） ==========
    (function ensureChineseTitle() {
        const postTitleEl = document.querySelector('.post-title');
        if (!postTitleEl) return;

        const titleText = (postTitleEl.textContent || '').trim();
        if (titleText) {
            // 统一设置浏览器标签标题为中文标题
            document.title = `${titleText} - 筑居思`;
        }
    })();

    // ========== 博客页面：底部相关推荐（Topics 优先 + Pillar 兜底；卡片+封面图） ==========
    (function injectRelatedPosts() {
        const postContent = document.querySelector('.post-content');
        if (!postContent) return;

        const postTitleEl = document.querySelector('.post-title');
        const currentTitle = (postTitleEl && postTitleEl.textContent ? postTitleEl.textContent : '').trim();
        const currentUrl = window.location.pathname.split('/').pop();
        const postHeaderTime = document.querySelector('.post-header time');
        const currentISODate = (postHeaderTime && postHeaderTime.getAttribute('datetime') ? postHeaderTime.getAttribute('datetime') : '').trim(); // YYYY-MM-DD
        const tagEls = Array.from(document.querySelectorAll('.blog-tags .tag'));
        const topicTags = tagEls.map(el => (el.textContent || '').trim()).filter(Boolean);
        const metaKeywordsEl = document.querySelector('meta[name="keywords"]');
        const metaKeywords = (metaKeywordsEl && metaKeywordsEl.getAttribute('content') ? metaKeywordsEl.getAttribute('content') : '')
            .split(/[,，]/).map(s => s.trim()).filter(Boolean);

        // Pillar 推断：优先 meta 覆盖，其次根据关键词/标签/标题启发式
        function inferPillarFromSignals(signalsText) {
            const s = (signalsText || '').toLowerCase();
            if (/禅修|内观|vipassana|自我觉察|心理|哲学|思考/.test(s)) return '思';
            if (/空间|建筑|设计|美学|城市|筑/.test(s)) return '筑';
            if (/生活|家|居住|家庭|居|日常/.test(s)) return '居';
            return '思';
        }

        function getCurrentPillar() {
            const metaPillarEl = document.querySelector('meta[name="pillar"]');
            const metaPillar = metaPillarEl && metaPillarEl.getAttribute('content') ? metaPillarEl.getAttribute('content') : null;
            if (metaPillar) return metaPillar.trim();
            const combined = [currentTitle, ...topicTags, ...metaKeywords].join(' ');
            return inferPillarFromSignals(combined);
        }

        const currentPillar = getCurrentPillar();

        // 封面图兜底映射（使用站内已存在资源）
        const pillarFallbackCovers = {
            '筑': '../images/exhibit-001-main.jpg',
            '居': '../images/exhibit-002-main.jpg',
            '思': '../images/exhibit-003-main.jpg',
            'default': '../images/placeholder-image.jpg'
        };

        function getPillarFallback(pillar) {
            return pillarFallbackCovers[pillar] || pillarFallbackCovers['default'];
        }

        // 评分：Topics 重合度为主；同 Pillar 加分；同月轻权重
        function scoreCandidate(candidate) {
            let score = 0;
            const candidateSignals = new Set([...(candidate.topics || []), ...(candidate.keywords || [])]);
            topicTags.forEach(t => { if (candidateSignals.has(t)) score += 4; }); // 主题强相关
            metaKeywords.forEach(k => { if (candidateSignals.has(k)) score += 2; }); // 关键词次之

            if (candidate.pillar && currentPillar && candidate.pillar === currentPillar) score += 1.5;

            // 同月小权重
            if (currentISODate && candidate.date) {
                const monthA = currentISODate.slice(0, 7);
                const monthB = candidate.date.slice(0, 7);
                if (monthA && monthB && monthA === monthB) score += 0.5;
            }

            // 标题弱匹配（中文2字片段）
            for (let i = 0; i < Math.max(0, currentTitle.length - 1); i++) {
                const part = currentTitle.slice(i, i + 2);
                if (/^[\u4e00-\u9fa5]{2}$/.test(part) && (candidate.title || '').includes(part)) {
                    score += 0.5;
                }
            }
            return score;
        }

        async function fetchDoc(url) {
            const res = await fetch(url);
            if (!res.ok) return null;
            const html = await res.text();
            return new DOMParser().parseFromString(html, 'text/html');
        }

        function extractFirstImage(doc) {
            const img = doc.querySelector('.post-content img, article img');
            if (!img) return null;
            let src = img.getAttribute('src') || '';
            if (!src) return null;
            // 规范化相对路径
            if (src.startsWith('./')) src = src.replace('./', '');
            if (src.startsWith('../')) return src; // 已经是相对上级路径
            if (/^https?:\/\//i.test(src)) return src; // 绝对 URL
            // 候选页通常位于 blogs/ 下，这里将相对路径提升到与候选同层
            return `../${src.replace(/^\/?/, '')}`;
        }

        function extractTopics(doc) {
            const tags = Array.from(doc.querySelectorAll('.blog-tags .tag')).map(el => (el.textContent || '').trim()).filter(Boolean);
            const metaKeywordsEl = doc.querySelector('meta[name="keywords"]');
            const keywords = (metaKeywordsEl && metaKeywordsEl.getAttribute('content') ? metaKeywordsEl.getAttribute('content') : '')
                .split(/[,，]/).map(s => s.trim()).filter(Boolean);
            return { tags, keywords };
        }

        function extractPillar(doc) {
            const metaPillarEl = doc.querySelector('meta[name="pillar"]');
            const metaPillar = metaPillarEl && metaPillarEl.getAttribute('content') ? metaPillarEl.getAttribute('content') : null;
            if (metaPillar) return metaPillar.trim();
            const postTitleEl = doc.querySelector('.post-title');
            const title = (postTitleEl && postTitleEl.textContent ? postTitleEl.textContent : doc.title || '').trim();
            const { tags, keywords } = extractTopics(doc);
            const combined = [title, ...tags, ...keywords].join(' ');
            return inferPillarFromSignals(combined);
        }

        async function loadCandidatesWithDetails() {
            try {
                const indexDoc = await fetchDoc('../blogs.html');
                if (!indexDoc) return [];
                const links = Array.from(indexDoc.querySelectorAll('.links-grid a.link-card'));
                const basics = links.map(a => {
                    const href = a.getAttribute('href') || '';
                    const file = href.split('/').pop();
                    const h5El = a.querySelector('h5');
                    const title = (h5El && h5El.textContent ? h5El.textContent : '').trim();
                    const dateTagEl = a.querySelector('.date-tag');
                    const date = (dateTagEl && dateTagEl.textContent ? dateTagEl.textContent : '').trim(); // YYYY-MM-DD
                    const full = href.startsWith('blogs/') ? `../${href}` : href;
                    return { href: full, file, title, date };
                }).filter(x => x.file && x.file.endsWith('.html') && x.file !== currentUrl);

                // 并发抓取详情，用于 Topics 与首图提取
                const docs = await Promise.all(basics.map(it => fetchDoc(it.href).catch(() => null)));
                return basics.map((it, idx) => {
                    const doc = docs[idx];
                    if (!doc) return { ...it, topics: [], keywords: [], pillar: null, cover: null };
                    const postTitleEl = doc.querySelector('.post-title');
                    const title = (postTitleEl && postTitleEl.textContent ? postTitleEl.textContent : it.title || '').trim();
                    const { tags, keywords } = extractTopics(doc);
                    const pillar = extractPillar(doc);
                    const cover = extractFirstImage(doc);
                    return { ...it, title, topics: tags, keywords, pillar, cover };
                });
            } catch (e) {
                console.warn('加载候选文章失败', e);
                return [];
            }
        }

        function pickTopRelated(candidates) {
            // 先按评分排序
            candidates.forEach(c => { c._score = scoreCandidate(c); });
            const sorted = [...candidates].sort((a, b) => (b._score - a._score) || (b.date.localeCompare(a.date)));
            const topByTopics = sorted.filter(c => c._score > 0).slice(0, 3);
            if (topByTopics.length >= 3) return topByTopics;

            // 兜底：从同 Pillar 中按时间补齐
            const chosenSet = new Set(topByTopics.map(x => x.file));
            const samePillar = candidates
                .filter(c => c.pillar === currentPillar && !chosenSet.has(c.file))
                .sort((a, b) => b.date.localeCompare(a.date));

            const final = [...topByTopics];
            for (const c of samePillar) {
                if (final.length >= 3) break;
                final.push(c);
            }
            // 若仍不足，任意最新补齐
            if (final.length < 3) {
                const rest = candidates.filter(c => !new Set(final.map(x => x.file)).has(c.file))
                    .sort((a, b) => b.date.localeCompare(a.date));
                for (const c of rest) {
                    if (final.length >= 3) break;
                    final.push(c);
                }
            }
            return final.slice(0, 3);
        }

        (async () => {
            const candidates = await loadCandidatesWithDetails();
            if (!candidates || candidates.length === 0) return;

            const picks = pickTopRelated(candidates);
            if (!picks || picks.length === 0) return;

            const section = document.createElement('section');
            section.className = 'related-posts';
            section.innerHTML = `
                <h3>相关推荐</h3>
                <div class="related-grid"></div>
            `;

            const grid = section.querySelector('.related-grid');
            picks.forEach(it => {
                const card = document.createElement('a');
                card.href = it.href;
                card.className = 'related-card';
                const cover = it.cover || getPillarFallback(it.pillar || currentPillar);
                card.innerHTML = `
                    <div class="cover-wrap"><img class="cover" src="${cover}" alt="${(it.title || '相关封面').replace(/"/g, '&quot;')}" loading="lazy"></div>
                    <h4>${it.title || ''}</h4>
                    ${it.date ? `<p class="date">${it.date}</p>` : '<p class="date"></p>'}
                `;
                grid.appendChild(card);
            });

            // 插入到文章底部
            const article = document.querySelector('.container.blog-post article') || document.querySelector('article');
            if (article) {
                article.appendChild(section);
            } else {
                const parentEl = postContent.parentElement;
                if (parentEl) {
                    parentEl.appendChild(section);
                }
            }
        })();
    })();

    // 移动菜单切换
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
        // 切换侧边栏显示状态
        const toggleSidebar = () => {
            const isOpen = sidebar.classList.contains('show');
            if (isOpen) {
                sidebar.classList.remove('show');
                document.body.classList.remove('sidebar-open');
                mobileMenuToggle.classList.remove('active');
            } else {
                sidebar.classList.add('show');
                document.body.classList.add('sidebar-open');
                mobileMenuToggle.classList.add('active');
            }
        };
        
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
        
        // 点击外部时关闭侧边栏（移动端）
        document.addEventListener('click', (event) => {
            if (window.innerWidth <= 768) {
                const isClickInsideSidebar = sidebar.contains(event.target);
                const isClickOnMenuToggle = mobileMenuToggle.contains(event.target);
                
                if (!isClickInsideSidebar && !isClickOnMenuToggle && sidebar.classList.contains('show')) {
                    sidebar.classList.remove('show');
                    document.body.classList.remove('sidebar-open');
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });
        
        // 处理窗口大小变化
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                document.body.classList.remove('sidebar-open');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }

    // 阅读进度指示器（若不存在则动态创建）
    let progressBar = document.getElementById('reading-progress');
    if (!progressBar) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.id = 'reading-progress';
        progressContainer.appendChild(bar);
        // 插入到 <body> 开头，确保置顶
        document.body.insertBefore(progressContainer, document.body.firstChild);
        progressBar = bar;
    }

    window.addEventListener('scroll', () => {
        if (!progressBar) return;
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    });


    // ========== newsletter 轮播逻辑 ==========
    document.querySelectorAll('.newsletter-carousel').forEach(container => {
        const slides = container.querySelector('.slides');
        const dots   = container.querySelectorAll('.dot');
        if (slides && dots.length > 0) {
            dots.forEach((dot, idx) => {
                dot.addEventListener('click', () => {
                    // 切换 transform
                    slides.style.transform = `translateX(-${idx * 100}%)`;
                    // 更新 active 状态
                    const activeDot = container.querySelector('.dot.active');
                    if (activeDot) activeDot.classList.remove('active');
                    dot.classList.add('active');
                });
            });
        }
    });

    // ========== 首页博客自动添加描述 ==========
    // 只在首页执行此功能
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadBlogDescriptions();
    }

    /**
     * 从博客页面加载描述并填充到首页
     */
    async function loadBlogDescriptions() {
        // 找到"个人博客 - 最新文章"部分
        const allSections = document.querySelectorAll('.content-section');
        let blogSectionElement = null;
        
        for (const section of allSections) {
            const h3 = section.querySelector('h3');
            if (h3 && h3.textContent.includes('个人博客 - 最新文章')) {
                blogSectionElement = section;
                break;
            }
        }

        if (!blogSectionElement) return;

        const cards = blogSectionElement.querySelectorAll('.content-card');
        
        // 为每个博客卡片加载描述
        for (const card of cards) {
            const link = card.querySelector('a');
            if (!link) continue;

            const href = link.getAttribute('href');
            if (!href) continue;

            const descElement = card.querySelector('p');
            if (!descElement || descElement.textContent.trim() !== '') {
                // 如果已经有内容，跳过
                continue;
            }

            try {
                const description = await fetchBlogDescription(href);
                if (description) {
                    // 截取前10个字符（10字以内），确保不超过10个字符
                    let shortDesc = description.substring(0, 10);
                    // 如果截取后刚好10个字符，保持原样；如果少于10个字符，也保持原样
                    descElement.textContent = shortDesc;
                }
            } catch (error) {
                console.error(`加载博客描述失败: ${href}`, error);
            }
        }
    }

    /**
     * 从博客页面获取描述信息
     */
    async function fetchBlogDescription(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) return null;

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 尝试获取meta description
            const metaDesc = doc.querySelector('meta[name="description"]');
            if (metaDesc) {
                const content = metaDesc.getAttribute('content');
                if (content && content.trim()) {
                    // 清理内容，去除多余的空格和分隔符
                    let desc = content.trim();
                    // 如果有分隔符（如|），取第一部分
                    if (desc.includes('|')) {
                        desc = desc.split('|')[0].trim();
                    }
                    return desc;
                }
            }

            // 如果meta description不存在，尝试从og:description获取
            const ogDesc = doc.querySelector('meta[property="og:description"]');
            if (ogDesc) {
                const content = ogDesc.getAttribute('content');
                if (content && content.trim()) {
                    return content.trim();
                }
            }

            return null;
        } catch (error) {
            console.error(`获取博客描述失败: ${url}`, error);
            return null;
        }
    }

    // ========== 自动转换尾注中的链接 ==========
    // 将博客文章尾注中的纯文本URL转换为可点击链接
    convertFootnotesLinks();
    
    /**
     * 转换博客文章中的尾注链接
     */
    function convertFootnotesLinks() {
        // 只在博客文章页面执行
        const postContent = document.querySelector('.post-content');
        if (!postContent) return;
        
        // 匹配尾注格式：以 [^数字]: 开头的段落
        const footnotePattern = /^\[\^\d+\]:/;
        // URL匹配：匹配 http:// 或 https:// 开头的完整URL
        const urlPattern = /(https?:\/\/[^\s\)，。；：！？<>"']+)/g;
        
        // 查找所有可能是尾注的段落
        const paragraphs = postContent.querySelectorAll('p');
        
        paragraphs.forEach(p => {
            const text = p.textContent.trim();
            
            // 检查是否是尾注格式
            if (footnotePattern.test(text)) {
                // 检查是否已经包含链接
                if (p.querySelector('a')) {
                    return; // 已经有链接，跳过
                }
                
                // 检查是否包含URL
                const matches = text.match(urlPattern);
                if (matches && matches.length > 0) {
                    let html = p.innerHTML;
                    
                    // 将每个URL转换为链接
                    matches.forEach(url => {
                        // 清理URL（移除末尾可能的标点）
                        let cleanUrl = url;
                        const trailingPunctuation = /[，。；：！？\)\]\s]+$/;
                        let punctuation = '';
                        
                        // 检查URL末尾是否有标点符号
                        if (trailingPunctuation.test(url)) {
                            const match = url.match(trailingPunctuation);
                            if (match) {
                                punctuation = match[0];
                                cleanUrl = url.replace(trailingPunctuation, '');
                            }
                        }
                        
                        // 判断是否为外部链接
                        try {
                            const urlObj = new URL(cleanUrl);
                            const isExternal = urlObj.hostname !== window.location.hostname;
                            const linkTag = `<a href="${cleanUrl}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="footnote-link">${cleanUrl}</a>`;
                            
                            // 替换原始文本中的URL（保留标点）
                            html = html.replace(url, linkTag + punctuation);
                        } catch (e) {
                            // URL格式错误，跳过
                            console.warn('Invalid URL format:', cleanUrl);
                        }
                    });
                    
                    p.innerHTML = html;
                }
            }
        });
    }
}); 