(function () {
  var bento = document.querySelector('.library-bento');
  if (!bento) return;

  var counters = bento.querySelectorAll('[data-count]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatCount(value, useComma) {
    return useComma ? value.toLocaleString('en-US') : String(value);
  }

  function animateCounter(el) {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';

    var target = parseInt(el.getAttribute('data-count'), 10);
    if (!Number.isFinite(target)) return;

    var useComma = el.dataset.format === 'comma';

    if (reduced) {
      el.textContent = formatCount(target, useComma);
      return;
    }

    var duration = 2800;
    var start = null;

    function tick(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      el.textContent = formatCount(current, useComma);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatCount(target, useComma);
      }
    }

    requestAnimationFrame(tick);
  }

  function runCounters() {
    counters.forEach(animateCounter);
  }

  if (!counters.length) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
    );
    observer.observe(bento);
  } else {
    runCounters();
  }
})();
