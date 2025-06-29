/**
 * 相关内容推荐系统 - 资源加载器
 * 此文件负责动态加载CSS并初始化模块
 */

// 加载CSS样式
function loadStyles() {
    if (document.querySelector('link[href*="modules/related-content/styles.css"]')) {
        return Promise.resolve(); // 样式已加载
    }

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '../modules/related-content/styles.css';
        link.onload = () => resolve();
        link.onerror = () => reject(new Error('无法加载相关内容样式'));
        document.head.appendChild(link);
    });
}

// 初始化模块
function initModule() {
    // 先加载样式，然后加载主模块
    loadStyles()
        .then(() => import('./index.js'))
        .catch(error => console.error('初始化相关内容模块失败:', error));
}

// 页面准备好后执行初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModule);
} else {
    initModule();
} 