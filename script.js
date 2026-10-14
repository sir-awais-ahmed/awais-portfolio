/* Pasand Khan — portfolio v5 */
document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Light / dark mode ---------- */
(function setupMode() {
  const root = document.documentElement;
  const btn = document.getElementById('mode-toggle');
  const meta = document.getElementById('theme-color-meta');
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    meta.setAttribute('content', theme === 'dark' ? '#08120F' : '#F3F6F4');
  }
  apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  btn.addEventListener('click', () => {
    const theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(theme);
    try { localStorage.setItem('awais-theme', theme); } catch (e) { /* storage blocked */ }
  });
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem('awais-theme'); } catch (err) { /* ignore */ }
    if (!saved) apply(e.matches ? 'light' : 'dark');
  });
})();

/* ---------- Mobile menu ---------- */
(function setupMenu() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  function setOpen(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.header')) setOpen(false); });
})();

/* ---------- Count-up numbers ---------- */
function countUp(el) {
  const target = Number(el.dataset.count);
  if (reduceMotion) { el.textContent = target; return; }
  const start = performance.now();
  (function step(now) {
    const t = Math.min((now - start) / 1300, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

/* ---------- Radar chart ---------- */
(function drawRadar() {
  const svg = document.getElementById('radar');
  if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const data = [
    ['Attendance', 2, 2], ['Conduct', 2, 2], ['Communication', 3, 3], ['Teamwork', 2, 2],
    ['Quality of work', 4, 4], ['Initiative', 2, 3], ['Responsibility', 2, 2], ['Adaptability', 1, 2],
  ];
  const n = data.length;
  // Phones scale the chart down, so draw a smaller web with more room for the (larger) labels
  const narrow = window.matchMedia('(max-width: 479px)').matches;
  const R = narrow ? 92 : 110;
  if (narrow) svg.setAttribute('viewBox', '-250 -138 500 276');
  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  const el = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    svg.appendChild(node);
    return node;
  };
  [0.25, 0.5, 0.75, 1].forEach((f) => {
    el('polygon', { class: 'ring', points: data.map((_, i) => pt(i, R * f).join(',')).join(' ') });
  });
  data.forEach(([label], i) => {
    const [x, y] = pt(i, R);
    el('line', { class: 'axis', x1: 0, y1: 0, x2: x, y2: y });
    const [lx, ly] = pt(i, R + 22);
    const t = el('text', { class: 'lbl', x: lx, y: ly + 4, 'text-anchor': Math.abs(lx) < 8 ? 'middle' : lx > 0 ? 'start' : 'end' });
    t.textContent = label;
  });
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'grow');
  svg.appendChild(g);
  const shape = document.createElementNS(NS, 'polygon');
  shape.setAttribute('class', 'shape');
  shape.setAttribute('points', data.map(([, s, m], i) => pt(i, (R * s) / m).join(',')).join(' '));
  g.appendChild(shape);
  data.forEach(([, s, m], i) => {
    const [x, y] = pt(i, (R * s) / m);
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'pt'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 4.5);
    g.appendChild(c);
  });
})();

/* ---------- Scroll: header, chapter rail ---------- */
const header = document.getElementById('header');
const rail = document.querySelector('.rail');
const railFill = document.getElementById('rail-fill');
const railLinks = [...rail.querySelectorAll('a')];
const navLinks = [...document.querySelectorAll('.nav a')];
const sections = railLinks.map((a) => document.getElementById(a.dataset.sec));
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > window.innerHeight * 0.5);
  const first = sections[0].offsetTop - window.innerHeight * 0.5;
  const last = sections[sections.length - 1].offsetTop - window.innerHeight * 0.5;
  rail.classList.toggle('show', y > first);
  railFill.style.transform = `scaleY(${Math.min(Math.max((y - first) / (last - first), 0), 1)})`;

  let current = -1;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.5) current = i; });
  railLinks.forEach((a, i) => { a.classList.toggle('active', i === current); a.classList.toggle('done', i < current); });
  const id = current >= 0 ? sections[current].id : '';
  navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

/* ---------- Reveal, counters, radar ---------- */
(function setupReveal() {
  const targets = document.querySelectorAll('.reveal');
  const radar = document.getElementById('radar');
  const counters = document.querySelectorAll('[data-count]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in')); radar.classList.add('in'); return;
  }
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } }),
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );
  targets.forEach((el) => obs.observe(el));
  obs.observe(radar);
  const cObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); } }),
    { threshold: 0.6 }
  );
  counters.forEach((el) => cObs.observe(el));
})();

/* ---------- Journal reader ---------- */
(function setupReader() {
  const reader = document.getElementById('reader');
  const body = document.getElementById('reader-body');
  if (!reader || typeof reader.showModal !== 'function') return;
  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      body.replaceChildren(document.getElementById(`tpl-${btn.dataset.open}`).content.cloneNode(true));
      body.scrollTop = 0;
      reader.showModal();
    });
  });
  document.getElementById('reader-close').addEventListener('click', () => reader.close());
  reader.addEventListener('click', (e) => { if (e.target === reader) reader.close(); });
})();

/* ---------- Journal week filter ---------- */
(function setupWeekFilter() {
  const btns = [...document.querySelectorAll('.wk')];
  const cards = [...document.querySelectorAll('#entries .entry')];
  btns.forEach((btn) => btn.addEventListener('click', () => {
    const w = btn.dataset.week;
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    cards.forEach((c) => {
      const show = w === 'all' || c.dataset.week === w;
      c.hidden = !show;
      if (show) c.classList.add('in');   // cards revealed by the filter skip the scroll fade
    });
  }));
})();

/* ---------- Work viewer ---------- */
(function setupViewer() {
  const stage = document.getElementById('stage');
  const img = document.getElementById('stage-img');
  const title = document.getElementById('stage-title');
  const text = document.getElementById('stage-text');
  const count = document.getElementById('stage-count');
  const thumbs = [...document.querySelectorAll('.thumb')];
  function show(i) {
    const t = thumbs[i];
    thumbs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    const swap = () => {
      img.src = t.dataset.src; img.alt = t.dataset.alt;
      title.textContent = t.dataset.title; text.textContent = t.dataset.text;
      count.textContent = `${i + 1} / ${thumbs.length}`;
      stage.classList.remove('swap');
    };
    if (reduceMotion) return swap();
    stage.classList.add('swap');
    setTimeout(swap, 220);
  }
  thumbs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = (i + d + thumbs.length) % thumbs.length;
      thumbs[n].focus(); show(n);
    });
  });
})();

/* ---------- Contact form (opens the visitor's email app) ---------- */
(function setupContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (!name || !email || !message) {
      status.textContent = 'Fill in your name, email and message, then send again.';
      return;
    }
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:awaisahmed6038@gmail.com?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email app with the message filled in.';
    form.reset();
  });
})();

document.getElementById('year').textContent = new Date().getFullYear();
