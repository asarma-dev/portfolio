// Tile auto-scroll — desktop only.
// On mobile, tiles stack in normal document flow and scroll natively.
if (window.matchMedia('(min-width: 768px)').matches) {
  (function () {
    const container = document.querySelector(".work-grid");
    const track = document.querySelector(".work-scroll-track");
    if (!container || !track) return;

    // Clone tiles 3 times so the loop reset happens once every 3 rotations.
    // More copies = fewer resets = less visible flash at the loop boundary.
    const originals = Array.from(track.children);
    for (let i = 0; i < 2; i++) {
      originals.forEach((tile) => {
        const clone = tile.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        // cloneNode doesn't reinitialize custom elements — force lottie-player to load
        clone.querySelectorAll('lottie-player').forEach(p => p.load(p.getAttribute('src')));
        track.appendChild(clone);
      });
    }

    const speed = 1.0;
    let pos = 0;
    let paused = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // resetAt = height of the 3 clone sets (3/4 of total track height).
    // Infinity until Lottie loads and tiles reach their true rendered height.
    // ResizeObserver keeps it current so the reset point stays accurate.
    // Lottie visibility tracking — position-based rather than IntersectionObserver.
    // IntersectionObserver fires against layout position, not visual position, so it
    // doesn't account for the translateY on the track — all tiles appear "in view".
    // Here we use pos directly: pure arithmetic, no DOM reads in the hot path.
    let containerHeight = container.offsetHeight;
    const tilesWithLottie = [];
    track.querySelectorAll('.project-tile').forEach(tile => {
      const players = Array.from(tile.querySelectorAll('lottie-player'));
      if (players.length) tilesWithLottie.push({ tile, players, top: 0, height: 0, visible: true });
    });

    function measureTiles() {
      containerHeight = container.offsetHeight;
      tilesWithLottie.forEach(t => {
        t.top = t.tile.offsetTop;
        t.height = t.tile.offsetHeight;
      });
    }

    let resetAt = Infinity;
    const ro = new ResizeObserver(() => {
      const measured = track.scrollHeight * 2 / 3;
      if (Math.abs(measured - resetAt) > 1) {
        if (pos >= measured) pos = pos % (track.scrollHeight / 3);
        resetAt = measured;
      }
      measureTiles();
    });
    ro.observe(track);

    // Trackpad/wheel: add delta directly to position
    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      pos += e.deltaY * 0.6;
    }, { passive: false });

    // Pause auto-scroll on hover
    track.addEventListener("mouseenter", () => { paused = true; });
    track.addEventListener("mouseleave", () => { paused = false; });

    function tick() {
      if (!paused && !reducedMotion && !window.__animPaused) pos += speed;
      if (pos >= resetAt) pos -= resetAt;
      if (pos < 0) pos += resetAt;
      // Round to nearest pixel to prevent sub-pixel snapping on loop reset
      track.style.transform = `translateY(-${Math.round(pos)}px)`;

      // Play/pause lottie-players based on scroll position.
      // Only fires play/pause on state changes — not every frame.
      if (tilesWithLottie.length) {
        const viewBottom = pos + containerHeight;
        tilesWithLottie.forEach(t => {
          const nowVisible = t.height > 0 && t.top + t.height > pos && t.top < viewBottom;
          if (nowVisible !== t.visible) {
            t.visible = nowVisible;
            if (nowVisible) {
              if (!reducedMotion && !window.__animPaused) t.players.forEach(p => p.play());
            } else {
              t.players.forEach(p => p.pause());
            }
          }
        });
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  })();
}

// Case study left column: scrolls naturally, freezes when bottom nears viewport bottom
// Desktop only — mobile scrolls normally
(function () {
  const el = document.querySelector('.cs-text');
  if (!el) return;

  const BOTTOM_PAD = 80;
  const mq = window.matchMedia('(min-width: 768px)');
  let frozenAt = null;

  // Placeholder holds the grid cell open when el is fixed
  const placeholder = document.createElement('div');
  placeholder.setAttribute('aria-hidden', 'true');

  function freeze() {
    const rect = el.getBoundingClientRect();
    frozenAt = window.scrollY;

    placeholder.style.width  = rect.width  + 'px';
    placeholder.style.height = rect.height + 'px';
    el.parentNode.insertBefore(placeholder, el);

    el.style.position = 'fixed';
    el.style.top      = rect.top   + 'px';
    el.style.left     = rect.left  + 'px';
    el.style.width    = rect.width + 'px';
  }

  function unfreeze() {
    frozenAt = null;
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    el.style.position = '';
    el.style.top      = '';
    el.style.left     = '';
    el.style.width    = '';
  }

  window.addEventListener('scroll', function () {
    // Re-check on every scroll — guards against responsive mode switches
    if (!mq.matches) {
      if (frozenAt !== null) unfreeze();
      return;
    }
    if (frozenAt === null) {
      if (el.getBoundingClientRect().bottom <= window.innerHeight - BOTTOM_PAD) {
        freeze();
      }
    } else if (window.scrollY < frozenAt) {
      unfreeze();
    }
  }, { passive: true });

  // Also unfreeze immediately if viewport drops below desktop breakpoint
  mq.addEventListener('change', function (e) {
    if (!e.matches && frozenAt !== null) unfreeze();
  });

  window.addEventListener('resize', function () {
    if (!mq.matches && frozenAt !== null) unfreeze();
  });
})();

// Fade-in on scroll — all screen sizes
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".cs-section, .project-tile").forEach((el) => {
  // Skip aria-hidden clones — they don't need fade-in and the transform-based
  // carousel means IntersectionObserver fires unreliably for off-screen clones
  if (el.getAttribute("aria-hidden") === "true") return;
  el.classList.add("fade-in");
  observer.observe(el);
});

// Pause animations button — WCAG 2.2.2 keyboard-accessible control
(function () {
  const btn = document.querySelector('.pause-animations');
  if (!btn) return;
  window.__animPaused = false;
  btn.addEventListener('click', () => {
    window.__animPaused = !window.__animPaused;
    btn.textContent = window.__animPaused ? 'Play animations' : 'Pause animations';
    btn.setAttribute('aria-pressed', String(window.__animPaused));
    document.querySelectorAll('lottie-player:not(.lightbox-lottie)').forEach(p => {
      window.__animPaused ? p.pause() : p.play();
    });
  });
})();

// Pause lottie-player animations for users who prefer reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('load', () => {
    document.querySelectorAll('lottie-player:not(.lightbox-lottie)').forEach(p => p.pause());
  });
}
