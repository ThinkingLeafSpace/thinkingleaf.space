/**
 * 增强版懒加载脚本
 * 支持图片、iframe、背景图片等多种元素的懒加载
 * 提升页面加载速度和用户体验
 */

(function() {
  'use strict';

  // 配置选项
  const config = {
    // 预加载距离（像素）- 元素进入视口前多少距离开始加载
    rootMargin: '50px',
    // 触发阈值
    threshold: 0.01,
    // 占位符背景色
    placeholderBg: '#f2f2f2'
  };

  // 检查浏览器支持
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const supportsLazyLoading = 'loading' in HTMLImageElement.prototype;

  /**
   * 图片懒加载处理
   */
  function initImageLazyLoad() {
    // 处理使用 data-src 的图片（旧方式，用于不支持原生懒加载的浏览器）
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if (!lazyImages.length) return;

    if (supportsIntersectionObserver) {
      const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // 加载图片
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            
            // 移除 data-src 和 data-srcset，避免重复加载
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            
            // 图片加载完成后的处理
            img.onload = function() {
              img.classList.add('lazy-loaded');
              // 添加淡入动画
              img.style.opacity = '0';
              setTimeout(function() {
                img.style.transition = 'opacity 0.3s ease-in';
                img.style.opacity = '1';
              }, 10);
            };
            
            // 图片加载失败的处理
            img.onerror = function() {
              img.classList.add('lazy-error');
              img.alt = img.alt || '图片加载失败';
            };
            
            // 停止观察
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: config.rootMargin,
        threshold: config.threshold
      });
      
      // 观察所有懒加载图片
      lazyImages.forEach(function(img) {
        // 如果有 src 但很小（占位符），先隐藏
        if (img.src && img.src.includes('placeholder') || img.src.includes('data:image')) {
          img.style.opacity = '0';
        }
        imageObserver.observe(img);
      });
    } else {
      // 降级处理：延迟加载所有图片
      setTimeout(function() {
        lazyImages.forEach(function(img) {
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.classList.add('lazy-loaded');
        });
      }, 250);
    }
  }

  /**
   * iframe 懒加载处理
   */
  function initIframeLazyLoad() {
    const lazyIframes = document.querySelectorAll('iframe[data-src]');
    
    if (!lazyIframes.length) return;

    if (supportsIntersectionObserver) {
      const iframeObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
            iframe.classList.add('lazy-loaded');
            observer.unobserve(iframe);
          }
        });
      }, {
        rootMargin: config.rootMargin,
        threshold: config.threshold
      });
      
      lazyIframes.forEach(function(iframe) {
        iframeObserver.observe(iframe);
      });
    } else {
      // 降级处理
      setTimeout(function() {
        lazyIframes.forEach(function(iframe) {
          iframe.src = iframe.dataset.src;
          iframe.classList.add('lazy-loaded');
        });
      }, 500);
    }
  }

  /**
   * 背景图片懒加载处理
   */
  function initBackgroundImageLazyLoad() {
    const lazyBackgrounds = document.querySelectorAll('[data-bg]');
    
    if (!lazyBackgrounds.length) return;

    if (supportsIntersectionObserver) {
      const bgObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const element = entry.target;
            const bgImage = element.dataset.bg;
            
            // 创建图片对象预加载
            const img = new Image();
            img.onload = function() {
              element.style.backgroundImage = `url(${bgImage})`;
              element.classList.add('lazy-loaded');
              element.removeAttribute('data-bg');
            };
            img.src = bgImage;
            
            observer.unobserve(element);
          }
        });
      }, {
        rootMargin: config.rootMargin,
        threshold: config.threshold
      });
      
      lazyBackgrounds.forEach(function(element) {
        // 设置占位符背景
        element.style.backgroundColor = config.placeholderBg;
        bgObserver.observe(element);
      });
    }
  }

  /**
   * 长列表懒加载（用于博客列表等）
   */
  function initListLazyLoad() {
    const lazySections = document.querySelectorAll('[data-lazy-section]');
    
    if (!lazySections.length) return;

    if (supportsIntersectionObserver) {
      const sectionObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const section = entry.target;
            section.classList.add('lazy-loaded');
            observer.unobserve(section);
          }
        });
      }, {
        rootMargin: config.rootMargin,
        threshold: config.threshold
      });
      
      lazySections.forEach(function(section) {
        sectionObserver.observe(section);
      });
    }
  }

  /**
   * 为所有没有 loading 属性的图片添加懒加载支持
   * 确保所有图片都能享受懒加载
   */
  function enhanceNativeLazyLoading() {
    if (supportsLazyLoading) {
      // 为没有 loading 属性的图片添加 loading="lazy"
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(function(img) {
        // 跳过首屏关键图片（如logo、重要banner等）
        if (!img.classList.contains('critical-image') && 
            !img.closest('.hero') && 
            !img.closest('.header')) {
          img.loading = 'lazy';
        }
      });
    }
  }

  /**
   * 初始化所有懒加载功能
   */
  function initLazyLoading() {
    initImageLazyLoad();
    initIframeLazyLoad();
    initBackgroundImageLazyLoad();
    initListLazyLoad();
    enhanceNativeLazyLoading();
    
    // 监听动态添加的内容（如通过 AJAX 加载的内容）
    if (supportsIntersectionObserver) {
      const mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              // 检查新添加的图片
              if (node.tagName === 'IMG' && node.dataset.src) {
                initImageLazyLoad();
              }
              // 检查新添加的 iframe
              if (node.tagName === 'IFRAME' && node.dataset.src) {
                initIframeLazyLoad();
              }
              // 检查是否有懒加载的子元素
              const lazyElements = node.querySelectorAll && node.querySelectorAll('[data-src], [data-bg], [data-lazy-section]');
              if (lazyElements && lazyElements.length) {
                initLazyLoading();
              }
            }
          });
        });
      });
      
      // 观察整个文档的变化
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }
})();
