document.addEventListener('DOMContentLoaded', function() {
  // 创建音乐播放器容器
  createMusicPlayer();
  
  // 加载FontAwesome (如果尚未加载)
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(fontAwesome);
  }
});

// 创建音乐播放器组件
function createMusicPlayer() {
  // 创建播放器容器
  const container = document.createElement('div');
  container.id = 'musicPlayerContainer';
  
  // 创建iframe
  const iframe = document.createElement('iframe');
  iframe.frameBorder = "no";
  iframe.border = "0";
  iframe.marginWidth = "0";
  iframe.marginHeight = "0";
  iframe.src = "//music.163.com/outchain/player?type=0&id=13671714168&auto=1&height=32";
  
  // 添加iframe到容器
  container.appendChild(iframe);
  document.body.appendChild(container);
  
  // 注：auto=1参数可能受到浏览器自动播放策略限制
  
  // 添加拖拽功能
  addDragFunctionality(container);
  
  // 添加动画结束事件监听器
  container.addEventListener('animationend', function() {
    this.classList.remove('shake-animation');
  });
}

// 添加拖拽功能
function addDragFunctionality(element) {
  let isDragging = false;
  let offsetX, offsetY;
  
  // 鼠标按下事件
  element.addEventListener('mousedown', function(e) {
    isDragging = true;
    
    // 添加拖动样式
    element.classList.add('dragging');
    element.classList.add('shake-animation');
    
    // 计算鼠标点击位置相对于元素的偏移量
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    
    // 阻止默认事件
    e.preventDefault();
  });
  
  // 鼠标移动事件
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    // 计算新位置
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;
    
    // 边界检测，防止元素被拖出视口
    const maxX = window.innerWidth - element.offsetWidth;
    const maxY = window.innerHeight - element.offsetHeight;
    
    newLeft = Math.max(0, Math.min(newLeft, maxX));
    newTop = Math.max(0, Math.min(newTop, maxY));
    
    // 更新元素位置
    element.style.left = newLeft + 'px';
    element.style.top = newTop + 'px';
    element.style.bottom = 'auto';
    element.style.right = 'auto';
  });
  
  // 鼠标释放事件
  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      element.classList.remove('dragging');
      element.classList.add('shake-animation');
    }
  });
  
  // 触摸开始事件（移动设备支持）
  element.addEventListener('touchstart', function(e) {
    isDragging = true;
    
    // 添加拖动样式
    element.classList.add('dragging');
    element.classList.add('shake-animation');
    
    // 计算触摸位置相对于元素的偏移量
    const touch = e.touches[0];
    offsetX = touch.clientX - element.getBoundingClientRect().left;
    offsetY = touch.clientY - element.getBoundingClientRect().top;
    
    // 阻止滚动
    e.preventDefault();
  });
  
  // 触摸移动事件
  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    
    // 计算新位置
    const touch = e.touches[0];
    let newLeft = touch.clientX - offsetX;
    let newTop = touch.clientY - offsetY;
    
    // 边界检测
    const maxX = window.innerWidth - element.offsetWidth;
    const maxY = window.innerHeight - element.offsetHeight;
    
    newLeft = Math.max(0, Math.min(newLeft, maxX));
    newTop = Math.max(0, Math.min(newTop, maxY));
    
    // 更新元素位置
    element.style.left = newLeft + 'px';
    element.style.top = newTop + 'px';
    element.style.bottom = 'auto';
    element.style.right = 'auto';
    
    // 阻止滚动
    e.preventDefault();
  });
  
  // 触摸结束事件
  document.addEventListener('touchend', function() {
    if (isDragging) {
      isDragging = false;
      element.classList.remove('dragging');
      element.classList.add('shake-animation');
    }
  });
}

/* 默认样式（移动端） */
.sidebar {
  /* 这里是移动端的样式，可以是其他宽度或自适应 */
  width: auto; /* 或其他适合移动端的宽度 */
}

/* 桌面端样式 - 只在屏幕宽度大于等于992px时应用 */
@media screen and (min-width: 992px) {
  .sidebar {
    width: 180px; /* 固定宽度 */
    /* 可能需要添加其他桌面端特定样式 */
  }
} 