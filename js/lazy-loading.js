/**
 * img[data-src] 进入视口后写入 src
 */
(function () {
  'use strict';

  var imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;

  function load(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  }

  if (!('IntersectionObserver' in window)) {
    imgs.forEach(load);
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        load(entry.target);
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '100px' }
  );

  imgs.forEach(function (img) {
    io.observe(img);
  });
})();
