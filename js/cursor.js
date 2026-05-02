// Ruby cursor — only on devices that support hover (excludes touch)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-ruby';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  const interactive = 'a, button, input, select, textarea, label, [role="button"]';

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.style.opacity = '1';
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
