/* ============================================================
   LMX STUDIO — SERVICES
   Editorial hover list. Scroll entrance for all; a floating
   visual preview that follows the cursor on desktop.
   (Typography change, number, shift & description are CSS :hover.)
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, isTouch, prefersReducedMotion, gsapReady } = window.LMX.utils;
  const { EASE, DUR } = window.LMX.motion;

  function init() {
    const list = $(".services__list");
    if (!list) return;
    const services = $$(".service", list);
    if (!gsapReady()) return;
    const gsap = window.gsap;
    const reduce = prefersReducedMotion();

    // Scroll entrance (rows rise in)
    if (!reduce && window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
      gsap.set(services, { autoAlpha: 0, y: 30 });
      window.ScrollTrigger.create({
        trigger: list,
        start: "top 80%",
        once: true,
        onEnter: () =>
          gsap.to(services, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: EASE.out,
            stagger: 0.06,
          }),
      });
    }

    // Touch: no hover, so the row crossing the middle of the screen
    // gets the same fill / shift / reveal / spotlight as a hovered row.
    if (isTouch() && window.ScrollTrigger) {
      const setActive = (s, on) => {
        s.classList.toggle("is-active", on);
        list.classList.toggle("has-active", !!list.querySelector(".service.is-active"));
      };
      services.forEach((s) => {
        window.ScrollTrigger.create({
          trigger: s,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => setActive(s, self.isActive),
        });
      });
    }

    // Floating preview (desktop, hover only)
    if (isTouch() || reduce) return;

    const pv = document.createElement("div");
    pv.className = "services-preview";
    pv.setAttribute("aria-hidden", "true");
    pv.innerHTML =
      '<div class="services-preview__inner"><img alt="" decoding="async" /><span></span></div>';
    document.body.appendChild(pv);
    const label = pv.querySelector("span");
    const img = pv.querySelector("img");

    gsap.set(pv, { xPercent: -50, yPercent: -50, scale: 0.94, autoAlpha: 0 });
    const qx = gsap.quickTo(pv, "x", { duration: 0.5, ease: EASE.follow });
    const qy = gsap.quickTo(pv, "y", { duration: 0.5, ease: EASE.follow });

    // The motion was always right; the picture arrived late. Assigning
    // img.src inside mouseenter meant the first hover on every row showed
    // an empty frame for the length of a network round trip. Warm all five
    // (~150KB total) the moment the pointer reaches the list — late enough
    // to cost nothing on load, early enough that no hover ever waits.
    let warmed = false;
    list.addEventListener(
      "pointerenter",
      () => {
        if (warmed) return;
        warmed = true;
        services.forEach((s) => {
          if (s.dataset.img) new Image().src = s.dataset.img;
        });
      },
      { once: true, passive: true }
    );

    services.forEach((s) => {
      s.addEventListener("mouseenter", () => {
        const name = s.dataset.service || s.querySelector(".service__name").textContent;
        label.textContent = name;
        if (s.dataset.img) {
          img.src = s.dataset.img;
          img.alt = name;
          pv.classList.add("has-img");
        } else {
          pv.classList.remove("has-img");
        }
        gsap.to(pv, { autoAlpha: 1, scale: 1, duration: DUR.pop, ease: EASE.out });
      });
      s.addEventListener(
        "mousemove",
        (e) => {
          qx(e.clientX);
          qy(e.clientY);
        },
        { passive: true }
      );
      s.addEventListener("mouseleave", () => {
        gsap.to(pv, { autoAlpha: 0, scale: 0.94, duration: DUR.pop, ease: EASE.out });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
