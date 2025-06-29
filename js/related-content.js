/**
 * 相关内容推荐系统
 * 为每篇博客和newsletter添加最相关的两篇文章推荐
 */

// 文章数据库，包含所有博客文章和newsletter的信息
const articlesDatabase = [
    {
        id: "high-school-advice",
        title: "写给高一的学弟学妹",
        path: "../blogs/high-school-advice.html",
        date: "2019-06-07",
        type: "blog",
        description: "一位学长分享高中学习与生活的经验与建议",
        tags: ["高中", "学习", "经验分享", "成长"],
        related: ["22-years-old", "talking-to-19-yo-self"]
    },
    {
        id: "talking-to-19-yo-self",
        title: "23岁的最后一天，和19岁的自己对话",
        path: "../blogs/talking-to-19-yo-self.html",
        date: "2024-11-30",
        type: "blog",
        description: "收到过去的来信，与19岁的自己对话的感悟",
        tags: ["自我对话", "成长", "回顾", "青春"],
        related: ["high-school-advice", "24-things"]
    },
    {
        id: "22-years-old",
        title: "22岁时的内在平静法宝",
        path: "../blogs/22-years-old.html",
        date: "2022-09-01",
        type: "blog",
        description: "今天没那么内在平静？尝试下做这些吧！（我的22岁消除烦恼法宝！）",
        tags: ["内在平静", "心理健康", "生活方式", "自我提升"],
        related: ["meditation-journey", "life-management-system-99-things"]
    },
    {
        id: "meditation-journey",
        title: "半载观想小记：在大理、在内观禅修的路上",
        path: "../blogs/meditation-journey.html",
        date: "2024-07-04",
        type: "blog",
        description: "2024年，一段禅修之旅的思考与感悟",
        tags: ["禅修", "内观", "大理", "旅行", "心灵"],
        related: ["22-years-old", "24-things"]
    },
    {
        id: "life-management-system-99-things",
        title: "人生管理系统-让我开心的99件小事",
        path: "../blogs/life-management-system-99-things.html",
        date: "2022-08-24",
        type: "blog",
        description: "探索生活中的小确幸，发现让自己开心的99件小事",
        tags: ["生活", "幸福", "小确幸", "生活管理"],
        related: ["22-years-old", "24-things"]
    },
    {
        id: "24-things",
        title: "24岁学会的24件事",
        path: "../blogs/24-things.html",
        date: "2024-03-12",
        type: "blog",
        description: "关于生活、工作与个人成长的年度思考总结",
        tags: ["成长", "总结", "人生经验", "自我提升"],
        related: ["life-management-system-99-things", "talking-to-19-yo-self"]
    },
    {
        id: "creativity-thoughts",
        title: "我是如何看待创造的",
        path: "../blogs/creativity-thoughts.html",
        date: "2025-05-02",
        type: "blog",
        description: "关于创造的本质、意义与如何提升创造力的思考",
        tags: ["创造力", "思考", "艺术", "设计"],
        related: ["design-experiment", "life-in-weeks"]
    },
    {
        id: "design-experiment",
        title: "或许设计实验就是容易失败，对吗？",
        path: "../blogs/design-experiment.html",
        date: "2025-04-14",
        type: "blog",
        description: "2025年，在南京七家湾社区参与何志森老师的mapping工作坊的思考",
        tags: ["设计", "实验", "失败", "工作坊", "mapping"],
        related: ["creativity-thoughts", "study-work-life-balance"]
    },
    {
        id: "life-in-weeks",
        title: "人生周历：我的生命地图",
        path: "../blogs/life-in-weeks.html",
        date: "2025-05-25",
        type: "blog",
        description: "可视化展示我人生的每一周，时间快速流逝着",
        tags: ["生命", "时间管理", "可视化", "人生规划"],
        related: ["24-things", "life-management-system-99-things"]
    },
    {
        id: "study-work-life-balance",
        title: "寻找Study-Work-life Balance",
        path: "../newsletters/study-work-life-balance.html",
        date: "2024-05-15",
        type: "newsletter",
        description: "如何在学习、工作和生活之间找到平衡",
        tags: ["平衡", "时间管理", "生活方式", "工作"],
        related: ["life-management-system-99-things", "24-things"]
    }
];

// 获取当前页面的ID
function getCurrentPageId() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    const id = filename.replace('.html', '');
    return id;
}

// 从数据库中查找当前文章
function getCurrentArticle() {
    const currentId = getCurrentPageId();
    return articlesDatabase.find(article => article.id === currentId);
}

// 获取相关文章
function getRelatedArticles() {
    const currentArticle = getCurrentArticle();
    
    if (!currentArticle || !currentArticle.related) {
        return [];
    }
    
    return currentArticle.related.map(relatedId => {
        return articlesDatabase.find(article => article.id === relatedId);
    }).filter(article => article !== undefined);
}

// 创建相关文章HTML
function createRelatedArticlesHTML() {
    const relatedArticles = getRelatedArticles();
    
    if (relatedArticles.length === 0) {
        return '';
    }
    
    let html = `
    <div class="related-articles">
        <h3>你可能也喜欢</h3>
        <div class="related-articles-grid">
    `;
    
    relatedArticles.forEach(article => {
        html += `
            <a href="${article.path}" class="related-article-card">
                <h4>${article.title}</h4>
                <span class="date-tag">${article.date}</span>
                <p>${article.description}</p>
            </a>
        `;
    });
    
    html += `
        </div>
    </div>
    `;
    
    return html;
}

// 添加相关文章到页面
function addRelatedArticlesToPage() {
    const postNavigation = document.querySelector('.post-navigation');
    
    if (postNavigation) {
        const relatedArticlesHTML = createRelatedArticlesHTML();
        postNavigation.insertAdjacentHTML('beforebegin', relatedArticlesHTML);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    addRelatedArticlesToPage();
}); 