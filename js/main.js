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
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        
        // 如果在根路径，默认为主页
        if (currentPath === '/' || currentPath.endsWith('index.html')) {
            const homeLink = document.querySelector('.sidebar-nav a[href="index.html"]');
            if (homeLink) homeLink.classList.add('active');
            return;
        }
        
        // 否则，匹配当前路径
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPath.endsWith(linkPath)) {
                link.classList.add('active');
            }
        });
    }
    
    // 初始化活动导航链接
    setActiveNavLink();

    // 移动菜单切换
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // 点击外部时关闭侧边栏（移动端）
        document.addEventListener('click', (event) => {
            if (window.innerWidth <= 768) {
                const isClickInsideSidebar = sidebar.contains(event.target);
                const isClickOnMenuToggle = mobileMenuToggle.contains(event.target);
                
                if (!isClickInsideSidebar && !isClickOnMenuToggle && sidebar.classList.contains('show')) {
                    sidebar.classList.remove('show');
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });
        
        // 处理窗口大小变化
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }

    // 阅读进度指示器
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            progressBar.style.width = `${progress}%`;
        });
    }


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