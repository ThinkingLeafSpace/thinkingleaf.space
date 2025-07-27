/**
 * 禅意交互设计原则 - JavaScript实现
 * 核心交互哲学: "静默邀请，而非强行打扰"
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有交互效果
    initReadingProgressBar();
    initAnimateOnScroll();
    initImageBlurLoad();
    initFooterQuotes();
    initReadingReminder();
    initCommentHighlight();
});

/**
 * 1. 阅读进度条
 * 随着页面滚动，顶部出现一条朱红色细线，从左至右填充
 */
function initReadingProgressBar() {
    // 检查是否是文章页面
    if (!document.querySelector('article')) return;
    
    // 创建进度条容器和进度条
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
    
    // 监听滚动事件，更新进度条
    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.scrollY;
        
        const width = (scrollTop / documentHeight) * 100;
        progressBar.style.width = width + '%';
    });
}

/**
 * 2. 元素进入视窗动画
 * 当页面向下滚动，关键元素在进入视窗时有细微的浮现效果
 */
function initAnimateOnScroll() {
    // 选择需要动画的元素
    const animatedElements = document.querySelectorAll('h1, h2, h3, blockquote, .featured-card, .portfolio-item, .newsletter-item');
    
    // 为每个元素添加初始类
    animatedElements.forEach(element => {
        element.classList.add('animate-on-scroll');
    });
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 只触发一次
            }
        });
    }, {
        threshold: 0.1, // 当元素10%进入视窗时触发
        rootMargin: '0px 0px -50px 0px' // 稍微提前触发
    });
    
    // 观察每个元素
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * 3. 图片加载效果
 * 图片从模糊到清晰的加载效果
 */
function initImageBlurLoad() {
    const images = document.querySelectorAll('img:not(.comment-avatar):not(.logo-image)');
    
    images.forEach(img => {
        // 添加模糊类
        img.classList.add('blur-load');
        
        // 图片加载完成后移除模糊效果
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });
}

/**
 * 4. 页脚随机问候语
 * 每次刷新页面，页脚会随机出现一句充满哲思或略带调皮的话
 */
function initFooterQuotes() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    const quotes = [
        "山高水长，与君同行。",
        "一花一世界，一叶一菩提。",
        "天地有大美而不言。",
        "不是在此山中，就是在去此山的路上。",
        "无心插柳柳成荫，有心栽花花不发。",
        "明月松间照，清泉石上流。",
        "云深不知处，唯有白鹭飞。",
        "不以物喜，不以己悲。",
        "千江有水千江月，万里无云万里天。",
        "花开堪折直须折，莫待无花空折枝。",
        "夜深了，愿这里的文字能给你带来片刻的安宁。",
        "又见面了，朋友。继续我们的思考之旅。"
    ];
    
    // 检查是否为回访用户
    const isReturningUser = localStorage.getItem('visited');
    
    // 选择问候语
    let quote;
    if (isReturningUser && Math.random() < 0.33) {
        // 33%的概率显示回访问候语
        const returningQuotes = quotes.slice(-2); // 最后两条是回访问候语
        quote = returningQuotes[Math.floor(Math.random() * returningQuotes.length)];
    } else {
        // 随机选择一条普通问候语
        const regularQuotes = quotes.slice(0, -2); // 除了最后两条
        quote = regularQuotes[Math.floor(Math.random() * regularQuotes.length)];
    }
    
    // 创建问候语元素
    const quoteElement = document.createElement('p');
    quoteElement.className = 'footer-quote';
    quoteElement.textContent = quote;
    
    // 添加到页脚
    const footerContent = footer.querySelector('.footer-content') || footer;
    footerContent.appendChild(quoteElement);
    
    // 标记为已访问
    localStorage.setItem('visited', 'true');
    
    // 检查是否为夜间访问
    const currentHour = new Date().getHours();
    if (currentHour >= 1 && currentHour <= 4) {
        quoteElement.textContent = "夜深了，愿这里的文字能给你带来片刻的安宁。";
    }
}

/**
 * 5. 阅读进度记忆
 * 如果一篇文章阅读超过一半后离开，下次返回该文章时提供继续阅读的选项
 */
function initReadingReminder() {
    // 检查是否是文章页面
    const article = document.querySelector('article');
    if (!article) return;
    
    const articleId = window.location.pathname;
    
    // 监听滚动事件，记录阅读进度
    window.addEventListener('scroll', debounce(function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const readingProgress = (scrollTop + windowHeight) / documentHeight;
        
        // 如果阅读进度超过50%，保存进度
        if (readingProgress > 0.5) {
            const readingData = {
                scrollPosition: scrollTop,
                timestamp: Date.now()
            };
            localStorage.setItem('reading_' + articleId, JSON.stringify(readingData));
        }
    }, 1000));
    
    // 检查是否有保存的阅读进度
    const savedReadingData = localStorage.getItem('reading_' + articleId);
    if (savedReadingData) {
        const readingData = JSON.parse(savedReadingData);
        const currentTime = Date.now();
        const hoursSinceLastRead = (currentTime - readingData.timestamp) / (1000 * 60 * 60);
        
        // 如果上次阅读时间在24小时内，显示提醒
        if (hoursSinceLastRead < 24) {
            const reminderElement = document.createElement('div');
            reminderElement.className = 'reading-reminder';
            
            const reminderText = document.createElement('span');
            reminderText.className = 'reading-reminder-text';
            reminderText.textContent = '上次您读到这里，需要继续吗？';
            
            const reminderLink = document.createElement('a');
            reminderLink.className = 'reading-reminder-link';
            reminderLink.textContent = '继续阅读';
            reminderLink.href = '#';
            reminderLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: readingData.scrollPosition,
                    behavior: 'smooth'
                });
                
                // 淡出提醒
                setTimeout(() => {
                    reminderElement.style.opacity = '0';
                    setTimeout(() => {
                        reminderElement.remove();
                    }, 500);
                }, 1000);
            });
            
            reminderElement.appendChild(reminderText);
            reminderElement.appendChild(reminderLink);
            
            // 插入到文章开头
            article.insertBefore(reminderElement, article.firstChild);
        }
    }
}

/**
 * 6. 评论高亮效果
 * 提交评论后，自己刚发布的评论卡片会有一个短暂的高亮边框
 */
function initCommentHighlight() {
    // 监听评论表单提交
    const commentForm = document.querySelector('.comment-form');
    if (!commentForm) return;
    
    commentForm.addEventListener('submit', function(e) {
        // 这里不阻止默认提交，假设评论会通过AJAX提交
        // e.preventDefault();
        
        // 存储评论ID，用于后续标记
        const commentId = Date.now().toString();
        localStorage.setItem('last_comment_id', commentId);
    });
    
    // 检查页面加载后是否有新评论需要高亮
    document.addEventListener('DOMContentLoaded', function() {
        const lastCommentId = localStorage.getItem('last_comment_id');
        if (lastCommentId) {
            // 这里假设评论已经添加到DOM中，并且有一个data-id属性
            // 实际实现可能需要根据后端返回的评论ID来查找
            const newComment = document.querySelector(`.comment-card[data-id="${lastCommentId}"]`);
            if (newComment) {
                newComment.classList.add('own-comment', 'new');
                // 清除存储的ID，避免重复高亮
                localStorage.removeItem('last_comment_id');
            }
        }
    });
}

/**
 * 工具函数：防抖
 * 用于减少函数调用频率
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * 7. Logo微交互
 * 当鼠标悬停在Logo上时，花瓣会极其缓慢地、优雅地舒展或旋转一度
 * 这部分已经在CSS中实现，这里只需确保Logo有正确的类名
 */
function initLogoInteraction() {
    const logo = document.querySelector('.sidebar-logo img, header .logo img');
    if (logo) {
        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';
        logo.parentNode.insertBefore(logoContainer, logo);
        logoContainer.appendChild(logo);
        logo.classList.add('logo-image');
    }
}

/**
 * 8. 彩蛋 - Logo三击效果
 * 在Logo上快速点击三次，触发一个小动画
 */
function initLogoEasterEgg() {
    const logo = document.querySelector('.logo-container');
    if (!logo) return;
    
    let clickCount = 0;
    let clickTimer;
    
    logo.addEventListener('click', function() {
        clickCount++;
        
        // 重置计时器
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 500); // 500ms内完成三次点击
        
        // 检查是否达到三次点击
        if (clickCount === 3) {
            triggerLogoAnimation();
            clickCount = 0;
        }
    });
    
    function triggerLogoAnimation() {
        // 创建水墨动画元素
        const inkDrop = document.createElement('div');
        inkDrop.className = 'ink-drop';
        logo.appendChild(inkDrop);
        
        // 添加动画类
        setTimeout(() => {
            inkDrop.classList.add('animate');
            
            // 动画结束后移除元素
            setTimeout(() => {
                inkDrop.remove();
            }, 3000);
        }, 10);
    }
    
    // 添加水墨动画样式
    const style = document.createElement('style');
    style.textContent = `
        .logo-container {
            position: relative;
            overflow: visible;
        }
        
        .ink-drop {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background-color: var(--accent);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            z-index: 1000;
        }
        
        .ink-drop.animate {
            animation: ink-bloom 3s ease-out forwards;
        }
        
        @keyframes ink-bloom {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.8;
                border-radius: 50%;
            }
            20% {
                opacity: 0.6;
            }
            100% {
                transform: translate(-50%, -50%) scale(20);
                opacity: 0;
                border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
            }
        }
    `;
    document.head.appendChild(style);
}

// 初始化Logo相关交互
initLogoInteraction();
initLogoEasterEgg(); 