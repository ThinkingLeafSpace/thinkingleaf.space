/**
 * 菩提叶滚动驱动动画
 * 实现禅意与自然的流动感
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查是否支持IntersectionObserver和减少动画偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        console.log('用户偏好减少动画，动画已禁用');
        return; // 如果用户偏好减少动画，则不执行动画
    }

    // 获取菩提叶元素
    const bodhiLeaf = document.querySelector('.bodhi-leaf');
    const bodhiLeafPath = document.querySelector('.bodhi-leaf-path');
    const bodhiLeafVeins = document.querySelectorAll('.bodhi-leaf-vein');
    
    if (!bodhiLeaf || !bodhiLeafPath) return;

    // 初始化滚动监听
    initScrollAnimation();

    /**
     * 初始化滚动驱动动画
     */
    function initScrollAnimation() {
        // 创建一个IntersectionObserver来检测页面滚动
        const options = {
            root: null, // 使用视口作为根
            rootMargin: '0px',
            threshold: 0.1 // 当目标元素有10%进入视口时触发
        };

        // 创建观察器
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // 当hero部分进入视口时
                if (entry.isIntersecting) {
                    // 开始绘制菩提叶轮廓
                    setTimeout(() => {
                        bodhiLeafPath.classList.add('draw-leaf-path');
                        
                        // 延迟绘制主脉
                        setTimeout(() => {
                            // 先绘制主脉（第一条叶脉）
                            if (bodhiLeafVeins[0]) {
                                bodhiLeafVeins[0].classList.add('draw-leaf-vein');
                            }
                            
                            // 然后绘制其他叶脉，左右交替
                            setTimeout(() => {
                                // 按顺序绘制其余叶脉，交错效果
                                for (let i = 1; i < bodhiLeafVeins.length; i++) {
                                    ((index) => {
                                        setTimeout(() => {
                                            bodhiLeafVeins[index].classList.add('draw-leaf-vein');
                                        }, (index - 1) * 150); // 每条叶脉间隔150ms，比之前更快
                                    })(i);
                                }
                                
                                // 所有叶脉绘制完成后，开始飘动动画
                                const veinsDelay = (bodhiLeafVeins.length - 1) * 150;
                                setTimeout(() => {
                                    bodhiLeaf.classList.add('animate-leaf');
                                }, veinsDelay + 300); // 等待所有叶脉绘制完成后再等300ms
                            }, 400);
                        }, 600); // 等待叶子轮廓绘制更久一些
                    }, 300);
                    
                    // 一旦触发，不再需要观察
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // 开始观察hero部分
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            observer.observe(heroSection);
        }
    }

    /**
     * 滚动进度控制
     * 随着页面滚动，控制菩提叶的位置和旋转
     */
    function handleScroll() {
        // 获取页面滚动百分比
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = scrollTop / scrollHeight;

        // 如果页面已经开始滚动，确保菩提叶可见
        if (scrollTop > 100 && !bodhiLeaf.classList.contains('animate-leaf')) {
            // 立即开始绘制菩提叶轮廓
            bodhiLeafPath.classList.add('draw-leaf-path');
            
            // 延迟绘制叶脉
            setTimeout(() => {
                // 先绘制主脉
                if (bodhiLeafVeins[0]) {
                    bodhiLeafVeins[0].classList.add('draw-leaf-vein');
                }
                
                // 然后绘制其他叶脉
                setTimeout(() => {
                    // 绘制剩余叶脉
                    for (let i = 1; i < bodhiLeafVeins.length; i++) {
                        ((index) => {
                            setTimeout(() => {
                                bodhiLeafVeins[index].classList.add('draw-leaf-vein');
                            }, (index - 1) * 150);
                        })(i);
                    }
                    
                    // 开始飘动动画
                    setTimeout(() => {
                        bodhiLeaf.classList.add('animate-leaf');
                    }, (bodhiLeafVeins.length - 1) * 150 + 300);
                }, 400);
            }, 600);
        }
    }

    // 添加滚动事件监听
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 初始检查，以防页面已经滚动
    handleScroll();
}); 