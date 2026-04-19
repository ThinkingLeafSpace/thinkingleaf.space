/**
 * 全站搜索：仅当存在 #site-search 容器时初始化（首页若未挂载则跳过）
 */
(function () {
  'use strict';
  var root = document.getElementById('site-search');
  if (!root) return;
})();
