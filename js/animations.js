/* ============================================================
   LMX STUDIO — ANIMATIONS (Hero Experience)
   - Cinematic entrance timeline (GSAP)
   - Scroll evolution (ScrollTrigger)
   - Subtle cursor parallax (desktop only)
   All motion is opt-out via prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion, isTouch, gsapReady } = window.LMX.utils;

  function initHero() {
    const hero = $("#hero");
    if (!hero) return;

    const reduce = prefersReducedMotion();
    const gsap = window.gsap;

    if (window.ScrollTrigger && gsapReady()) {
      gsap.registerPlugin(window.ScrollTrigger);
      // Avoid costly refreshes when the mobile URL bar shows/hides
      window.ScrollTrigger.config({ ignoreMobileResize: true });
    }

    // Collect elements (order mirrors the required entrance sequence)
    const brand = $(".brand");
    const navLinks = $$(".nav__link");
    const navToggle = $(".nav-toggle");
    const mark = $(".hero__mark");
    const eyebrow = $(".hero__eyebrow");
    const lines = $$(".hero__headline .hero__line > span");
    const subtitle = $(".hero__subtitle");
    const scroll = $(".hero__scroll");
    const content = $(".hero__content");

    // No GSAP or reduced motion: content is already visible (CSS default).
    if (!gsapReady() || reduce) return;

    // Initial states — set while the preloader still covers the screen,
    // so nothing flashes before the entrance plays.
    gsap.set([brand, navToggle, ...navLinks, eyebrow, subtitle, scroll], {
      autoAlpha: 0,
      y: 22,
    });
    gsap.set(lines, { yPercent: 115 });
    gsap.set(mark, { autoAlpha: 0, scale: 1.12, xPercent: 5 });

    // ---- ENTRANCE TIMELINE ----
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      paused: true,
    });
    tl
      // 1 · logo
      .to(brand, { autoAlpha: 1, y: 0, duration: 0.6 }, 0)
      // 2 · symbol (the ghost mark emerges from depth)
      .to(
        mark,
        { autoAlpha: 1, scale: 1, xPercent: 0, duration: 1.5, ease: "expo.out" },
        0.05
      )
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.25)
      // 3 · headline (masked lines rise)
      .to(
        lines,
        { yPercent: 0, duration: 1.05, ease: "expo.out", stagger: 0.12 },
        0.35
      )
      // 4 · subtitle
      .to(subtitle, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.8)
      // 5 · navigation
      .to([...navLinks, navToggle], { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.9)
      // 6 · scroll indicator
      .to(scroll, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.1);

    // Play once the preloader has lifted.
    if (document.documentElement.classList.contains("is-loaded")) {
      tl.play();
    } else {
      document.addEventListener("lmx:loaded", () => tl.play(), { once: true });
    }

    setupScroll(gsap, hero, content, mark, scroll);
    setupParallax(gsap, content, mark);
  }

  // ---- SCROLL EVOLUTION (subtle, cinematic) ----
  // Same movement on every screen size (scale + fade + mark drift).
  // Blur is desktop-only: on phones a CSS filter rasterises the text
  // and leaves the headline soft even at rest.
  function setupScroll(gsap, hero, content, mark, scroll) {
    if (!window.ScrollTrigger) return;
    const mm = gsap.matchMedia();

    mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (ctx) => {
      // Phones: drift only — no scale, blur or fade, which left the
      // headline soft / dimmed on mobile browsers.
      const contentTo = ctx.conditions.desktop
        ? { yPercent: -14, scale: 0.965, autoAlpha: 0.1, filter: "blur(3px)", ease: "none" }
        : { yPercent: -14, ease: "none" };

      const tl = gsap.timeline({
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      tl.to(content, contentTo, 0)
        .to(mark, { yPercent: -12, scale: 1.06, ease: "none" }, 0)
        .to(scroll, { autoAlpha: 0, ease: "none", duration: 0.25 }, 0);
    });
  }

  // ---- CURSOR PARALLAX (desktop only, very light) ----
  function setupParallax(gsap, content, mark) {
    if (isTouch()) return;

    const markX = gsap.quickTo(mark, "x", { duration: 0.9, ease: "power3" });
    const markY = gsap.quickTo(mark, "y", { duration: 0.9, ease: "power3" });
    const conX = gsap.quickTo(content, "x", { duration: 1, ease: "power3" });
    const conY = gsap.quickTo(content, "y", { duration: 1, ease: "power3" });

    window.addEventListener(
      "pointermove",
      (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        // mark drifts more (further "back"), content barely moves
        markX(nx * 42);
        markY(ny * 32);
        conX(nx * -12);
        conY(ny * -8);
      },
      { passive: true }
    );
  }

  /* ============================================================
     ABOUT — typographic scroll animations
     Words change contrast (colour / fill), position and scale.
     ============================================================ */
  function initAbout() {
    const about = $("#about");
    if (!about || !gsapReady()) return;
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    const reduce = prefersReducedMotion();
    if (reduce || !window.ScrollTrigger) return;

    // Statement: masked lines rise on enter
    const lines = $$(".about__statement .about__line > span", about);
    gsap.set(lines, { yPercent: 120 });
    window.ScrollTrigger.create({
      trigger: ".about__statement",
      start: "top 82%",
      once: true,
      onEnter: () =>
        gsap.to(lines, {
          yPercent: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.12,
        }),
    });

    // Statement: contrast shift (faint → white) as it scrolls through
    gsap.fromTo(
      ".about__statement .about__line:not(.about__line--metal) > span",
      { color: "#3f3f3f" },
      {
        color: "#f5f5f5",
        ease: "none",
        scrollTrigger: {
          trigger: ".about__statement",
          start: "top 72%",
          end: "center 55%",
          scrub: true,
        },
      }
    );
    // Metal line: scale + fade (échelle)
    gsap.fromTo(
      ".about__line--metal > span",
      { scale: 0.94, autoAlpha: 0.5 },
      {
        scale: 1.03,
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".about__statement",
          start: "top 72%",
          end: "center 55%",
          scrub: true,
        },
      }
    );

    // Stats: count up on enter
    $$(".about__stat-num", about).forEach((el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      el.textContent = prefix + "0" + suffix;
      window.ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = prefix + Math.round(obj.v) + suffix;
            },
          });
        },
      });
    });

    // Values: reveal in on enter
    gsap.from($$(".value", about), {
      autoAlpha: 0,
      y: 26,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".about__values", start: "top 80%", once: true },
    });

    // Portrait: gentle parallax (all screen sizes)
    const portrait = $(".about__portrait img", about);
    if (portrait) {
      gsap.fromTo(
        portrait,
        { yPercent: -6, scale: 1.08 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: ".about__portrait",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }
  }

  function boot() {
    initHero();
    initAbout();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
