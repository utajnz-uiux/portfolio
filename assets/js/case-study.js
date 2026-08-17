(function () {
  function prepareVideo(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.loop = true;
    video.setAttribute('loop', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('autoplay', '');
  }

  function playVideo(video) {
    if (!video) return;
    prepareVideo(video);

    var playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {});
    }
  }

  function playVideosIn(container) {
    if (!container) return;
    container.querySelectorAll('.case-media-video').forEach(playVideo);
  }

  function scheduleVideoPlay(container) {
    playVideosIn(container);
    window.setTimeout(function () {
      playVideosIn(container);
    }, 150);
    window.setTimeout(function () {
      playVideosIn(container);
    }, 750);
    window.setTimeout(function () {
      playVideosIn(container);
    }, 1200);
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
    videos.forEach(function (video) {
      prepareVideo(video);
      playVideo(video);

      video.addEventListener('loadeddata', function () {
        playVideo(video);
      });
      video.addEventListener('canplay', function () {
        playVideo(video);
      });
      video.addEventListener('ended', function () {
        video.currentTime = 0;
        playVideo(video);
      });

      if ('IntersectionObserver' in window) {
        var videoObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                playVideo(video);
              }
            });
          },
          { threshold: 0.01, rootMargin: '0px 0px 12% 0px' }
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

(function () {
  var dialog = document.getElementById('caseImageLightbox');
  if (!dialog) return;

  var dialogImg = dialog.querySelector('.case-lightbox-image');
  var closeBtn = dialog.querySelector('.case-lightbox-close');

  function openLightbox(src, alt) {
    dialogImg.src = src;
    dialogImg.alt = alt || '';
    document.documentElement.classList.add('lightbox-open');
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  }

  function closeLightbox() {
    if (dialog.open) dialog.close();
    dialogImg.removeAttribute('src');
    dialogImg.alt = '';
    document.documentElement.classList.remove('lightbox-open');
  }

  document.querySelectorAll('.case-zoom-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      var src = btn.getAttribute('data-zoom-src') || (img && img.currentSrc) || (img && img.src);
      var alt = btn.getAttribute('data-zoom-alt') || (img && img.alt) || '';
      openLightbox(src, alt);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) closeLightbox();
  });

  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('lightbox-open');
  });
})();
