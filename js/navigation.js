/* ============================================================
   LMX STUDIO — NAVIGATION
   1) Fixed header: backdrop + condense on scroll, hide on
      scroll-down / reveal on scroll-up.
   2) Mobile fullscreen menu with a GSAP open/close sequence:
      button → background → lines → links → secondary info.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion, gsapReady } = window.LMX.utils;

  /* ---------- 1 · HEADER SCROLL BEHAVIOUR ---------- */
  (function header() {
    const el = $(".site-header");
    if (!el) return;

    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      el.classList.toggle("is-scrolled", y > 40);
      // Don't hide the header while the menu is open
      if (!document.documentElement.classList.contains("menu-open")) {
        if (y > lastY && y > 240) el.classList.add("is-hidden");
        else el.classList.remove("is-hidden");
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  })();

  /* ---------- 2 · MOBILE FULLSCREEN MENU ---------- */
  (function menu() {
    const toggle = $("#nav-toggle");
    const menuEl = $("#menu");
    if (!toggle || !menuEl) return;

    const bg = $(".menu__bg", menuEl);
    const glyph = $(".nav-toggle__glyph", toggle);
    const label = $(".nav-toggle__label", toggle);
    const rules = $$(".menu__rule", menuEl);
    const labels = $$(".menu__label > span", menuEl);
    const indexes = $$(".menu__index", menuEl);
    const footer = $(".menu__footer", menuEl);
    const links = $$(".menu__link", menuEl);

    let isOpen = false;
    let lastFocus = null;
    const canAnimate = gsapReady() && !prefersReducedMotion();
    const gsap = window.gsap;

    let tl = null;
    if (canAnimate) {
      gsap.set(bg, { scaleY: 0 });
      gsap.set(rules, { scaleX: 0 });
      gsap.set(labels, { yPercent: 110 });
      gsap.set(indexes, { autoAlpha: 0 });
      gsap.set(footer, { autoAlpha: 0, y: 20 });

      tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onReverseComplete: finishClose,
      });
      tl
        // 1 · button (plus → cross)
        .to(glyph, { rotate: 45, duration: 0.4, ease: "power2.inOut" }, 0)
        // 2 · background curtain
        .to(bg, { scaleY: 1, duration: 0.6, ease: "power4.inOut" }, 0.05)
        // 3 · lines draw in
        .to(rules, { scaleX: 1, duration: 0.5, stagger: 0.06 }, 0.35)
        // 4 · links rise
        .to(labels, { yPercent: 0, duration: 0.6, stagger: 0.07, ease: "expo.out" }, 0.45)
        .to(indexes, { autoAlpha: 1, duration: 0.4, stagger: 0.07 }, 0.5)
        // 5 · secondary info
        .to(footer, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.78);
    }

    function setState(open) {
      isOpen = open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      menuEl.setAttribute("aria-hidden", String(!open));
      if (label) label.textContent = open ? label.dataset.close : label.dataset.open;
      document.documentElement.classList.toggle("menu-open", open);
      toggle.classList.toggle("is-active", open);
    }

    function open() {
      if (isOpen) return;
      lastFocus = document.activeElement;
      menuEl.classList.add("is-open");
      setState(true);
      if (canAnimate) {
        tl.eventCallback("onComplete", () => links[0] && links[0].focus());
        tl.play();
      } else {
        links[0] && links[0].focus();
      }
    }

    function close() {
      if (!isOpen) return;
      setState(false);
      if (canAnimate) {
        tl.reverse();
      } else {
        finishClose();
      }
    }

    // Called when the close animation (or instant close) has finished.
    function finishClose() {
      menuEl.classList.remove("is-open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    toggle.addEventListener("click", () => (isOpen ? close() : open()));

    // Close on link click (same-page anchors)
    links.forEach((a) => a.addEventListener("click", close));

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) close();
    });

    // Basic focus trap while open
    menuEl.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !isOpen) return;
      const focusables = [toggle, ...links, $(".menu__mail", menuEl)].filter(Boolean);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Safety: if resized up to desktop while open, close instantly
    window.matchMedia("(min-width: 768px)").addEventListener("change", (m) => {
      if (m.matches && isOpen) {
        if (canAnimate) tl.progress(0).pause();
        setState(false);
        finishClose();
      }
    });
  })();
})();
