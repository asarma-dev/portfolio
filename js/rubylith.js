// Rubylith entrance — flashes ruby red on every page load, then fades out.
// Double rAF ensures the browser paints opacity:1 before the transition starts.
// Skipped entirely when prefers-reduced-motion is set.
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.querySelector('.ruby-entrance');
  if (!overlay) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    overlay.style.opacity = '0';
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transition = `opacity var(--duration-slowest) var(--ease-out)`;
      overlay.style.opacity = '0';
    });
  });
});
