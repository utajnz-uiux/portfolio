var illuLeft = document.getElementById('illuLeft');
  var illuRight = document.getElementById('illuRight');
  var dripDot = document.getElementById('dripDot');
  var dripWrap = document.querySelector('.drip-wrap');
  var nextSection = document.getElementById('work');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;
  var dripAnchorTop = 0;
  var dripMaxHeight = 400;

  function measureDripRange() {
    var scrollY = window.scrollY;
    dripAnchorTop = dripWrap.getBoundingClientRect().top + scrollY;
    var sectionTop = nextSection.getBoundingClientRect().top + scrollY;
    dripMaxHeight = Math.max(sectionTop - dripAnchorTop, 20);
  }

  function updateSplit() {
    var scrollY = window.scrollY;
    var vh = window.innerHeight;
    var spreadProgress = Math.min(Math.max(scrollY / (vh * 0.9), 0), 1);
    var spread = spreadProgress * 160;
    var fade = 1 - spreadProgress * 0.9;
    illuLeft.style.transform = 'translateX(' + (-spread) + 'px)';
    illuRight.style.transform = 'translateX(' + spread + 'px)';
    illuLeft.style.opacity = fade;
    illuRight.style.opacity = fade;

    var dripProgress = Math.min(Math.max(scrollY / dripMaxHeight, 0), 1);
    var dripHeight = 9 + dripProgress * (dripMaxHeight - 9);
    dripDot.style.height = dripHeight + 'px';
    dripDot.style.borderRadius = '50% 50% 50% 50% / ' + (60 - dripProgress * 30) + '% ' + (60 - dripProgress * 30) + '% ' + (40 + dripProgress * 20) + '% ' + (40 + dripProgress * 20) + '%';

    ticking = false;
  }

  function onScroll() {
    if (!ticking && !reduceMotion) {
      window.requestAnimationFrame(updateSplit);
      ticking = true;
    }
  }

  function onResize() {
    measureDripRange();
    if (!reduceMotion) updateSplit();
  }

  measureDripRange();
  if (!reduceMotion) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);
    updateSplit();
  }

  var track = document.getElementById('carouselTrack');
  var headline = document.getElementById('galleryHeadline');
  var cards = Array.prototype.slice.call(track.querySelectorAll('.case-card'));
  var currentName = cards.length ? cards[0].dataset.name : '';
  var carouselTicking = false;

  function updateActiveCard() {
    var trackRect = track.getBoundingClientRect();
    var center = trackRect.left + trackRect.width / 2;
    var closest = null;
    var closestDist = Infinity;

    cards.forEach(function (card) {
      var r = card.getBoundingClientRect();
      var cardCenter = r.left + r.width / 2;
      var dist = Math.abs(cardCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = card;
      }
      card.classList.remove('active');
    });

    if (closest) {
      closest.classList.add('active');
      var name = closest.dataset.name;
      if (name !== currentName) {
        currentName = name;
        headline.classList.add('swapping');
        setTimeout(function () {
          headline.textContent = name;
          headline.classList.remove('swapping');
        }, 150);
      }
    }
    carouselTicking = false;
  }

  function onCarouselScroll() {
    if (!carouselTicking) {
      window.requestAnimationFrame(updateActiveCard);
      carouselTicking = true;
    }
  }

  if (track && cards.length) {
    track.addEventListener('scroll', onCarouselScroll, { passive: true });
    window.addEventListener('resize', onCarouselScroll);
    window.addEventListener('load', updateActiveCard);
    updateActiveCard();
  }
