/**
 * 浅色 / 深色：在 html 根节点切换 .dark-theme，并写入 localStorage
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'zhujusi-theme';
  var btn = document.getElementById('theme-toggle-btn');
  var html = document.documentElement;

  function apply(theme) {
    if (theme === 'dark') {
      html.classList.add('dark-theme');
    } else {
      html.classList.remove('dark-theme');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') {
      apply('dark');
    } else if (saved === 'light') {
      apply('light');
    }
  } catch (e) {}

  if (btn) {
    btn.addEventListener('click', function () {
      apply(html.classList.contains('dark-theme') ? 'light' : 'dark');
    });
  }
})();
