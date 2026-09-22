/* ============================================================
   LMX STUDIO — MAIN (boot orchestrator)
   Runs the cinematic preloader, then hands off to the Hero.
   Concept "Matter & Light": the mark emerges from black, a
   single gold edge sweeps across it, then the loader lifts.
   Fast by design — never blocks access to the site.
   ============================================================ */
(function () {
  "use strict";

  const { $, prefersReducedMotion, gsapReady, lockScroll, unlockScroll, onReady } =
    window.LMX.utils;

  const MIN_DISPLAY = 600; // ms — floor so the intro reads, never drags
  const startedAt = performance.now();

  /* Signal the rest of the app (Hero / ÉTAPE 03) that we're in. */
  function announceLoaded() {
    document.documentElement.classList.add("is-loaded");
    document.dispatchEvent(new CustomEvent("lmx:loaded"));
  }

  /* Hard fallback: remove the loader with a plain CSS fade.
     Used when GSAP is unavailable so the site is never trapped. */
  function fallbackHide(preloader) {
    preloader.classList.add("is-hidden");
    preloader.addEventListener(
      "transitionend",
      () => {
        preloader.hidden = true;
        unlockScroll();
        announceLoaded();
      },
      { once: true }
    );
    // Safety net if transitionend never fires
    window.setTimeout(() => {
      preloader.hidden = true;
      unlockScroll();
      announceLoaded();
    }, 600);
  }

  /* Reduced motion: no choreography — reveal the mark, then lift. */
  function reducedMotion(preloader) {
    const logo = $(".preloader__logo", preloader);
    const bar = $(".preloader__bar", preloader);
    if (logo) logo.style.opacity = "1";
    if (bar) bar.style.transform = "scaleX(1)";
    onReady(() => {
      window.setTimeout(() => {
        preloader.classList.add("is-hidden");
        window.setTimeout(() => {
          preloader.hidden = true;
          unlockScroll();
          announceLoaded();
        }, 200);
      }, 150);
    });
  }

  /* Full cinematic timeline. */
  function cinematic(preloader) {
    const gsap = window.gsap;
    const logo = $(".preloader__logo", preloader);
    const sweep = $(".preloader__sweep", preloader);
    const bar = $(".preloader__bar", preloader);
    const count = $(".preloader__count", preloader);

    gsap.set(preloader, { autoAlpha: 1 });
    gsap.set(logo, { autoAlpha: 0, scale: 1.06, filter: "brightness(0.45) contrast(0.9)" });
    gsap.set(sweep, { xPercent: -60, autoAlpha: 0 });
    gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });

    // Progress counter proxy (very minimal, for screen readers + micro label)
    const progress = { v: 0 };
    const setCount = () => {
      const val = Math.round(progress.v);
      if (count) count.textContent = val + "%";
    };

    // INTRO — apparition + montée de luminosité + révélation
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .to(logo, {
        autoAlpha: 1,
        scale: 1,
        filter: "brightness(1) contrast(1.05)",
        duration: 0.7,
        ease: "expo.out",
      })
      .to(
        progress,
        { v: 92, duration: 0.9, ease: "power2.out", onUpdate: setCount },
        0
      )
      .to(bar, { scaleX: 0.92, duration: 0.9, ease: "power2.out" }, 0)
      // gold edge of light sweeping across the mark
      .fromTo(
        sweep,
        { xPercent: -60, autoAlpha: 0 },
        { xPercent: 160, autoAlpha: 1, duration: 0.75, ease: "power2.inOut" },
        0.25
      )
      .to(sweep, { autoAlpha: 0, duration: 0.25 }, ">-0.15");

    // OUTRO — completion + fluid handoff to the Hero
    function playOutro() {
      const outro = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          preloader.hidden = true;
          unlockScroll();
          announceLoaded();
        },
      });
      outro
        .to(progress, { v: 100, duration: 0.25, onUpdate: setCount })
        .to(bar, { scaleX: 1, duration: 0.25 }, 0)
        .to(logo, { scale: 1.02, duration: 0.5, ease: "power2.in" }, 0.05)
        .to([bar, count], { autoAlpha: 0, duration: 0.3 }, 0.15)
        .to(
          logo,
          { autoAlpha: 0, filter: "brightness(1.6)", duration: 0.5 },
          0.2
        )
        .to(preloader, { autoAlpha: 0, duration: 0.6 }, 0.25);
    }

    // Gate the outro on real load, but honour the minimum display floor,
    // so the preloader is quick yet never cut mid-reveal.
    onReady(() => {
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, MIN_DISPLAY - elapsed);
      window.setTimeout(playOutro, wait);
    });
  }

  function init() {
    const preloader = $("#preloader");
    if (!preloader) {
      unlockScroll();
      announceLoaded();
      return;
    }

    lockScroll();

    if (prefersReducedMotion()) {
      reducedMotion(preloader);
      return;
    }
    if (!gsapReady()) {
      fallbackHide(preloader);
      return;
    }
    cinematic(preloader);
  }

  // Run as soon as DOM is parsed (scripts are deferred).
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
