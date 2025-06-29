/**
 * 标签系统 - 实现博客文章中的标签显示、点击弹窗和相关内容跳转功能
 * 
 * 功能:
 * 1. 将日期标签(date-tag)居左显示
 * 2. 自动提取文章中的关键词作为标签
 * 3. 点击标签显示相关内容弹窗
 * 4. 显示每个标签的文章数量
 */

// 标签数据库，记录每个标签下有多少篇文章
const tagDatabase = {
    "高中": ["high-school-advice"],
    "学习": ["high-school-advice", "design-experiment"],
    "经验分享": ["high-school-advice", "22-years-old"],
    "成长": ["high-school-advice", "talking-to-19-yo-self", "24-things"],
    "自我对话": ["talking-to-19-yo-self"],
    "回顾": ["talking-to-19-yo-self", "24-things"],
    "青春": ["talking-to-19-yo-self", "high-school-advice"],
    "内在平静": ["22-years-old", "meditation-journey"],
    "心理健康": ["22-years-old", "meditation-journey"],
    "生活方式": ["22-years-old", "life-management-system-99-things", "study-work-life-balance"],
    "自我提升": ["22-years-old", "24-things"],
    "禅修": ["meditation-journey"],
    "内观": ["meditation-journey"],
    "大理": ["meditation-journey"],
    "旅行": ["meditation-journey"],
    "心灵": ["meditation-journey", "22-years-old"],
    "生活": ["life-management-system-99-things", "24-things"],
    "幸福": ["life-management-system-99-things"],
    "小确幸": ["life-management-system-99-things"],
    "生活管理": ["life-management-system-99-things", "life-in-weeks"],
    "总结": ["24-things"],
    "人生经验": ["24-things", "talking-to-19-yo-self"],
    "创造力": ["creativity-thoughts"],
    "思考": ["creativity-thoughts", "design-experiment"],
    "艺术": ["creativity-thoughts"],
    "设计": ["creativity-thoughts", "design-experiment"],
    "实验": ["design-experiment"],
    "失败": ["design-experiment"],
    "工作坊": ["design-experiment"],
    "mapping": ["design-experiment"],
    "生命": ["life-in-weeks"],
    "时间管理": ["life-in-weeks", "study-work-life-balance"],
    "可视化": ["life-in-weeks"],
    "人生规划": ["life-in-weeks", "24-things"],
    "平衡": ["study-work-life-balance"],
    "工作": ["study-work-life-balance"]
};

// 获取文章信息的函数
function getArticleById(id) {
    return articlesDatabase.find(article => article.id === id);
}

// 获取当前页面的标签
function getCurrentPageTags() {
    const currentId = getCurrentPageId();
    const currentArticle = articlesDatabase.find(article => article.id === currentId);
    return currentArticle ? currentArticle.tags : [];
}

// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化标签系统
    initTagSystem();
});

/**
 * 初始化标签系统
 */
function initTagSystem() {
    // 1. 处理日期标签样式
    styleDateTags();
    
    // 2. 提取并创建文章标签
    extractAndCreateTags();
    
    // 3. 添加标签点击事件
    addTagClickEvents();
}

/**
 * 处理日期标签样式，确保居左显示
 */
function styleDateTags() {
    const dateTags = document.querySelectorAll('.date-tag');
    
    dateTags.forEach(tag => {
        // 添加必要的样式
        tag.style.display = 'inline-block';
        tag.style.marginRight = 'auto';
        tag.style.textAlign = 'left';
        tag.style.fontStyle = 'italic';
        tag.style.color = '#666';
    });
    
    // 调整包含日期标签的父元素样式
    const blogMeta = document.querySelectorAll('.blog-meta');
    blogMeta.forEach(meta => {
        meta.style.display = 'flex';
        meta.style.justifyContent = 'flex-start';
        meta.style.alignItems = 'center';
        meta.style.flexWrap = 'wrap';
        meta.style.marginBottom = '15px';
    });
}

/**
 * 从文章内容中提取关键词并创建标签
 */
function extractAndCreateTags() {
    // 获取文章内容
    const articleContent = document.querySelector('article');
    if (!articleContent) return;
    
    // 获取文章文本
    const articleText = articleContent.textContent;
    
    // 常见的中文停用词
    const stopWords = new Set([
        '的', '了', '和', '是', '在', '我', '有', '这', '个', '你', '们', '他', '她', '它', 
        '就', '要', '会', '到', '可以', '也', '很', '但是', '因为', '所以', '如果', '那么', 
        '这样', '那样', '只是', '而且', '并且', '或者', '不过', '然后', '还有', '一个', '一些', 
        '一样', '这个', '那个', '什么', '怎么', '为什么', '如何', '当然', '可能', '应该', '一直'
    ]);
    
    // 提取关键词（简单实现：提取3-10个字符的词组，排除停用词）
    const keywordRegex = /[\u4e00-\u9fa5]{2,10}/g;
    const matches = articleText.match(keywordRegex) || [];
    
    // 统计词频
    const wordFreq = {};
    matches.forEach(word => {
        if (!stopWords.has(word) && word.length >= 2) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });
    
    // 按词频排序
    const sortedWords = Object.keys(wordFreq).sort((a, b) => wordFreq[b] - wordFreq[a]);
    
    // 选择前5-8个关键词作为标签（根据文章长度调整）
    const contentLength = articleText.length;
    const tagCount = Math.min(
        Math.max(5, Math.floor(contentLength / 500)), // 每500字符一个标签，最少5个
        8 // 最多8个标签
    );
    
    const selectedTags = sortedWords.slice(0, tagCount);
    
    // 创建标签容器
    createTagContainer(selectedTags);
}

/**
 * 创建标签容器并添加标签
 * @param {Array} tags 标签数组
 */
function createTagContainer(tags) {
    if (!tags || tags.length === 0) return;
    
    // 检查是否已有标签容器
    let tagContainer = document.querySelector('.article-tags');
    
    // 如果没有，创建一个
    if (!tagContainer) {
        tagContainer = document.createElement('div');
        tagContainer.className = 'article-tags';
        tagContainer.style.display = 'flex';
        tagContainer.style.flexWrap = 'wrap';
        tagContainer.style.gap = '8px';
        tagContainer.style.margin = '20px 0';
        
        // 添加标签容器标题
        const tagTitle = document.createElement('span');
        tagTitle.textContent = '标签：';
        tagTitle.style.fontWeight = 'bold';
        tagTitle.style.marginRight = '10px';
        tagContainer.appendChild(tagTitle);
        
        // 将标签容器插入到合适的位置（文章开头或meta之后）
        const blogMeta = document.querySelector('.blog-meta');
        if (blogMeta) {
            blogMeta.parentNode.insertBefore(tagContainer, blogMeta.nextSibling);
        } else {
            const article = document.querySelector('article');
            if (article) {
                article.insertBefore(tagContainer, article.firstChild);
            }
        }
    }
    
    // 添加标签
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'article-tag';
        tagElement.dataset.tag = tag;
        tagElement.textContent = `${tag} (${getTagCount(tag)})`;
        tagElement.style.background = '#f0f0f0';
        tagElement.style.color = '#333';
        tagElement.style.padding = '3px 8px';
        tagElement.style.borderRadius = '4px';
        tagElement.style.fontSize = '0.9em';
        tagElement.style.cursor = 'pointer';
        tagElement.style.transition = 'background-color 0.2s';
        
        // 鼠标悬停效果
        tagElement.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#e0e0e0';
        });
        
        tagElement.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#f0f0f0';
        });
        
        tagContainer.appendChild(tagElement);
    });
}

/**
 * 获取标签在所有文章中的出现次数
 * 注意：这里使用模拟数据，实际应从数据库或预计算的JSON中获取
 * @param {string} tag 标签名
 * @returns {number} 标签出现次数
 */
function getTagCount(tag) {
    // 模拟数据：常见标签及其出现次数
    const tagCounts = {
        '设计': 5,
        '创意': 7,
        '思考': 9,
        '生活': 12,
        '工作': 6,
        '学习': 8,
        '阅读': 4,
        '写作': 3,
        '旅行': 2,
        '摄影': 3,
        '音乐': 2,
        '电影': 3,
        '艺术': 5,
        '科技': 4,
        '编程': 2,
        '健康': 3,
        '冥想': 2,
        '效率': 4,
        '时间管理': 3
    };
    
    // 返回标签计数，如果不存在则返回1
    return tagCounts[tag] || 1;
}

/**
 * 添加标签点击事件
 */
function addTagClickEvents() {
    document.addEventListener('click', function(event) {
        // 检查点击的是否是标签
        if (event.target.classList.contains('article-tag')) {
            const tag = event.target.dataset.tag;
            showTagModal(tag);
        }
        
        // 关闭模态框
        if (event.target.classList.contains('tag-modal-close') || 
            event.target.classList.contains('tag-modal-overlay')) {
            closeTagModal();
        }
    });
}

/**
 * 显示标签相关内容的模态框
 * @param {string} tag 标签名
 */
function showTagModal(tag) {
    // 关闭可能已经打开的模态框
    closeTagModal();
    
    // 创建模态框覆盖层
    const overlay = document.createElement('div');
    overlay.className = 'tag-modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    
    // 创建模态框内容
    const modal = document.createElement('div');
    modal.className = 'tag-modal';
    modal.style.backgroundColor = 'white';
    modal.style.borderRadius = '8px';
    modal.style.padding = '20px';
    modal.style.maxWidth = '600px';
    modal.style.width = '80%';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';
    modal.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    modal.style.position = 'relative';
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tag-modal-close';
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#666';
    modal.appendChild(closeBtn);
    
    // 添加标题
    const title = document.createElement('h3');
    title.textContent = `标签：${tag}`;
    title.style.marginTop = '0';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '10px';
    modal.appendChild(title);
    
    // 添加相关文章列表
    const relatedArticles = getRelatedArticles(tag);
    
    if (relatedArticles.length > 0) {
        const articleList = document.createElement('ul');
        articleList.style.paddingLeft = '20px';
        
        relatedArticles.forEach(article => {
            const listItem = document.createElement('li');
            listItem.style.margin = '10px 0';
            
            const articleLink = document.createElement('a');
            articleLink.href = article.url;
            articleLink.textContent = article.title;
            articleLink.style.color = '#0066cc';
            articleLink.style.textDecoration = 'none';
            
            listItem.appendChild(articleLink);
            
            // 添加文章日期
            if (article.date) {
                const dateSpan = document.createElement('span');
                dateSpan.textContent = ` (${article.date})`;
                dateSpan.style.color = '#666';
                dateSpan.style.fontSize = '0.9em';
                listItem.appendChild(dateSpan);
            }
            
            articleList.appendChild(listItem);
        });
        
        modal.appendChild(articleList);
    } else {
        const noResults = document.createElement('p');
        noResults.textContent = `没有找到与"${tag}"相关的文章。`;
        noResults.style.color = '#666';
        modal.appendChild(noResults);
    }
    
    // 将模态框添加到覆盖层
    overlay.appendChild(modal);
    
    // 将覆盖层添加到body
    document.body.appendChild(overlay);
    
    // 防止滚动
    document.body.style.overflow = 'hidden';
}

/**
 * 关闭标签模态框
 */
function closeTagModal() {
    const overlay = document.querySelector('.tag-modal-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
    }
}

/**
 * 获取与标签相关的文章
 * 注意：这里使用模拟数据，实际应从数据库或预计算的JSON中获取
 * @param {string} tag 标签名
 * @returns {Array} 相关文章数组
 */
function getRelatedArticles(tag) {
    // 模拟数据：相关文章列表
    const allArticles = [
        { 
            title: '冥想之旅：我的21天冥想实践', 
            url: '../blogs/2024-07-06-meditation-journey.html', 
            date: '2024年7月6日',
            tags: ['冥想', '健康', '生活', '习惯']
        },
        { 
            title: '24岁学会的24件事', 
            url: '../blogs/2024-11-10-24-things.html', 
            date: '2024年11月10日',
            tags: ['生活', '思考', '成长', '学习']
        },
        { 
            title: '与19岁的自己对话', 
            url: '../blogs/2024-11-13-talking-to-19-yo-self.html', 
            date: '2024年11月13日',
            tags: ['思考', '成长', '回顾', '建议']
        },
        { 
            title: '设计实验：如何通过实验提升设计能力', 
            url: '../blogs/2025-04-15-design-experiment.html', 
            date: '2025年4月15日',
            tags: ['设计', '创意', '学习', '方法']
        },
        { 
            title: '创意思考：如何培养创造性思维', 
            url: '../blogs/2025-05-03-creativity-thoughts.html', 
            date: '2025年5月3日',
            tags: ['创意', '思考', '方法', '灵感']
        },
        { 
            title: '生命周计划：以周为单位规划人生', 
            url: '../blogs/2025-05-25-life-in-weeks.html', 
            date: '2025年5月25日',
            tags: ['生活', '时间管理', '规划', '效率']
        },
        { 
            title: '22岁的感悟与思考', 
            url: '../blogs/2022-09-01-22-years-old.html', 
            date: '2022年9月1日',
            tags: ['思考', '生活', '成长', '回顾']
        },
        { 
            title: '生活管理系统：99件小事提升生活品质', 
            url: '../blogs/2022-08-24-life-management-system-99-things.html', 
            date: '2022年8月24日',
            tags: ['生活', '效率', '习惯', '管理']
        },
        { 
            title: '高中生活建议', 
            url: '../blogs/2019-06-07-high-school-advice.html', 
            date: '2019年6月7日',
            tags: ['学习', '建议', '高中', '经验']
        }
    ];
    
    // 尝试模糊匹配标签
    return allArticles.filter(article => {
        // 检查文章标签是否包含搜索的标签
        if (article.tags && article.tags.includes(tag)) {
            return true;
        }
        
        // 检查文章标题是否包含标签
        if (article.title.includes(tag)) {
            return true;
        }
        
        // 模糊匹配：检查标签是否是文章标签的子字符串
        if (article.tags && article.tags.some(t => t.includes(tag) || tag.includes(t))) {
            return true;
        }
        
        return false;
    });
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initTagSystem,
        styleDateTags,
        extractAndCreateTags,
        showTagModal
    };
} 