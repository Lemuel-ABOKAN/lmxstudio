/* ============================================================
   LMX STUDIO — MICRO-INTERACTIONS (shared, purposeful only)
   1) Scroll progress line — the signature gold light, doubling
      as an orientation cue.
   2) Magnetic elements — reusable via [data-magnetic] on real
      CTAs (strong affordance), desktop only.
   Everything else (link underlines, button states, project
   hover/tilt, cursor, reveals) lives with its own component.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion, isTouch, gsapReady } = window.LMX.utils;
  const { EASE, DUR } = window.LMX.motion;

  /* ---------- 1 · Scroll progress line ---------- */
  (function scrollProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    let ticking = false;
    function update() {
      const st = window.scrollY || document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, st / h) : 0;
      bar.style.transform = "scaleX(" + p + ")";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update, { passive: true });
    update();
  })();

  /* ---------- 2 · Magnetic elements ---------- */
  (function magnetic() {
    if (isTouch() || prefersReducedMotion() || !gsapReady()) return;
    const gsap = window.gsap;

    $$("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.4;
      const inner = el.querySelector("[data-magnetic-inner]");
      const bx = gsap.quickTo(el, "x", { duration: 0.5, ease: EASE.follow });
      const by = gsap.quickTo(el, "y", { duration: 0.5, ease: EASE.follow });
      const ix = inner ? gsap.quickTo(inner, "x", { duration: 0.6, ease: EASE.follow }) : null;
      const iy = inner ? gsap.quickTo(inner, "y", { duration: 0.6, ease: EASE.follow }) : null;

      let r = null; // cache rect on enter → no layout read per move
      el.addEventListener("pointerenter", () => (r = el.getBoundingClientRect()));
      el.addEventListener(
        "pointermove",
        (e) => {
          if (!r) r = el.getBoundingClientRect();
          const mx = e.clientX - (r.left + r.width / 2);
          const my = e.clientY - (r.top + r.height / 2);
          bx(mx * strength);
          by(my * strength);
          if (ix) {
            ix(mx * strength * 0.5);
            iy(my * strength * 0.5);
          }
        },
        { passive: true }
      );
      el.addEventListener("pointerleave", () => {
        r = null;
        bx(0);
        by(0);
        if (ix) {
          ix(0);
          iy(0);
        }
      });
    });
  })();
})();
