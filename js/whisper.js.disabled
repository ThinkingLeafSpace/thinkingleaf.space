/**
 * Whisper 功能 - 纯 JavaScript 实现
 * 一个优雅的、带有动画效果的提示组件，用于在文本中插入解释性内容
 * 
 * 使用方法：
 * <span class="whisper" data-content="提示内容">🌱</span>
 * 或
 * <span class="whisper" data-content="提示内容" data-emoji="💡">🌱</span>
 */

document.addEventListener('DOMContentLoaded', function() {
  initWhisper();
});

/**
 * 初始化所有 Whisper 元素
 */
function initWhisper() {
  const whisperElements = document.querySelectorAll('.whisper');
  
  whisperElements.forEach(element => {
    setupWhisper(element);
  });
}

/**
 * 为单个元素设置 Whisper 功能
 * @param {HTMLElement} element - 要设置的元素
 */
function setupWhisper(element) {
  const content = element.getAttribute('data-content');
  const emoji = element.getAttribute('data-emoji') || element.textContent.trim() || '🌱';
  
  if (!content) {
    console.warn('Whisper 元素缺少 data-content 属性');
    return;
  }
  
  // 设置图标
  element.textContent = emoji;
  element.setAttribute('aria-label', '悬停查看提示');
  element.setAttribute('tabindex', '0'); // 支持键盘导航
  
  // 创建提示卡片
  const card = document.createElement('div');
  card.className = 'whisper-card';
  card.textContent = content;
  card.setAttribute('role', 'tooltip');
  card.style.display = 'none';
  element.appendChild(card);
  
  // 鼠标悬停事件
  let hoverTimeout;
  element.addEventListener('mouseenter', function() {
    clearTimeout(hoverTimeout);
    showCard(card);
  });
  
  element.addEventListener('mouseleave', function() {
    hideCard(card);
  });
  
  // 键盘导航支持
  element.addEventListener('focus', function() {
    showCard(card);
  });
  
  element.addEventListener('blur', function() {
    hideCard(card);
  });
  
  // 点击事件（移动端）
  element.addEventListener('click', function(e) {
    e.preventDefault();
    if (card.style.display === 'none' || card.style.opacity === '0') {
      showCard(card);
    } else {
      hideCard(card);
    }
  });
}

/**
 * 显示提示卡片（带动画）
 * @param {HTMLElement} card - 提示卡片元素
 */
function showCard(card) {
  card.style.display = 'block';
  
  // 使用 requestAnimationFrame 确保显示后再应用动画
  requestAnimationFrame(() => {
    card.style.opacity = '0';
    // 保持 CSS 中的 translateX(-50%) 居中定位
    card.style.transform = 'translateX(-50%) translateY(10px) scale(0.95)';
    card.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
    
    requestAnimationFrame(() => {
      card.style.opacity = '1';
      // 保持 CSS 中的 translateX(-50%) 居中定位
      card.style.transform = 'translateX(-50%) translateY(0) scale(1)';
      card.style.transition = 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });
}

/**
 * 隐藏提示卡片（带动画）
 * @param {HTMLElement} card - 提示卡片元素
 */
function hideCard(card) {
  card.style.opacity = '0';
  // 保持 CSS 中的 translateX(-50%) 居中定位
  card.style.transform = 'translateX(-50%) translateY(10px) scale(0.95)';
  card.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
  
  setTimeout(() => {
    if (card.style.opacity === '0') {
      card.style.display = 'none';
    }
  }, 200);
}

/**
 * 手动初始化新的 Whisper 元素（用于动态添加的内容）
 * @param {HTMLElement|string} elementOrSelector - 元素或选择器
 */
function initWhisperElement(elementOrSelector) {
  const element = typeof elementOrSelector === 'string' 
    ? document.querySelector(elementOrSelector)
    : elementOrSelector;
  
  if (element && !element.classList.contains('whisper-initialized')) {
    element.classList.add('whisper-initialized');
    setupWhisper(element);
  }
}

// 导出函数供外部使用
window.Whisper = {
  init: initWhisper,
  initElement: initWhisperElement
};

