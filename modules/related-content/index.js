/**
 * 相关内容推荐系统 - 主入口文件
 * 此文件是相关内容模块的入口点，使用延迟加载提高性能
 */

// 延迟加载相关内容模块
function lazyLoadRelatedContent() {
    // 检查页面是否已经完全加载
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // 延迟加载核心功能
        import('./core.js')
            .then(module => {
                // 页面完全加载后再显示相关内容
                window.requestIdleCallback 
                    ? window.requestIdleCallback(() => module.addRelatedArticlesToPage()) 
                    : setTimeout(() => module.addRelatedArticlesToPage(), 1000);
            })
            .catch(error => console.error('无法加载相关内容模块:', error));
    } else {
        // 如果页面尚未加载完成，等待DOMContentLoaded事件
        document.addEventListener('DOMContentLoaded', lazyLoadRelatedContent);
    }
}

// 初始化
lazyLoadRelatedContent(); 