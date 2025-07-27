/**
 * 视差滚动效果
 * 实现页面元素随滚动产生不同速度的移动，创造深度感
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查是否支持IntersectionObserver和减少动画偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        console.log('用户偏好减少动画，视差效果已禁用');
        return; // 如果用户偏好减少动画，则不执行视差效果
    }

    // 创建视差叶子元素
    createParallaxLeaves();
    
    // 初始化视差滚动效果
    initParallaxEffect();

    /**
     * 创建视差叶子元素
     * 在页面上动态创建多个菩提叶形状，用于产生视差效果
     */
    function createParallaxLeaves() {
        const parallaxContainer = document.createElement('div');
        parallaxContainer.className = 'parallax-container';
        document.querySelector('.main-content').prepend(parallaxContainer);

        // 创建多个不同大小和位置的菩提叶
        const leafCount = 6;  // 叶子数量
        const sizes = ['small', 'medium', 'large'];
        const positions = [
            {top: '10%', left: '5%'}, 
            {top: '15%', right: '10%'}, 
            {top: '35%', left: '12%'}, 
            {top: '45%', right: '8%'},
            {top: '60%', left: '15%'},
            {top: '75%', right: '12%'}
        ];

        // 叶子SVG模板
        const leafSvgTemplate = `
        <svg class="parallax-leaf-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path class="parallax-leaf-path" d="M100,30 C60,10 10,50 10,100 C10,150 100,180 100,180 C100,180 190,150 190,100 C190,50 140,10 100,30" fill="none" stroke="var(--accent)" stroke-width="1.5" />
            <path class="parallax-leaf-vein" d="M100,30 L100,180" fill="none" stroke="var(--accent)" stroke-width="1" />
            <path class="parallax-leaf-vein" d="M100,60 C80,70 60,90 50,110" fill="none" stroke="var(--accent)" stroke-width="0.8" />
            <path class="parallax-leaf-vein" d="M100,60 C120,70 140,90 150,110" fill="none" stroke="var(--accent)" stroke-width="0.8" />
        </svg>`;

        // 创建叶子元素
        for (let i = 0; i < leafCount; i++) {
            const leaf = document.createElement('div');
            leaf.className = `parallax-element parallax-leaf ${sizes[i % sizes.length]}`;
            leaf.innerHTML = leafSvgTemplate;
            
            // 设置叶子位置
            leaf.style.top = positions[i].top;
            if (positions[i].left) leaf.style.left = positions[i].left;
            if (positions[i].right) leaf.style.right = positions[i].right;
            
            // 设置数据属性，用于控制视差效果的强度
            leaf.setAttribute('data-parallax-speed', (0.1 + (i * 0.05)).toFixed(2));
            leaf.setAttribute('data-parallax-direction', i % 2 === 0 ? '1' : '-1');
            
            // 添加到容器
            parallaxContainer.appendChild(leaf);
        }
    }

    /**
     * 初始化视差滚动效果
     * 监听滚动事件，根据滚动位置计算元素的位移
     */
    function initParallaxEffect() {
        // 获取所有需要应用视差效果的元素
        const parallaxElements = document.querySelectorAll('.parallax-element');
        const heroTitle = document.querySelector('.hero h2');
        const heroSubtitles = document.querySelectorAll('.hero p');
        const contentSections = document.querySelectorAll('.featured-categories, .about-me');

        // 添加hero区域的视差类
        if (document.querySelector('.hero')) {
            document.querySelector('.hero').classList.add('hero-parallax');
        }

        // 处理滚动事件
        window.addEventListener('scroll', function() {
            // 当前滚动位置
            const scrollY = window.scrollY;

            // 更新普通视差元素
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-parallax-speed')) || 0.2;
                const direction = parseFloat(element.getAttribute('data-parallax-direction')) || 1;
                const yOffset = scrollY * speed * direction;
                element.style.transform = `translateY(${yOffset}px)`;
            });

            // 更新hero标题的视差效果
            if (heroTitle) {
                heroTitle.style.transform = `translateY(${scrollY * 0.4}px)`;
            }

            // 更新hero副标题的视差效果
            heroSubtitles.forEach((subtitle, index) => {
                subtitle.style.transform = `translateY(${scrollY * (0.3 - index * 0.1)}px)`;
            });

            // 内容区块的对向视差效果
            contentSections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (inView) {
                    const scrollOffset = window.innerHeight - rect.top;
                    const parallaxOffset = scrollOffset * (index % 2 === 0 ? 0.05 : -0.05);
                    section.style.transform = `translateY(${parallaxOffset}px)`;
                }
            });
        });

        // 鼠标移动视差效果
        document.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // 鼠标位置转换为相对中心的偏移百分比
            const offsetX = (mouseX - windowWidth / 2) / windowWidth;
            const offsetY = (mouseY - windowHeight / 2) / windowHeight;
            
            // 为叶子元素添加鼠标移动视差效果
            parallaxElements.forEach(element => {
                const direction = parseFloat(element.getAttribute('data-parallax-direction')) || 1;
                const speed = parseFloat(element.getAttribute('data-parallax-speed')) || 0.2;
                
                // 计算偏移量
                const moveX = offsetX * 40 * direction * speed;
                const moveY = offsetY * 20 * direction * speed;
                
                // 应用变换，结合滚动视差效果
                const currentTransform = element.style.transform;
                const translateY = currentTransform.match(/translateY\(([^)]+)\)/) 
                    ? currentTransform.match(/translateY\(([^)]+)\)/)[1] 
                    : '0px';
                
                element.style.transform = `translateY(${translateY}) translateX(${moveX}px) rotate(${moveX * 0.2}deg)`;
            });
        });
    }
}); 