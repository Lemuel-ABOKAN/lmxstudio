/* ============================================================
   LMX STUDIO — UTILS
   Small, dependency-free helpers shared across modules.
   Exposed on the global LMX namespace (classic scripts).
   ============================================================ */
(function () {
  "use strict";

  const LMX = (window.LMX = window.LMX || {});

  /* DOM selection */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* Capability & preference checks */
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isTouch = () =>
    window.matchMedia("(hover: none), (pointer: coarse)").matches;

  const gsapReady = () => typeof window.gsap !== "undefined";

  /* Scroll lock (used during the preloader) */
  const lockScroll = () => document.documentElement.classList.add("is-loading");
  const unlockScroll = () =>
    document.documentElement.classList.remove("is-loading");

  /* Fire a callback once, on window load OR after a hard timeout,
     so the site is NEVER blocked by a slow/failed asset. */
  const onReady = (cb, timeout = 3000) => {
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      cb();
    };
    if (document.readyState === "complete") {
      run();
    } else {
      window.addEventListener("load", run, { once: true });
    }
    window.setTimeout(run, timeout);
  };

  /* Number formatting for the progress counter */
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  /* First visit of the session? The inline script in <head> already decided
     this before first paint and wrote it to <html class="seen">; reading the
     class back keeps one source of truth and survives blocked storage. */
  const firstVisit = !document.documentElement.classList.contains("seen");
  const markSeen = () => {
    try {
      sessionStorage.setItem("lmx:seen", "1");
    } catch (e) {
      /* nothing to do: the visitor simply gets the full intro next time */
    }
  };

  /* ---------- MOTION VOCABULARY ----------
     One vocabulary, two engines. The curves and durations below are the GSAP
     side of the tokens declared in css/variables.css — same names, same feel,
     one place to tune. Before this existed, six hand-typed GSAP curves ran
     alongside four CSS ones and the two never agreed.

     GSAP has no cubic-bezier() without the CustomEase plugin, so each entry
     names the closest built-in. Keep the pairs in sync:
       out      power4.out    ≈ --ease-out      cubic-bezier(.23,1,.32,1)
       inOut    power4.inOut  ≈ --ease-in-out   cubic-bezier(.77,0,.175,1)
       emphasis expo.out      ≈ --ease-emphasis cubic-bezier(.16,1,.3,1)
       scrub    none          scroll-bound motion is linear by definition
       follow   power3        a smoothing filter on a pointer, not a
                              transition — it has no CSS counterpart

     ease-in is deliberately absent. It delays the first frames, which is
     exactly when the eye is watching, so it reads as lag on any UI. */
  const EASE = {
    out: "power4.out",
    inOut: "power4.inOut",
    emphasis: "expo.out",
    scrub: "none",
    follow: "power3",
  };

  /* Seconds, mirroring --dur-* in variables.css. Duration follows FREQUENCY:
     the more often a motion is seen, the shorter it has to be. */
  const DUR = {
    press: 0.14,
    hover: 0.18,
    pop: 0.2,
    menu: 0.32,
    base: 0.4,
    slow: 0.7,
    reveal: 1.4,
  };

  LMX.motion = { EASE, DUR };

  LMX.utils = {
    $,
    $$,
    prefersReducedMotion,
    isTouch,
    gsapReady,
    lockScroll,
    unlockScroll,
    onReady,
    clamp,
    firstVisit,
    markSeen,
  };
})();
