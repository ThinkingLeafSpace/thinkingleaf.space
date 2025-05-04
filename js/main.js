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

    // Highlight the active navigation link based on current page
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        
        // Default to home if on root path
        if (currentPath === '/' || currentPath.endsWith('index.html')) {
            document.querySelector('.sidebar-nav a[href="index.html"]').classList.add('active');
            return;
        }
        
        // Otherwise, match the current path
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPath.endsWith(linkPath)) {
                link.classList.add('active');
            }
        });
    }
    
    // Initialize active nav link
    setActiveNavLink();

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // Close sidebar when clicking outside (mobile)
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

    // Handle window resize for responsive behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
            if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        }
    });

    // ========== newsletter 轮播逻辑 ==========
    document.querySelectorAll('.newsletter-carousel').forEach(container => {
        const slides = container.querySelector('.slides');
        const dots   = container.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                // 切换 transform
                slides.style.transform = `translateX(-${idx * 100}%)`;
                // 更新 active 状态
                container.querySelector('.dot.active').classList.remove('active');
                dot.classList.add('active');
            });
        });
    });
}); 