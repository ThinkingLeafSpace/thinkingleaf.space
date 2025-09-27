// ---------------------------------- 
// 全局深色模式管理器 (Theme Manager)
// 统一管理网站深色模式的切换与存储
// ---------------------------------- 

document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  // 主题类型
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
  };
  
  // 首先检查系统偏好
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 然后检查本地存储中的主题设置（优先级更高）
  const savedTheme = localStorage.getItem('theme');
  
  // 应用主题
  function applyTheme(theme) {
    if (theme === THEMES.DARK) {
      document.body.classList.add('dark-theme');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
      localStorage.setItem('theme', THEMES.DARK);
    } else {
      document.body.classList.remove('dark-theme');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
      localStorage.setItem('theme', THEMES.LIGHT);
    }

    // 触发自定义事件，让其他脚本可以响应主题变化
    document.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: theme }
    }));
  }
  
  // 初始化主题
  function initTheme() {
    if (savedTheme === THEMES.DARK || (savedTheme === null && prefersDarkScheme.matches)) {
      applyTheme(THEMES.DARK);
    } else {
      applyTheme(THEMES.LIGHT);
    }
  }
  
  // 切换主题
  function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
      applyTheme(THEMES.LIGHT);
    } else {
      applyTheme(THEMES.DARK);
    }
  }
  
  // 监听系统主题变化
  prefersDarkScheme.addEventListener('change', function(event) {
    if (localStorage.getItem('theme') === null) {
      // 只有当用户没有明确设置主题时，才跟随系统变化
      applyTheme(event.matches ? THEMES.DARK : THEMES.LIGHT);
    }
  });
  
  // 绑定主题切换按钮事件
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // 初始化主题
  initTheme();
});
