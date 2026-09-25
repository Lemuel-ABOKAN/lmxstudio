/* ============================================================
   LMX STUDIO — SELECTED WORK
   Clean card grid: a screenshot per project + a direct link to
   the live site. Data-driven — edit the PROJECTS array.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion, gsapReady } = window.LMX.utils;
  const { EASE, DUR } = window.LMX.motion;

  /* ---------- DATA (easily modifiable) ---------- */
  const PROJECTS = [
    {
      title: "Synergie Ivoire Solutions",
      category: "Corporate · Site vitrine",
      description:
        "Cabinet d'accompagnement des entreprises à Abidjan : création, comptabilité, immobilier et administratif.",
      image:
        "https://image.thum.io/get/width/1400/crop/900/noanimate/https://synergie-eight.vercel.app/",
      year: "2025",
      url: "https://synergie-eight.vercel.app/",
    },
    {
      title: "Globalprextige",
      category: "Commerce · Site vitrine",
      description:
        "Quincaillerie & matériaux de construction à Abidjan : univers produits, showroom et demande de devis.",
      image:
        "https://image.thum.io/get/width/1400/crop/900/noanimate/https://globalprextige.vercel.app/",
      year: "2025",
      url: "https://globalprextige.vercel.app/",
    },
    {
      title: "Sankofa Lodge",
      category: "Hôtellerie · Expérience web",
      description:
        "Lodge de luxe à Abidjan, une expérience immersive, entre héritage et raffinement.",
      image:
        "https://image.thum.io/get/width/1400/crop/900/noanimate/https://sankofalogde.vercel.app/",
      year: "2024",
      url: "https://sankofalogde.vercel.app/",
    },
    {
      title: "SFID",
      category: "Finance · Site vitrine",
      description:
        "Société Financière de l'Innovation du Développement : financement, conseil en investissement et accompagnement stratégique.",
      image: "assets/images/projects/sfid.webp",
      year: "2025",
      url: "https://sfid-lemuel1.vercel.app/",
    },
  ];

  const pad = (n) => String(n + 1).padStart(2, "0");

  /* ---------- RENDER ---------- */
  function render(section) {
    const cards = PROJECTS.map((p, i) => {
      // Placeholder sits behind; the screenshot covers it and,
      // if it fails to load (e.g. protected site), removes itself.
      // The placeholder shimmers until the screenshot lands, then stops —
      // three of these come from a third-party render service, so the wait
      // is real and has to read as "arriving", not "broken".
      const media = `
          <span class="pcard__ph" aria-hidden="true"><span>${p.title}</span></span>
          ${
            p.image
              ? `<img class="pcard__img" src="${p.image}" alt="Aperçu du site ${p.title}" loading="lazy" decoding="async" onload="this.closest('.pcard').classList.add('is-loaded')" onerror="this.closest('.pcard').classList.add('is-loaded');this.remove()" />`
              : ""
          }`;
      return `
      <a class="pcard" href="${p.url}" target="_blank" rel="noopener"
         data-cursor="view" aria-label="${p.title}, ouvrir le site" style="--i:${i}">
        <div class="pcard__media">
          <span class="pcard__index numeral">${pad(i)}</span>
          ${media}
        </div>
        <div class="pcard__body">
          <div class="pcard__meta">
            <p class="pcard__cat label">${p.category}</p>
            <h3 class="pcard__title">${p.title}</h3>
            <p class="pcard__desc">${p.description}</p>
          </div>
          <span class="pcard__cta">Visiter le site <span class="pcard__arrow" aria-hidden="true">↗</span></span>
        </div>
      </a>`;
    }).join("");

    section.innerHTML = `
      <div class="container work__head">
        <p class="label work__eyebrow">Projets sélectionnés</p>
        <h2 class="work__title"><span>Réalisations</span><span>récentes</span></h2>
      </div>
      <div class="container work__grid">${cards}</div>`;
  }

  /* ---------- INIT ---------- */
  function init() {
    const section = $("#work");
    if (!section) return;
    render(section);

    const cards = $$(".pcard", section);
    const revealAll = () => cards.forEach((c) => c.classList.add("is-revealed"));

    // Motion is the enhancement, never the gate. Without GSAP, without
    // ScrollTrigger or with reduced motion, the work is simply there —
    // the clip-path that hides it must never be able to outlive the code
    // that is supposed to lift it.
    if (!gsapReady() || prefersReducedMotion() || !window.ScrollTrigger) {
      revealAll();
      return;
    }
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // The screenshot wipes up from its own bottom edge while the text
    // rises: one coordinated motion, not two competing entrances. The
    // 80ms cascade between cards lives in CSS, off --i.
    window.ScrollTrigger.create({
      trigger: ".work__grid",
      start: "top 85%",
      once: true,
      onEnter: revealAll,
    });
    // Safety net: if the trigger never fires (layout shift, refresh race),
    // the work still shows.
    window.setTimeout(revealAll, 4000);

    // Title reveal
    gsap.from($$(".work__title span", section), {
      yPercent: 110,
      autoAlpha: 0,
      duration: 0.8,
      ease: EASE.emphasis,
      stagger: 0.06,
      scrollTrigger: { trigger: ".work__head", start: "top 85%", once: true },
    });

    // Only the text rises. The media is handled by the clip-path wipe
    // above — animating opacity on the card too would double-expose the
    // same element and turn a reveal into mush.
    gsap.from($$(".pcard__body", section), {
      autoAlpha: 0,
      y: 24,
      duration: 0.6,
      ease: EASE.out,
      stagger: 0.08,
      scrollTrigger: { trigger: ".work__grid", start: "top 82%", once: true },
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
