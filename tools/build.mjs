// Static page generator for KROMAKOPIA. Zero dependencies: `node tools/build.mjs`.
// Reads content/*.json and writes every HTML page, sitemap.xml and robots.txt.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { esc, pad, img, stockTag, chromaArt, worksList, workFilters, servicesList, heroMedia, projectPage, published, sig } from '../assets/js/templates.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const site = read('content/site.json');
const { projects } = read('content/projects.json');
const { services } = read('content/services.json');
const stock = read('content/stock.json');
const live = published(projects);
const URL_BASE = site.url.replace(/\/$/, '');
const BRAND = site.brand;
const C = site.contact;
const hash = p => createHash('sha1').update(readFileSync(join(ROOT, p))).digest('hex').slice(0, 8);
const CSS_V = hash('assets/css/kromakopia.css');
const PB_V = hash('assets/css/package-builder.css');
const OG = `${URL_BASE}/assets/og-kromakopia.png`;
const sitemap = [];
const zz = projects.find(p => p.slug === 'zeyzey-beauty');
const ic = projects.find(p => p.slug === 'italian-chef-pizza');

const arrow = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>';
const waLink = text => `https://wa.me/${C.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
const WA_HELLO = 'Merhaba KROMAKOPIA, bir çekim / içerik projesi hakkında konuşmak istiyorum.';

/* ---------------- Chrome ---------------- */
const NAV = [
  ['/calismalar/', 'İşler'],
  ['/hizmetler/', 'Hizmetler'],
  ['/surec/', 'Süreç'],
  ['/paketler/', 'Paketler'],
  ['/hakkimizda/', 'Stüdyo'],
  ['/iletisim/', 'İletişim']
];

const header = () => `<a class="skip" href="#icerik">İçeriğe geç</a>
<header class="site-header">
  <a class="wordmark" href="/" aria-label="${BRAND} ana sayfa">${BRAND}<sup>®</sup></a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle><span class="menu-btn-label">Menü</span><span class="menu-btn-lines" aria-hidden="true"></span></button>
  <a class="btn btn-primary btn-sm header-cta" href="/proje-baslat/">Proje Başlat</a>
</header>
<div class="menu" id="menu" data-menu aria-hidden="true" role="dialog" aria-modal="true" aria-label="Site menüsü">
  <nav class="menu-nav" aria-label="Ana menü">${NAV.map(([h, t]) => `<a class="menu-link" href="${h}">${t}</a>`).join('')}</nav>
  <div class="menu-foot">
    <div class="actions"><a class="btn btn-primary btn-sm" href="/proje-baslat/">Teklif al</a><a class="btn btn-line btn-sm" href="/cekim-planla/">Çekim planla</a><a class="btn btn-line btn-sm" href="/gorusme-planla/">Görüşme planla</a></div>
    <div class="menu-contact"><a href="${waLink(WA_HELLO)}" target="_blank" rel="noopener">WhatsApp ${C.whatsappLabel}</a></div>
  </div>
</div>`;

const actionBar = () => `<div class="action-bar" aria-label="Hızlı iletişim"><a class="btn btn-primary" href="/proje-baslat/">Teklif al</a><a class="btn btn-line" href="${waLink(WA_HELLO)}" target="_blank" rel="noopener">WhatsApp</a></div>`;

const footer = () => `<footer class="site-footer dark">
  <div class="shell">
    <div class="footer-grid">
      <div><p class="footer-pitch">Bir sonraki çekiminiz burada başlasın.</p><div class="actions"><a class="btn btn-primary" href="/proje-baslat/">Proje Başlat</a></div></div>
      <div><h2>Stüdyo</h2><ul><li><a href="/calismalar/">İşler</a></li><li><a href="/hizmetler/">Hizmetler</a></li><li><a href="/surec/">Süreç</a></li><li><a href="/hakkimizda/">Stüdyo</a></li></ul></div>
      <div><h2>Başlayın</h2><ul><li><a href="/proje-baslat/">Teklif al</a></li><li><a href="/cekim-planla/">Çekim planla</a></li><li><a href="/gorusme-planla/">Görüşme planla</a></li><li><a href="/paketler/">Paketler</a></li><li><a href="/paket-olustur/">Paket oluştur</a></li><li><a href="/check-up/">Dijital check-up</a></li></ul></div>
      <div><h2>İletişim</h2><ul><li><a href="${waLink(WA_HELLO)}" target="_blank" rel="noopener">WhatsApp ${C.whatsappLabel}</a></li>${C.instagram ? `<li><a href="${esc(C.instagram)}" target="_blank" rel="noopener">Instagram</a></li>` : ''}<li><a href="/iletisim/">İletişim formu</a></li></ul></div>
    </div>
    <p class="footer-mark" data-fit aria-hidden="true"><span class="fit-inner">${BRAND}</span></p>
    <div class="footer-base"><span>© <span data-year>2026</span> ${BRAND}. Markalar için içerik ve prodüksiyon stüdyosu.</span><a href="/kvkk/">KVKK ve gizlilik</a></div>
  </div>
</footer>`;

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND,
  url: `${URL_BASE}/`,
  logo: `${URL_BASE}/assets/kromakopia-icon-512.png`,
  description: 'Markalar için fotoğraf, video, içerik ve kreatif kampanya üreten bağımsız kreatif stüdyo.',
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service', telephone: `+${C.whatsapp}`, availableLanguage: ['tr', 'en'] }],
  knowsAbout: ['Fotoğraf prodüksiyonu', 'Video prodüksiyonu', 'Kreatif kampanya', 'Sosyal medya içeriği', 'Dijital reklam', 'Marka kimliği']
};

function layout({ path, title, description, body, page = '', scripts = [], css = [], ld = [], noindex = false }) {
  const canonical = `${URL_BASE}${path}`;
  const fullTitle = path === '/' ? title : `${title} | ${BRAND}`;
  if (!noindex && path !== '/404.html') sitemap.push(path);
  const lds = [orgLd, ...ld].map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#f3efe8">
<link rel="icon" href="/assets/kromakopia-icon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/kromakopia-icon-512.png" type="image/png" sizes="512x512">
<link rel="apple-touch-icon" href="/assets/kromakopia-touch.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${OG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${OG}">
<script>document.documentElement.classList.add('js','is-loading');setTimeout(function(){document.documentElement.classList.remove('is-loading')},2200)</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Manrope:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/css/kromakopia.css?v=${CSS_V}">
${css.map(h => `<link rel="stylesheet" href="${h}">`).join('\n')}
<script type="module" src="/assets/js/kromakopia.js"></script>
${scripts.map(s => (s.includes('package-builder') ? `<script defer src="${s}"></script>` : `<script type="module" src="${s}"></script>`)).join('\n')}
${lds}
</head>
<body${page ? ` data-page="${page}"` : ''}>
${header()}
<main id="icerik">
${body}
</main>
${footer()}
${actionBar()}
</body>
</html>
`;
}

function write(path, html) {
  const file = path.endsWith('.html') ? join(ROOT, path) : join(ROOT, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

function redirectPage(from, to) {
  write(from, `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>Yönlendiriliyor | ${BRAND}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${URL_BASE}${to}">
<meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)} + location.search + location.hash)</script>
</head>
<body style="background:#f3efe8;color:#171513;font-family:system-ui,sans-serif;padding:40px">
<p>Bu sayfa taşındı. <a style="color:#d9450c" href="${to}">Yeni adrese gidin</a>.</p>
</body>
</html>
`);
}

const rendered = (name, html) => `data-render="${name}" data-sig="${sig(html)}"`;

/* ---------------- Reusable sections ---------------- */
const BAND_ITEMS = ['Ürün çekimi', 'Model ve moda', 'Lifestyle', 'Reels ve tanıtım filmi', 'Kampanya görselleri', 'E-ticaret', 'Restoran ve menü', 'Güzellik'];
const band = () => `<div class="band" data-marquee data-speed="55" aria-hidden="true"><div class="marquee"><div class="marquee-group">${BAND_ITEMS.map(i => `<span>${i}</span>`).join('')}</div></div></div>`;

const STAGES = [
  { title: 'Keşif', text: 'Markayı, hedefleri ve ihtiyaçları anlıyoruz.', out: ['Brief görüşmesi', 'Hedef ve kapsam', 'Takvim ve bütçe'], image: stock.discovery, caption: 'Temsili görsel' },
  { title: 'Kreatif Konsept', text: 'Stratejiyi, yaratıcı fikri ve görsel yönü belirliyoruz.', out: ['Kreatif fikir', 'Moodboard', 'Çekim planı'], image: zz.chapters[0].image, caption: 'Zeyzey Beauty, marka sistemi' },
  { title: 'Çekim ve Üretim', text: 'Fotoğraf, video, tasarım ve dijital üretimi kendi ekibimizle yapıyoruz.', out: ['Fotoğraf ve video', 'Kurgu ve renk', 'Tasarım ve web'], image: stock.production, caption: 'Temsili görsel' },
  { title: 'Yayın ve Gelişim', text: 'İçerikleri hayata geçiriyor, sonuçları değerlendiriyoruz.', out: ['Yayın planı', 'Reklam ve ölçüm', 'Gelişim önerileri'], image: zz.chapters[3].image, caption: 'Zeyzey Beauty, sosyal medya vitrini' }
];
const stack = () => `<div class="stack" data-stack>${STAGES.map((s, i) => `
  <article class="step-card" style="--n:${i}">
    <div class="step-copy">
      <span class="k-num" aria-hidden="true">${pad(i + 1)}</span>
      <div><h3><span class="sr-only">Adım ${i + 1}: </span>${s.title}</h3><p>${s.text}</p></div>
      <ul aria-label="Bu adımın çıktıları">${s.out.map(o => `<li>${o}</li>`).join('')}</ul>
    </div>
    <figure class="step-media">${img(s.image, { sizes: '(max-width: 900px) 92vw, 46vw' })}<figcaption>${s.caption}</figcaption></figure>
  </article>`).join('')}
</div>`;

const ctaRows = () => `<div class="cta-rows">
  <a class="cta-row" href="/proje-baslat/"><strong>Teklif al</strong><span>Üç kısa adımda projenizi anlatın; kapsam ve fiyatla bir iş günü içinde dönelim.</span><i>${arrow}</i></a>
  <a class="cta-row" href="/cekim-planla/"><strong>Çekim planla</strong><span>Ürün, model, lifestyle veya mekân çekiminiz için tarih ve kapsamı konuşalım.</span><i>${arrow}</i></a>
  <a class="cta-row" href="/gorusme-planla/"><strong>Görüşme planla</strong><span>${site.booking.durationMinutes} dakikalık bir tanışma görüşmesinde ihtiyacınızı birlikte netleştirelim.</span><i>${arrow}</i></a>
</div>
<div class="cta-direct"><a href="${waLink(WA_HELLO)}" target="_blank" rel="noopener">WhatsApp’tan yazın: ${C.whatsappLabel}</a></div>`;

const ctaSection = (title = 'AKLINIZDA BİR PROJE Mİ VAR?', sub = 'Birlikte hayata geçirelim.') => `<section class="cta dark" aria-labelledby="cta-title">
  <div class="shell">
    <div class="cta-head"><div><h2 id="cta-title" class="cta-title">${title}</h2><p class="cta-sub">${sub}</p></div><a class="btn btn-primary btn-glow" href="/proje-baslat/">Proje Başlat</a></div>
    ${ctaRows()}
  </div>
</section>`;

/* ---------------- Home ---------------- */
function home() {
  const worksHtml = worksList(live);
  const svcHtml = servicesList(services);
  const hm = heroMedia(site);
  const body = `
<section class="hero" aria-labelledby="hero-title">
  <div class="shell hero-grid">
    <div class="hero-copy">
      <p class="kicker rise">FİKİR. GÖRÜNTÜ. ETKİ.</p>
      <h1 id="hero-title" class="h-hero rise">Markanız için içerik ve tanıtım üretiyoruz.</h1>
      <ul class="hero-points rise">
        <li>Markalar için fotoğraf, video, içerik ve kreatif kampanyalar üretiyoruz.</li>
        <li>Çekimden kurguya, fikirden yayına kadar süreci kendi ekibimizle yönetiyoruz.</li>
        <li>Gerektiğinde marka kimliği ve dijital deneyimi de destekliyoruz.</li>
      </ul>
      <div class="hero-actions rise"><a class="btn btn-primary btn-glow" href="/proje-baslat/">Proje Başlat</a><a class="btn btn-line" href="/gorusme-planla/">Görüşme Planla</a><a class="text-link" href="/cekim-planla/">Çekim planla</a></div>
      <ul class="hero-tags rise" aria-label="Çalıştığımız alanlar"><li>Moda</li><li>Güzellik</li><li>Lifestyle</li><li>Restoran</li><li>E-ticaret</li></ul>
    </div>
    <div class="hero-visual rise">
      <div class="hero-frame" ${rendered('hero-media', hm)}>${hm}</div>
      <span class="hero-badge" aria-hidden="true">Çekim · Kurgu · Yayın</span>
      <a class="hero-card" href="/calismalar/zeyzey-beauty/">${img({ ...zz.chapters[0].image, alt: '' }, { sizes: '64px' })}<div><small>Seçili iş</small><strong>ZEYZEY BEAUTY</strong><span>Projeyi incele</span></div></a>
    </div>
  </div>
</section>
${band()}
<section class="works" id="isler" aria-labelledby="works-title">
  <div class="shell">
    <div class="section-head"><h2 id="works-title" class="h-display">Seçili işler.</h2><p class="lead">Kimlikten çekime, ekrandan rafa: markalar için ürettiklerimizden.</p></div>
    <div class="works-list" ${rendered('works', worksHtml)}>${worksHtml}</div>
    <div class="works-end"><a class="btn btn-dark" href="/calismalar/">Tüm işler</a><a class="text-link" href="/proje-baslat/">Benzer bir iş için teklif al</a></div>
  </div>
</section>
<section class="services" aria-labelledby="svc-title">
  <div class="shell">
    <div class="section-head"><h2 id="svc-title" class="h-display">Ne üretiyoruz?</h2><p class="lead">Odağımız çekim ve içerik. Kampanya, reklam, kimlik ve web bunun etrafında aynı ekiple ilerliyor.</p></div>
    <div class="svc-grid" ${rendered('services', svcHtml)}>${svcHtml}</div>
    <div class="svc-note"><p>Hangisine ihtiyacınız olduğundan emin değil misiniz? 20 dakikada birlikte netleştirelim.</p><a class="btn btn-dark btn-sm" href="/gorusme-planla/">Görüşme planla</a></div>
  </div>
</section>
<section class="production" aria-labelledby="prod-title">
  <div class="shell production-grid">
    <figure class="production-media"><img data-speed-y="-0.08" src="${esc(stock.studio.src)}" srcset="${esc(stock.studio.srcset)}" sizes="(max-width: 900px) 92vw, 42vw" alt="${esc(stock.studio.alt)}" width="${stock.studio.width}" height="${stock.studio.height}" loading="lazy" decoding="async">${stockTag(stock.studio)}</figure>
    <div class="production-copy">
      <h2 id="prod-title" class="h-display">Kendi ekibimizle çekiyoruz.</h2>
      <p class="lead">Fikri bulan, çekimi planlayan ve kurguyu yapan aynı ekip. Bu yüzden içerik, ilk günden markanızın diliyle üretiliyor.</p>
      <ul class="check-list">
        <li>Fotoğraf, video ve kampanya çekimlerini planlıyor ve uyguluyoruz.</li>
        <li>Ürün, model, lifestyle ve mekân çekimlerini aynı akışta yönetiyoruz.</li>
        <li>Teslimleri sosyal medya, reklam, e-ticaret ve web formatlarında hazırlıyoruz.</li>
      </ul>
      <ul class="sectors" aria-label="Sektörler"><li>Moda</li><li>Güzellik</li><li>Lifestyle</li><li>Restoran</li><li>E-ticaret</li></ul>
      <div class="actions"><a class="btn btn-primary" href="/cekim-planla/">Çekim planla</a><a class="btn btn-line" href="/surec/">Nasıl çalışıyoruz?</a></div>
    </div>
  </div>
  <div class="shell">
    <ol class="flow" aria-label="Çalışma sürecimiz">
      <li><h3>Keşif</h3><p>Markayı, hedefi ve kapsamı netleştiriyoruz.</p></li>
      <li><h3>Konsept</h3><p>Fikri, görsel yönü ve çekim planını kuruyoruz.</p></li>
      <li><h3>Çekim ve üretim</h3><p>Fotoğraf, video ve tasarımı üretiyoruz.</p></li>
      <li><h3>Yayın</h3><p>İçeriği yayına alıyor, sonuçları okuyoruz.</p></li>
    </ol>
  </div>
</section>
${ctaSection()}`;
  return layout({
    path: '/',
    title: `${BRAND} | Markalar için fotoğraf, video ve içerik prodüksiyonu`,
    description: 'KROMAKOPIA; markalar için fotoğraf, video, içerik ve kreatif kampanyalar üreten bağımsız kreatif stüdyo. Çekimden kurguya, fikirden yayına kadar kendi ekibimizle.',
    body,
    page: 'home',
    ld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: `${URL_BASE}/`, inLanguage: 'tr' }]
  });
}

/* ---------------- Works ---------------- */
function worksIndex() {
  const worksHtml = worksList(live);
  const filtersHtml = workFilters(live);
  return layout({
    path: '/calismalar/',
    title: 'İşler',
    description: 'KROMAKOPIA’nın markalar için ürettiği çekim, kimlik ve dijital işler.',
    body: `
<section class="works" style="padding-top:calc(var(--header-h) + clamp(40px, 6vw, 90px))" aria-labelledby="works-title">
  <div class="shell">
    <div class="section-head"><h1 id="works-title" class="h-display">İşlerimiz.</h1><p class="lead">Her proje, bir markanın dünyasının nasıl kurulduğunu gösteriyor. Konsept çalışmalar ayrıca etiketlenir.</p></div>
    <div class="works-bar"><div class="filters" role="group" aria-label="İşleri filtrele" ${rendered('filters', filtersHtml)}>${filtersHtml}</div><a class="btn btn-primary btn-sm" href="/proje-baslat/">Proje Başlat</a></div>
    <div class="works-list" ${rendered('works', worksHtml)}>${worksHtml}</div>
  </div>
</section>
${ctaSection('SIRADAKİ İŞ SİZİNKİ OLSUN.', 'Markanız için çekimi ve içeriği birlikte planlayalım.')}`,
    page: 'works'
  });
}

function projectDetail(p) {
  return layout({
    path: `/calismalar/${p.slug}/`,
    title: p.title,
    description: p.summary,
    body: projectPage(p, projects),
    page: 'project',
    ld: [{ '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.title, description: p.summary, image: `${URL_BASE}${p.cover.src}`, creator: { '@type': 'Organization', name: BRAND }, inLanguage: 'tr' }]
  });
}

/* ---------------- Services ---------------- */
function servicesIndex() {
  const rows = services.map((s, i) => `<a class="svc-row" href="/hizmetler/${s.slug}/">
  <span class="svc-num">${pad(i + 1)}</span>
  <h2>${esc(s.title)}</h2>
  <p>${esc(s.short)}</p>
  <div class="svc-row-media" aria-hidden="true">${s.image?.src ? img({ ...s.image, alt: '' }, { sizes: '170px' }) : chromaArt(i + 1)}</div>
</a>`).join('\n');
  return layout({
    path: '/hizmetler/',
    title: 'Hizmetler',
    description: 'Fotoğraf ve video prodüksiyonu, kreatif kampanyalar, sosyal medya içeriği, dijital reklam, marka kimliği ve web.',
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Ne üretiyoruz?</h1><div><p class="lead">Odağımız markalar için çekim ve içerik. Gerektiğinde kampanyayı, reklamı, kimliği ve web’i de aynı ekiple kuruyoruz.</p><div class="actions" style="margin-top:22px"><a class="btn btn-primary" href="/proje-baslat/">Teklif al</a><a class="btn btn-line" href="/cekim-planla/">Çekim planla</a></div></div></div></section>
<section class="shell section-tight" style="padding-top:0"><nav class="svc-list" aria-label="Hizmetler">${rows}</nav></section>
<section class="shell section-tight" style="padding-top:0">
  <div class="pkg-quote"><div><h3>Nereden başlayacağınızdan emin değil misiniz?</h3><p>Hazır paketlere göz atın, kendi paketinizi oluşturun ya da kısa bir görüşmeyle önceliği birlikte bulalım.</p></div><div class="actions"><a class="btn btn-dark" href="/paketler/">Paketler</a><a class="btn btn-line" href="/gorusme-planla/">Görüşme planla</a></div></div>
</section>
${ctaSection()}`,
    page: 'services'
  });
}

function serviceDetail(s, i) {
  const related = (s.projects || []).map(slug => live.find(p => p.slug === slug)).filter(Boolean);
  const next = services[(i + 1) % services.length];
  const shoot = ['fotograf-ve-video', 'kreatif-kampanyalar', 'sosyal-medya-ve-icerik'].includes(s.slug);
  return layout({
    path: `/hizmetler/${s.slug}/`,
    title: s.title,
    description: s.short,
    body: `
<section class="page-hero shell">
  <a class="back" href="/hizmetler/">Tüm hizmetler</a>
  <div class="page-hero-split"><h1 class="h-display">${esc(s.title)}</h1><div><p class="lead">${esc(s.lead)}</p><div class="actions" style="margin-top:22px"><a class="btn btn-primary" href="/proje-baslat/?hizmet=${s.slug}">Teklif al</a>${shoot ? '<a class="btn btn-line" href="/cekim-planla/">Çekim planla</a>' : '<a class="btn btn-line" href="/gorusme-planla/">Görüşme planla</a>'}</div></div></div>
</section>
<section class="shell section-tight" style="padding-top:0">
  <div class="detail-grid">
    <figure class="detail-media">${s.image?.src ? img(s.image, { sizes: '(max-width: 900px) 92vw, 46vw', eager: true }) + stockTag(s.image) : chromaArt(i + 1, pad(i + 1))}</figure>
    <div>
      <div class="detail-block"><h2>Neler dahil?</h2><ul class="check-list">${s.includes.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="detail-block"><h2>Kimler için?</h2><p class="body-copy">${esc(s.fit)}</p></div>
      <div class="detail-block"><h2>Nasıl başlarız?</h2><p class="body-copy">Kısa bir brief ya da tanışma görüşmesiyle ihtiyacı netleştiriyor; kapsamı, takvimi ve fiyatı yazılı olarak paylaşıyoruz.</p>
        <div class="actions" style="margin-top:22px"><a class="btn btn-primary" href="/proje-baslat/?hizmet=${s.slug}">Teklif al</a><a class="btn btn-line" href="/gorusme-planla/">Görüşme planla</a></div>
      </div>
      ${related.length ? `<div class="detail-block"><h2>İlgili işler</h2><div class="related">${related.map(p => `<a href="/calismalar/${p.slug}/">${img(p.cover, { sizes: '300px' })}<strong>${esc(p.title)}</strong></a>`).join('')}</div></div>` : ''}
    </div>
  </div>
</section>
<a class="case-next" href="/hizmetler/${next.slug}/"><span>Sıradaki hizmet</span><strong>${esc(next.title)}</strong></a>`,
    page: 'service',
    ld: [{ '@context': 'https://schema.org', '@type': 'Service', name: s.title, description: s.short, serviceType: s.title, areaServed: 'TR', provider: { '@type': 'Organization', name: BRAND, url: `${URL_BASE}/` } }]
  });
}

/* ---------------- Process & studio ---------------- */
function processPage() {
  return layout({
    path: '/surec/',
    title: 'Süreç',
    description: 'Keşiften yayına dört adımda nasıl çalıştığımız: keşif, kreatif konsept, çekim ve üretim, yayın ve gelişim.',
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Fikirden yayına.</h1><div><p class="lead">Her proje aynı dört adımdan geçer. Hangi adımda ne alacağınızı en baştan bilirsiniz.</p><div class="actions" style="margin-top:22px"><a class="btn btn-primary" href="/proje-baslat/">Proje Başlat</a></div></div></div></section>
<section style="padding-bottom:var(--section)"><div class="shell">${stack()}</div></section>
<section class="section" style="background:var(--bg-2)"><div class="shell">
  <h2 class="h-section" style="max-width:16ch;margin-bottom:clamp(32px,4vw,56px)">İki çalışma biçimi.</h2>
  <div class="principles">
    <div><h3>Proje bazlı</h3><p>Kampanya çekimi, marka kimliği ya da web sitesi gibi başı ve sonu belli işler. Kapsam, takvim ve teslimler baştan yazılı olarak belirlenir.</p></div>
    <div><h3>Aylık üretim</h3><p>Sosyal medya içeriği, düzenli çekimler ve dijital reklam gibi süreklilik isteyen işler. Her ay planlar, çeker, sonuçları birlikte değerlendiririz.</p></div>
    <div><h3>İkisi birlikte</h3><p>Çoğu marka bir kampanya çekimiyle başlar, ardından aylık içerik üretimiyle devam eder. Geçişi aynı ekip yönetir.</p></div>
  </div>
</div></section>
${ctaSection()}`,
    page: 'process'
  });
}

function aboutPage() {
  return layout({
    path: '/hakkimizda/',
    title: 'Stüdyo',
    description: 'KROMAKOPIA; markalar için fotoğraf, video, içerik ve kreatif kampanya üreten bağımsız bir kreatif stüdyo.',
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Markalar için içerik üreten bağımsız bir stüdyo.</h1><div><p class="lead">Fotoğraf ve video çekiyor, kampanyalar tasarlıyor, sosyal medya için içerik üretiyoruz. Gerektiğinde marka kimliğini ve dijital deneyimi de aynı ekiple kuruyoruz.</p></div></div></section>
<section class="section" style="background:var(--bg-2)"><div class="shell">
  <p class="statement">Kroma renk demek, kopya çoğaltmak. Bir markanın rengini bulup her içerikte aynı netlikte çoğaltıyoruz.</p>
  <div class="principles" style="margin-top:clamp(48px,7vw,100px)">
    <div><h3>Kendi ekibimizle</h3><p>Fikri bulan, çekimi planlayan ve kurguyu yapan aynı ekip. Konuştuğunuz kişi, işi yapan kişi.</p></div>
    <div><h3>Çekimden yayına</h3><p>Konsept, prodüksiyon, kurgu, tasarım ve yayın tek akışta. Fikir el değiştirirken sulanmıyor.</p></div>
    <div><h3>Ölçülü ve açık</h3><p>Ne üreteceğimizi, ne kadar süreceğini ve neye mal olacağını baştan yazıyoruz.</p></div>
  </div>
</div></section>
<section class="section"><div class="shell detail-grid">
  <h2 class="h-section">Kimlerle çalışıyoruz?</h2>
  <div class="body-copy"><p>Moda, güzellik, lifestyle, restoran ve e-ticaret markalarıyla; görüntünün satışa doğrudan etki ettiği alanlarda çalışıyoruz.</p><p>Tek seferlik çekim ve kampanyalar da üstleniyoruz, aylık içerik üretimi de yapıyoruz. Çalışmalarımızı Türkçe ve İngilizce yürütebiliyoruz.</p>
  <div class="actions" style="margin-top:28px"><a class="btn btn-primary" href="/proje-baslat/">Proje Başlat</a><a class="btn btn-line" href="/calismalar/">İşlere bakın</a></div></div>
</div></section>
${ctaSection()}`,
    page: 'about'
  });
}

/* ---------------- Packages ---------------- */
const SOCIAL_PACKAGES = [
  { id: 'essential', name: 'ESSENTIAL', price: '14.900', text: 'Düzenli ve tutarlı bir içerik akışı için başlangıç.', items: ['Profil düzeni ve görsel tutarlılık', 'Sosyal medya yayın yönetimi', 'Aylık içerik planı', 'Sosyal medya tasarımları'], msg: 'Essential paketi hakkında görüşmek istiyorum.\n\nPaket bedeli: 14.900 TL / ay' },
  { id: 'studio', name: 'STUDIO', price: '19.900', text: 'Markaya özel çekimlerle içerik kalitesini yükseltmek isteyenlere.', items: ['ESSENTIAL kapsamı', 'Plana bağlı fotoğraf ve video çekimi', 'Reels kurgusu ve görsel seriler', 'Geliştirilmiş içerik stratejisi'], msg: 'Studio paketi hakkında görüşmek istiyorum.\n\nPaket bedeli: 19.900 TL / ay', featured: true },
  { id: 'growth', name: 'GROWTH', price: '29.900', text: 'Çekilen içeriği reklamla buluşturup talebi büyütmek isteyenlere.', items: ['STUDIO kapsamı', 'Meta Ads kampanya yönetimi', 'Reklam kreatifi testleri', 'Aylık performans raporu'], note: 'Reklam bütçesi pakete dahil değildir; doğrudan Meta’ya ödenir.', msg: 'Growth paketi hakkında görüşmek istiyorum.\n\nPaket bedeli: 29.900 TL / ay\n\nMeta reklam bütçesinin paket bedeline dahil olmadığını biliyorum.' },
  { id: 'full', name: 'FULL', price: '44.900', text: 'İçerik, prodüksiyon ve reklamı birlikte yöneten kapsamlı iş ortaklığı.', items: ['Marka ve görsel dil', 'Fotoğraf, video ve tasarım üretimi', 'Sosyal medya ve içerik stratejisi', 'Meta Ads yönetimi ve raporlama'], note: 'Önerilen Meta reklam bütçesi 20.000–30.000 TL / ay; doğrudan Meta’ya ödenir.', msg: 'Full paketi hakkında görüşmek istiyorum.\n\nAjans bedeli: 44.900 TL / ay\nÖnerilen Meta reklam bütçesi: 20.000–30.000 TL / ay\n\nMeta reklam bütçesinin doğrudan Meta’ya ödendiğini biliyorum.' }
];
const PROJECT_GROUPS = [
  { title: 'Fotoğraf / Video Prodüksiyon', text: 'Sosyal medya için 2 saatlik veya yarım günlük içerik çekimi. Model, stüdyo ve özel set gerektiren prodüksiyonlar ayrıca planlanır.', slug: 'fotograf-ve-video', builder: true, shoot: true },
  { title: 'Özel Kreatif Kampanyalar', text: 'Lansman, sezon veya yeni koleksiyon kampanyaları. Kapsam fikre ve kanallara göre değiştiği için her kampanyayı ayrıca fiyatlandırıyoruz.', slug: 'kreatif-kampanyalar', builder: false, shoot: true },
  { title: 'Marka Kimliği Paketleri', text: 'Mini kapsam: logo yönü, renk ve tipografi sistemi. Tam kapsam: buna ek olarak marka kılavuzu ve temel uygulamalar.', slug: 'marka-kimligi', builder: true },
  { title: 'Web Tasarım', text: 'Tek bir hedefe odaklanan landing page ya da markanın tüm hikâyesini anlatan kurumsal web sitesi. Alan adı ve barındırma ayrıca ücretlendirilir.', slug: 'web-ve-dijital-deneyim', builder: true }
];

function packagesPage() {
  const social = SOCIAL_PACKAGES.map(p => `<article class="pkg${p.featured ? ' is-featured' : ''}" id="paket-${p.id}">
  <h3>${p.name}</h3>
  <p class="pkg-price">${p.price} TL <small>/ ay</small></p>
  <p>${p.text}</p>
  <ul>${p.items.map(i => `<li>${i}</li>`).join('')}</ul>
  ${p.note ? `<p class="note">${p.note}</p>` : ''}
  <div class="actions"><a class="btn btn-primary btn-sm" href="/proje-baslat/?paket=${p.id}&amp;hizmet=sosyal-medya-ve-icerik">Teklif al</a><a class="btn btn-line btn-sm" href="${waLink(`Merhaba KROMAKOPIA,\n\n${p.msg}\n\nDetayları konuşabilir miyiz?`)}" target="_blank" rel="noopener">WhatsApp</a></div>
</article>`).join('');
  const groups = PROJECT_GROUPS.map(g => `<article class="pkg">
  <h3>${g.title}</h3>
  <p>${g.text}</p>
  <div class="actions"><a class="btn btn-primary btn-sm" href="/proje-baslat/?hizmet=${g.slug}">Teklif al</a>${g.shoot ? '<a class="btn btn-line btn-sm" href="/cekim-planla/">Çekim planla</a>' : ''}${g.builder ? '<a class="btn btn-line btn-sm" href="/paket-olustur/">Paket oluşturucu</a>' : ''}</div>
</article>`).join('');
  return layout({
    path: '/paketler/',
    title: 'Paketler',
    description: 'Fotoğraf ve video prodüksiyonu, aylık içerik üretim paketleri, kreatif kampanyalar, marka kimliği ve web tasarım.',
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Net kapsam. Açık başlangıç.</h1><p class="lead">Aylık içerik paketleri sabit fiyatlı. Çekim, kampanya ve proje işleri ise kapsamı netleştirdikten sonra yazılı teklifle başlar.</p></div></section>
<section class="shell section-tight" style="padding-top:0">
  <div class="pkg-group">
    <div class="pkg-group-head"><h2 class="h-section">Prodüksiyon ve proje işleri</h2><p>Çekim, kampanya, kimlik ve web. Başlangıç kapsamlarını paket oluşturucuda görebilir, özel ihtiyaçlar için teklif alabilirsiniz.</p></div>
    <div class="pkg-grid">${groups}</div>
  </div>
  <div class="pkg-group">
    <div class="pkg-group-head"><h2 class="h-section">Aylık İçerik Üretim Paketleri</h2><p>Minimum çalışma süresi 3 aydır. Kanal, içerik adedi, revizyon ve çekim kapsamı başlangıçta birlikte netleşir.</p></div>
    <div class="pkg-grid">${social}</div>
  </div>
  <div class="pkg-group">
    <div class="pkg-quote"><div><h3>Hazır paket size uymuyor mu?</h3><p>İhtiyacınız olan hizmetleri seçin, toplamı anında görün ve paketi WhatsApp’tan bize gönderin.</p></div><div class="actions"><a class="btn btn-dark" href="/paket-olustur/">Paketini oluştur</a></div></div>
  </div>
</section>
${ctaSection()}`,
    page: 'packages'
  });
}

function builderPage() {
  return layout({
    path: '/paket-olustur/',
    title: 'Paket Oluştur',
    description: 'İhtiyacınız olan hizmetleri seçin, aylık ve tek seferlik toplamı anında görün.',
    css: [`/assets/css/package-builder.css?v=${PB_V}`],
    scripts: ['/assets/js/package-builder.js'],
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Paketinizi oluşturun.</h1><p class="lead">İhtiyacınız olanları seçin, toplamı anında görün. Nihai kapsam ve fiyatı görüşmede birlikte netleştiriyoruz.</p></div></section>
<section class="shell section-tight package-builder" style="padding-top:0" id="kendi-paketini-olustur" aria-labelledby="builder-title" data-package-builder>
  <h2 class="sr-only" id="builder-title">Paketinizi oluşturun</h2>
  <div data-builder-mount><p>Paket oluşturucu yükleniyor. <a href="/iletisim/">İletişime geçin</a></p></div>
  <noscript><p>Hizmet seçimi ve canlı hesaplama için JavaScript’i etkinleştirin veya <a href="/iletisim/">iletişim sayfamızdan</a> bize ulaşın.</p></noscript>
</section>`,
    page: 'builder'
  });
}

function checkupPage() {
  return layout({
    path: '/check-up/',
    title: 'Dijital Check-up',
    description: 'Instagram hesabınızı veya web sitenizi gönderin, en kritik üç noktayı birlikte görelim.',
    scripts: ['/assets/js/forms.js'],
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Nerede kaybettiğinizi birlikte bulalım.</h1><p class="lead">Instagram hesabınızı veya web sitenizi gönderin. Görüntü, içerik ve dönüşüm tarafındaki en kritik üç noktayı paylaşalım.</p></div></section>
<section class="shell form-shell">
  <aside class="form-aside"><h2>Nasıl işliyor?</h2><ul><li>Hesabınızı veya sitenizi yazın.</li><li>Talebiniz WhatsApp’ta hazır mesaj olarak açılır; göndermek sizin elinizde.</li><li>İlk değerlendirme ücretsizdir ve en kritik üç gözlemle sınırlıdır.</li></ul></aside>
  <form class="form-card" data-checkup-form novalidate>
    <div class="form-grid">
      <div class="field field-full"><label for="checkup-target">Instagram kullanıcı adı veya web sitesi *</label><input id="checkup-target" name="target" type="text" inputmode="url" autocomplete="url" placeholder="@hesabiniz veya https://…" required maxlength="240"><p class="field-error" aria-live="polite"></p></div>
      <div class="field field-full"><label for="checkup-business">İşletme adı <span class="hint">(isteğe bağlı)</span></label><input id="checkup-business" name="business" type="text" autocomplete="organization" maxlength="100"><p class="field-error" aria-live="polite"></p></div>
    </div>
    <div class="form-foot"><p class="note">Mesaj WhatsApp’ta açılır.</p><button class="btn btn-primary" type="submit">Check-up iste</button></div>
  </form>
</section>`,
    page: 'checkup'
  });
}

/* ---------------- Lead forms ---------------- */
const field = (id, label, input, { full = false, hint = '' } = {}) => `<div class="field${full ? ' field-full' : ''}"><label for="${id}">${label}${hint ? ` <span class="hint">${hint}</span>` : ''}</label>${input}<p class="field-error" aria-live="polite"></p></div>`;
let hpCount = 0;
const hp = () => `<div class="hp" aria-hidden="true"><label for="hp-${++hpCount}">Bu alanı boş bırakın</label><input id="hp-${hpCount}" name="_honey" type="text" tabindex="-1" autocomplete="off"></div>`;
const consent = id => `<label class="consent" for="${id}"><input id="${id}" name="kvkk" type="checkbox" required><span>Bilgilerimin talebime dönüş yapılması amacıyla işlenmesine ilişkin <a href="/kvkk/" target="_blank">KVKK aydınlatma metnini</a> okudum. *</span></label>`;
const choices = (name, list, type = 'checkbox', inline = false) => `<div class="choices${inline ? ' choices-inline' : ''}">${list.map(v => `<label class="choice"><input type="${type}" name="${name}" value="${esc(v)}"${type === 'radio' ? ' required' : ''}><span>${esc(v)}</span></label>`).join('')}</div>`;
const budgetSelect = (id, name, kind, label) => field(id, label, `<select id="${id}" name="${name}" data-label="${label}" data-options="${kind}"><option value="">Seçin</option>${(kind === 'shoot' ? site.forms.shootBudgets : site.forms.budgets).map(b => `<option>${esc(b)}</option>`).join('')}</select>`);
const doneBlock = (formId, title, text) => `<div class="form-card form-done" data-done="${formId}" hidden aria-live="polite">
  <h2>${title}</h2><p>${text}</p>
  <div class="summary-list" data-done-summary></div>
  <div class="actions"><a class="btn btn-dark" href="/calismalar/">İşlere göz atın</a><a class="btn btn-line" data-done-wa target="_blank" rel="noopener" href="${waLink()}">WhatsApp’tan da yazın</a></div>
</div>`;

const BRIEF_SERVICES = ['Fotoğraf / Video Çekimi', 'Kreatif Kampanya', 'Sosyal Medya', 'Dijital Reklam', 'Marka Kimliği', 'Web Tasarım', 'Birden Fazla Hizmet'];

function briefPage() {
  return layout({
    path: '/proje-baslat/',
    title: 'Proje Başlat',
    description: 'Üç adımlık brief ile projenizi anlatın; kapsam, takvim ve fiyatla dönüş yapalım.',
    scripts: ['/assets/js/forms.js'],
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Projenizi anlatın.</h1><p class="lead">Üç kısa adım, yaklaşık iki dakika. En geç bir iş günü içinde kapsam önerisi ve sonraki adımla dönüyoruz.</p></div></section>
<section class="shell form-shell">
  <aside class="form-aside">
    <h2>Sonra ne olur?</h2>
    <ul><li>Briefinizi okuyup gerekirse kısa sorularla netleştiriyoruz.</li><li>${site.booking.durationMinutes} dakikalık bir tanışma görüşmesi öneriyoruz.</li><li>Kapsam, takvim ve fiyatı yazılı teklif olarak paylaşıyoruz.</li></ul>
    <p class="note">Acele bir işiniz mi var? <a class="text-link" href="${waLink('Merhaba KROMAKOPIA, acil bir proje için yazıyorum.')}" target="_blank" rel="noopener">WhatsApp’tan yazın</a>.</p>
  </aside>
  <div>
  <form class="form-card" id="brief-form" data-kform="brief" novalidate>
    <ol class="steps-nav" aria-label="Form adımları"><li>Hizmet</li><li>Proje</li><li>İletişim</li></ol>
    ${hp()}
    <input type="hidden" name="paket" data-label="Paket" value="">
    <div class="form-step">
      <h2 class="step-title">Hangi konuda destek istiyorsunuz?</h2>
      <p class="step-sub">Birden fazla seçebilirsiniz.</p>
      <fieldset class="field"><legend class="sr-only">Hizmetler</legend><div data-group-required="En az bir hizmet seçin.">${choices('hizmetler', BRIEF_SERVICES)}</div><p class="field-error" aria-live="polite"></p></fieldset>
      <div class="form-foot"><span></span><button class="btn btn-primary" type="button" data-next>Devam et</button></div>
    </div>
    <div class="form-step" hidden>
      <h2 class="step-title">Projeden bahsedin.</h2>
      <p class="step-sub">Seçtiğiniz hizmetler: <b data-service-summary>—</b>. <a class="text-link" href="#" data-goto="0">Değiştir</a></p>
      <div class="form-grid">
        ${field('b-company', 'Marka / şirket *', '<input id="b-company" name="sirket" data-label="Marka / şirket" type="text" autocomplete="organization" required maxlength="120">', { full: true })}
        ${field('b-desc', 'Proje açıklaması *', '<textarea id="b-desc" name="aciklama" data-label="Proje açıklaması" required minlength="20" maxlength="3000" placeholder="Ne üretmek istiyorsunuz? Ör. yeni koleksiyon için ürün ve model çekimi, 10 reels, kampanya görselleri…"></textarea>', { full: true })}
        ${field('b-needs', 'Hizmetlerle ilgili notlar', '<input id="b-needs" name="ihtiyac" data-label="Hizmet notları" type="text" maxlength="300" placeholder="Ör. ürünler hazır, manken ve stüdyo gerekiyor">', { full: true, hint: '(isteğe bağlı)' })}
        ${field('b-date', 'Hedeflenen başlangıç', '<input id="b-date" name="baslangic" data-label="Hedeflenen başlangıç" type="date">')}
        ${budgetSelect('b-budget', 'butce', 'project', 'Tahmini bütçe')}
        ${field('b-refs', 'Referans web sitesi veya bağlantılar', '<textarea id="b-refs" name="referanslar" data-label="Referanslar" maxlength="1200" style="min-height:90px" placeholder="Beğendiğiniz çekimler, markalar, mevcut siteniz, Instagram hesabınız…"></textarea>', { full: true, hint: '(isteğe bağlı)' })}
      </div>
      <div class="form-foot"><button class="btn btn-line" type="button" data-prev>Geri</button><button class="btn btn-primary" type="button" data-next>Devam et</button></div>
    </div>
    <div class="form-step" hidden>
      <h2 class="step-title">Size nasıl ulaşalım?</h2>
      <p class="step-sub">Bilgilerinizi yalnızca bu talebe dönüş yapmak için kullanırız.</p>
      <div class="form-grid">
        ${field('b-name', 'Ad soyad *', '<input id="b-name" name="ad" data-label="Ad soyad" type="text" autocomplete="name" required maxlength="100">')}
        ${field('b-email', 'E-posta *', '<input id="b-email" name="email" data-label="E-posta" type="email" autocomplete="email" required maxlength="160" placeholder="ad@marka.com">')}
        ${field('b-phone', 'Telefon', '<input id="b-phone" name="telefon" data-label="Telefon" type="tel" autocomplete="tel" maxlength="30" pattern="[0-9+()\\s-]{7,30}" data-pattern-message="Telefon numarasını rakamlarla yazın." placeholder="+90 5xx xxx xx xx">', { hint: '(isteğe bağlı)' })}
        <fieldset class="field"><legend>Tercih ettiğiniz iletişim *</legend>${choices('iletisim', ['E-posta', 'Telefon', 'WhatsApp'], 'radio', true)}<p class="field-error" aria-live="polite"></p></fieldset>
        <div class="field-full">${consent('b-kvkk')}</div>
      </div>
      <div class="form-foot"><button class="btn btn-line" type="button" data-prev>Geri</button><button class="btn btn-primary" type="submit">Briefi gönder</button></div>
    </div>
    <p class="form-status" role="status" aria-live="polite" data-form-status></p>
  </form>
  ${doneBlock('brief-form', 'Briefiniz bize ulaştı.', 'En geç bir iş günü içinde seçtiğiniz kanaldan dönüş yapıyoruz. Bu arada işlerimize göz atabilirsiniz.')}
  </div>
</section>`,
    page: 'brief'
  });
}

function shootPage() {
  return layout({
    path: '/cekim-planla/',
    title: 'Çekim Planla',
    description: 'Ürün, model, lifestyle veya mekân için fotoğraf ve video çekimi talebi gönderin; uygunluğu ve kapsamı onaylayıp dönelim.',
    scripts: ['/assets/js/forms.js'],
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Çekiminizi planlayalım.</h1><p class="lead">Fotoğraf ve video prodüksiyonu için ihtiyacınızı yazın. Bu form bir ön taleptir; tarih, uygunluk ve kapsam biz onayladıktan sonra kesinleşir.</p></div></section>
<section class="shell form-shell">
  <aside class="form-aside">
    <h2>Rezervasyon nasıl kesinleşir?</h2>
    <ul><li>Talebinizi alıp tarih uygunluğunu kontrol ediyoruz.</li><li>Kapsamı, ekip ve ekipman ihtiyacını ve fiyatı yazılı olarak paylaşıyoruz.</li><li>Onayınızla çekim tarihi takvime işleniyor.</li></ul>
    <div class="notice"><strong>Önemli:</strong> Bu form otomatik rezervasyon oluşturmaz.</div>
  </aside>
  <div>
  <form class="form-card" id="shoot-form" data-kform="shoot" novalidate>
    ${hp()}
    <div class="form-grid">
      <fieldset class="field field-full"><legend>Çekim türü *</legend><div data-group-required="En az bir çekim türü seçin.">${choices('cekim_turu', ['Fotoğraf', 'Video', 'Fotoğraf ve video'], 'checkbox', true)}</div><p class="field-error" aria-live="polite"></p></fieldset>
      <fieldset class="field field-full"><legend>Çekim içeriği *</legend><div data-group-required="En az bir içerik türü seçin.">${choices('icerik', ['Ürün', 'Model', 'Lifestyle', 'Mekân', 'Yemek / menü'], 'checkbox', true)}</div><p class="field-error" aria-live="polite"></p></fieldset>
      ${field('s-location', 'Lokasyon *', '<input id="s-location" name="lokasyon" data-label="Lokasyon" type="text" required maxlength="160" placeholder="Şehir, mekânınız, stüdyo ihtiyacı…">')}
      ${field('s-date', 'Tercih edilen tarih', '<input id="s-date" name="tarih" data-label="Tercih edilen tarih" type="date">')}
      ${field('s-duration', 'Tahmini süre', '<select id="s-duration" name="sure" data-label="Tahmini süre"><option value="">Seçin</option><option>2 saat</option><option>Yarım gün</option><option>Tam gün</option><option>Birden fazla gün</option><option>Emin değilim</option></select>')}
      ${field('s-count', 'Ürün veya sahne sayısı', '<input id="s-count" name="adet" data-label="Ürün / sahne sayısı" type="text" inputmode="numeric" maxlength="40" placeholder="Ör. 12 ürün, 4 sahne">')}
      ${field('s-model', 'Manken ihtiyacı', '<select id="s-model" name="manken" data-label="Manken ihtiyacı"><option value="">Seçin</option><option>Gerek yok</option><option>Manken bizden</option><option>Manken sizden (ajans/oyuncu)</option><option>Emin değilim</option></select>')}
      ${field('s-deliver', 'Teslim beklentisi', '<select id="s-deliver" name="teslim" data-label="Teslim beklentisi"><option value="">Seçin</option><option>Sadece fotoğraf</option><option>Sadece video</option><option>Fotoğraf ve video</option><option>Sosyal medya formatlarında kurgulu video</option></select>')}
      ${budgetSelect('s-budget', 'butce', 'shoot', 'Yaklaşık bütçe')}
      ${field('s-refs', 'Referans bağlantıları', '<textarea id="s-refs" name="referanslar" data-label="Referanslar" maxlength="1200" style="min-height:90px" placeholder="Beğendiğiniz çekimler, moodboard, Pinterest panosu…"></textarea>', { full: true, hint: '(isteğe bağlı)' })}
      ${field('s-notes', 'Eklemek istedikleriniz', '<textarea id="s-notes" name="notlar" data-label="Notlar" maxlength="2000" style="min-height:90px"></textarea>', { full: true, hint: '(isteğe bağlı)' })}
      ${field('s-company', 'Marka / şirket *', '<input id="s-company" name="sirket" data-label="Marka / şirket" type="text" autocomplete="organization" required maxlength="120">')}
      ${field('s-name', 'Ad soyad *', '<input id="s-name" name="ad" data-label="Ad soyad" type="text" autocomplete="name" required maxlength="100">')}
      ${field('s-email', 'E-posta *', '<input id="s-email" name="email" data-label="E-posta" type="email" autocomplete="email" required maxlength="160">')}
      ${field('s-phone', 'Telefon', '<input id="s-phone" name="telefon" data-label="Telefon" type="tel" autocomplete="tel" maxlength="30" pattern="[0-9+()\\s-]{7,30}" data-pattern-message="Telefon numarasını rakamlarla yazın.">', { hint: '(isteğe bağlı)' })}
      <div class="field-full">${consent('s-kvkk')}</div>
    </div>
    <div class="form-foot"><p class="note">Ön talep. Onayımızla kesinleşir.</p><button class="btn btn-primary" type="submit">Çekim talebini gönder</button></div>
    <p class="form-status" role="status" aria-live="polite" data-form-status></p>
  </form>
  ${doneBlock('shoot-form', 'Çekim talebiniz alındı.', 'Bu henüz bir rezervasyon değil. Tarih uygunluğunu ve kapsamı kontrol edip en geç bir iş günü içinde dönüyoruz.')}
  </div>
</section>`,
    page: 'shoot'
  });
}

function meetingPage() {
  return layout({
    path: '/gorusme-planla/',
    title: 'Görüşme Planla',
    description: `${site.booking.durationMinutes} dakikalık bir tanışma görüşmesi planlayın; projenizi ve ihtiyacınızı birlikte netleştirelim.`,
    scripts: ['/assets/js/forms.js'],
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Tanışalım.</h1><p class="lead">15–20 dakikalık online bir görüşmede markanızı, ihtiyacınızı ve nereden başlayabileceğimizi konuşalım. Ücretsizdir, bağlayıcı değildir.</p></div></section>
<section class="shell form-shell">
  <aside class="form-aside">
    <h2>Görüşmede ne konuşacağız?</h2>
    <ul><li>Markanız ve şu anki içerik durumu</li><li>Hedefiniz ve zamanlamanız</li><li>Size uygun çekim, içerik ve çalışma biçimi</li></ul>
    <p class="note">Görüşme Google Meet veya telefonla yapılır.</p>
  </aside>
  <div>
    <div data-cal hidden></div>
    <div data-cal-fallback>
      <div class="notice" style="margin-bottom:18px">Online takvimimiz henüz yayında değil. Size uygun zaman aralığını yazın; görüşme saatini e-postayla teyit edelim.</div>
      <form class="form-card" id="meeting-form" data-kform="meeting" novalidate>
        ${hp()}
        <div class="form-grid">
          ${field('m-name', 'Ad soyad *', '<input id="m-name" name="ad" data-label="Ad soyad" type="text" autocomplete="name" required maxlength="100">')}
          ${field('m-company', 'Marka / şirket *', '<input id="m-company" name="sirket" data-label="Marka / şirket" type="text" autocomplete="organization" required maxlength="120">')}
          ${field('m-email', 'E-posta *', '<input id="m-email" name="email" data-label="E-posta" type="email" autocomplete="email" required maxlength="160">')}
          ${field('m-phone', 'Telefon', '<input id="m-phone" name="telefon" data-label="Telefon" type="tel" autocomplete="tel" maxlength="30" pattern="[0-9+()\\s-]{7,30}" data-pattern-message="Telefon numarasını rakamlarla yazın.">', { hint: '(isteğe bağlı)' })}
          ${field('m-date', 'Tercih ettiğiniz gün', '<input id="m-date" name="gun" data-label="Tercih edilen gün" type="date">')}
          ${field('m-time', 'Saat aralığı *', '<select id="m-time" name="saat" data-label="Saat aralığı" required><option value="">Seçin</option><option>10:00 – 12:00</option><option>12:00 – 14:00</option><option>14:00 – 16:00</option><option>16:00 – 18:00</option><option>Esnek</option></select>')}
          ${field('m-topic', 'Ne hakkında konuşmak istersiniz?', '<textarea id="m-topic" name="konu" data-label="Görüşme konusu" maxlength="1500" style="min-height:100px"></textarea>', { full: true, hint: '(isteğe bağlı)' })}
          <div class="field-full">${consent('m-kvkk')}</div>
        </div>
        <div class="form-foot"><p class="note">Saati e-postayla teyit ediyoruz.</p><button class="btn btn-primary" type="submit">Görüşme iste</button></div>
        <p class="form-status" role="status" aria-live="polite" data-form-status></p>
      </form>
      ${doneBlock('meeting-form', 'Görüşme talebiniz alındı.', 'Size uygun saati en geç bir iş günü içinde e-postayla teyit ediyoruz.')}
    </div>
  </div>
</section>`,
    page: 'meeting'
  });
}

function contactPage() {
  return layout({
    path: '/iletisim/',
    title: 'İletişim',
    description: 'KROMAKOPIA ile iletişime geçin: teklif alın, çekim veya görüşme planlayın.',
    scripts: ['/assets/js/forms.js'],
    body: `
<section class="page-hero shell"><div class="page-hero-split"><h1 class="h-display">Aklınızda bir proje mi var?</h1><p class="lead">Birlikte hayata geçirelim. Size en uygun başlangıcı seçin.</p></div></section>
<section class="shell section-tight" style="padding-top:0">
  <div class="hub">
    <a href="/proje-baslat/"><strong>Teklif al</strong><span>Üç adımlık brief ile projenizi anlatın.</span></a>
    <a href="/cekim-planla/"><strong>Çekim planla</strong><span>Fotoğraf ve video prodüksiyonu için ön talep.</span></a>
    <a href="/gorusme-planla/"><strong>Görüşme planla</strong><span>${site.booking.durationMinutes} dakikalık tanışma görüşmesi.</span></a>
  </div>
</section>
<section class="shell form-shell">
  <aside class="form-aside">
    <h2>Kısa bir mesaj da yeter.</h2>
    <p>Ne istediğinizden henüz emin değilseniz birkaç satır yazın, gerisini birlikte netleştirelim.</p>
    <ul><li><a class="text-link" href="${waLink(WA_HELLO)}" target="_blank" rel="noopener">WhatsApp ${C.whatsappLabel}</a></li></ul>
  </aside>
  <div>
  <form class="form-card" id="contact-form" data-kform="contact" novalidate>
    ${hp()}
    <input type="hidden" name="paket" data-label="Paket" value="">
    <div class="form-grid">
      ${field('c-name', 'Ad soyad *', '<input id="c-name" name="ad" data-label="Ad soyad" type="text" autocomplete="name" required maxlength="100">')}
      ${field('c-company', 'Marka / şirket', '<input id="c-company" name="sirket" data-label="Marka / şirket" type="text" autocomplete="organization" maxlength="120">', { hint: '(isteğe bağlı)' })}
      ${field('c-email', 'E-posta *', '<input id="c-email" name="email" data-label="E-posta" type="email" autocomplete="email" required maxlength="160">')}
      ${field('c-topic', 'Konu', `<select id="c-topic" name="konu" data-label="Konu"><option value="">Seçin</option>${BRIEF_SERVICES.slice(0, 6).map(s => `<option>${s}</option>`).join('')}<option>Henüz emin değilim</option></select>`)}
      ${field('c-msg', 'Mesajınız *', '<textarea id="c-msg" name="mesaj" data-label="Mesaj" required minlength="10" maxlength="3000"></textarea>', { full: true })}
      <div class="field-full">${consent('c-kvkk')}</div>
    </div>
    <div class="form-foot"><p class="note">En geç bir iş günü içinde dönüyoruz.</p><button class="btn btn-primary" type="submit">Mesajı gönder</button></div>
    <p class="form-status" role="status" aria-live="polite" data-form-status></p>
  </form>
  ${doneBlock('contact-form', 'Mesajınız bize ulaştı.', 'En geç bir iş günü içinde dönüş yapıyoruz.')}
  </div>
</section>`,
    page: 'contact'
  });
}

function kvkkPage() {
  return layout({
    path: '/kvkk/',
    title: 'KVKK Aydınlatma Metni ve Gizlilik',
    description: 'KROMAKOPIA web sitesi formları aracılığıyla toplanan kişisel verilerin işlenmesine ilişkin aydınlatma metni.',
    body: `
<section class="page-hero shell"><h1 class="h-display" style="max-width:18ch">KVKK aydınlatma metni ve gizlilik.</h1><p class="lead">6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, web sitemiz üzerinden paylaştığınız bilgilerin nasıl işlendiğini açıklıyoruz.</p></section>
<section class="shell section-tight" style="padding-top:0"><div class="prose">
  <h2>Veri sorumlusu</h2>
  <p>Kişisel verileriniz, veri sorumlusu sıfatıyla ${BRAND} tarafından işlenir. Bu metinle ilgili talepleriniz için <a href="/iletisim/">iletişim formunu</a> kullanabilir veya <a href="${waLink()}" target="_blank" rel="noopener">WhatsApp</a> üzerinden yazabilirsiniz.</p>
  <h2>Hangi verileri işliyoruz?</h2>
  <p>Teklif, görüşme, çekim ve iletişim formlarında paylaştığınız bilgiler: ad soyad, e-posta, telefon, marka veya şirket adı, proje ve çekim detayları, bütçe aralığı, tercih ettiğiniz tarih ve iletişim yöntemi ile paylaştığınız bağlantılar.</p>
  <h2>Hangi amaçla işliyoruz?</h2>
  <ul><li>Talebinizi değerlendirmek ve size dönüş yapmak,</li><li>Teklif, görüşme veya çekim planlaması yapmak,</li><li>Talebinize ilişkin iletişimi sürdürmek.</li></ul>
  <p>Verileriniz pazarlama listelerine eklenmez ve üçüncü kişilere satılmaz.</p>
  <h2>Hukuki sebep ve toplama yöntemi</h2>
  <p>Verileriniz, web sitemizdeki formlar aracılığıyla elektronik ortamda; KVKK m.5/2-c (bir sözleşmenin kurulmasıyla doğrudan ilgili olması) ve m.5/2-f (meşru menfaat) hukuki sebeplerine dayanılarak toplanır.</p>
  <h2>Aktarım</h2>
  <p>Form gönderimleri, iletinin e-posta kutumuza ulaştırılması için form iletim hizmeti sağlayıcısı FormSubmit (formsubmit.co) üzerinden iletilir; bu hizmetin sunucuları yurt dışında bulunabilir. WhatsApp bağlantılarını kullanmayı tercih ederseniz mesajınız WhatsApp (Meta) altyapısı üzerinden iletilir. Sitede yazı tipleri Google Fonts, bazı görseller Unsplash üzerinden yüklenir.</p>
  <h2>Saklama süresi</h2>
  <p>Talep verileri, iş ilişkisi kurulmadığı durumda en fazla 2 yıl süreyle saklanır ve ardından silinir.</p>
  <h2>Haklarınız</h2>
  <p>KVKK’nın 11. maddesi uyarınca verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz. Taleplerinizi <a href="/iletisim/">iletişim formu</a> üzerinden iletebilirsiniz.</p>
  <h2>Çerezler</h2>
  <p>Sitemiz reklam veya analiz çerezi kullanmaz. Paket oluşturucu, seçimlerinizi yalnızca kendi tarayıcınızda (yerel depolama) saklar.</p>
  <h2>Görseller</h2>
  <p>“Temsili görsel” etiketli fotoğraflar Unsplash lisansıyla kullanılan geçici görsellerdir ve müşteri işi değildir.</p>
</div></section>`,
    page: 'legal'
  });
}

function notFound() {
  return layout({
    path: '/404.html',
    title: 'Sayfa bulunamadı',
    description: 'Aradığınız sayfa bulunamadı.',
    noindex: true,
    body: `
<section class="page-hero shell" style="min-height:70vh"><h1 class="h-display">Bu sayfa yerinde yok.</h1><p class="lead">Adres değişmiş ya da yanlış yazılmış olabilir. Aşağıdaki bağlantılardan devam edin.</p>
<div class="actions" style="margin-top:32px"><a class="btn btn-primary" href="/">Ana sayfa</a><a class="btn btn-line" href="/calismalar/">İşler</a><a class="btn btn-line" href="/iletisim/">İletişim</a></div></section>`,
    page: '404'
  });
}

/* ---------------- Write everything ---------------- */
write('/', home());
write('/calismalar/', worksIndex());
live.forEach(p => write(`/calismalar/${p.slug}/`, projectDetail(p)));
write('/hizmetler/', servicesIndex());
services.forEach((s, i) => {
  write(`/hizmetler/${s.slug}/`, serviceDetail(s, i));
  (s.redirectFrom || []).forEach(old => redirectPage(`/hizmetler/${old}/`, `/hizmetler/${s.slug}/`));
});
write('/surec/', processPage());
write('/hakkimizda/', aboutPage());
write('/paketler/', packagesPage());
write('/paket-olustur/', builderPage());
write('/check-up/', checkupPage());
write('/iletisim/', contactPage());
write('/proje-baslat/', briefPage());
write('/cekim-planla/', shootPage());
write('/gorusme-planla/', meetingPage());
write('/kvkk/', kvkkPage());
write('/404.html', notFound());
redirectPage('/fiyatlar/', '/paketler/');
['brand-signal-system', 'content-engine', 'demand-revenue-loop'].forEach(old => redirectPage(`/calismalar/${old}/`, '/calismalar/'));

writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(p => `  <url><loc>${URL_BASE}${p}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${URL_BASE}/sitemap.xml\n`);
console.log(`Built ${sitemap.length} indexable pages.`);
if (!existsSync(join(ROOT, 'assets/og-kromakopia.png'))) console.warn('Missing assets/og-kromakopia.png');
