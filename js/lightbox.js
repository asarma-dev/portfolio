(function () {
  const overlay = document.querySelector(".lightbox");
  const bg = document.querySelector(".lightbox-bg");
  const closeBtn = document.querySelector(".lightbox-close");
  if (!overlay) return;

  const img = overlay.querySelector(".lightbox-img");
  const lottieEl = overlay.querySelector(".lightbox-lottie");
  let prevFocus = null;

  // Focus trap — Tab cycles within the lightbox (close button is the only focusable element)
  function handleTrapKeydown(e) {
    if (e.key === 'Tab') { e.preventDefault(); closeBtn?.focus(); }
  }

  function openShared() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    if (bg) bg.classList.add("is-open");
    if (closeBtn) {
      closeBtn.classList.add("is-open");
      closeBtn.setAttribute("aria-hidden", "false");
      closeBtn.focus();
    }
    document.body.classList.add("lightbox-open");
    document.addEventListener("keydown", handleTrapKeydown);
  }

  function open(src, alt) {
    prevFocus = document.activeElement;
    img.src = src;
    img.alt = alt;
    openShared();
  }

  function openLottie(src, bg) {
    prevFocus = document.activeElement;
    img.style.display = 'none';
    if (lottieEl) {
      lottieEl.classList.add('is-active');
      lottieEl.setAttribute('background', bg || '#000000');
      lottieEl.load(src);
    }
    openShared();
  }

  function close() {
    document.removeEventListener("keydown", handleTrapKeydown);
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    if (bg) bg.classList.remove("is-open");
    if (closeBtn) {
      closeBtn.classList.remove("is-open");
      closeBtn.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("lightbox-open");
    overlay.addEventListener('transitionend', function reset(e) {
      if (e.target !== overlay) return;
      overlay.removeEventListener('transitionend', reset);
      img.style.display = '';
      if (lottieEl) lottieEl.classList.remove('is-active');
    });
    prevFocus?.focus();
  }

  // Open on tile click or keyboard activation
  document.querySelectorAll(".cs-img-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const lottieSource = tile.querySelector("lottie-player");
      if (lottieSource) {
        openLottie(lottieSource.getAttribute("src"), tile.dataset.lottieBg);
      } else {
        const source = tile.querySelector("img");
        if (source) open(source.src, source.alt);
      }
    });
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const lottieSource = tile.querySelector("lottie-player");
        if (lottieSource) {
          openLottie(lottieSource.getAttribute("src"), tile.dataset.lottieBg);
        } else {
          const source = tile.querySelector("img");
          if (source) open(source.src, source.alt);
        }
      }
    });
  });

  // Close on button, backdrop click, or Escape
  if (closeBtn) closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
})();
