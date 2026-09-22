/* ============================================================
   LMX STUDIO — SELECTED WORK
   Clean card grid: a screenshot per project + a direct link to
   the live site. Data-driven — edit the PROJECTS array.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion, gsapReady } = window.LMX.utils;

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
      const media = `
          <span class="pcard__ph" aria-hidden="true"><span>${p.title}</span></span>
          ${
            p.image
              ? `<img class="pcard__img" src="${p.image}" alt="Aperçu du site ${p.title}" loading="lazy" decoding="async" onerror="this.remove()" />`
              : ""
          }`;
      return `
      <a class="pcard" href="${p.url}" target="_blank" rel="noopener"
         data-cursor="view" aria-label="${p.title}, ouvrir le site">
        <div class="pcard__media">
          <span class="pcard__index numeral">${pad(i)}</span>
          ${media}
        </div>
        <div class="pcard__body">
          <div class="pcard__meta">
            <p class="pcard__cat label">${p.category}</p>
            <h3 class="pcard__title">${p.title}</h3>
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

    if (!gsapReady() || prefersReducedMotion() || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // Title reveal
    gsap.from($$(".work__title span", section), {
      yPercent: 110,
      autoAlpha: 0,
      duration: 0.8,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".work__head", start: "top 85%", once: true },
    });

    // Cards reveal
    gsap.from($$(".pcard", section), {
      autoAlpha: 0,
      y: 40,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".work__grid", start: "top 82%", once: true },
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
