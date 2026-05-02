// ── Focus trap utility ──
function createFocusTrap(container) {
  const sel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    const els = [...container.querySelectorAll(sel)];
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  return {
    activate()   { container.addEventListener('keydown', handleKeydown); },
    deactivate() { container.removeEventListener('keydown', handleKeydown); }
  };
}

// ── Work panel toggle ──
const workToggle = document.querySelector('.nav-work-toggle');
const workPanel  = document.querySelector('.work-panel');
const workPanelTrap = workPanel ? createFocusTrap(workPanel) : null;
let workPanelPrevFocus = null;

function openWorkPanel() {
  workPanelPrevFocus = document.activeElement;
  workPanel.classList.add('is-open');
  workPanel.setAttribute('aria-hidden', 'false');
  workToggle.setAttribute('aria-expanded', 'true');
  workToggle.classList.add('is-active');
  workPanelTrap?.activate();
  workPanel.querySelector('a, button')?.focus();
}

function closeWorkPanel() {
  workPanelTrap?.deactivate();
  workPanel.classList.remove('is-open');
  workPanel.setAttribute('aria-hidden', 'true');
  workToggle.setAttribute('aria-expanded', 'false');
  // Preserve is-active on case study pages
  if (!window.location.pathname.includes('/work/')) {
    workToggle.classList.remove('is-active');
  }
  workPanelPrevFocus?.focus();
}

workToggle?.addEventListener('click', () => {
  const isOpen = workPanel.classList.contains('is-open');
  isOpen ? closeWorkPanel() : openWorkPanel();
});

document.querySelector('.work-panel-close')?.addEventListener('click', closeWorkPanel);

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeWorkPanel();
});

// Close when a panel link is clicked
workPanel?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeWorkPanel);
});

// ── Mobile hamburger toggle ──
const burger            = document.querySelector('.nav-burger');
const mobileMenu        = document.querySelector('.nav-mobile-menu');
const mobileWorkTrigger = document.querySelector('.nav-mobile-work-trigger');
const mobileAccordion   = document.querySelector('.nav-mobile-accordion');
const mobileTrap        = mobileMenu ? createFocusTrap(mobileMenu) : null;
let mobilePrevFocus     = null;

function closeMobileMenu() {
  mobileTrap?.deactivate();
  mobileMenu.classList.remove('is-open');
  burger.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  // Reset accordion
  mobileAccordion?.classList.remove('is-open');
  mobileWorkTrigger?.classList.remove('is-open');
  mobileWorkTrigger?.setAttribute('aria-expanded', 'false');
  mobilePrevFocus?.focus();
}

burger?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('is-open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    mobilePrevFocus = document.activeElement;
    mobileMenu.classList.add('is-open');
    burger.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    mobileTrap?.activate();
    mobileMenu.querySelector('a, button')?.focus();
  }
});

// Close when any menu link is tapped
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Work accordion in mobile menu
mobileWorkTrigger?.addEventListener('click', () => {
  const isOpen = mobileAccordion.classList.contains('is-open');
  mobileAccordion.classList.toggle('is-open');
  mobileWorkTrigger.classList.toggle('is-open');
  mobileWorkTrigger.setAttribute('aria-expanded', String(!isOpen));
});

// ── Active link — current page ──
const path = window.location.pathname;
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === 'about.html' && path.endsWith('about.html')) {
    link.classList.add('is-active');
  }
  if (href === 'resume.html' && path.endsWith('resume.html')) {
    link.classList.add('is-active');
  }
});

// Mark Work as active on any case study page
if (path.includes('/work/')) {
  workToggle?.classList.add('is-active');
}

// ── Nav scroll behaviour ──
const nav = document.querySelector('.site-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
}, { passive: true });
