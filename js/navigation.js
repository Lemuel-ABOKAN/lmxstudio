/* ============================================================
   LMX STUDIO — NAVIGATION
   1) Fixed header: backdrop + condense on scroll, hide on
      scroll-down / reveal on scroll-up.
   2) Mobile fullscreen menu — state, focus and ARIA only; the
      open/close choreography is CSS (see style.css).
   3) Anchor scrolling, distance-capped.
   4) Active section — the "where am I?" answer.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion } = window.LMX.utils;

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

    const label = $(".nav-toggle__label", toggle);
    const links = $$(".menu__link", menuEl);

    let isOpen = false;
    let lastFocus = null;
    let closeTimer = null;

    /* The open/close choreography is pure CSS (see "MOBILE FULLSCREEN MENU"
       in style.css). It is a class toggle, which is the cheapest tool that
       works — and CSS transitions run off the main thread, so the menu stays
       smooth while the page is still loading and keeps working even if the
       GSAP CDN never answers. JS owns state, focus and ARIA only. */
    const EXIT_MS = 340; // must match the .menu visibility transition delay

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
      window.clearTimeout(closeTimer);
      lastFocus = document.activeElement;
      menuEl.classList.add("is-open");
      setState(true);
      // Focus the first link immediately — never make a keyboard user wait
      // out an animation to reach the navigation.
      links[0] && links[0].focus();
    }

    function close() {
      if (!isOpen) return;
      setState(false);
      // Keep .is-open through the exit transitions, then drop it. Reopening
      // mid-exit cancels this, and the CSS transitions retarget from wherever
      // they are — no restart from zero.
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(finishClose, EXIT_MS);
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    function finishClose() {
      menuEl.classList.remove("is-open");
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
        window.clearTimeout(closeTimer);
        setState(false);
        finishClose();
      }
    });
  })();

  /* ---------- 3 · ANCHOR SCROLLING, DISTANCE-CAPPED ----------
     The document is ~18 screens tall. `scroll-behavior: smooth` in CSS
     applies the same easing whatever the distance, so clicking "Accueil"
     in the footer smooth-scrolled the visitor through the entire page —
     eighteen screens of blur that cannot be cancelled. Smooth motion is
     supposed to preserve orientation; past a few screens it destroys it.

     So: smooth for a neighbourly hop, instant for a jump. The threshold is
     the one place a number is worth stating — 3 viewports is roughly where
     a scroll stops reading as "this moved" and starts reading as "where am
     I now". CSS cannot branch on distance, which is why this is JS. */
  (function anchors() {
    const MAX_SMOOTH_SCREENS = 3;

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const distance = Math.abs(target.getBoundingClientRect().top);
      const smooth =
        !prefersReducedMotion() &&
        distance < window.innerHeight * MAX_SMOOTH_SCREENS;

      target.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
        block: "start",
      });
      // Keep the URL and the focus ring honest — scrollIntoView alone
      // moves the viewport without telling assistive tech anything.
      history.replaceState(null, "", id);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  })();

  /* ---------- 4 · ACTIVE SECTION ----------
     "Where am I?" is the first question every screen has to answer, and on
     a 7-section one-pager nothing answered it.

     A section is current when it owns the MIDDLE of the viewport — that is
     where the eye is, not the top edge. The indicator reuses the underline
     the nav links already have and rides --dur-hover (180ms): it is seen
     continuously while scrolling, so it must be felt, never watched. */
  (function activeSection() {
    const links = $$('.nav__link[href^="#"], .menu__link[href^="#"]');
    if (!links.length) return;

    const byId = new Map();
    links.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      if (!byId.has(id)) byId.set(id, []);
      byId.get(id).push(a);
    });

    const sections = [...byId.keys()]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    let currentId = null;

    function setCurrent(id) {
      if (id === currentId) return;
      currentId = id;
      links.forEach((a) => {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }

    function update() {
      const mid = window.innerHeight / 2;
      let found = null;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        // Several sections can straddle the middle; the first one that
        // owns it wins, so the indicator never flickers between two.
        if (r.top <= mid && r.bottom > mid) {
          found = s;
          break;
        }
      }
      if (found) setCurrent(found.id);
    }

    // Driven by scroll, not by IntersectionObserver. IO is cheaper in
    // principle, but it only ever tells you when a threshold is CROSSED:
    // it delivers nothing before its first callback, nothing while the
    // page is hidden, and nothing on a resize that moves the sections
    // under a stationary scroll position. Each of those leaves the
    // indicator stale or blank. One rAF-throttled passive listener — the
    // same pattern the header above already uses — is deterministic, and
    // setCurrent() early-returns when nothing changed, so the cost is a
    // handful of getBoundingClientRect calls per frame of actual scrolling.
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("pageshow", update);
    update(); // first paint and deep links, without waiting on anything
  })();
})();
