(function () {
  var url = window.SITE_CONFIG && window.SITE_CONFIG.bookingUrl;
  if (!url || url.indexOf('YOUR-LINK') !== -1) return;

  document.querySelectorAll('.booking-link').forEach(function (link) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
})();
