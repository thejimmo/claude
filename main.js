/* ============================================================
   JK99 — main.js
   Particles · reveals · parallax · counters · interactions
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- HERO PARTICLES ---- */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');

  const COLORS = [
    [75, 173, 232],   // blue
    [242, 107, 58],   // orange
    [245, 166, 35],   // gold
    [142, 211, 240],  // light blue
  ];

  let particles = [], W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(seed) {
    return {
      x: Math.random() * W,
      y: seed ? Math.random() * H : H + Math.random() * 80,
      r: Math.random() * 2.4 + 0.5,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.7 + 0.25),
      a: Math.random() * 0.55 + 0.15,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      f: Math.random() * Math.PI * 2,
    };
  }

  function init() { resize(); particles = Array.from({ length: 110 }, () => spawn(true)); }

  let last = 0;
  function tick(t) {
    const dt = Math.min((t - last) / 16, 3); last = t;
    ctx.clearRect(0, 0, W, H);
    if (particles.length < 130 && Math.random() < 0.3) particles.push(spawn(false));

    particles = particles.filter(p => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.f += 0.03 * dt;
      const a = p.a * (0.7 + 0.3 * Math.sin(p.f));
      const [r, g, b] = p.c;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grd.addColorStop(0, `rgba(${r},${g},${b},${a * 0.8})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, 6.283); ctx.fill();
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      return p.y > -20;
    });
    requestAnimationFrame(tick);
  }

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  init();
  requestAnimationFrame(tick);
})();

/* ---- HERO LOAD + MOUSE SPOTLIGHT ---- */
(function () {
  const hero = document.querySelector('.hero');
  const spot = document.getElementById('heroSpot');
  if (hero) requestAnimationFrame(() => hero.classList.add('loaded'));
  if (hero && spot && !reduceMotion) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      spot.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      spot.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  }
})();

/* ---- NAV STATE + SCROLL PROGRESS ---- */
(function () {
  const nav = document.getElementById('nav');
  const bar = document.getElementById('progress');
  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- SCROLL REVEAL ---- */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
})();

/* ---- PARALLAX ---- */
(function () {
  if (reduceMotion) return;
  const layers = [
    { el: document.querySelector('.manifesto__bg'), speed: 0.14, scale: 1.1 },
    { el: document.querySelector('.lookbook__img'), speed: 0.1, scale: 1.06 },
  ].filter(l => l.el);
  if (!layers.length) return;

  let ticking = false;
  function update() {
    layers.forEach(l => {
      const r = l.el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const shift = (window.innerHeight - r.top) * l.speed;
      l.el.style.transform = `translate3d(0, ${shift * -0.3}px, 0) scale(${l.scale})`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

/* ---- ANIMATED COUNTERS ---- */
(function () {
  const nums = document.querySelectorAll('.stat__num');
  if (!nums.length) return;

  function format(n) {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
    return String(n);
  }
  function run(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = format(target) + suffix; return; }
    const dur = 1500; const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

/* ---- MAGNETIC BUTTONS ---- */
(function () {
  if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
})();

/* ---- CARD TILT ---- */
(function () {
  if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${py * -5}deg) rotateY(${px * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
})();

/* ---- NEWSLETTER ---- */
(function () {
  const form = document.getElementById('signup');
  if (!form) return;
  const input = form.querySelector('.signup__input');
  const msg = document.getElementById('signupMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = (input.value || '').trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) { msg.textContent = '> invalid email — try again'; msg.style.color = '#ff5a4d'; return; }
    msg.textContent = "> you're on the list. welcome to JK99.";
    msg.style.color = '';
    input.value = '';
  });
})();
