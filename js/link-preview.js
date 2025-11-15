/**
 * 链接预览卡片功能
 * 为内部链接（跳转到其他子页面的链接）提供悬停预览功能
 */

class LinkPreview {
    constructor() {
        this.previewCard = null;
        this.currentLink = null;
        this.hoverTimeout = null;
        this.previewCache = new Map();
        this.init();
    }

    init() {
        // 创建预览卡片 DOM
        this.createPreviewCard();
        
        // 标记所有内部链接
        this.markInternalLinks();
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 创建预览卡片 DOM 元素
     */
    createPreviewCard() {
        this.previewCard = document.createElement('div');
        this.previewCard.className = 'link-preview-card';
        this.previewCard.setAttribute('role', 'tooltip');
        this.previewCard.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.previewCard);
    }

    /**
     * 标记所有内部链接
     */
    markInternalLinks() {
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // 判断是否为内部链接
            if (this.isInternalLink(href)) {
                link.setAttribute('data-internal-link', 'true');
            }
        });
    }

    /**
     * 判断链接是否为内部链接
     * @param {string} href - 链接地址
     * @returns {boolean}
     */
    isInternalLink(href) {
        if (!href) return false;
        
        // 排除以下情况：
        // 1. 锚点链接 (#)
        // 2. 外部链接 (http://, https://, //, mailto:, tel:, javascript:)
        // 3. 空链接
        
        if (href.startsWith('#') || 
            href.startsWith('javascript:') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            href === '' ||
            href === '#') {
            return false;
        }
        
        // 如果是完整 URL，检查是否为同域
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
            try {
                const linkUrl = new URL(href, window.location.origin);
                const currentUrl = new URL(window.location.href);
                // 只处理同域链接
                return linkUrl.origin === currentUrl.origin;
            } catch (e) {
                return false;
            }
        }
        
        // 相对路径链接视为内部链接
        return true;
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 检测是否为移动设备
        const isMobile = window.matchMedia('(max-width: 768px)').matches || 
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);
        
        if (isMobile) {
            // 移动端：点击触发预览
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[data-internal-link="true"]');
                if (link) {
                    // 如果预览已显示且是同一个链接，允许正常跳转
                    if (this.currentLink === link && this.previewCard.classList.contains('visible')) {
                        // 不阻止跳转，让链接正常工作
                        return;
                    }
                    
                    // 阻止默认跳转，显示预览
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 显示预览
                    this.currentLink = link;
                    this.showPreview(link, e);
                } else {
                    // 点击其他区域时隐藏预览
                    if (this.previewCard.classList.contains('visible') && 
                        !this.previewCard.contains(e.target)) {
                        this.hidePreview();
                    }
                }
            });
            
            // 移动端：点击预览卡片内的链接允许跳转
            this.previewCard.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.getAttribute('href')) {
                    // 允许跳转
                    window.location.href = link.getAttribute('href');
                }
            });
            
            // 移动端：点击预览卡片外部区域关闭
            document.addEventListener('touchstart', (e) => {
                if (this.previewCard.classList.contains('visible')) {
                    if (!this.previewCard.contains(e.target) && 
                        !e.target.closest('a[data-internal-link="true"]')) {
                        this.hidePreview();
                    }
                }
            });
        } else {
            // 桌面端：鼠标悬停触发预览
            document.addEventListener('mouseenter', (e) => {
                const link = e.target.closest('a[data-internal-link="true"]');
                if (link) {
                    this.handleLinkEnter(e, link);
                }
            }, true);

            document.addEventListener('mouseleave', (e) => {
                const link = e.target.closest('a[data-internal-link="true"]');
                if (link) {
                    this.handleLinkLeave(e, link);
                }
            }, true);

            // 鼠标移动时更新预览卡片位置
            document.addEventListener('mousemove', (e) => {
                if (this.currentLink && this.previewCard.classList.contains('visible')) {
                    this.updatePreviewPosition(e);
                }
            });

            // 点击链接时隐藏预览
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[data-internal-link="true"]');
                if (link) {
                    this.hidePreview();
                }
            });
        }
    }

    /**
     * 处理鼠标进入链接
     */
    handleLinkEnter(e, link) {
        this.currentLink = link;
        
        // 延迟显示预览（避免鼠标快速划过时频繁触发）
        this.hoverTimeout = setTimeout(() => {
            this.showPreview(link, e);
        }, 300);
    }

    /**
     * 处理鼠标离开链接
     */
    handleLinkLeave(e, link) {
        // 清除延迟显示
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        
        // 检查鼠标是否移动到预览卡片上
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && this.previewCard.contains(relatedTarget)) {
            // 鼠标移动到预览卡片上，保持显示
            return;
        }
        
        // 延迟隐藏（给用户时间移动到预览卡片）
        setTimeout(() => {
            // 再次检查鼠标位置
            const mouseOverLink = document.elementFromPoint(e.clientX, e.clientY);
            const mouseOverPreview = this.previewCard.contains(mouseOverLink);
            
            if (!mouseOverPreview && mouseOverLink !== link) {
                this.hidePreview();
            }
        }, 100);
    }

    /**
     * 显示预览卡片
     */
    async showPreview(link, event) {
        const href = link.getAttribute('href');
        if (!href) return;

        // 获取完整 URL
        const fullUrl = new URL(href, window.location.origin).href;
        
        // 检查缓存
        if (this.previewCache.has(fullUrl)) {
            const cachedData = this.previewCache.get(fullUrl);
            // 验证缓存的数据是否有效
            if (this.isValidPreviewData(cachedData)) {
                this.renderPreview(cachedData);
                // 等待DOM更新后再更新位置
                setTimeout(() => {
                    this.updatePreviewPosition(event);
                }, 0);
                this.previewCard.classList.add('visible');
                return;
            } else {
                // 缓存的数据无效，清除缓存
                this.previewCache.delete(fullUrl);
            }
        }

        // 显示加载状态
        this.previewCard.innerHTML = '<div class="link-preview-loading">加载预览</div>';
        this.previewCard.classList.add('visible');
        // 等待DOM更新后再更新位置
        setTimeout(() => {
            this.updatePreviewPosition(event);
        }, 0);

        try {
            // 获取页面预览信息
            const previewData = await this.fetchPreviewData(fullUrl);
            
            // 检查预览数据是否有效
            if (!this.isValidPreviewData(previewData)) {
                // 数据无效，直接隐藏预览卡片，不显示错误信息
                this.hidePreview();
                return;
            }
            
            // 缓存预览数据
            this.previewCache.set(fullUrl, previewData);
            
            // 渲染预览
            this.renderPreview(previewData);
            // 等待DOM更新后再更新位置
            setTimeout(() => {
                this.updatePreviewPosition(event);
            }, 0);
        } catch (error) {
            // 获取失败，直接隐藏预览卡片，不显示错误信息
            console.warn('Failed to fetch preview:', error);
            this.hidePreview();
        }
    }

    /**
     * 获取页面预览数据
     */
    async fetchPreviewData(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 提取预览信息
            const title = this.extractTitle(doc);
            const description = this.extractDescription(doc);
            const date = this.extractDate(doc);
            const type = this.extractType(url, doc);

            return {
                title,
                description,
                date,
                type,
                url
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * 提取页面标题
     */
    extractTitle(doc) {
        // 优先使用 og:title，然后是 title，最后是 h1
        const ogTitle = doc.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            return ogTitle.getAttribute('content');
        }
        
        const titleTag = doc.querySelector('title');
        if (titleTag) {
            return titleTag.textContent.replace(/\s*[-–—]\s*筑居思\s*$/, '').trim();
        }
        
        const h1 = doc.querySelector('h1, .post-title, .blog-header h1');
        if (h1) {
            return h1.textContent.trim();
        }
        
        return '无标题';
    }

    /**
     * 提取页面描述
     */
    extractDescription(doc) {
        // 优先使用 og:description，然后是 meta description
        const ogDesc = doc.querySelector('meta[property="og:description"]');
        if (ogDesc) {
            const desc = ogDesc.getAttribute('content');
            // 如果描述超过150字，截取前150字
            if (desc && desc.length > 150) {
                return desc.substring(0, 150) + '...';
            }
            return desc || '';
        }
        
        const metaDesc = doc.querySelector('meta[name="description"]');
        if (metaDesc) {
            const desc = metaDesc.getAttribute('content');
            // 如果描述超过150字，截取前150字
            if (desc && desc.length > 150) {
                return desc.substring(0, 150) + '...';
            }
            return desc || '';
        }
        
        // 尝试从内容中提取
        const content = doc.querySelector('.post-content, .article-content, .blog-body, main p');
        if (content) {
            const text = content.textContent.trim();
            // 确保提取150个字符（中文字符）
            if (text.length > 150) {
                return text.substring(0, 150) + '...';
            }
            return text;
        }
        
        return '暂无描述';
    }

    /**
     * 提取日期
     */
    extractDate(doc) {
        // 尝试从 meta 标签中提取
        const articleTime = doc.querySelector('meta[property="article:published_time"]');
        if (articleTime) {
            const date = new Date(articleTime.getAttribute('content'));
            return this.formatDate(date);
        }
        
        // 尝试从 time 标签中提取
        const timeTag = doc.querySelector('time[datetime]');
        if (timeTag) {
            const date = new Date(timeTag.getAttribute('datetime'));
            return this.formatDate(date);
        }
        
        // 尝试从 .post-meta, .blog-meta 中提取
        const meta = doc.querySelector('.post-meta, .blog-meta');
        if (meta) {
            const text = meta.textContent;
            const dateMatch = text.match(/\d{4}[年\-/]\d{1,2}[月\-/]\d{1,2}/);
            if (dateMatch) {
                return dateMatch[0];
            }
        }
        
        return null;
    }

    /**
     * 格式化日期
     */
    formatDate(date) {
        if (!date || isNaN(date.getTime())) return null;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 提取内容类型
     */
    extractType(url, doc) {
        if (url.includes('/blogs/') || url.includes('blogs.html')) {
            return '博客';
        } else if (url.includes('/exhibits/') || url.includes('cabinet.html')) {
            return '展品';
        } else if (url.includes('portfolio.html')) {
            return '作品集';
        } else if (url.includes('newsletter.html')) {
            return 'Newsletter';
        } else if (url.includes('index.html') || url === '/') {
            return '首页';
        }
        return '页面';
    }

    /**
     * 检查预览数据是否有效
     */
    isValidPreviewData(data) {
        if (!data) return false;
        
        // 必须有标题，且标题不能是"无标题"
        if (!data.title || data.title.trim() === '' || data.title === '无标题') {
            return false;
        }
        
        // 描述可以为空，但如果存在且只是"暂无描述"，则认为无效
        if (data.description && data.description.trim() === '暂无描述') {
            return false;
        }
        
        return true;
    }

    /**
     * 渲染预览卡片内容
     */
    renderPreview(data) {
        const { title, description, date, type } = data;
        
        let html = `
            <div class="link-preview-content">
                <div class="link-preview-title">${this.escapeHtml(title)}</div>
                ${description && description.trim() !== '' && description !== '暂无描述' 
                    ? `<div class="link-preview-description">${this.escapeHtml(description)}</div>` 
                    : ''}
                <div class="link-preview-meta">
                    ${date ? `<span class="link-preview-date">${date}</span>` : ''}
                    <span class="link-preview-type">${type}</span>
                </div>
            </div>
        `;
        
        this.previewCard.innerHTML = html;
    }

    /**
     * 更新预览卡片位置
     */
    updatePreviewPosition(event) {
        if (!this.previewCard || !this.currentLink) return;

        const rect = this.currentLink.getBoundingClientRect();
        const cardRect = this.previewCard.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const spacing = 12; // 卡片与链接的间距
        
        // 检测是否为移动设备
        const isMobile = window.matchMedia('(max-width: 768px)').matches || 
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);

        let top, left;
        
        if (isMobile) {
            // 移动端：居中显示在屏幕中央
            left = (viewportWidth - cardRect.width) / 2;
            top = (viewportHeight - cardRect.height) / 2;
            
            // 如果卡片高度超过视窗，则从顶部开始显示
            if (cardRect.height > viewportHeight - spacing * 2) {
                top = spacing;
            }
        } else {
            // 桌面端：显示在链接下方
            top = rect.bottom + spacing;
            left = rect.left + (rect.width / 2) - (cardRect.width / 2);
        }

        // 重置位置类
        this.previewCard.classList.remove('position-top', 'position-left', 'position-right');

        // 检查是否超出底部
        if (top + cardRect.height > viewportHeight) {
            top = rect.top - cardRect.height - spacing;
            this.previewCard.classList.add('position-top');
        }

        // 检查是否超出右侧
        if (left + cardRect.width > viewportWidth) {
            left = viewportWidth - cardRect.width - spacing;
            this.previewCard.classList.add('position-right');
        }

        // 检查是否超出左侧
        if (left < spacing) {
            left = spacing;
            this.previewCard.classList.add('position-left');
        }

        // 确保不超出顶部
        if (top < spacing) {
            top = isMobile ? spacing : rect.bottom + spacing;
        }

        this.previewCard.style.top = `${top}px`;
        this.previewCard.style.left = `${left}px`;
    }

    /**
     * 隐藏预览卡片
     */
    hidePreview() {
        if (this.previewCard) {
            this.previewCard.classList.remove('visible');
        }
        this.currentLink = null;
    }

    /**
     * HTML 转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化链接预览功能
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，避免影响页面加载性能
    setTimeout(() => {
        new LinkPreview();
    }, 500);
});
