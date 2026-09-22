/* ============================================================
   LMX STUDIO — CUSTOM CURSOR (desktop only)
   States: default · link · view · drag  (label shown for view/drag)
   Smooth GSAP interpolation, a lagging ring behind a small dot.
   Discreet, pointer-events:none — never blocks clicks.
   Disabled on touch, coarse pointers and prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  const { $, prefersReducedMotion, isTouch, gsapReady } = window.LMX.utils;

  // Desktop + fine pointer + motion only
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine || isTouch() || prefersReducedMotion() || !gsapReady()) return;

  const gsap = window.gsap;

  // Build
  const cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML =
    '<span class="cursor__ring"><span class="cursor__label"></span></span>' +
    '<span class="cursor__dot"></span>';
  document.body.appendChild(cursor);

  const ring = $(".cursor__ring", cursor);
  const dot = $(".cursor__dot", cursor);
  const label = $(".cursor__label", cursor);

  document.documentElement.classList.add("has-cursor");
  gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });
  gsap.set(cursor, { autoAlpha: 0 });

  // Smooth follow — dot fast, ring lags slightly
  const dx = gsap.quickTo(dot, "x", { duration: 0.14, ease: "power3" });
  const dy = gsap.quickTo(dot, "y", { duration: 0.14, ease: "power3" });
  const rx = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3" });
  const ry = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3" });

  let shown = false;
  window.addEventListener(
    "pointermove",
    (e) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      if (!shown) {
        shown = true;
        gsap.to(cursor, { autoAlpha: 1, duration: 0.3 });
      }
    },
    { passive: true }
  );

  // Hide when the pointer leaves the window
  document.addEventListener("mouseleave", () =>
    gsap.to(cursor, { autoAlpha: 0, duration: 0.2 })
  );
  document.addEventListener("mouseenter", () =>
    gsap.to(cursor, { autoAlpha: 1, duration: 0.2 })
  );

  // Press feedback (GSAP owns the transform, so scale composes cleanly)
  window.addEventListener("pointerdown", () =>
    gsap.to(ring, { scale: 0.85, duration: 0.15, ease: "power3.out" })
  );
  window.addEventListener("pointerup", () =>
    gsap.to(ring, { scale: 1, duration: 0.2, ease: "power3.out" })
  );

  // ---- State detection ----
  const LINK_SEL =
    'a, button, .link, .nav__link, .service, .tech, .magnetic, [role="button"], input, textarea, select';

  function setState(target) {
    const dc = target.closest ? target.closest("[data-cursor]") : null;
    let state = "default";
    let text = "";

    if (dc) {
      const v = (dc.dataset.cursor || "").toLowerCase();
      if (v === "view" || v === "project") {
        state = "view";
        text = v === "project" ? "Projet" : "Voir";
      } else if (v === "drag") {
        state = "drag";
        text = "Glisser";
      } else if (v === "link") {
        state = "link";
      }
    } else if (target.closest && target.closest(LINK_SEL)) {
      state = "link";
    }

    cursor.classList.toggle("is-link", state === "link");
    cursor.classList.toggle("is-view", state === "view");
    cursor.classList.toggle("is-drag", state === "drag");
    if (text) label.textContent = text;
  }

  document.addEventListener("pointerover", (e) => setState(e.target));
})();
