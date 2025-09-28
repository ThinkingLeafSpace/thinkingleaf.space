/**
 * 图片懒加载增强脚本
 * 为不支持原生懒加载的浏览器提供支持
 */

document.addEventListener('DOMContentLoaded', function() {
  // 检查浏览器是否支持Intersection Observer API
  if ('IntersectionObserver' in window) {
    // 获取所有带有data-src属性的图片
    const lazyImages = [].slice.call(document.querySelectorAll('img[data-src]'));
    
    // 创建观察器实例
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        // 当图片进入视口
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          // 将data-src的值设置为src
          lazyImage.src = lazyImage.dataset.src;
          
          // 如果有data-srcset，也设置srcset
          if (lazyImage.dataset.srcset) {
            lazyImage.srcset = lazyImage.dataset.srcset;
          }
          
          // 图片加载完成后添加loaded类，可用于淡入效果
          lazyImage.onload = function() {
            lazyImage.classList.add('loaded');
          };
          
          // 停止观察这个图片
          observer.unobserve(lazyImage);
        }
      });
    });
    
    // 开始观察每一张图片
    lazyImages.forEach(function(lazyImage) {
      imageObserver.observe(lazyImage);
    });
  } else {
    // 降级处理：为不支持IntersectionObserver的浏览器提供基本的懒加载
    // 这个实现会在页面加载后延迟加载所有图片，不是真正的按需加载
    const lazyImages = [].slice.call(document.querySelectorAll('img[data-src]'));
    
    setTimeout(function() {
      lazyImages.forEach(function(lazyImage) {
        lazyImage.src = lazyImage.dataset.src;
        if (lazyImage.dataset.srcset) {
          lazyImage.srcset = lazyImage.dataset.srcset;
        }
      });
    }, 250);
  }
});
