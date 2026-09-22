/* ============================================================
   LMX STUDIO — DIGITAL LAB
   Four self-contained creative-dev experiments. Each loop runs
   ONLY while its module is on screen (IntersectionObserver),
   so the page stays light. Three.js is lazy-loaded for the 3D
   experiment alone — never the whole page in WebGL.
   All experiments honour prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  const { $, $$, prefersReducedMotion, isTouch } = window.LMX.utils;
  const REDUCE = prefersReducedMotion();
  const LOW = window.innerWidth < 768; // lighter effects on phones

  function debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  /* rAF loop with start/stop */
  function loop(update) {
    let raf = null;
    let running = false;
    let last = performance.now();
    function tick(now) {
      const dt = Math.min(48, now - last);
      last = now;
      update(dt, now);
      raf = requestAnimationFrame(tick);
    }
    return {
      start() {
        if (running || REDUCE) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      },
      stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      },
    };
  }

  /* Run start/stop as the element enters/leaves the viewport */
  function onVisible(el, api) {
    if (REDUCE) {
      api.paint && api.paint();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            api.paint && api.paint(); // first frame immediately
            api.start();
          } else {
            api.stop();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
  }

  /* Canvas sizing helper (DPR-aware) */
  function fitCanvas(canvas, stage) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = stage.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    canvas.style.width = r.width + "px";
    canvas.style.height = r.height + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: r.width, h: r.height, ctx };
  }

  /* ==========================================================
     EXPERIMENT 01 — Particle field (mouse interaction)
     ========================================================== */
  function initParticles(root) {
    const stage = $(".exp__stage", root);
    const canvas = $("canvas", root);
    if (!stage || !canvas) return;
    let W, H, ctx, particles;
    const mouse = { x: -999, y: -999, on: false };

    function build() {
      const s = fitCanvas(canvas, stage);
      W = s.w;
      H = s.h;
      ctx = s.ctx;
      const count = Math.min(LOW ? 42 : 90, Math.round((W * H) / (LOW ? 12000 : 9000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // mouse repel
        if (mouse.on) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12000) {
            const d = Math.sqrt(d2) || 1;
            const f = (110 - d) / 110;
            p.x += (dx / d) * f * 2.2;
            p.y += (dy / d) * f * 2.2;
          }
        }

        // links (skipped on phones — O(n²) is the heaviest part)
        if (!LOW) {
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 9000) {
              const a = (1 - d2 / 9000) * 0.16;
              ctx.strokeStyle = "rgba(216,216,216," + a + ")";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.stroke();
            }
          }
        }

        const near =
          mouse.on &&
          (p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2 < 12000;
        ctx.fillStyle = near
          ? "rgba(201,154,74,0.95)"
          : "rgba(216,216,216,0.6)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, near ? 2.4 : 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const anim = loop(draw);
    build();

    let rect = stage.getBoundingClientRect();
    stage.addEventListener("pointerenter", () => (rect = stage.getBoundingClientRect()));
    stage.addEventListener(
      "pointermove",
      (e) => {
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.on = true;
      },
      { passive: true }
    );
    stage.addEventListener("pointerleave", () => (mouse.on = false));
    window.addEventListener(
      "resize",
      debounce(() => {
        rect = stage.getBoundingClientRect();
        build();
      }, 200)
    );

    onVisible(root, {
      start: anim.start,
      stop: anim.stop,
      paint: () => {
        build();
        draw();
      },
    });
  }

  /* ==========================================================
     EXPERIMENT 02 — Dynamic text (scramble + magnetic letters)
     ========================================================== */
  function initText(root) {
    const stage = $(".exp__stage", root);
    const el = $(".exp__text", root);
    if (!stage || !el) return;

    const WORDS = ["CREATIVE", "DEVELOPER", "MOTION", "LMX STUDIO"];
    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/0123456789";
    let wordIndex = 0;

    function render(text) {
      el.innerHTML = "";
      for (const ch of text) {
        const s = document.createElement("span");
        s.className = "exp__char";
        s.textContent = ch === " " ? " " : ch;
        el.appendChild(s);
      }
    }

    function scrambleTo(next) {
      const spans = () => $$(".exp__char", el);
      const from = el.textContent;
      const len = Math.max(from.length, next.length);
      render(next.padEnd(len, " "));
      const chars = spans();
      let frame = 0;
      const total = 22;
      const settle = chars.map(() => Math.floor(Math.random() * 14) + 4);
      const id = setInterval(() => {
        frame++;
        chars.forEach((c, i) => {
          const target = next[i] || " ";
          if (frame >= settle[i]) {
            c.textContent = target === " " ? " " : target;
            c.classList.remove("is-scrambling");
          } else {
            c.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            c.classList.add("is-scrambling");
          }
        });
        if (frame > total) {
          clearInterval(id);
          render(next);
        }
      }, 45);
      return id;
    }

    render(WORDS[0]);

    let cycle = null;
    function startCycle() {
      if (REDUCE || cycle) return;
      cycle = setInterval(() => {
        wordIndex = (wordIndex + 1) % WORDS.length;
        scrambleTo(WORDS[wordIndex]);
      }, 2600);
    }
    function stopCycle() {
      if (cycle) clearInterval(cycle);
      cycle = null;
    }

    // magnetic letters follow the cursor slightly
    if (!isTouch() && !REDUCE) {
      stage.addEventListener("pointermove", (e) => {
        const chars = $$(".exp__char", el);
        chars.forEach((c) => {
          const b = c.getBoundingClientRect();
          const dx = e.clientX - (b.left + b.width / 2);
          const dy = e.clientY - (b.top + b.height / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const f = (120 - dist) / 120;
            c.style.transform = `translate(${(-dx / dist) * f * 10}px, ${
              (-dy / dist) * f * 10
            }px)`;
          } else {
            c.style.transform = "";
          }
        });
      });
      stage.addEventListener("pointerleave", () => {
        $$(".exp__char", el).forEach((c) => (c.style.transform = ""));
      });
    }

    onVisible(root, {
      start: startCycle,
      stop: stopCycle,
      paint: () => render(WORDS[0]),
    });
  }

  /* ==========================================================
     EXPERIMENT 03 — Animated SVG + magnetic node
     ========================================================== */
  function initMagnetic(root) {
    const stage = $(".exp__stage", root);
    const rings = $(".exp__rings", root);
    const orb = $(".exp__orb", root);
    const link = $(".exp__link-line", root);
    if (!stage || !orb) return;

    let angle = 0;
    const pos = { x: 0.5, y: 0.5 }; // normalized
    const target = { x: 0.5, y: 0.5 };

    function update() {
      angle += 0.3;
      if (rings) rings.style.transform = `rotate(${angle}deg)`;
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      const r = stage.getBoundingClientRect();
      const px = pos.x * r.width;
      const py = pos.y * r.height;
      orb.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%)`;
      if (link) {
        link.setAttribute("x1", r.width / 2);
        link.setAttribute("y1", r.height / 2);
        link.setAttribute("x2", px);
        link.setAttribute("y2", py);
      }
    }

    const anim = loop(update);

    let mrect = stage.getBoundingClientRect();
    stage.addEventListener("pointerenter", () => (mrect = stage.getBoundingClientRect()));
    stage.addEventListener(
      "pointermove",
      (e) => {
        target.x = (e.clientX - mrect.left) / mrect.width;
        target.y = (e.clientY - mrect.top) / mrect.height;
      },
      { passive: true }
    );
    stage.addEventListener("pointerleave", () => {
      target.x = 0.5;
      target.y = 0.5;
    });

    onVisible(root, {
      start: anim.start,
      stop: anim.stop,
      paint: update,
    });
  }

  /* ==========================================================
     EXPERIMENT 04 — Light 3D (Three.js, lazy-loaded)
     ========================================================== */
  function loadThree() {
    return new Promise((resolve, reject) => {
      if (window.THREE) return resolve(window.THREE);
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      s.onload = () => resolve(window.THREE);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function initThree(root) {
    const stage = $(".exp__stage", root);
    const canvas = $("canvas", root);
    const fallback = $(".exp__fallback", root);
    if (!stage || !canvas) return;

    // No WebGL, reduced motion, touch or small screens → static fallback.
    // (Simplify Three.js on mobile: never spin up WebGL there.)
    const testGL = (() => {
      try {
        return !!document
          .createElement("canvas")
          .getContext("webgl");
      } catch (e) {
        return false;
      }
    })();
    const smallOrTouch = isTouch() || window.innerWidth < 768;
    if (REDUCE || !testGL || smallOrTouch) {
      if (fallback) fallback.hidden = false;
      if (canvas) canvas.hidden = true;
      return;
    }

    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            boot();
          }
        });
      },
      { threshold: 0.1 }
    );
    io.observe(root);

    function boot() {
      loadThree()
        .then((THREE) => run(THREE))
        .catch(() => {
          if (fallback) fallback.hidden = false;
        });
    }

    function run(THREE) {
      canvas.hidden = false;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 4.2;

      const geo = new THREE.IcosahedronGeometry(1.35, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xd8d8d8,
        metalness: 1,
        roughness: 0.28,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xc99a4a, transparent: true, opacity: 0.5 })
      );
      mesh.add(wire);

      scene.add(new THREE.AmbientLight(0x404040, 1.2));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(3, 4, 5);
      scene.add(key);
      const gold = new THREE.PointLight(0xc99a4a, 6, 20);
      gold.position.set(-3, -2, 3);
      scene.add(gold);

      const target = { x: 0, y: 0 };
      stage.addEventListener("pointermove", (e) => {
        const r = stage.getBoundingClientRect();
        target.x = (e.clientX - r.left) / r.width - 0.5;
        target.y = (e.clientY - r.top) / r.height - 0.5;
      });

      function resize() {
        const r = stage.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener("resize", resize);

      const anim = loop(() => {
        mesh.rotation.y += 0.004;
        mesh.rotation.x += 0.002;
        mesh.rotation.y += (target.x * 0.6 - mesh.rotation.y % (Math.PI * 2)) * 0;
        mesh.rotation.x += target.y * 0.02;
        mesh.rotation.z += target.x * 0.01;
        renderer.render(scene, camera);
      });

      // Own visibility gating (render only when visible)
      const io2 = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => (e.isIntersecting ? anim.start() : anim.stop())),
        { threshold: 0.1 }
      );
      io2.observe(root);
    }
  }

  /* ---------- BOOT ---------- */
  function init() {
    const map = {
      particles: initParticles,
      text: initText,
      magnetic: initMagnetic,
      three: initThree,
    };
    $$(".exp").forEach((el) => {
      const kind = el.dataset.exp;
      if (map[kind]) map[kind](el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
