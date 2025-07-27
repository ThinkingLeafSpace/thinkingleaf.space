document.addEventListener('DOMContentLoaded', () => {
    // 主题切换功能
    const themeToggle = document.getElementById('theme-toggle');
    
    // 如果找到了主题切换按钮，则设置其功能
    if (themeToggle) {
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        
        // 检查本地存储中的主题设置
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (sunIcon && moonIcon) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            }
        }
        
        // 切换主题
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            // 切换图标
            if (sunIcon && moonIcon) {
                if (document.body.classList.contains('dark-theme')) {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                    localStorage.setItem('theme', 'dark');
                } else {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                    localStorage.setItem('theme', 'light');
                }
            } else {
                // 如果没有找到图标，只切换主题类
                if (document.body.classList.contains('dark-theme')) {
                    localStorage.setItem('theme', 'dark');
                } else {
                    localStorage.setItem('theme', 'light');
                }
            }
        });
    } else {
        // 如果页面上没有主题切换按钮，则创建一个
        createThemeToggleButton();
    }
    
    // 添加平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 根据当前页面高亮导航链接
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        
        // 如果在根路径，默认为主页
        if (currentPath === '/' || currentPath.endsWith('index.html')) {
            const homeLink = document.querySelector('.sidebar-nav a[href="index.html"]');
            if (homeLink) homeLink.classList.add('active');
            return;
        }
        
        // 否则，匹配当前路径
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPath.endsWith(linkPath)) {
                link.classList.add('active');
            }
        });
    }
    
    // 初始化活动导航链接
    setActiveNavLink();

    // 移动菜单切换
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // 点击外部时关闭侧边栏（移动端）
        document.addEventListener('click', (event) => {
            if (window.innerWidth <= 768) {
                const isClickInsideSidebar = sidebar.contains(event.target);
                const isClickOnMenuToggle = mobileMenuToggle.contains(event.target);
                
                if (!isClickInsideSidebar && !isClickOnMenuToggle && sidebar.classList.contains('show')) {
                    sidebar.classList.remove('show');
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });
        
        // 处理窗口大小变化
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }

    // 阅读进度指示器
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            progressBar.style.width = `${progress}%`;
        });
    }

    // 创建主题切换按钮的函数
    function createThemeToggleButton() {
        // 如果页面上已经有主题切换按钮，则不创建
        if (document.getElementById('theme-toggle')) return;
        
        // 创建主题切换按钮
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', '切换深浅模式');
        
        // 创建太阳图标
        const sunIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sunIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        sunIcon.setAttribute('width', '20');
        sunIcon.setAttribute('height', '20');
        sunIcon.setAttribute('viewBox', '0 0 24 24');
        sunIcon.setAttribute('fill', 'none');
        sunIcon.setAttribute('stroke', 'currentColor');
        sunIcon.setAttribute('stroke-width', '2');
        sunIcon.setAttribute('stroke-linecap', 'round');
        sunIcon.setAttribute('stroke-linejoin', 'round');
        sunIcon.classList.add('sun-icon');
        
        // 添加太阳图标的路径
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '5');
        sunIcon.appendChild(circle);
        
        const lines = [
            { x1: '12', y1: '1', x2: '12', y2: '3' },
            { x1: '12', y1: '21', x2: '12', y2: '23' },
            { x1: '4.22', y1: '4.22', x2: '5.64', y2: '5.64' },
            { x1: '18.36', y1: '18.36', x2: '19.78', y2: '19.78' },
            { x1: '1', y1: '12', x2: '3', y2: '12' },
            { x1: '21', y1: '12', x2: '23', y2: '12' },
            { x1: '4.22', y1: '19.78', x2: '5.64', y2: '18.36' },
            { x1: '18.36', y1: '5.64', x2: '19.78', y2: '4.22' }
        ];
        
        lines.forEach(lineAttrs => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            Object.entries(lineAttrs).forEach(([attr, value]) => {
                line.setAttribute(attr, value);
            });
            sunIcon.appendChild(line);
        });
        
        // 创建月亮图标
        const moonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        moonIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        moonIcon.setAttribute('width', '20');
        moonIcon.setAttribute('height', '20');
        moonIcon.setAttribute('viewBox', '0 0 24 24');
        moonIcon.setAttribute('fill', 'none');
        moonIcon.setAttribute('stroke', 'currentColor');
        moonIcon.setAttribute('stroke-width', '2');
        moonIcon.setAttribute('stroke-linecap', 'round');
        moonIcon.setAttribute('stroke-linejoin', 'round');
        moonIcon.classList.add('moon-icon');
        moonIcon.style.display = 'none';
        
        // 添加月亮图标的路径
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
        moonIcon.appendChild(path);
        
        // 将图标添加到按钮
        themeToggle.appendChild(sunIcon);
        themeToggle.appendChild(moonIcon);
        
        // 将按钮添加到页面
        document.body.appendChild(themeToggle);
        
        // 检查本地存储中的主题设置
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
        
        // 添加切换主题的事件监听器
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            if (document.body.classList.contains('dark-theme')) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
                localStorage.setItem('theme', 'dark');
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // ========== newsletter 轮播逻辑 ==========
    document.querySelectorAll('.newsletter-carousel').forEach(container => {
        const slides = container.querySelector('.slides');
        const dots   = container.querySelectorAll('.dot');
        if (slides && dots.length > 0) {
            dots.forEach((dot, idx) => {
                dot.addEventListener('click', () => {
                    // 切换 transform
                    slides.style.transform = `translateX(-${idx * 100}%)`;
                    // 更新 active 状态
                    const activeDot = container.querySelector('.dot.active');
                    if (activeDot) activeDot.classList.remove('active');
                    dot.classList.add('active');
                });
            });
        }
    });
}); 