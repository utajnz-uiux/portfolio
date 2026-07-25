var topBtn = document.getElementById('caseTopBtn');
if (topBtn) {
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
