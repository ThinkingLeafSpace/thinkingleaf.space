/**
 * 筑居思站点：移动端侧栏、阅读进度条
 */
(function () {
  'use strict';

  var toggle = document.querySelector('.mobile-menu-toggle');
  var sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      var open = !sidebar.classList.contains('show');
      sidebar.classList.toggle('show', open);
      document.body.classList.toggle('sidebar-open', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    });

    sidebar.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        sidebar.classList.remove('show');
        document.body.classList.remove('sidebar-open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '打开导航菜单');
      });
    });

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    var main = document.querySelector('.main-content');
    if (main) {
      main.addEventListener('click', function () {
        if (!document.body.classList.contains('sidebar-open')) return;
        sidebar.classList.remove('show');
        document.body.classList.remove('sidebar-open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '打开导航菜单');
      });
    }
  }

  var bar = document.getElementById('reading-progress');
  if (bar) {
    function updateProgress() {
      var doc = document.documentElement;
      var h = doc.scrollHeight - doc.clientHeight;
      var pct = h > 0 ? (doc.scrollTop / h) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }
})();
