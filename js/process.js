/* ============================================================
   LMX STUDIO — PROCESS (interactive timeline)
   On scroll: the active number changes, a progress line follows,
   and each step's content reveals. GSAP ScrollTrigger.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion, gsapReady } = window.LMX.utils;

  function init() {
    const section = $("#process");
    if (!section) return;

    const steps = $$(".step", section);
    const count = $(".process__count", section);
    const label = $(".process__count-label", section);
    const fill = $(".process__fill", section);
    const gsap = window.gsap;
    const reduce = prefersReducedMotion();
    const ST = window.ScrollTrigger;

    // Fallback: everything visible if no animation available.
    if (!gsapReady() || reduce || !ST) {
      steps.forEach((s) => s.classList.add("is-inview"));
      $$(".process__title .reveal-line", section).forEach((l) =>
        l.classList.add("is-inview")
      );
      if (fill) fill.style.transform = "scaleY(1)";
      return;
    }

    gsap.registerPlugin(ST);

    // Title lines reveal
    $$(".process__title .reveal-line", section).forEach((l) => {
      ST.create({
        trigger: l,
        start: "top 85%",
        once: true,
        onEnter: () => l.classList.add("is-inview"),
      });
    });

    // Each step reveals as it enters
    steps.forEach((s) => {
      ST.create({
        trigger: s,
        start: "top 80%",
        once: true,
        onEnter: () => s.classList.add("is-inview"),
      });
    });

    // Progress line follows the scroll through the steps
    gsap.fromTo(
      fill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: $(".process__steps", section),
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      }
    );

    // Active step + sticky counter
    function setActive(i) {
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      const s = steps[i];
      if (count) count.textContent = s.querySelector(".step__index").textContent;
      if (label) label.textContent = s.querySelector(".step__title").textContent;
      gsap.fromTo(
        count,
        { yPercent: 45, autoAlpha: 0.3 },
        { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" }
      );
    }

    steps.forEach((s, i) => {
      ST.create({
        trigger: s,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) setActive(i);
        },
      });
    });

    steps[0].classList.add("is-active");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
