/**
 * 语义 tip 悬停预览（适配 a[data-tip]）
 * - 轻量、无依赖、可键盘聚焦
 * - 玻璃拟物风格通过配套 CSS 实现
 */

(function() {
    function createTipPopover() {
        const el = document.createElement('div');
        el.className = 'tip-popover';
        el.setAttribute('role', 'tooltip');
        el.setAttribute('aria-live', 'polite');
        el.innerHTML = '<div class="tip-content"></div><a class="tip-cta" href="#">深入阅读 →</a>';
        document.body.appendChild(el);
        return el;
    }

    function positionPopover(popover, target) {
        const rect = target.getBoundingClientRect();
        const pop = popover.getBoundingClientRect();
        const spacing = 12;
        let top = rect.bottom + spacing;
        let left = rect.left + (rect.width / 2) - (pop.width / 2);

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        popover.classList.remove('pos-top', 'pos-left', 'pos-right');

        if (top + pop.height > vh) {
            top = rect.top - pop.height - spacing;
            popover.classList.add('pos-top');
        }
        if (left + pop.width > vw) {
            left = vw - pop.width - spacing;
            popover.classList.add('pos-right');
        }
        if (left < spacing) {
            left = spacing;
            popover.classList.add('pos-left');
        }

        popover.style.top = top + 'px';
        popover.style.left = left + 'px';
    }

    function enhanceLinks() {
        const anchors = document.querySelectorAll('a[data-tip]');
        if (!anchors.length) return;

        const popover = createTipPopover();
        let currentAnchor = null;
        let hideTimer = null;

        function show(anchor) {
            currentAnchor = anchor;
            const tipText = anchor.getAttribute('data-tip') || '';
            const href = anchor.getAttribute('href') || '#';
            popover.querySelector('.tip-content').textContent = tipText;
            const cta = popover.querySelector('.tip-cta');
            cta.setAttribute('href', href);
            positionPopover(popover, anchor);
            popover.classList.add('visible');
        }

        function scheduleHide(delay) {
            if (hideTimer) clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                popover.classList.remove('visible');
                currentAnchor = null;
            }, delay);
        }

        document.addEventListener('mousemove', (e) => {
            if (!currentAnchor || !popover.classList.contains('visible')) return;
            positionPopover(popover, currentAnchor);
        });

        document.addEventListener('mouseenter', (e) => {
            const a = e.target.closest('a[data-tip]');
            if (!a) return;
            if (hideTimer) clearTimeout(hideTimer);
            show(a);
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const a = e.target.closest('a[data-tip]');
            if (!a) return;
            // 若移入浮层，不立即隐藏
            const related = e.relatedTarget;
            if (related && (related === popover || popover.contains(related))) return;
            scheduleHide(120);
        }, true);

        popover.addEventListener('mouseleave', () => scheduleHide(80));
        popover.addEventListener('mouseenter', () => { if (hideTimer) clearTimeout(hideTimer); });

        // 键盘可达：focus/blur
        anchors.forEach(a => {
            a.setAttribute('tabindex', a.getAttribute('tabindex') || '0');
            a.addEventListener('focus', () => show(a));
            a.addEventListener('blur', () => scheduleHide(0));
            a.addEventListener('keydown', (ev) => {
                if (ev.key === 'Escape') scheduleHide(0);
            });
        });
    }

    window.addEventListener('DOMContentLoaded', function() {
        // 微延迟，避免首屏抖动
        setTimeout(enhanceLinks, 300);
        window.addEventListener('resize', () => {
            // 重新定位
            const visible = document.querySelector('.tip-popover.visible');
            if (!visible) return;
            const current = document.activeElement && document.activeElement.matches('a[data-tip]')
                ? document.activeElement
                : null;
            if (current) positionPopover(visible, current);
        });
    });
})();


