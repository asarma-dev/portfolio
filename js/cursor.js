// Ruby cursor — only on devices that support hover (excludes touch)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-ruby';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  const interactive = 'a, button, input, select, textarea, label, [role="button"]';

  let mouseX = 0, mouseY = 0, rafPending = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        cursor.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
        cursor.style.opacity = '1';
        rafPending = false;
      });
    }
  });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) cursor.classList.add('is-hovering');
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) cursor.classList.remove('is-hovering');
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
}
