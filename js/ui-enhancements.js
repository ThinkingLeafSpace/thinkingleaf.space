/**
 * UI增强功能
 * 实现首字下沉效果、平滑滚动和图片遮罩效果
 */

document.addEventListener('DOMContentLoaded', function() {
    // 应用首字下沉效果
    applyDropCap();
    
    // 添加平滑滚动效果
    applySmoothScroll();
    
    // 添加图片遮罩效果
    applyImageMasks();
    
    // 添加渐入动画效果
    applyFadeInEffects();
});

/**
 * 应用首字下沉效果到文章内容
 */
function applyDropCap() {
    // 查找所有文章内容区域
    const articleContents = document.querySelectorAll('.article-content');
    
    articleContents.forEach(content => {
        // 查找第一段落
        const firstParagraph = content.querySelector('p:first-of-type');
        
        if (firstParagraph) {
            // 添加首字下沉类
            firstParagraph.classList.add('drop-cap');
        }
    });
}

/**
 * 应用平滑滚动效果到所有内部链接
 */
function applySmoothScroll() {
    // 获取所有内部链接
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 获取目标元素
            const targetId = this.getAttribute('href');
            
            // 确保目标存在
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // 平滑滚动到目标位置
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * 应用图片遮罩效果到英雄图片
 */
function applyImageMasks() {
    // 获取所有英雄图片
    const heroImages = document.querySelectorAll('.hero-image');
    
    heroImages.forEach(image => {
        // 检查是否已经应用了遮罩
        if (!image.classList.contains('masked')) {
            // 添加遮罩类
            image.classList.add('masked');
        }
    });
    
    // 为展品图片添加悬停效果
    const exhibitImages = document.querySelectorAll('.exhibit-item img');
    
    exhibitImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

/**
 * 应用渐入动画效果
 */
function applyFadeInEffects() {
    // 获取所有需要添加渐入效果的元素
    const fadeElements = document.querySelectorAll('.card, .post-item, .exhibit-item, .hero');
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当元素进入视口时
            if (entry.isIntersecting) {
                // 添加渐入类
                entry.target.classList.add('fade-in');
                // 停止观察该元素
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // 当元素有10%进入视口时触发
    });
    
    // 观察所有元素
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * 为文章内容添加引导线效果
 */
function addReadingGuides() {
    // 获取所有文章内容
    const articles = document.querySelectorAll('.article-content');
    
    articles.forEach(article => {
        // 获取所有段落
        const paragraphs = article.querySelectorAll('p');
        
        paragraphs.forEach(paragraph => {
            // 添加鼠标悬停效果
            paragraph.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(200, 70, 48, 0.03)';
                this.style.borderLeft = '2px solid var(--accent)';
                this.style.paddingLeft = '10px';
            });
            
            paragraph.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
                this.style.borderLeft = '';
                this.style.paddingLeft = '';
            });
        });
    });
}

// 在页面加载完成后调用引导线效果
document.addEventListener('DOMContentLoaded', function() {
    addReadingGuides();
}); 