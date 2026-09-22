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
  };
})();
