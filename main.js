/* ============================================================
   JK99_OS — main.js  (Techwear HUD / Brutalist)
   ============================================================ */

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = window.matchMedia('(pointer: fine)').matches;

/* ---- LIVE CLOCK (UTC) ---- */
(function () {
  const el = document.getElementById('clock');
  if (!el) return;
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const d = new Date();
    el.textContent = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---- TYPEWRITER READOUT ---- */
(function () {
  const el = document.getElementById('typeline');
  if (!el) return;
  const text = '> booting JK99_OS // streetwear × gaming protocol — ready_';
  if (RM) { el.textContent = text; return; }
  let i = 0;
  el.textContent = '';
  function step() {
    if (i <= text.length) { el.textContent = text.slice(0, i); i++; setTimeout(step, 28 + Math.random() * 30); }
  }
  setTimeout(step, 700);
})();

/* ---- RETICLE CURSOR ---- */
(function () {
  const r = document.getElementById('reticle');
  if (!r || !FINE || RM) return;
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; r.classList.add('on'); }, { passive: true });
  window.addEventListener('pointerdown', () => r.classList.add('click'));
  (function loop() {
    x += (tx - x) * 0.25; y += (ty - y) * 0.25;
    r.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
})();

/* ---- TOP BAR + PROGRESS ---- */
(function () {
  const bar = document.getElementById('topbar');
  const prog = document.getElementById('progress');
  function onScroll() {
    const y = window.scrollY;
    if (bar) bar.classList.toggle('scrolled', y > 30);
    if (prog) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
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
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14 });
  els.forEach(el => io.observe(el));
})();

/* ---- PARALLAX ---- */
(function () {
  if (RM) return;
  const layers = [
    { el: document.querySelector('.band__bg'), speed: 0.12, scale: 1.1 },
    { el: document.querySelector('.lookbook__bg'), speed: 0.09, scale: 1.05 },
  ].filter(l => l.el);
  if (!layers.length) return;
  let ticking = false;
  function update() {
    layers.forEach(l => {
      const r = l.el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const shift = (innerHeight - r.top) * l.speed;
      l.el.style.transform = `translate3d(0, ${shift * -0.28}px, 0) scale(${l.scale})`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
})();

/* ---- ANIMATED COUNTERS ---- */
(function () {
  const nums = document.querySelectorAll('.stat__n');
  if (!nums.length) return;
  function fmt(n) {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
    return String(n);
  }
  function run(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    if (RM) { el.textContent = prefix + fmt(target) + suffix; return; }
    const dur = 1400, start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(Math.round(target * e)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

/* ---- CARD TILT (subtle, mechanical) ---- */
(function () {
  if (RM || !FINE) return;
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${py * -3}deg) rotateY(${px * 4}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
})();

/* ---- NEWSLETTER ---- */
(function () {
  const form = document.getElementById('signup');
  if (!form) return;
  const input = document.getElementById('email');
  const msg = document.getElementById('signupMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = (input.value || '').trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) { msg.textContent = '> ERR: invalid address — retry_'; msg.style.color = '#F26B3A'; return; }
    msg.textContent = '> ACCESS GRANTED — welcome to JK99_OS_';
    msg.style.color = '';
    input.value = '';
  });
})();
