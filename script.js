// ---------------------------------- 
// 博客的呼吸与心跳 (The Breath & The Heartbeat)
// 为静态的页面注入一丝生命的温度
// ---------------------------------- 

document.addEventListener('DOMContentLoaded', function() {
  // 阅读进度指示器
  window.addEventListener('scroll', function() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('reading-progress').style.width = scrolled + '%';
  });

  // 自动生成目录
  const articleBody = document.querySelector('.article-body');
  const tocList = document.getElementById('toc-list');
  
  if (articleBody && tocList) {
    const headings = articleBody.querySelectorAll('h2, h3, h4');
    
    if (headings.length > 0) {
      headings.forEach(function(heading, index) {
        // 如果标题没有 id，为其添加一个
        if (!heading.id) {
          heading.id = 'heading-' + index;
        }
        
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        
        // 根据标题级别添加缩进
        if (heading.tagName === 'H3') {
          listItem.style.marginLeft = '20px';
        } else if (heading.tagName === 'H4') {
          listItem.style.marginLeft = '40px';
        }
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
      });
    } else {
      // 如果没有找到标题，隐藏目录
      document.getElementById('toc').style.display = 'none';
    }
  }
  
  // 图片延迟加载
  const lazyImages = document.querySelectorAll('.lazy-image');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  } else {
    // 兼容不支持 IntersectionObserver 的浏览器
    lazyImages.forEach(function(img) {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }
}); 