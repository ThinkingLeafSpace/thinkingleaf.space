document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme based on user preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
    }
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle-btn');
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Add smooth scrolling for internal links
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

    // 移动端导航菜单
    function setupMobileNav() {
        const navToggle = document.createElement('button');
        navToggle.className = 'nav-toggle';
        navToggle.setAttribute('aria-label', '切换导航菜单');
        navToggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        const header = document.querySelector('.header-content');
        const mainNav = document.querySelector('.main-nav');
        
        // 仅在移动视图下添加汉堡菜单按钮
        if (window.innerWidth < 768) {
            if (!document.querySelector('.nav-toggle')) {
                header.insertBefore(navToggle, document.querySelector('.theme-toggle'));
            }
        } else {
            const existingToggle = document.querySelector('.nav-toggle');
            if (existingToggle) {
                existingToggle.remove();
            }
        }
        
        // 点击汉堡菜单切换导航显示
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('show');
            navToggle.classList.toggle('active');
        });
    }
    
    // 初始设置移动导航
    setupMobileNav();
    
    // 窗口大小改变时重新设置
    window.addEventListener('resize', setupMobileNav);
}); 