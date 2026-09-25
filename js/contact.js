/* ============================================================
   LMX STUDIO — CONTACT
   Monumental closing headline, a magnetic CTA (GSAP), and an
   elegant reveal into the footer.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, isTouch, prefersReducedMotion, gsapReady } = window.LMX.utils;
  const { EASE, DUR } = window.LMX.motion;

  function init() {
    const section = $("#contact");
    if (!section) return;

    // Current year in the footer
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    const gsap = window.gsap;
    const reduce = prefersReducedMotion();
    const ST = window.ScrollTrigger;

    if (!gsapReady() || reduce || !ST) return; // content visible by default

    gsap.registerPlugin(ST);

    // Contact: stagger the centered content in
    gsap.from(
      [
        $(".contact__headline", section),
        $(".contact__subtitle", section),
        $(".contact__email", section),
        $(".contact__cta-row", section),
      ].filter(Boolean),
      {
        autoAlpha: 0,
        y: 28,
        duration: 0.9,
        ease: EASE.out,
        stagger: 0.06,
        scrollTrigger: { trigger: section, start: "top 65%", once: true },
      }
    );

    // Footer: columns, wordmark and bottom bar rise in
    const footer = $(".footer");
    if (footer) {
      gsap.from(
        [
          ...$$(".footer__col", footer),
          $(".footer__brand", footer),
          $(".footer__bottom", footer),
        ].filter(Boolean),
        {
          autoAlpha: 0,
          y: 30,
          duration: 0.8,
          ease: EASE.out,
          stagger: 0.06,
          scrollTrigger: { trigger: footer, start: "top 90%", once: true },
        }
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
