// ---------------------------------- 
// 全局深色模式管理器 (Theme Manager)
// 统一管理网站深色模式的切换与存储
// ---------------------------------- 

document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  const bodyEl = document.body;
  
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

  // ---------------------------
  // Emotion (data-emotion) Manager
  // ---------------------------
  const EMOTIONS = [
    'passion',       // 热情
    'serenity',      // 平静
    'joy',           // 欢愉
    'contemplation', // 沉思
    'growth',        // 生长
    'wander',        // 游历
    'transcend'      // 超越（品牌朱红）
  ];

  function applyEmotion(emotion) {
    if (!emotion || emotion === 'none') {
      delete bodyEl.dataset.emotion;
      localStorage.removeItem('emotion');
      document.dispatchEvent(new CustomEvent('emotionChanged', { detail: { emotion: null } }));
      return;
    }
    bodyEl.setAttribute('data-emotion', emotion);
    localStorage.setItem('emotion', emotion);
    document.dispatchEvent(new CustomEvent('emotionChanged', { detail: { emotion } }));
  }

  function initEmotion() {
    const savedEmotion = localStorage.getItem('emotion');
    if (savedEmotion && EMOTIONS.includes(savedEmotion)) {
      applyEmotion(savedEmotion);
    }
  }

  // Lightweight on-page selector for quick preview (non-invasive)
  function mountEmotionSwitcher() {
    // Avoid duplicating on pages that might already provide their own UI
    if (document.getElementById('emotion-switcher')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'emotion-switcher';
    wrapper.setAttribute('aria-label', '切换情绪主题');
    Object.assign(wrapper.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      zIndex: '1000',
      background: 'rgba(255,255,255,0.8)',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '10px',
      padding: '6px 8px',
      backdropFilter: 'saturate(180%) blur(8px)'
    });

    // Dark theme adjustment
    const updateWrapperTheme = () => {
      const isDark = document.body.classList.contains('dark-theme');
      wrapper.style.background = isDark ? 'rgba(30,30,30,0.7)' : 'rgba(255,255,255,0.8)';
      wrapper.style.border = isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)';
      select.style.color = isDark ? '#EDEDED' : '#222';
    };

    const select = document.createElement('select');
    select.title = 'Emotion Theme';
    select.ariaLabel = 'Emotion Theme';
    Object.assign(select.style, {
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      padding: '6px 28px 6px 10px',
      borderRadius: '8px',
      border: '1px solid rgba(0,0,0,0.15)',
      background: 'transparent',
      fontSize: '12px'
    });

    const emotionsWithNone = ['none', ...EMOTIONS];
    emotionsWithNone.forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key === 'none' ? '🎨 无' : key;
      select.appendChild(opt);
    });

    const savedEmotion = localStorage.getItem('emotion');
    if (savedEmotion && EMOTIONS.includes(savedEmotion)) {
      select.value = savedEmotion;
    } else {
      select.value = 'none';
    }

    select.addEventListener('change', () => applyEmotion(select.value));

    // Small caret icon
    const caret = document.createElement('span');
    Object.assign(caret.style, {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      fontSize: '10px',
      color: 'currentColor'
    });
    caret.textContent = '▾';

    wrapper.style.position = 'fixed';
    wrapper.style.display = 'inline-block';
    wrapper.style.minWidth = '120px';
    wrapper.style.lineHeight = '1';
    wrapper.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';

    wrapper.appendChild(select);
    wrapper.appendChild(caret);
    document.body.appendChild(wrapper);

    updateWrapperTheme();
    document.addEventListener('themeChanged', updateWrapperTheme);
  }

  initEmotion();
  mountEmotionSwitcher();
});
