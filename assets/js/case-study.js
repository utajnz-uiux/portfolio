(function () {
  var sections = document.querySelectorAll('.case-reveal');
  if (!sections.length) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function reveal(el) {
    el.classList.add('is-visible');
  }

  function isInView(el) {
    var rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
  }

  if (prefersReducedMotion) {
    sections.forEach(reveal);
    return;
  }

  sections.forEach(function (el) {
    if (isInView(el)) reveal(el);
  });

  document.documentElement.classList.add('js-reveal');

  if (!('IntersectionObserver' in window)) {
    sections.forEach(reveal);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
  );

  sections.forEach(function (el) {
    if (!el.classList.contains('is-visible')) observer.observe(el);
  });
})();

var topBtn = document.getElementById('caseTopBtn');
if (topBtn) {
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

(function () {
  var videos = document.querySelectorAll('.case-media-video');
  if (!videos.length) return;

  function playVideo(video) {
    video.muted = true;
    video.play().catch(function () {
      video.setAttribute('controls', '');
    });
  }

  videos.forEach(function (video) {
    playVideo(video);
    video.addEventListener('loadeddata', function () {
      playVideo(video);
    }, { once: true });
  });

  document.addEventListener('click', function () {
    videos.forEach(playVideo);
  }, { once: true });
})();
