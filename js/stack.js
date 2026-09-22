/* ============================================================
   LMX STUDIO — SKILLS (Stack technique)
   Editorial rows; the percentage counts up on scroll.
   Values render statically without JS / with reduced motion.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion, gsapReady } = window.LMX.utils;

  function init() {
    const pcts = $$(".skill__pct");
    if (!pcts.length) return;
    if (!gsapReady() || prefersReducedMotion() || !window.ScrollTrigger) return;

    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    pcts.forEach((el) => {
      const target = parseFloat(el.dataset.count) || 0;
      el.textContent = "0";
      window.ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.3,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.v);
            },
          });
        },
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
