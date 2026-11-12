// KROMAKOPIA — interaction & motion engine (vanilla, no dependencies).
import { worksList, workFilters, servicesList, heroMedia, projectPage, published, sig, esc } from './templates.mjs';

const root = document.documentElement;
// `?motion` previews the full motion design even when the OS asks for reduced motion.
const forceMotion = new URLSearchParams(location.search).has('motion');
if (forceMotion) document.documentElement.dataset.motion = 'force';
const osReduced = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = { get matches() { return osReduced.matches && !forceMotion; }, addEventListener: (...a) => osReduced.addEventListener(...a) };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

root.classList.add('js');

/* ---------------- Content (CMS-editable JSON) ---------------- */
const contentCache = {};
export const loadContent = name => (contentCache[name] ??= fetch(`/content/${name}.json`, { cache: 'no-cache' })
  .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
  .catch(() => null));

function swap(el, html) {
  const s = sig(html);
  if (el.dataset.sig === s) return false;
  el.innerHTML = html;
  el.dataset.sig = s;
  return true;
}

async function hydrate() {
  const regions = $$('[data-render]');
  if (!regions.length) return;
  const needs = new Set(regions.map(el => el.dataset.render));
  const [projects, services, site] = await Promise.all([
    needs.has('works') || needs.has('filters') ? loadContent('projects') : null,
    needs.has('services') || needs.has('svc-index') ? loadContent('services') : null,
    needs.has('hero-media') ? loadContent('site') : null
  ]);
  let changed = false;
  for (const el of regions) {
    const limit = Number(el.dataset.limit) || Infinity;
    if (el.dataset.render === 'works' && projects) changed = swap(el, worksList(published(projects.projects).slice(0, limit))) || changed;
    if (el.dataset.render === 'filters' && projects) changed = swap(el, workFilters(projects.projects)) || changed;
    if (el.dataset.render === 'services' && services) changed = swap(el, servicesList(services.services)) || changed;
    if (el.dataset.render === 'svc-index' && services) changed = swap(el, services.services.map((s, i) => `<a href="/hizmetler/${esc(s.slug)}/"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</a>`).join('')) || changed;
    if (el.dataset.render === 'hero-media' && site) changed = swap(el, heroMedia(site)) || changed;
  }
  if (changed) { initRoll(); initFilters(); initHeroMedia(); initServices(); collect(); requestTick(); }
}

/* ---------------- Small UI ---------------- */
function initRoll() {
  $$('.btn:not([data-rolled]), [data-roll]:not([data-rolled])').forEach(el => {
    if (el.children.length && !el.matches('[data-roll]')) return;
    const text = el.textContent.trim();
    if (!text) return;
    el.dataset.rolled = '';
    el.innerHTML = `<span class="roll"><span>${esc(text)}</span><span aria-hidden="true">${esc(text)}</span></span>`;
  });
}

function initGlass() {
  document.addEventListener('pointermove', e => {
    const b = e.target.closest?.('.btn-glass');
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
    b.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
  }, { passive: true });
}

function initYear() { $$('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); }); }

/* ---------------- Header & full-screen menu ---------------- */
function initMenu() {
  const btn = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!btn || !menu) return;
  const path = location.pathname.replace(/index\.html$/, '');
  $$('.menu-link', menu).forEach(a => {
    const href = new URL(a.href).pathname;
    if (href === '/' ? path === '/' : path.startsWith(href)) a.setAttribute('aria-current', 'page');
  });
  const outside = () => [$('main'), $('.site-footer')].filter(Boolean);
  let lastFocus = null;
  const set = open => {
    btn.setAttribute('aria-expanded', String(open));
    $('.menu-btn-label', btn).textContent = open ? 'Kapat' : 'Menü';
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    root.classList.toggle('menu-open', open);
    outside().forEach(el => { el.inert = open; });
    if (open) { lastFocus = document.activeElement; setTimeout(() => $('.menu-link', menu)?.focus(), 80); }
    else if (lastFocus) lastFocus.focus();
  };
  menu.inert = true;
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) set(false);
    if (e.key === 'Tab' && menu.classList.contains('is-open')) {
      const f = [btn, ...$$('a, button', menu)].filter(el => el.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ---------------- Text splitting ---------------- */
function splitChars(el) {
  if (el.dataset.splitDone) return [];
  el.dataset.splitDone = '';
  const chars = [];
  const walk = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
          const word = document.createElement('span');
          word.style.display = 'inline-block';
          word.style.whiteSpace = 'nowrap';
          [...part].forEach(c => {
            const s = document.createElement('span');
            s.className = 'ch';
            s.textContent = c;
            s.setAttribute('aria-hidden', 'true');
            word.append(s);
            chars.push(s);
          });
          frag.append(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'SUP') walk(child);
    });
  };
  if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
  walk(el);
  return chars;
}

/* ---------------- Fit giant type to its container width ---------------- */
function initFit() {
  const items = $$('[data-fit]');
  if (!items.length) return;
  const fit = () => items.forEach(el => {
    const inner = $('.fit-inner', el);
    if (!inner) return;
    const cs = getComputedStyle(el);
    const avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    el.style.fontSize = '100px';
    const w = inner.getBoundingClientRect().width;
    if (w > 0 && avail > 0) el.style.fontSize = `${Math.floor((100 * avail / w) * 100) / 100}px`;
  });
  fit();
  document.fonts?.ready.then(fit);
  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { fit(); requestTick(); }, 120); }, { passive: true });
}

/* ---------------- Marquees (measured, seamless) ---------------- */
function initMarquees() {
  $$('[data-marquee]').forEach(m => {
    const track = $('.marquee', m);
    const group = $('.marquee-group', track);
    if (!track || !group || track.dataset.ready) return;
    track.dataset.ready = '';
    const fill = () => {
      while (track.scrollWidth < innerWidth * 2.2 && track.children.length < 12) {
        const c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c);
      }
      const w = group.getBoundingClientRect().width;
      track.style.setProperty('--shift', `${w}px`);
      track.style.setProperty('--dur', `${Math.max(18, w / (Number(m.dataset.speed) || 60))}s`);
      m._groupWidth = w;
    };
    fill();
    addEventListener('resize', fill, { passive: true });
  });
}

/* ---------------- Scroll / frame engine ---------------- */
let vh = innerHeight, vw = innerWidth, sy = scrollY, lastSy = scrollY, velocity = 0;
let ticking = false, settleFrames = 0;
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
const state = {};
const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

function collect() {
  state.heroFrame = $('[data-hero-frame]');
  state.heroMedia = $('[data-hero-parallax]');
  state.heroContent = $('[data-hero-content]');
  state.chroma = $$('[data-chroma]');
  state.mega = $$('[data-mega]');
  state.scaleIn = $$('[data-scale-in] .work-media');
  state.reveals = $$('[data-char-reveal]').map(el => ({ el, chars: el._chars || (el._chars = $$('.ch', el)), on: -1 }));
  state.parallax = $$('[data-speed-y]');
  state.stack = $$('[data-stack] > .step-card');
  state.flow = $$('[data-flow]').map(el => ({ el, rows: $$('.marquee', el) }));
  state.header = $('.site-header');
}

function frame(now) {
  ticking = false;
  sy = scrollY;
  const dv = sy - lastSy;
  lastSy = sy;
  velocity = lerp(velocity, dv, 0.18);
  const still = reduced.matches;

  // Header: solid after leaving the top, tucks away while scrolling down.
  if (state.header) {
    state.header.classList.toggle('is-solid', sy > 40);
    if (!root.classList.contains('menu-open')) state.header.classList.toggle('is-hidden', dv > 4 && sy > vh * 0.9 ? true : dv < -2 ? false : state.header.classList.contains('is-hidden'));
  }

  // Hero: recedes (scale + radius) as the next section slides over it.
  if (state.heroFrame && !still) {
    const p = clamp(sy / vh);
    state.heroFrame.style.transform = `scale(${1 - p * 0.1})`;
    state.heroFrame.style.borderRadius = `${p * 28}px`;
    state.heroFrame.style.filter = p > 0.01 ? `brightness(${1 - p * 0.55})` : '';
    if (state.heroContent) state.heroContent.style.transform = `translate3d(${pointer.x * 8}px, ${pointer.y * 6 - p * 90}px, 0)`;
    if (state.heroMedia) state.heroMedia.style.transform = `translate3d(${pointer.x * -16}px, ${pointer.y * -12 + p * 60}px, 0) scale(1.04)`;
  }

  // Registration split on the wordmark from pointer + scroll velocity.
  if (state.chroma.length && !still) {
    const split = clamp(Math.abs(velocity) * 0.12 + Math.hypot(pointer.x - pointer.tx, pointer.y - pointer.ty) * 14 + 1, 0, 4);
    state.chroma.forEach(el => el.style.setProperty('--split', split.toFixed(2)));
  }

  // Giant works headline shrinks back as projects take the stage.
  state.mega.forEach(el => {
    if (still) return;
    const host = el.closest('section');
    const r = host.getBoundingClientRect();
    const p = clamp((-r.top + vh * 0.1) / (vh * 0.9));
    el.style.transform = `scale(${1 - easeOut(p) * 0.22})`;
    el.style.opacity = String(1 - easeOut(p) * 0.82);
  });

  // Project media grows towards full size while entering.
  state.scaleIn.forEach(el => {
    if (still) { el.style.transform = ''; return; }
    const r = el.getBoundingClientRect();
    if (r.top > vh * 1.2 || r.bottom < -vh * 0.2) return;
    const p = easeOut(clamp((vh - r.top) / (vh * 0.85)));
    el.style.transform = `scale(${0.82 + p * 0.18})`;
    el.style.borderRadius = `${40 - p * 26}px`;
  });

  // Letters light up as the sentence travels through the viewport.
  state.reveals.forEach(item => {
    const r = item.el.getBoundingClientRect();
    const start = vh * 0.88, range = vh * 0.5 + r.height * 0.5;
    const p = still ? 1 : clamp((start - r.top) / range);
    const count = Math.round(p * item.chars.length);
    if (count === item.on) return;
    item.chars.forEach((c, i) => c.classList.toggle('on', i < count));
    item.on = count;
  });

  // Differential parallax for media compositions.
  state.parallax.forEach(el => {
    if (still) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.speedY);
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
  });

  // Stacked process cards: each one sinks back as the next covers it.
  state.stack.forEach((card, i) => {
    const next = state.stack[i + 1];
    if (!next || still) { card.style.transform = ''; card.style.filter = ''; return; }
    const r = card.getBoundingClientRect();
    const nr = next.getBoundingClientRect();
    const t = clamp((r.bottom - nr.top) / r.height);
    card.style.transform = `scale(${1 - easeOut(t) * 0.08})`;
    card.style.filter = t > 0 ? `brightness(${1 - t * 0.45})` : '';
  });

  // Scroll-coupled typography rows (approach section).
  state.flow.forEach(f => {
    const r = f.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    f.rows.forEach((row, i) => {
      const w = row.firstElementChild?.getBoundingClientRect().width || 1;
      const base = (now || 0) * 0.02 * (still ? 0 : 1) + (still ? 0 : sy * 0.45);
      const x = ((base % w) + w) % w;
      row.style.transform = `translate3d(${i % 2 ? x - w : -x}px, 0, 0)`;
    });
  });

  updateServices();
  updateMarkGlow();
  drawStarlight(now || performance.now());

  // Pointer easing.
  pointer.x = lerp(pointer.x, pointer.tx, 0.08);
  pointer.y = lerp(pointer.y, pointer.ty, 0.08);
  const moving = Math.abs(pointer.x - pointer.tx) > 0.001 || Math.abs(pointer.y - pointer.ty) > 0.001 || Math.abs(velocity) > 0.05;
  const flowVisible = state.flow.some(f => { const r = f.el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh; });
  if (moving || flowVisible || svc.moving || glow.moving || star.alive) settleFrames = 20;
  if (settleFrames-- > 0) requestTick();
}

function initEngine() {
  collect();
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', () => { vh = innerHeight; vw = innerWidth; sizeServices(); requestTick(); }, { passive: true });
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    pointer.tx = (e.clientX / vw) * 2 - 1;
    pointer.ty = (e.clientY / vh) * 2 - 1;
    requestTick();
  }, { passive: true });
  reduced.addEventListener?.('change', requestTick);
  requestTick();
}

/* ---------------- Services: 3D ring (desktop) / snap rail (touch) ---------------- */
const svc = { section: null, cards: [], links: [], current: 0, moving: false, enabled: false };
const svc3d = matchMedia('(min-width: 1024px) and (pointer: fine)');

function initServices() {
  svc.section = $('[data-services]');
  if (!svc.section) return;
  svc.cards = $$('.svc', svc.section);
  svc.links = $$('.svc-index a', svc.section);
  sizeServices();
  if (!svc.bound) {
    svc.bound = true;
    svc3d.addEventListener?.('change', () => { sizeServices(); requestTick(); });
    reduced.addEventListener?.('change', () => { sizeServices(); requestTick(); });
  }
}

// The ring is a scroll-linked layout, so it stays on with reduced motion; it
// then tracks the scroll position 1:1 instead of easing towards it.
function sizeServices() {
  if (!svc.section) return;
  svc.enabled = svc3d.matches && svc.cards.length > 1;
  svc.section.classList.toggle('is-3d', svc.enabled);
  svc.section.style.height = svc.enabled ? `${100 + (svc.cards.length - 1) * 42}vh` : '';
  if (!svc.enabled) svc.cards.forEach(c => { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; c.style.pointerEvents = ''; c.removeAttribute('tabindex'); });
}

function updateServices() {
  if (!svc.enabled) { svc.moving = false; return; }
  const r = svc.section.getBoundingClientRect();
  const total = r.height - vh;
  const p = clamp(-r.top / total);
  const target = p * (svc.cards.length - 1);
  svc.current = reduced.matches ? target : lerp(svc.current, target, 0.12);
  svc.moving = Math.abs(svc.current - target) > 0.002;
  const step = 52; // degrees between cards on the ring
  const radius = Math.min(vw * 0.26, 420);
  svc.cards.forEach((card, i) => {
    const rel = i - svc.current;
    const a = rel * step * Math.PI / 180;
    const x = Math.sin(a) * radius;
    const z = (Math.cos(a) - 1) * radius;
    const y = rel * 34;
    const depth = clamp(1 - Math.abs(rel) * 0.38);
    card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(rel * step).toFixed(2)}deg)`;
    card.style.opacity = Math.abs(rel) > 2.4 ? '0' : (0.12 + depth * 0.88).toFixed(3);
    card.style.zIndex = String(100 - Math.round(Math.abs(rel) * 10));
    const front = Math.abs(rel) < 0.5;
    card.style.pointerEvents = front ? 'auto' : 'none';
    card.tabIndex = front ? 0 : -1;
  });
  const active = Math.round(svc.current);
  svc.links.forEach((l, i) => l.classList.toggle('is-active', i === active));
}

/* ---------------- Mouse effects (fine pointers with hover only) ---------------- */
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

// Hero wordmark: an orange copy of the letters sits exactly on top and is
// revealed through a radial mask that follows the pointer.
const glow = { el: null, x: 0, y: 0, tx: 0, ty: 0, moving: false };

function initMarkGlow() {
  const mark = $('.hero-mark');
  const inner = mark && $('.fit-inner', mark);
  if (!inner || glow.el || !finePointer.matches) return;
  const el = document.createElement('span');
  el.className = 'hm-glow';
  el.setAttribute('aria-hidden', 'true');
  [...inner.children].forEach(n => el.append(n.cloneNode(true)));
  inner.append(el);
  glow.el = el;
  const aim = e => {
    const r = inner.getBoundingClientRect();
    glow.tx = e.clientX - r.left;
    glow.ty = e.clientY - r.top;
  };
  mark.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse') return;
    aim(e);
    if (!mark.classList.contains('is-lit')) { glow.x = glow.tx; glow.y = glow.ty; }
    mark.classList.add('is-lit');
    requestTick();
  });
  mark.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { aim(e); requestTick(); } }, { passive: true });
  mark.addEventListener('pointerleave', () => mark.classList.remove('is-lit'));
}

function updateMarkGlow() {
  if (!glow.el) return;
  const k = reduced.matches ? 1 : 0.2;
  glow.x = lerp(glow.x, glow.tx, k);
  glow.y = lerp(glow.y, glow.ty, k);
  glow.moving = Math.abs(glow.x - glow.tx) > 0.3 || Math.abs(glow.y - glow.ty) > 0.3;
  glow.el.style.setProperty('--mx', `${glow.x.toFixed(1)}px`);
  glow.el.style.setProperty('--my', `${glow.y.toFixed(1)}px`);
}

// Starlight cursor: a tiny star beside the native cursor and a short trail
// of sparks that fade out. One small canvas, pooled particles, capped count.
const star = { ctx: null, canvas: null, dpr: 1, parts: [], hx: 0, hy: 0, x: 0, y: 0, lastMove: 0, lastX: null, lastY: null, alive: false, last: 0, sprites: null, drawn: false };
const STAR_MAX = 34;

function starSprite(rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, `rgba(${rgb}, 1)`);
  grad.addColorStop(0.18, `rgba(${rgb}, .85)`);
  grad.addColorStop(0.45, `rgba(${rgb}, .22)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

function initStarlight() {
  const enabled = () => finePointer.matches && !reduced.matches;
  const setup = () => {
    if (!enabled() || star.canvas) return;
    const c = document.createElement('canvas');
    c.className = 'starlight';
    c.setAttribute('aria-hidden', 'true');
    document.body.append(c);
    star.canvas = c;
    star.ctx = c.getContext('2d');
    star.sprites = { white: starSprite('255, 246, 232'), orange: starSprite('242, 107, 56') };
    const size = () => {
      star.dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round(innerWidth * star.dpr);
      c.height = Math.round(innerHeight * star.dpr);
    };
    size();
    addEventListener('resize', size, { passive: true });
  };
  const teardown = () => { star.canvas?.remove(); star.canvas = star.ctx = null; star.parts.length = 0; star.alive = false; };
  setup();
  const onChange = () => (enabled() ? setup() : teardown());
  finePointer.addEventListener?.('change', onChange);
  reduced.addEventListener?.('change', onChange);

  addEventListener('pointermove', e => {
    if (!star.canvas || e.pointerType !== 'mouse') return;
    const now = performance.now();
    if (star.lastX === null || now - star.lastMove > 300) { star.hx = star.x = e.clientX; star.hy = star.y = e.clientY; }
    star.x = e.clientX; star.y = e.clientY; star.lastMove = now;
    const dist = star.lastX === null ? 0 : Math.hypot(e.clientX - star.lastX, e.clientY - star.lastY);
    // One spark roughly every 22px travelled, never more than two per event.
    let n = Math.min(2, Math.floor(dist / 22));
    if (n > 0 || star.lastX === null) { star.lastX = e.clientX; star.lastY = e.clientY; }
    while (n-- > 0) {
      const p = star.parts.length >= STAR_MAX ? star.parts.shift() : {};
      p.x = e.clientX + (Math.random() - 0.5) * 6;
      p.y = e.clientY + (Math.random() - 0.5) * 6;
      p.vx = (Math.random() - 0.5) * 0.018;
      p.vy = 0.006 + Math.random() * 0.016;
      p.size = 0.7 + Math.random() * 1.1;
      p.life = 520 + Math.random() * 380;
      p.born = now;
      p.orange = Math.random() < 0.38;
      p.twinkle = Math.random() < 0.25;
      star.parts.push(p);
    }
    star.alive = true;
    requestTick();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { star.lastMove = 0; requestTick(); });
}

function drawStarlight(now) {
  const { ctx, canvas } = star;
  if (!ctx) return;
  const dt = Math.min(48, now - (star.last || now));
  star.last = now;
  // The head star trails the pointer slightly and fades once it rests.
  star.hx = lerp(star.hx, star.x, 0.35);
  star.hy = lerp(star.hy, star.y, 0.35);
  const idle = now - star.lastMove;
  const headA = clamp(1 - (idle - 500) / 500);
  star.parts = star.parts.filter(p => now - p.born < p.life);
  star.alive = star.parts.length > 0 || headA > 0;
  if (!star.alive) {
    if (star.drawn) { ctx.clearRect(0, 0, canvas.width, canvas.height); star.drawn = false; }
    return;
  }
  const d = star.dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(d, 0, 0, d, 0, 0);
  star.drawn = true;
  for (const p of star.parts) {
    const t = (now - p.born) / p.life;
    p.x += p.vx * dt; p.y += p.vy * dt;
    const a = (1 - t) * (1 - t) * (p.twinkle ? 0.75 + 0.25 * Math.sin(now * 0.03 + p.born) : 1);
    const s = p.size * (1 - t * 0.5);
    ctx.globalAlpha = a;
    const r = s * 4;
    ctx.drawImage(p.orange ? star.sprites.orange : star.sprites.white, p.x - r, p.y - r, r * 2, r * 2);
  }
  if (headA > 0) {
    // Sits just below-right of the arrow tip so it never covers the cursor.
    const x = star.hx + 13, y = star.hy + 17;
    ctx.globalAlpha = headA;
    ctx.drawImage(star.sprites.orange, x - 9, y - 9, 18, 18);
    ctx.drawImage(star.sprites.white, x - 4, y - 4, 8, 8);
    ctx.globalAlpha = headA * 0.7;
    ctx.fillStyle = '#fff6e8';
    ctx.fillRect(x - 5, y - 0.4, 10, 0.8);
    ctx.fillRect(x - 0.4, y - 5, 0.8, 10);
  }
  ctx.globalAlpha = 1;
}

/* ---------------- Works filters ---------------- */
function initFilters() {
  const bar = $('[data-render="filters"]');
  const list = $('[data-render="works"]');
  if (!bar || !list) return;
  const apply = id => {
    $$('.filter', bar).forEach(b => { const on = b.dataset.filter === id; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    $$('.work', list).forEach(w => { w.hidden = id !== '*' && !w.dataset.categories.split(' ').includes(id); });
    requestTick();
  };
  if (!bar.dataset.bound) {
    bar.dataset.bound = '';
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-filter]');
      if (!b) return;
      apply(b.dataset.filter);
      const url = new URL(location.href);
      if (b.dataset.filter === '*') url.searchParams.delete('kategori'); else url.searchParams.set('kategori', b.dataset.filter);
      history.replaceState(null, '', url);
    });
  }
  const wanted = new URLSearchParams(location.search).get('kategori');
  if (wanted && $(`[data-filter="${CSS.escape(wanted)}"]`, bar)) apply(wanted);
}

/* ---------------- Hero media (video or generative placeholder) ---------------- */
function initHeroMedia() {
  const v = $('[data-hero-video]');
  if (v && !v.dataset.bound) {
    v.dataset.bound = '';
    const conn = navigator.connection;
    const lite = conn && (conn.saveData || /2g/.test(conn.effectiveType || ''));
    const src = (innerWidth < 768 && v.dataset.srcMobile) || v.dataset.src;
    if (!lite && src) {
      v.src = src;
      if (reduced.matches) v.removeAttribute('autoplay'); else v.play().catch(() => {});
      new IntersectionObserver(([e]) => { if (reduced.matches) return; e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }).observe(v);
    }
  }
  const c = $('[data-hero-gl]');
  if (c && !c.dataset.bound) {
    c.dataset.bound = '';
    import('./hero-gl.js').then(m => m.start(c, { reduced: reduced.matches })).catch(() => {});
  }
}

/* ---------------- Reveal on enter (used sparingly) ---------------- */
function initReveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  items.forEach(i => io.observe(i));
}

/* ---------------- Unbuilt project pages (served by 404.html) ---------------- */
async function routeProject() {
  if (document.body.dataset.page !== '404') return;
  const m = location.pathname.match(/^\/calismalar\/([a-z0-9-]+)\/?$/);
  if (!m) return;
  const data = await loadContent('projects');
  const project = published(data?.projects).find(p => p.slug === m[1]);
  if (!project) return;
  const main = $('main');
  main.innerHTML = projectPage(project, data.projects);
  document.title = `${project.title} — KROMAKOPIA`;
  initRoll(); initReveal(); collect(); requestTick();
}

/* ---------------- Boot ---------------- */
function boot() {
  initYear();
  initRoll();
  initGlass();
  initMenu();
  $$('[data-split]').forEach(splitChars);
  $$('[data-char-reveal]').forEach(splitChars);
  $$('.hero .ch').forEach((c, i) => c.style.setProperty('--i', i));
  $$('.hero .word').forEach((w, i) => w.style.setProperty('--i', i));
  initMarkGlow();
  initStarlight();
  initFit();
  initMarquees();
  initServices();
  initFilters();
  initHeroMedia();
  initReveal();
  initEngine();
  routeProject();
  hydrate();
  const ready = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-loading')));
  (document.fonts?.ready || Promise.resolve()).then(ready);
  setTimeout(ready, 1400);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
