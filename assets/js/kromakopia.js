// KROMAKOPIA — interaction & motion engine (vanilla, no dependencies).
import { worksList, workFilters, servicesList, heroMedia, projectPage, published, sig, esc } from './templates.mjs';

// `?motion` previews the full motion design even when the OS asks for reduced motion.
const forceMotion = new URLSearchParams(location.search).has('motion');
if (forceMotion) document.documentElement.dataset.motion = 'force';
const osReduced = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = { get matches() { return osReduced.matches && !forceMotion; } };

const root = document.documentElement;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
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
    needs.has('services') ? loadContent('services') : null,
    needs.has('hero-media') ? loadContent('site') : null
  ]);
  let changed = false;
  for (const el of regions) {
    const limit = Number(el.dataset.limit) || Infinity;
    if (el.dataset.render === 'works' && projects) changed = swap(el, worksList(published(projects.projects).slice(0, limit))) || changed;
    if (el.dataset.render === 'filters' && projects) changed = swap(el, workFilters(projects.projects)) || changed;
    if (el.dataset.render === 'services' && services) changed = swap(el, servicesList(services.services)) || changed;
    if (el.dataset.render === 'hero-media' && site) changed = swap(el, heroMedia(site)) || changed;
  }
  if (changed) { initRoll(); initFilters(); initHeroMedia(); collect(); requestTick(); }
}

/* ---------------- Small UI ---------------- */
function initRoll() {
  $$('.btn:not([data-rolled])').forEach(el => {
    if (el.children.length) return;
    const text = el.textContent.trim();
    if (!text) return;
    el.dataset.rolled = '';
    el.innerHTML = `<span class="roll"><span>${esc(text)}</span><span aria-hidden="true">${esc(text)}</span></span>`;
  });
}

// The primary button's bloom follows the pointer.
function initGlow() {
  document.addEventListener('pointermove', e => {
    const b = e.target.closest?.('.btn-primary');
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
    b.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
  }, { passive: true });
}

function initYear() { $$('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); }); }

/* ---------------- Full-screen menu ---------------- */
function initMenu() {
  const btn = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!btn || !menu) return;
  const path = location.pathname.replace(/index\.html$/, '');
  $$('.menu-link', menu).forEach(a => {
    const href = new URL(a.href).pathname;
    if (href === '/' ? path === '/' : path.startsWith(href)) a.setAttribute('aria-current', 'page');
  });
  const outside = () => [$('main'), $('.site-footer'), $('.action-bar')].filter(Boolean);
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

/* ---------------- Fit giant type to its container width ---------------- */
function initFit() {
  const items = $$('[data-fit]');
  if (!items.length) return;
  const fit = () => items.forEach(el => {
    const inner = $('.fit-inner', el);
    if (!inner) return;
    const avail = el.clientWidth;
    el.style.fontSize = '100px';
    const w = inner.getBoundingClientRect().width;
    if (w > 0 && avail > 0) el.style.fontSize = `${Math.floor((100 * avail / w) * 100) / 100}px`;
  });
  fit();
  document.fonts?.ready.then(fit);
  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fit, 120); }, { passive: true });
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
    };
    fill();
    addEventListener('resize', fill, { passive: true });
  });
}

/* ---------------- Scroll engine (one rAF, only while scrolling) ---------------- */
let vh = innerHeight, lastSy = scrollY, ticking = false;
const state = {};
const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

function collect() {
  state.header = $('.site-header');
  state.heroImg = $('.hero-frame img, .hero-frame video');
  state.hero = $('.hero');
  state.scaleIn = $$('[data-scale-in]');
  state.parallax = $$('[data-speed-y]');
  state.stack = $$('[data-stack] > .step-card');
  state.bar = $('.action-bar');
}

function frame() {
  ticking = false;
  const sy = scrollY;
  const dv = sy - lastSy;
  lastSy = sy;
  const still = reduced.matches;

  if (state.header) {
    state.header.classList.toggle('is-solid', sy > 24);
    if (!root.classList.contains('menu-open')) state.header.classList.toggle('is-hidden', dv > 4 && sy > vh ? true : dv < -2 ? false : state.header.classList.contains('is-hidden'));
  }

  // Mobile action bar appears once the hero CTAs are out of view.
  if (state.bar) {
    const heroBottom = state.hero ? state.hero.getBoundingClientRect().bottom : vh * 0.6 - sy;
    const nearEnd = sy + vh > document.documentElement.scrollHeight - 220;
    state.bar.classList.toggle('is-on', heroBottom < vh * 0.25 && !nearEnd);
  }

  if (state.heroImg && !still) {
    const p = clamp(sy / vh);
    state.heroImg.style.transform = `translate3d(0, ${(p * 60).toFixed(1)}px, 0) scale(${(1.06 + p * 0.06).toFixed(4)})`;
  }

  state.scaleIn.forEach(el => {
    if (still) { el.style.transform = ''; return; }
    const r = el.getBoundingClientRect();
    if (r.top > vh * 1.2 || r.bottom < -vh * 0.2) return;
    const p = easeOut(clamp((vh - r.top) / (vh * 0.8)));
    el.style.transform = `scale(${(0.9 + p * 0.1).toFixed(4)})`;
  });

  state.parallax.forEach(el => {
    if (still) return;
    const r = el.parentElement.getBoundingClientRect();
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
    card.style.transform = `scale(${1 - easeOut(t) * 0.07})`;
    card.style.filter = t > 0 ? `brightness(${1 - t * 0.3})` : '';
  });
}

function initEngine() {
  collect();
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', () => { vh = innerHeight; requestTick(); }, { passive: true });
  requestTick();
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

/* ---------------- Hero video (when set in content/site.json) ---------------- */
function initHeroMedia() {
  const v = $('[data-hero-video]');
  if (!v || v.dataset.bound) return;
  v.dataset.bound = '';
  const conn = navigator.connection;
  const lite = conn && (conn.saveData || /2g/.test(conn.effectiveType || ''));
  const src = (innerWidth < 768 && v.dataset.srcMobile) || v.dataset.src;
  if (lite || !src) return;
  v.src = src;
  if (reduced.matches) v.removeAttribute('autoplay'); else v.play().catch(() => {});
  new IntersectionObserver(([e]) => { if (reduced.matches) return; e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }).observe(v);
}

/* ---------------- Reveal on enter (used sparingly) ---------------- */
function initReveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
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
  $('main').innerHTML = projectPage(project, data.projects);
  document.title = `${project.title} — KROMAKOPIA`;
  initRoll(); initReveal(); collect(); requestTick();
}

/* ---------------- Boot ---------------- */
function boot() {
  initYear();
  initRoll();
  initGlow();
  initMenu();
  $$('.hero .rise').forEach((el, i) => el.style.setProperty('--i', i));
  initFit();
  initMarquees();
  initFilters();
  initHeroMedia();
  initReveal();
  initEngine();
  routeProject();
  hydrate();
  const ready = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-loading')));
  (document.fonts?.ready || Promise.resolve()).then(ready);
  setTimeout(ready, 1200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
