/* ============================================================
   JK99Gaming — main.js
   Particle canvas, scroll reveals, parallax
   ============================================================ */

// ---- HERO PARTICLE SYSTEM ----
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = [
    { r: 75,  g: 173, b: 232 }, // blue
    { r: 242, g: 107, b: 58  }, // orange
    { r: 245, g: 166, b: 35  }, // gold
    { r: 137, g: 211, b: 240 }, // light blue
  ];

  let particles = [];
  let W, H, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  function spawnParticle() {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:     Math.random() * W,
      y:     H + Math.random() * 100,
      r:     Math.random() * 2.5 + 0.5,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    -(Math.random() * 0.8 + 0.3),
      alpha: Math.random() * 0.6 + 0.15,
      color: c,
      flicker: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 120 }, spawnParticle).map(p => ({
      ...p,
      y: Math.random() * H,
    }));
  }

  let lastTime = 0;
  function tick(ts) {
    const dt = Math.min((ts - lastTime) / 16, 3);
    lastTime = ts;

    ctx.clearRect(0, 0, W, H);

    // Slowly add particles to replace ones that exit
    if (particles.length < 140 && Math.random() < 0.35) {
      particles.push(spawnParticle());
    }

    particles = particles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.flicker += 0.03 * dt;

      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.flicker));
      const { r, g, b } = p.color;

      // Glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grd.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.8})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();

      return p.y > -20;
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  requestAnimationFrame(tick);
})();


// ---- NAV SCROLL STATE ----
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let last = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.style.background = y > 60
      ? 'rgba(6,4,15,0.95)'
      : 'rgba(10,6,24,0.72)';
    last = y;
  }, { passive: true });
})();


// ---- HERO LOAD ANIMATION ----
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');
  if (hero) setTimeout(() => hero.classList.add('loaded'), 100);
});


// ---- SCROLL REVEAL (IntersectionObserver) ----
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => io.observe(el));
})();


// ---- PARALLAX on full-bleed image sections ----
(function () {
  const parallaxEls = [
    document.querySelector('.visual-break__img'),
    document.querySelector('.character-break__img'),
  ].filter(Boolean);

  if (!parallaxEls.length) return;

  function onScroll() {
    parallaxEls.forEach(el => {
      const rect = el.parentElement.getBoundingClientRect();
      const progress = -rect.top / window.innerHeight;
      const shift = progress * 60;
      el.style.transform = `translateY(${shift}px) scale(1.08)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ---- MARQUEE: pause on hover ----
(function () {
  const track = document.querySelector('.marquee__track');
  if (!track) return;
  const parent = track.closest('.marquee');
  parent?.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  parent?.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
})();
