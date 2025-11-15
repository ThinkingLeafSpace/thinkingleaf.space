/**
 * 博客关键词标签处理脚本
 * 将逗号分隔的关键词字符串转换为独立的标签卡片
 */

(function() {
    'use strict';
    
    /**
     * 初始化关键词标签
     */
    function initKeywordTags() {
        const keywordLists = document.querySelectorAll('.keywords-list');
        
        keywordLists.forEach(function(keywordList) {
            // 如果已经处理过，跳过
            if (keywordList.classList.contains('processed')) {
                return;
            }
            
            const keywordsText = keywordList.textContent.trim();
            if (!keywordsText) {
                return;
            }
            
            // 清空原有内容
            keywordList.textContent = '';
            
            // 分割关键词（支持中文逗号和英文逗号）
            const keywords = keywordsText
                .split(/[,，]/)
                .map(function(kw) {
                    return kw.trim();
                })
                .filter(function(kw) {
                    return kw.length > 0;
                });
            
            // 为每个关键词创建标签
            keywords.forEach(function(keyword) {
                const tag = document.createElement('span');
                tag.className = 'keyword-tag';
                tag.textContent = keyword;
                keywordList.appendChild(tag);
            });
            
            // 标记为已处理
            keywordList.classList.add('processed');
        });
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKeywordTags);
    } else {
        initKeywordTags();
    }
    
    // 如果使用动态加载内容，可以监听DOM变化
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function(mutations) {
            let shouldInit = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            // 检查是否添加了包含关键词列表的元素
                            if (node.querySelector && node.querySelector('.keywords-list')) {
                                shouldInit = true;
                            }
                            // 或者新添加的节点本身就是关键词列表
                            if (node.classList && node.classList.contains('keywords-list')) {
                                shouldInit = true;
                            }
                        }
                    });
                }
            });
            if (shouldInit) {
                initKeywordTags();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();

