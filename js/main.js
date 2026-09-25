/* ============================================================
   LMX STUDIO — MAIN (boot orchestrator)
   Runs the cinematic preloader, then hands off to the Hero.
   Concept "Matter & Light": the mark emerges from black, a
   single gold edge sweeps across it, then the loader lifts.
   Fast by design — never blocks access to the site.
   ============================================================ */
(function () {
  "use strict";

  const {
    $,
    prefersReducedMotion,
    gsapReady,
    lockScroll,
    unlockScroll,
    onReady,
    firstVisit,
    markSeen,
  } = window.LMX.utils;
  const { EASE, DUR } = window.LMX.motion;

  const MIN_DISPLAY = 600; // ms — floor so the intro reads, never drags
  const HARD_LIMIT = 3500; // ms — absolute ceiling from boot; see watchdog below
  const startedAt = performance.now();

  /* The loader is lifted exactly once, whatever path gets us there:
     the cinematic outro, the CSS fallback, or the watchdog. */
  let finished = false;

  function finish(preloader) {
    if (finished) return;
    finished = true;
    if (preloader) preloader.hidden = true;
    unlockScroll();
    markSeen();
    document.documentElement.classList.add("is-loaded");
    document.dispatchEvent(new CustomEvent("lmx:loaded"));
  }

  /* WATCHDOG — the loader can never trap the site.
     The whole intro is GSAP, i.e. requestAnimationFrame: browsers throttle
     rAF in background tabs, so a page opened with ⌘-click would sit on a
     frozen logo with the scroll locked until the user focuses it. setTimeout
     keeps firing in background tabs, so this is the one guarantee that holds
     no matter what GSAP, the network or the CDN are doing. */
  function armWatchdog(preloader) {
    window.setTimeout(() => finish(preloader), HARD_LIMIT);
  }

  /* Hard fallback: remove the loader with a plain CSS fade.
     Used when GSAP is unavailable so the site is never trapped. */
  function fallbackHide(preloader) {
    preloader.classList.add("is-hidden");
    preloader.addEventListener("transitionend", () => finish(preloader), {
      once: true,
    });
    // Safety net if transitionend never fires
    window.setTimeout(() => finish(preloader), 600);
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
        window.setTimeout(() => finish(preloader), 200);
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
    const intro = gsap.timeline({ defaults: { ease: EASE.out } });
    intro
      .to(logo, {
        autoAlpha: 1,
        scale: 1,
        filter: "brightness(1) contrast(1.05)",
        duration: 0.7,
        ease: EASE.emphasis,
      })
      .to(
        progress,
        { v: 92, duration: 0.9, ease: EASE.out, onUpdate: setCount },
        0
      )
      .to(bar, { scaleX: 0.92, duration: 0.9, ease: EASE.out }, 0)
      // gold edge of light sweeping across the mark
      .fromTo(
        sweep,
        { xPercent: -60, autoAlpha: 0 },
        { xPercent: 160, autoAlpha: 1, duration: 0.75, ease: EASE.inOut },
        0.25
      )
      .to(sweep, { autoAlpha: 0, duration: 0.25 }, ">-0.15");

    // OUTRO — completion + fluid handoff to the Hero
    function playOutro() {
      const outro = gsap.timeline({
        defaults: { ease: EASE.inOut },
        onComplete: () => finish(preloader),
      });
      outro
        .to(progress, { v: 100, duration: 0.25, onUpdate: setCount })
        .to(bar, { scaleX: 1, duration: 0.25 }, 0)
        .to(logo, { scale: 1.02, duration: 0.5, ease: EASE.out }, 0.05)
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
      // Nobody is watching a background tab: skip the choreography rather
      // than queue a timeline rAF will not run.
      if (document.hidden) {
        finish(preloader);
        return;
      }
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, MIN_DISPLAY - elapsed);
      window.setTimeout(playOutro, wait);
    });
  }

  function init() {
    const preloader = $("#preloader");
    if (!preloader) {
      finish(null);
      return;
    }

    // Returning within the session: CSS already kept the loader off the
    // screen, so there is nothing to choreograph. Hand straight over to the
    // hero, which plays its own shortened entrance.
    if (!firstVisit) {
      finish(preloader);
      return;
    }

    lockScroll();
    armWatchdog(preloader);

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
