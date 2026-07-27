(function () {
  function playVideosIn(container) {
    if (!container) return;
    container.querySelectorAll('.case-media-video').forEach(function (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      if (video.paused) {
        video.play().catch(function () {});
      }
    });
  }

  function scheduleVideoPlay(container) {
    playVideosIn(container);
    window.setTimeout(function () {
      playVideosIn(container);
    }, 150);
    window.setTimeout(function () {
      playVideosIn(container);
    }, 750);
  }

  var sections = document.querySelectorAll('.case-reveal');
  if (sections.length) {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function reveal(el) {
      el.classList.add('is-visible');
      scheduleVideoPlay(el);
    }

    function isInView(el) {
      var rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    }

    if (prefersReducedMotion) {
      sections.forEach(reveal);
    } else {
      sections.forEach(function (el) {
        if (isInView(el)) reveal(el);
      });

      document.documentElement.classList.add('js-reveal');

      if (!('IntersectionObserver' in window)) {
        sections.forEach(reveal);
      } else {
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
      }
    }
  }

  var videos = document.querySelectorAll('.case-media-video');
  if (videos.length) {
    function playVideo(video) {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      video.play().catch(function () {});
    }

    videos.forEach(function (video) {
      playVideo(video);
      video.addEventListener('loadeddata', function () {
        playVideo(video);
      }, { once: true });
      video.addEventListener('canplay', function () {
        playVideo(video);
      }, { once: true });

      if ('IntersectionObserver' in window) {
        var videoObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                playVideo(video);
              }
            });
          },
          { threshold: [0.15, 0.35, 0.6], rootMargin: '0px 0px 8% 0px' }
        );
        videoObserver.observe(video);
      }
    });

    function unlockVideos() {
      videos.forEach(playVideo);
    }

    document.addEventListener('touchstart', unlockVideos, { once: true, passive: true });
    document.addEventListener('click', unlockVideos, { once: true });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) unlockVideos();
    });
  }
})();

var topBtn = document.getElementById('caseTopBtn');
if (topBtn) {
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
