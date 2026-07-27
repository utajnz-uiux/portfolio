(function () {
  var root = document.documentElement;
  if (!root.classList.contains('is-samsung-internet')) return;

  function probeForcedDark() {
    var probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:-9999px;top:0;width:2px;height:2px;pointer-events:none;background-color:#ffffff;color:#000000;';
    root.appendChild(probe);
    var bg = getComputedStyle(probe).backgroundColor;
    root.removeChild(probe);
    return bg !== 'rgb(255, 255, 255)';
  }

  function applyCorrection() {
    if (probeForcedDark()) {
      root.classList.add('samsung-night-correction');
    }
  }

  function scheduleChecks() {
    applyCorrection();
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(applyCorrection);
    });
    window.setTimeout(applyCorrection, 300);
    window.setTimeout(applyCorrection, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleChecks);
  } else {
    scheduleChecks();
  }

  window.addEventListener('load', scheduleChecks);
})();
