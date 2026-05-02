(function () {
  const img = document.querySelector('.glasses-image');
  if (!img) return;

  const layout = document.querySelector('.resume-layout');
  let layoutTop = 0;
  let layoutHeight = 0;
  let degOffset = 0; // rotation value at scrollY=0, subtracted to keep start at 0deg

  function measure() {
    const rect = layout.getBoundingClientRect();
    layoutTop = rect.top + window.scrollY;
    layoutHeight = rect.height;

    // Pre-calculate what the formula gives at scrollY=0 so we can zero it out
    const raw0 = (0 - layoutTop + window.innerHeight) / (layoutHeight + window.innerHeight);
    degOffset = -5 + Math.max(0, Math.min(1, raw0)) * 10;
  }

  function update() {
    const raw = (window.scrollY - layoutTop + window.innerHeight) / (layoutHeight + window.innerHeight);
    const t = Math.max(0, Math.min(1, raw));
    const deg = (-5 + t * 10) - degOffset;
    img.style.transform = 'rotate(' + deg.toFixed(2) + 'deg)';
  }

  window.addEventListener('load', function () {
    measure();
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', function () {
    measure();
    update();
  });
})();
