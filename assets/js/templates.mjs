// Shared render functions. Used by tools/build.mjs (static HTML) and by the
// browser (re-rendering content edited through the CMS without a rebuild).

export const CATEGORIES = [
  { id: 'marka-kimligi', label: 'Marka Kimliği' },
  { id: 'fotograf', label: 'Fotoğraf' },
  { id: 'video', label: 'Video' },
  { id: 'dijital', label: 'Dijital' },
  { id: 'kampanya', label: 'Kampanya' }
];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ESC[ch]);

export const pad = n => String(n).padStart(2, '0');

// Stable short signature so the browser can skip re-rendering unchanged regions.
export const sig = str => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

export const published = projects => (projects || []).filter(p => p && p.published !== false && p.slug && p.title);

export function img(image, { sizes = '100vw', eager = false, className = '' } = {}) {
  if (!image || !image.src) return '';
  const attrs = [
    className && `class="${esc(className)}"`,
    `src="${esc(image.src)}"`,
    image.srcset && `srcset="${esc(image.srcset)}" sizes="${esc(sizes)}"`,
    `alt="${esc(image.alt || '')}"`,
    image.width && `width="${Number(image.width)}"`,
    image.height && `height="${Number(image.height)}"`,
    eager ? 'fetchpriority="high"' : 'loading="lazy"',
    'decoding="async"'
  ].filter(Boolean);
  return `<img ${attrs.join(' ')}>`;
}

export function video(src, poster, { className = '' } = {}) {
  if (!src) return '';
  return `<video class="${esc(className)}" src="${esc(src)}"${poster ? ` poster="${esc(poster)}"` : ''} muted loop playsinline preload="metadata" aria-hidden="true"></video>`;
}

// Abstract chroma composition used where no real photograph exists yet.
export function chromaArt(seed, label = '') {
  return `<div class="chroma-art" style="--seed:${Number(seed) || 0}" aria-hidden="true"><i></i><i></i><i></i>${label ? `<b>${esc(label)}</b>` : ''}</div>`;
}

const categoryLabel = id => CATEGORIES.find(c => c.id === id)?.label || id;

export function workCard(project, index = 0) {
  const media = project.coverVideo
    ? video(project.coverVideo, project.cover?.src, { className: 'work-video' }) + img(project.cover, { sizes: '(max-width: 760px) 92vw, 70vw', className: 'work-poster' })
    : img(project.cover, { sizes: '(max-width: 760px) 92vw, 70vw' });
  return `<article class="work" data-categories="${esc((project.categories || []).join(' '))}" data-scale-in>
  <a class="work-link" href="/calismalar/${esc(project.slug)}/">
    <div class="work-media">${media || chromaArt(index)}</div>
    <div class="work-meta">
      <span class="work-index">${pad(index + 1)}</span>
      <h3 class="work-title">${esc(project.title)}</h3>
      <p class="work-summary">${esc(project.summary)}</p>
      <ul class="work-tags" aria-label="Hizmetler">${(project.services || []).map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      <span class="work-cta">Projeyi incele</span>
    </div>
  </a>
</article>`;
}

export function worksList(projects) {
  const list = published(projects);
  if (!list.length) return `<p class="empty-note">Yeni projeler hazırlanıyor.</p>`;
  return list.map(workCard).join('\n');
}

// Only categories that actually have published work become filters.
export function workFilters(projects) {
  const list = published(projects);
  const used = CATEGORIES.filter(c => list.some(p => (p.categories || []).includes(c.id)));
  return [`<button type="button" class="filter is-active" aria-pressed="true" data-filter="*">Tümü <sup>${list.length}</sup></button>`]
    .concat(used.map(c => `<button type="button" class="filter" aria-pressed="false" data-filter="${c.id}">${esc(c.label)} <sup>${list.filter(p => p.categories.includes(c.id)).length}</sup></button>`))
    .join('');
}

export function serviceCard(service, index) {
  const media = service.image?.src
    ? img(service.image, { sizes: '(max-width: 760px) 80vw, 420px' })
    : chromaArt(index + 1);
  return `<a class="svc" href="/hizmetler/${esc(service.slug)}/" data-svc>
  <div class="svc-media">${media}</div>
  <div class="svc-body"><span class="svc-num">${pad(index + 1)}</span><h3>${esc(service.title)}</h3><p>${esc(service.short)}</p></div>
</a>`;
}

export function servicesList(services) {
  return (services || []).map(serviceCard).join('\n');
}

export function heroMedia(site) {
  const hero = site?.hero || {};
  if (!hero.video) return `<canvas class="hero-gl" data-hero-gl aria-hidden="true"></canvas>`;
  const poster = hero.poster ? ` poster="${esc(hero.poster)}"` : '';
  return `<video class="hero-video" data-hero-video data-src="${esc(hero.video)}" data-src-mobile="${esc(hero.videoMobile || '')}"${poster} muted loop playsinline autoplay preload="none"${hero.alt ? ` aria-label="${esc(hero.alt)}"` : ' aria-hidden="true"'}></video>`;
}

export function projectPage(project, projects) {
  const list = published(projects);
  const i = list.findIndex(p => p.slug === project.slug);
  const next = list.length > 1 ? list[(i + 1) % list.length] : null;
  const chapters = (project.chapters || []).map((ch, n) => `
  <article class="chapter chapter-${esc(ch.layout || 'split')}" data-reveal>
    <figure class="chapter-media" data-hover-reveal>${img(ch.image, { sizes: ch.layout === 'wide' ? '(max-width: 760px) 92vw, 80vw' : '(max-width: 760px) 92vw, 50vw' })}</figure>
    <div class="chapter-copy"><span class="chapter-num">${pad(n + 1)}</span><h2>${esc(ch.title)}</h2><p>${esc(ch.text)}</p>${ch.note ? `<small>${esc(ch.note)}</small>` : ''}</div>
  </article>`).join('');
  const steps = (project.steps || []).length ? `
<section class="case-steps shell" aria-labelledby="steps-title">
  <h2 id="steps-title" class="h-section">Problemden uygulamaya</h2>
  <ol class="steps">${project.steps.map(s => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
</section>` : '';
  const closing = project.closing || {};
  return `
<section class="case-hero shell" aria-labelledby="page-title">
  <a class="back" href="/calismalar/">Tüm işler</a>
  <div class="case-hero-grid">
    <div class="case-hero-copy">
      <p class="case-kicker">${esc(project.sector || '')}${project.label ? ` <span>${esc(project.label)}</span>` : ''}</p>
      <h1 id="page-title" class="h-case" data-split>${esc(project.title)}</h1>
      <p class="lead">${esc(project.intro || project.summary)}</p>
      <ul class="work-tags" aria-label="Hizmetler">${(project.services || []).map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    </div>
    <figure class="case-cover">${project.coverVideo ? video(project.coverVideo, project.cover?.src, { className: 'case-video' }) : img(project.cover, { sizes: '(max-width: 760px) 92vw, 46vw', eager: true })}</figure>
  </div>
</section>
<section class="case-chapters shell" aria-label="${esc(project.title)} proje sunumu">${chapters}
</section>${steps}
<section class="case-closing shell">
  <h2 class="h-display">${esc(closing.title || 'Benzer bir proje mi düşünüyorsunuz?')}</h2>
  <p class="lead">${esc(closing.text || '')}</p>
  <div class="actions"><a class="btn btn-glass" href="/proje-baslat/${closing.service ? `?hizmet=${esc(closing.service)}` : ''}" data-roll>Benzer bir proje başlat</a><a class="btn btn-line" href="/calismalar/" data-roll>Diğer işler</a></div>
</section>
${next && next.slug !== project.slug ? `<a class="case-next" href="/calismalar/${esc(next.slug)}/"><span>Sıradaki proje</span><strong>${esc(next.title)}</strong></a>` : ''}`;
}

export const categoryName = categoryLabel;
