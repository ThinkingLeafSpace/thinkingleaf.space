/**
 * 相关内容推荐系统 - 核心功能
 * 此文件包含查找和显示相关文章的核心功能
 */

import { articlesDatabase } from './database.js';

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

// 导出核心功能
export { addRelatedArticlesToPage }; 