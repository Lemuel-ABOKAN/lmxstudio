/* ============================================================
   LMX STUDIO — PROJECT VIEW (fullscreen case study)
   The clicked gallery image is the seed of the transition:
   it grows from its position to a fullscreen hero (scale +
   position + radius), the background fades in, then the
   typography and narrative reveal. Close reverses fluidly.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion, gsapReady } = window.LMX.utils;

  let shell, bg, closeBtn, scroller, content, flip, flipImg, heroImg;
  let isOpen = false;
  let lastFocus = null;
  let srcRect = null;
  let io = null;

  function build() {
    shell = document.createElement("div");
    shell.className = "pv";
    shell.id = "project-view";
    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");
    shell.setAttribute("aria-hidden", "true");
    shell.innerHTML = `
      <div class="pv__bg"></div>
      <button class="pv__close" type="button" aria-label="Fermer le projet">
        <span>Fermer</span>
        <span class="pv__close-glyph" aria-hidden="true"><i></i><i></i></span>
      </button>
      <div class="pv__scroll">
        <div class="pv__content"></div>
      </div>
      <div class="pv__flip" aria-hidden="true"><img class="pv__flip-img" alt="" /></div>
    `;
    document.body.appendChild(shell);
    bg = $(".pv__bg", shell);
    closeBtn = $(".pv__close", shell);
    scroller = $(".pv__scroll", shell);
    content = $(".pv__content", shell);
    flip = $(".pv__flip", shell);
    flipImg = $(".pv__flip-img", shell);

    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) close();
    });
  }

  function metaRow(label, value) {
    return `<div class="pv__meta-item"><dt class="pv__meta-label label">${label}</dt><dd class="pv__meta-value">${value}</dd></div>`;
  }

  function storyAct(n, label, text, project, mediaLabel) {
    return `
      <section class="pv__act" data-reveal-pv>
        <div class="pv__act-head">
          <span class="pv__act-num numeral">${n}</span>
          <h3 class="pv__act-title">${label}</h3>
        </div>
        <p class="pv__act-text">${text}</p>
        <figure class="pv__media" data-reveal-pv>
          <div class="pv__media-ph"><span>${project}</span><em>${mediaLabel}</em></div>
        </figure>
      </section>`;
  }

  function fill(p) {
    const s = p.story || {};
    const acts =
      storyAct("01", "Le Défi", s.challenge || "", p.title, "Contexte") +
      storyAct("02", "La Direction", s.direction || "", p.title, "Direction") +
      storyAct("03", "Le Design", s.design || "", p.title, "Design") +
      storyAct("04", "Le Développement", s.development || "", p.title, "Développement") +
      storyAct("05", "Le Résultat", s.result || "", p.title, "Résultat");

    content.innerHTML = `
      <header class="pv__hero">
        <div class="pv__hero-media">
          <img class="pv__hero-img" src="${p.image}" alt="${p.title} — ${p.category}" />
        </div>
        <div class="pv__hero-caption container">
          <p class="pv__hero-cat label">${p.category}</p>
          <h2 class="pv__hero-title"><span>${p.title}</span></h2>
        </div>
      </header>

      <dl class="pv__meta container" data-reveal-pv>
        ${metaRow("Projet", p.title)}
        ${metaRow("Client", p.client || "—")}
        ${metaRow("Année", p.year || "—")}
        ${metaRow("Rôle", p.role || "—")}
        ${metaRow("Services", (p.services || []).join(", ") || "—")}
        ${metaRow("Technologies", (p.technologies || []).join(", ") || "—")}
      </dl>

      <div class="pv__story container">${acts}</div>

      <footer class="pv__foot container">
        <p class="pv__foot-note label">LMX Studio — Étude de cas</p>
        <button class="btn btn--accent pv__foot-close" type="button">Fermer le projet</button>
      </footer>
    `;
    heroImg = $(".pv__hero-img", content);
    $(".pv__foot-close", content).addEventListener("click", close);
  }

  function lock() {
    document.documentElement.classList.add("pv-open");
  }
  function unlock() {
    document.documentElement.classList.remove("pv-open");
  }

  function open(index, imgEl) {
    if (isOpen) return;
    const p = (window.LMX.projects || [])[index];
    if (!p) return;
    if (!shell) build();

    isOpen = true;
    lastFocus = document.activeElement;
    fill(p);

    shell.classList.add("is-open");
    shell.setAttribute("aria-hidden", "false");
    lock();
    scroller.scrollTop = 0;

    const reduce = prefersReducedMotion();
    const gsap = window.gsap;

    if (!gsapReady() || reduce || !imgEl) {
      // Instant open
      if (flip) flip.style.display = "none";
      revealObserver();
      closeBtn.focus();
      return;
    }

    // FLIP seed from the clicked image
    srcRect = imgEl.getBoundingClientRect();
    flipImg.src = p.image;
    flip.style.display = "block";
    gsap.set(bg, { autoAlpha: 0 });
    gsap.set(flip, {
      position: "fixed",
      top: srcRect.top,
      left: srcRect.left,
      width: srcRect.width,
      height: srcRect.height,
      borderRadius: 8,
      autoAlpha: 1,
      overflow: "hidden",
    });
    gsap.set(flipImg, { scale: 1.06 });
    gsap.set(heroImg, { autoAlpha: 0 });

    // hide caption/meta initially
    const cap = $(".pv__hero-title > span", content);
    const cat = $(".pv__hero-cat", content);
    gsap.set(cap, { yPercent: 115 });
    gsap.set(cat, { autoAlpha: 0, y: 20 });

    const tl = gsap.timeline({
      defaults: { ease: "power4.inOut" },
      onComplete: () => {
        // swap flip → real hero (seamless, same image & position)
        gsap.set(heroImg, { autoAlpha: 1 });
        flip.style.display = "none";
        revealObserver();
      },
    });
    tl.to(bg, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0)
      .to(
        flip,
        {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          borderRadius: 0,
          duration: 0.9,
        },
        0.05
      )
      .to(flipImg, { scale: 1, duration: 0.9 }, 0.05)
      // typography reveal
      .to(cap, { yPercent: 0, duration: 0.8, ease: "expo.out" }, 0.55)
      .to(cat, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.5);

    closeBtn.focus();
  }

  function close() {
    if (!isOpen) return;
    const reduce = prefersReducedMotion();
    const gsap = window.gsap;

    function finish() {
      shell.classList.remove("is-open");
      shell.setAttribute("aria-hidden", "true");
      unlock();
      if (io) {
        io.disconnect();
        io = null;
      }
      isOpen = false;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    if (!gsapReady() || reduce || !srcRect) {
      finish();
      return;
    }

    scroller.scrollTop = 0;
    // Bring the flip clone back and shrink it toward the gallery.
    gsap.set(heroImg, { autoAlpha: 0 });
    flip.style.display = "block";
    gsap.set(flip, {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0,
      autoAlpha: 1,
    });

    gsap
      .timeline({
        defaults: { ease: "power4.inOut" },
        onComplete: () => {
          flip.style.display = "none";
          finish();
        },
      })
      .to($$(".pv__content > *", content), { autoAlpha: 0, duration: 0.25 }, 0)
      .to(
        flip,
        {
          top: srcRect.top,
          left: srcRect.left,
          width: srcRect.width,
          height: srcRect.height,
          borderRadius: 8,
          duration: 0.7,
        },
        0.1
      )
      .to(bg, { autoAlpha: 0, duration: 0.5 }, 0.25);
  }

  // Reveal narrative acts as they scroll into the inner scroller.
  function revealObserver() {
    if (prefersReducedMotion()) return;
    const targets = $$("[data-reveal-pv]", content);
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-inview");
            io.unobserve(e.target);
          }
        });
      },
      { root: scroller, threshold: 0.15 }
    );
    targets.forEach((t) => io.observe(t));
  }

  // Public API
  window.LMX.openProject = open;

  // Keep flip target sizes correct on resize while open
  window.addEventListener("resize", () => {
    if (isOpen && flip && flip.style.display === "block" && window.gsap) {
      window.gsap.set(flip, { width: window.innerWidth, height: window.innerHeight });
    }
  });
})();
