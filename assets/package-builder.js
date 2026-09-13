(() => {
  'use strict';

  // All custom-package prices and variants live here; amounts are integer TL.
  const CONFIG = {
    storageKey: 'eightfold.custom-package.v1',
    whatsapp: '905369471196',
    services: [
      { id: 'social', number: '01', title: 'Sosyal Medya Yönetimi', description: 'Profilleriniz için düzenli yayın yönetimi.', billing: 'monthly', info: { what: 'Hesabınızın içerik akışını, paylaşım düzenini ve genel dijital görünümünü yönetiriz.', fit: 'Düzenli görünmek isteyen, içerik operasyonuna zamanı kalmayan işletmeler için.', scope: 'Yayın yönetimi dahil; içerik üretim adetleri seçilen kapsama göre belirlenir.' }, options: [
        { id: 'standard', name: 'Sosyal Medya Yönetimi', price: 9900 }
      ] },
      { id: 'content', number: '02', title: 'İçerik Stratejisi', description: 'Ne söyleyeceğiniz ve nasıl söyleyeceğiniz.', billing: 'monthly', info: { what: 'Ne paylaşılacağını, hangi formatların kullanılacağını ve içeriklerin hangi hedefe hizmet edeceğini planlarız.', fit: 'İçerik üreten ama yönünü ve önceliğini netleştirmek isteyen işletmeler için.', scope: 'Konu, format ve yayın yönü dahil; çekim ve tasarım üretimi ayrıca kapsamlandırılır.' }, options: [
        { id: 'standard', name: 'İçerik Stratejisi', price: 4900 }
      ] },
      { id: 'design', number: '03', title: 'Grafik Tasarım', description: '8 adet sosyal medya kreatifi / ay.', billing: 'monthly', info: { what: 'Sosyal medya postları, story kreatifleri, carousel ve kampanya görselleri üretiriz.', fit: 'Görsel standardını yükseltmek ve marka dilini her paylaşımda korumak isteyenler için.', scope: 'Test fiyatı aylık 8 kreatif içerir; ilave üretimler ayrıca planlanır.' }, options: [
        { id: 'standard', name: 'Grafik Tasarım', price: 6000 }
      ] },
      { id: 'ads', number: '04', title: 'Meta Ads Yönetimi', description: 'Kampanya yönetimi; standart hesap kurulumu dahil.', billing: 'monthly', cardNote: 'Meta reklam bütçesi hizmet bedeline dahil değildir ve doğrudan Meta’ya ödenir.', info: { what: 'Facebook ve Instagram reklam kampanyalarınızı kurar, hedefler, optimize eder ve takip ederiz.', fit: 'Reklamla düzenli talep oluşturmak ve bütçesini kontrollü yönetmek isteyen işletmeler için.', scope: 'Standart hesap kurulumu aylık yönetime dahildir. Meta reklam bütçesi hizmet bedeline dahil değildir ve doğrudan Meta’ya ödenir.' }, options: [
        { id: 'standard', name: 'Meta Ads Yönetimi', price: 7500 }
      ] },
      { id: 'growth', number: '05', title: 'Growth & Dijital Sistemler', description: 'Dijital süreçlerinize gelişim desteği.', billing: 'monthly', info: { what: 'Dijital kanalların birlikte çalışmasını, dönüşüm noktalarını ve büyüme fırsatlarını düzenli olarak analiz ederiz.', fit: 'Mevcut dijital düzenini ölçmek ve bir sonraki büyüme alanını görmek isteyen işletmeler için.', scope: 'Analiz ve gelişim öncelikleri dahil; yeni yazılım ve reklam bütçeleri hariçtir.' }, options: [
        { id: 'standard', name: 'Growth & Dijital Sistemler', price: 7500 }
      ] },
      { id: 'brand', number: '06', title: 'Marka Kimliği', description: 'Markanız için ortak bir görsel dil.', billing: 'once', info: { what: 'Markanın logo, renk, tipografi ve temel görsel sistemini oluşturur veya mevcut kimliği profesyonelleştiririz.', fit: 'Yeni başlayan, yenilenen veya dağınık görünen markalar için.', scope: 'Logo yönü, renk ve tipografi sistemi dahil; kapsamlı uygulamalar ayrıca netleştirilir.' }, options: [
        { id: 'mini', label: 'Mini', name: 'Mini Marka Kimliği', price: 14900 },
        { id: 'full', label: 'Tam', name: 'Tam Marka Kimliği', price: 24900 }
      ] },
      { id: 'production', number: '07', title: 'Fotoğraf & Video', description: 'İşletmenize özel içerik çekimi.', billing: 'once', unit: 'çekim', info: { what: 'Sosyal medya kullanımına yönelik fotoğraf ve video üretimi yaparız.', fit: 'Mekânını, ürününü veya hizmetini güçlü görsellerle göstermek isteyen işletmeler için.', scope: 'Çekim süresi seçilen seçeneğe göre belirlenir; özel prodüksiyon ihtiyaçları ayrıca fiyatlandırılır.' }, options: [
        { id: 'two-hours', label: '2 Saat', name: '2 Saat İçerik Çekimi', price: 7500 },
        { id: 'half-day', label: 'Yarım Gün', name: 'Yarım Gün İçerik Çekimi', price: 11500 }
      ] },
      { id: 'landing', number: '08', title: 'Landing Page', description: 'Tek hedefe odaklanan dijital sayfa.', billing: 'once', info: { what: 'Kampanya, hizmet veya ürün için dönüşüm odaklı bir landing page tasarlar ve geliştiririz.', fit: 'Tek bir teklifi net biçimde anlatmak ve başvuru ya da talep toplamak isteyen işletmeler için.', scope: 'Domain ve hosting ücretleri hizmet bedeline dahil değildir. Yıllık yenileme bedeli seçilen uzantı, altyapı ve sağlayıcıya göre değişir.', note: 'Alan adı ve hosting, müşteri adına veya müşteri hesabı üzerinden yönetilebilir.' }, options: [
        { id: 'standard', name: 'Landing Page', price: 12500 }
      ] },
      { id: 'corporate', number: '09', title: 'Kurumsal Web Sitesi', description: 'Markanız için kapsamlı dijital merkez.', billing: 'once', info: { what: 'Kurumsal yapınızı, hizmetlerinizi ve güven unsurlarınızı anlatan bir web sitesi tasarlar ve geliştiririz.', fit: 'Dijitalde kalıcı, güven veren ve kapsamlı bir adres isteyen işletmeler için.', scope: 'Domain ve hosting ücretleri hizmet bedeline dahil değildir. Yıllık yenileme bedeli seçilen uzantı, altyapı ve sağlayıcıya göre değişir.', note: 'Alan adı ve hosting, müşteri adına veya müşteri hesabı üzerinden yönetilebilir.' }, options: [
        { id: 'standard', name: 'Kurumsal Web Sitesi', price: 22500 }
      ] },
      { id: 'ads-audit', number: '10', title: 'Gelişmiş Meta Ads Audit / Yeniden Yapılandırma', description: 'Gerektiğinde uygulanan ileri hesap çalışması.', billing: 'once', info: { what: 'Mevcut reklam hesabını derinlemesine inceler; eski kampanyaları temizler, yapıyı ve takip düzenini gerektiğinde yeniden kurarız.', fit: 'Geçmişten kalan karmaşık yapısı veya ciddi yeniden organizasyon ihtiyacı bulunan hesaplar için.', scope: 'Opsiyonel bir ileri hizmettir. Standart hesap kurulumu aylık Meta Ads Yönetimi hizmetine dahildir; Meta reklam bütçesi dahil değildir.' }, options: [
        { id: 'standard', name: 'Gelişmiş Meta Ads Audit / Yeniden Yapılandırma', price: 5000 }
      ] }
    ]
  };
  const root = document.querySelector('[data-package-builder]');
  if (!root) return;
  const money = value => new Intl.NumberFormat('tr-TR').format(value);
  const rate = item => `${money(item.price)} TL${item.billing === 'monthly' ? ' / ay' : item.unit ? ' / çekim' : ''}`;
  const icon = kind => {
    const paths = { 'up-right': '<path d="M5 15 15 5M7 5h8v8"/>', right: '<path d="M3 10h14M11 4l6 6-6 6"/>', left: '<path d="M17 10H3m6-6-6 6 6 6"/>', down: '<path d="M10 3v14m0 0 6-6m-6 6-6-6"/>' };
    return `<svg class="ui-icon ui-icon-${kind}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">${paths[kind]}</svg>`;
  };
  const blankState = () => ({ selected: {}, variants: Object.fromEntries(CONFIG.services.map(s => [s.id, s.options[0].id])) });
  const sanitize = raw => {
    const next = blankState();
    if (!raw || typeof raw !== 'object') return next;
    CONFIG.services.forEach(service => {
      const variant = raw.variants?.[service.id];
      if (service.options.some(option => option.id === variant)) next.variants[service.id] = variant;
      if (raw.selected?.[service.id] === true) next.selected[service.id] = true;
    });
    // Preserve selections saved by the previous combined Web / Ads card model.
    if (raw.selected?.web === true) next.selected[raw.variants?.web === 'corporate' ? 'corporate' : 'landing'] = true;
    if (raw.setup === true) next.selected['ads-audit'] = true;
    return next;
  };
  let state = blankState();
  try { state = sanitize(JSON.parse(localStorage.getItem(CONFIG.storageKey))); } catch { /* Storage is optional. */ }
  const selectedItems = () => CONFIG.services.flatMap(service => state.selected[service.id]
    ? [{ ...service.options.find(o => o.id === state.variants[service.id]), key: service.id, billing: service.billing, unit: service.unit }]
    : []);
  const totalsFor = items => items.reduce((totals, item) => {
    totals[item.billing === 'monthly' ? 'monthly' : 'once'] += item.price;
    return totals;
  }, { monthly: 0, once: 0 });

  const renderServiceCard = service => `
    <article class="builder-card" data-service="${service.id}" data-billing="${service.billing}">
      <button class="builder-select" type="button" data-select="${service.id}" aria-pressed="false" aria-labelledby="builder-title-${service.id}" aria-describedby="builder-price-${service.id}">
        <span class="builder-card-top"><span class="builder-card-meta"><span class="builder-number">${service.number}</span>${service.billing === 'once' ? '<span class="builder-billing-label">Tek Seferlik</span>' : ''}</span><span class="builder-selection"><span data-selection-text>Pakete ekle</span><span class="builder-check" aria-hidden="true">+</span></span></span>
        <span class="builder-card-title" id="builder-title-${service.id}">${service.title}</span>
        <span class="builder-description">${service.description}</span>
        <span class="builder-card-price" id="builder-price-${service.id}"></span>
      </button>
      <button class="builder-info" type="button" data-info="${service.id}" aria-expanded="false" aria-controls="builder-info-${service.id}" aria-label="${service.title} hakkında bilgi"><svg class="ui-icon ui-icon-info" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="10" cy="10" r="7.2"></circle><path d="M10 9v5"></path><path d="M10 6.1h.01"></path></svg></button>
      <div class="builder-popover" id="builder-info-${service.id}" role="tooltip" aria-hidden="true"><p><strong>Ne yapıyoruz?</strong>${service.info.what}</p><p><strong>Kim için uygun?</strong>${service.info.fit}</p><p><strong>Neler dahil / hariç?</strong>${service.info.scope}</p>${service.info.note ? `<p class="builder-info-note">${service.info.note}</p>` : ''}<p class="builder-payment"><strong>Ödeme tipi</strong>${service.billing === 'monthly' ? 'Aylık hizmet' : 'Tek seferlik / proje bedeli'}</p></div>
      ${service.options.length > 1 ? `<div class="builder-variants" role="group" aria-label="${service.title} seçenekleri">${service.options.map(option => `<button type="button" data-variant="${option.id}" data-group="${service.id}" aria-pressed="false">${option.label}</button>`).join('')}</div>` : ''}
      ${service.cardNote ? `<p class="builder-card-note">${service.cardNote}</p>` : ''}
    </article>`;
  const monthlyServices = CONFIG.services.filter(service => service.billing === 'monthly');
  const projectServices = CONFIG.services.filter(service => service.billing === 'once');

  root.querySelector('[data-builder-mount]').innerHTML = `
    <div class="builder-layout">
      <div class="builder-service-groups">
        <section class="builder-service-group builder-group-monthly" aria-labelledby="builder-monthly-title">
          <div class="builder-group-head"><div><p class="builder-group-kicker">Aylık Hizmetler</p><h3 id="builder-monthly-title">Düzenli dijital çalışma</h3></div><p>Süreklilik isteyen hizmetler. Aylık kapsamınıza ekleyin.</p></div>
          <div class="builder-services" aria-label="Aylık hizmetler">${monthlyServices.map(renderServiceCard).join('')}</div>
        </section>
        <section class="builder-service-group builder-group-project" aria-labelledby="builder-project-title">
          <div class="builder-group-head"><div><p class="builder-group-kicker">Tek Seferlik / Proje Hizmetleri</p><h3 id="builder-project-title">İhtiyaca göre proje desteği</h3></div><p>Ayrı kapsamlanan üretim, kimlik ve kurulum işleri.</p></div>
          <div class="builder-services" aria-label="Tek seferlik ve proje hizmetleri">${projectServices.map(renderServiceCard).join('')}</div>
        </section>
      </div>
      <aside class="builder-summary-home" aria-label="Özel paket özeti">
        <div class="builder-summary" data-builder-summary>
          <div class="builder-summary-head"><div><p class="builder-kicker">PAKETİNİZ</p><h3>Özel Paketiniz</h3></div><span class="builder-summary-mark" aria-hidden="true">08</span></div>
          <div class="builder-summary-tools"><p data-builder-count>0 hizmet seçildi</p><button type="button" class="builder-text-button" data-builder-reset disabled>Seçimleri Temizle</button></div>
          <p class="builder-feedback" data-builder-feedback aria-live="polite" aria-hidden="true"></p>
          <p class="builder-empty" data-builder-empty>Henüz bir hizmet seçmediniz.</p>
          <ul class="builder-items" data-builder-items aria-label="Seçilen hizmetler"></ul>
          <div class="builder-totals" data-builder-totals>
            <div class="builder-total-monthly"><span>Aylık Hizmet Bedeli</span><p><strong data-monthly-total data-value="0">0</strong> <small>TL / ay</small></p></div>
            <div class="builder-total-once"><span>Tek Seferlik / Proje Bedeli</span><p><strong data-once-total data-value="0">0</strong> <small>TL</small></p></div>
          </div>
          <p class="builder-meta-note" data-builder-meta hidden>Meta reklam bütçesi hizmet bedeline dahil değildir ve doğrudan Meta’ya ödenir.</p>
          <div class="builder-contact"><label for="builder-name">Ad Soyad <span>(isteğe bağlı)</span></label><input id="builder-name" name="builder-name" type="text" autocomplete="name" maxlength="80"><label for="builder-business">İşletme Adı <span>(isteğe bağlı)</span></label><input id="builder-business" name="builder-business" type="text" autocomplete="organization" maxlength="100"></div>
          <a class="button button-light builder-whatsapp" data-builder-whatsapp role="link" aria-disabled="true" tabindex="-1" target="_blank" rel="noopener noreferrer">WhatsApp’tan Teklif İste ${icon('up-right')}</a>
          <p class="builder-send-note">Mesaj WhatsApp’ta açılır. Göndermek sizin kontrolünüzde.</p>
          <p class="builder-test-note">Test fiyatlarıdır. Nihai kapsam ve ücret görüşmede netleştirilir.</p>
        </div>
      </aside>
    </div>
    <p class="builder-sr-only" role="status" aria-live="polite" aria-atomic="true" data-builder-announcement></p>
    <div class="builder-mobile-bar" data-builder-bar hidden><button type="button" aria-haspopup="dialog" aria-controls="builder-sheet" aria-expanded="false" data-open-summary><span class="builder-mobile-values"><strong data-mobile-monthly><span data-mobile-monthly-value data-value="0">0</span><small> TL / ay</small></strong><span data-mobile-once>Tek seferlik: <b><span data-mobile-once-value data-value="0">0</span><small> TL</small></b></span></span><span class="builder-bar-action"><span data-mobile-count>0 hizmet</span><strong>Paketi Gör ${icon('up-right')}</strong></span></button></div>`;
  const summary = root.querySelector('[data-builder-summary]');
  const summaryHome = root.querySelector('.builder-summary-home');
  const itemList = root.querySelector('[data-builder-items]');
  const empty = root.querySelector('[data-builder-empty]');
  const counter = root.querySelector('[data-builder-count]');
  const reset = root.querySelector('[data-builder-reset]');
  const monthly = root.querySelector('[data-monthly-total]');
  const once = root.querySelector('[data-once-total]');
  const metaNote = root.querySelector('[data-builder-meta]');
  const whatsapp = root.querySelector('[data-builder-whatsapp]');
  const nameInput = root.querySelector('#builder-name');
  const businessInput = root.querySelector('#builder-business');
  const bar = root.querySelector('[data-builder-bar]');
  const openSummary = root.querySelector('[data-open-summary]');
  const mobileMonthlyValue = root.querySelector('[data-mobile-monthly-value]');
  const mobileOnceValue = root.querySelector('[data-mobile-once-value]');
  const announcement = root.querySelector('[data-builder-announcement]');
  const builderFeedback = root.querySelector('[data-builder-feedback]');
  const mobile = matchMedia('(max-width: 800px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sheet = document.createElement('dialog');
  sheet.id = 'builder-sheet';
  sheet.className = 'builder-sheet';
  sheet.setAttribute('aria-label', 'Özel Paketiniz');
  sheet.innerHTML = '<div class="builder-sheet-toolbar"><span>Paket özeti</span><button type="button" class="builder-close" aria-label="Paket özetini kapat" autofocus>×</button></div><div class="builder-sheet-body"></div>';
  document.body.append(sheet);
  const sheetBody = sheet.querySelector('.builder-sheet-body');
  let sectionVisible = false;
  let announceTimer;

  const messageFor = (items, totals) => {
    const lines = ['Merhaba EIGHTFOLD,', '', 'Web siteniz üzerinden kendi paketimi oluşturdum.', '', 'Seçtiğim hizmetler:', '', ...items.map(item => `• ${item.name} — ${rate(item)}`), '', 'Aylık Hizmet Bedeli:', `${money(totals.monthly)} TL / ay`, '', 'Tek Seferlik / Proje Bedeli:', `${money(totals.once)} TL`, '', 'Bu paket hakkında görüşmek istiyorum.'];
    if (items.some(item => item.key === 'ads' || item.key === 'ads-audit')) lines.push('', 'Not: Meta reklam bütçesinin hizmet bedeline dahil olmadığını biliyorum.');
    if (nameInput.value.trim()) lines.push('', `Ad Soyad: ${nameInput.value.trim()}`);
    if (businessInput.value.trim()) lines.push(`İşletme: ${businessInput.value.trim()}`);
    return lines.join('\n');
  };
  const updateLink = () => {
    const items = selectedItems();
    if (!items.length) {
      whatsapp.removeAttribute('href');
      whatsapp.setAttribute('aria-disabled', 'true');
      whatsapp.tabIndex = -1;
      return;
    }
    whatsapp.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(messageFor(items, totalsFor(items)))}`;
    whatsapp.removeAttribute('aria-disabled');
    whatsapp.tabIndex = 0;
  };
  const animate = (element, frames, duration = 220) => {
    if (!reduced.matches && element.animate) element.animate(frames, { duration, easing: 'cubic-bezier(.2,.7,.2,1)' });
  };
  const replayClass = (element, className) => {
    if (!element) return;
    element.classList.remove('is-added', 'is-removed', 'is-updated', 'is-updated-soft', 'is-money-updating', 'is-money-pulsing');
    void element.offsetWidth;
    element.classList.add(className);
  };
  const amountAnimations = new WeakMap();
  const animateAmount = (element, target, tone, enabled) => {
    if (!element) return;
    const previous = amountAnimations.get(element);
    if (previous?.frame) cancelAnimationFrame(previous.frame);
    const from = Number.isFinite(previous?.value) ? previous.value : Number(element.dataset.value || 0);
    element.dataset.value = String(target);
    if (!enabled || reduced.matches || from === target) {
      element.textContent = money(target);
      amountAnimations.set(element, { value: target, frame: 0 });
      return;
    }
    replayClass(element.closest('[class*="builder-total-"]') || element, tone === 'monthly' ? 'is-money-updating' : 'is-money-pulsing');
    const animation = { value: from, frame: 0 };
    const started = performance.now();
    const duration = 560;
    const tick = now => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      animation.value = Math.round(from + (target - from) * eased);
      element.textContent = money(animation.value);
      if (progress < 1) animation.frame = requestAnimationFrame(tick);
      else {
        animation.value = target;
        animation.frame = 0;
        element.textContent = money(target);
      }
    };
    amountAnimations.set(element, animation);
    animation.frame = requestAnimationFrame(tick);
  };
  const flyToSummary = card => {
    if (reduced.matches || !card) return;
    const target = mobile.matches && !sheet.open ? openSummary : summary;
    const sourceRect = card.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if (!sourceRect.width || !sourceRect.height || !targetRect.width || !targetRect.height) return;
    const ghost = document.createElement('span');
    ghost.className = 'builder-fly-chip';
    ghost.textContent = '+';
    ghost.style.left = `${sourceRect.left + sourceRect.width * .72}px`;
    ghost.style.top = `${sourceRect.top + 26}px`;
    document.body.append(ghost);
    const dx = targetRect.left + targetRect.width * .5 - (sourceRect.left + sourceRect.width * .72);
    const dy = targetRect.top + targetRect.height * .2 - (sourceRect.top + 26);
    const remove = () => ghost.remove();
    if (ghost.animate) {
      const motion = ghost.animate([
        { opacity: 0, transform: 'translate3d(0,0,0) scale(.72)' },
        { opacity: .82, transform: 'translate3d(0,0,0) scale(1)' },
        { opacity: 0, transform: `translate3d(${dx}px,${dy}px,0) scale(.42)` }
      ], { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
      motion.finished?.then(remove, remove);
    }
    setTimeout(remove, 760);
  };
  let feedbackTimer;
  const showBuilderFeedback = change => {
    const cardId = change.cardId || change.id;
    const card = root.querySelector(`[data-service="${cardId}"]`);
    replayClass(card, change.added ? 'is-added' : 'is-removed');
    replayClass(summary, change.added ? 'is-updated' : 'is-updated-soft');
    replayClass(bar, change.added ? 'is-updated' : 'is-updated-soft');
    if (change.added) flyToSummary(card);
    if (!builderFeedback) return;
    clearTimeout(feedbackTimer);
    builderFeedback.textContent = `${change.label} ${change.added ? 'eklendi' : 'çıkarıldı'}`;
    builderFeedback.setAttribute('aria-hidden', 'false');
    builderFeedback.classList.remove('is-visible');
    void builderFeedback.offsetWidth;
    builderFeedback.classList.add('is-visible');
    feedbackTimer = setTimeout(() => {
      builderFeedback.classList.remove('is-visible');
      builderFeedback.setAttribute('aria-hidden', 'true');
    }, 1700);
  };
  const render = (feedback = false) => {
    const items = selectedItems();
    const totals = totalsFor(items);
    CONFIG.services.forEach(service => {
      const card = root.querySelector(`[data-service="${service.id}"]`);
      const selected = !!state.selected[service.id];
      card.classList.toggle('is-selected', selected);
      card.querySelector('[data-select]').setAttribute('aria-pressed', String(selected));
      card.querySelector('[data-selection-text]').textContent = selected ? 'Seçildi' : 'Pakete ekle';
      card.querySelector('.builder-select .builder-check').textContent = selected ? '✓' : '+';
      const option = service.options.find(o => o.id === state.variants[service.id]);
      card.querySelector('.builder-card-price').innerHTML = `<strong>${money(option.price)}</strong><span>TL${service.billing === 'monthly' ? ' / ay' : service.unit ? ' / çekim' : ''}</span>${service.billing === 'once' ? '<small>Tek seferlik / proje</small>' : ''}`;
      card.querySelectorAll('[data-variant]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.variant === option.id)));
    });
    // Keep existing rows (and keyboard focus) when another item changes.
    itemList.querySelectorAll('[data-item]').forEach(row => {
      if (!items.some(item => item.key === row.dataset.item)) {
        if (row.contains(document.activeElement)) reset.focus({ preventScroll: true });
        if (!reduced.matches && row.animate) {
          const ghost = row.cloneNode(true);
          ghost.removeAttribute('data-item');
          ghost.setAttribute('aria-hidden', 'true');
          ghost.inert = true;
          ghost.style.cssText = `position:absolute;pointer-events:none;top:${row.offsetTop}px;width:${row.offsetWidth}px;`;
          itemList.append(ghost);
          const exit = ghost.animate([{ opacity: .65, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(8px)' }], { duration: 160, fill: 'forwards' });
          exit.finished.then(() => ghost.remove(), () => ghost.remove());
        }
        row.remove();
      }
    });
    items.forEach((item, index) => {
      let row = itemList.querySelector(`[data-item="${item.key}"]`);
      const fresh = !row;
      if (fresh) {
        row = document.createElement('li');
        row.dataset.item = item.key;
        row.innerHTML = '<div><strong></strong><span></span></div><button type="button" class="builder-remove">×</button>';
      }
      row.querySelector('strong').textContent = item.name;
      row.querySelector('span').textContent = `${rate(item)}${item.billing === 'once' ? ' · Tek seferlik' : ''}`;
      row.dataset.billing = item.billing;
      row.querySelector('button').dataset.remove = item.key;
      row.querySelector('button').setAttribute('aria-label', `${item.name} hizmetini kaldır`);
      if (itemList.children[index] !== row) itemList.insertBefore(row, itemList.children[index] || null);
      if (fresh && feedback) animate(row, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }]);
    });
    empty.hidden = items.length > 0;
    counter.textContent = `${items.length} hizmet seçildi`;
    reset.disabled = !items.length;
    if (reset.disabled && document.activeElement === reset) {
      (sheet.open ? sheet.querySelector('.builder-close') : root.querySelector('[data-select]')).focus({ preventScroll: true });
    }
    animateAmount(monthly, totals.monthly, 'monthly', feedback);
    animateAmount(once, totals.once, 'once', feedback);
    metaNote.hidden = !items.some(item => item.key === 'ads' || item.key === 'ads-audit');
    animateAmount(mobileMonthlyValue, totals.monthly, 'monthly', feedback);
    animateAmount(mobileOnceValue, totals.once, 'once', feedback);
    root.querySelector('[data-mobile-count]').textContent = `${items.length} hizmet`;
    updateLink();
    if (feedback) {
      clearTimeout(announceTimer);
      announceTimer = setTimeout(() => { announcement.textContent = `${items.length} hizmet seçildi. Aylık ${money(totals.monthly)} TL. Tek seferlik ${money(totals.once)} TL.`; }, 150);
    }
  };
  const saveAndRender = change => {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch { /* Selection still works without storage. */ }
    render(true);
    if (change) showBuilderFeedback(change);
  };
  const closeInfoPopovers = except => {
    root.querySelectorAll('[data-info]').forEach(button => {
      if (button !== except) {
        button.setAttribute('aria-expanded', 'false');
        const popover = root.querySelector(`#${button.getAttribute('aria-controls')}`);
        popover?.classList.remove('is-open');
        popover?.setAttribute('aria-hidden', 'true');
        button.closest('.builder-card')?.classList.remove('is-info-open');
      }
    });
  };
  const setInfoOpen = (button, open) => {
    const popover = root.querySelector(`#${button.getAttribute('aria-controls')}`);
    if (!popover) return;
    if (open) closeInfoPopovers(button);
    button.setAttribute('aria-expanded', String(open));
    popover.classList.toggle('is-open', open);
    popover.setAttribute('aria-hidden', String(!open));
    button.closest('.builder-card')?.classList.toggle('is-info-open', open);
  };
  let pointerInfoTarget = null;
  let pointerInfoAt = 0;
  const pointerRecentlyFocused = button => pointerInfoTarget === button && (performance.now() - pointerInfoAt) < 900;
  const handleAction = event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-info')) {
      pointerInfoTarget = null;
      event.stopPropagation();
      setInfoOpen(button, button.getAttribute('aria-expanded') !== 'true');
      return;
    }
    let change;
    if (button.hasAttribute('data-select')) {
      const id = button.dataset.select;
      const service = CONFIG.services.find(item => item.id === id);
      const added = !state.selected[id];
      state.selected[id] = added;
      change = { id, label: service?.title || 'Hizmet', added };
    } else if (button.hasAttribute('data-variant')) {
      const id = button.dataset.group;
      const service = CONFIG.services.find(item => item.id === id);
      const added = !state.selected[id];
      state.variants[id] = button.dataset.variant;
      state.selected[id] = true;
      if (added) change = { id, label: service?.title || 'Hizmet', added: true };
    } else if (button.hasAttribute('data-remove')) {
      const id = button.dataset.remove;
      const service = CONFIG.services.find(item => item.id === id);
      delete state.selected[id];
      change = { id, label: service?.title || 'Hizmet', added: false };
    } else if (button.hasAttribute('data-builder-reset')) state = blankState();
    else return;
    saveAndRender(change);
  };
  root.addEventListener('click', handleAction);
  sheet.addEventListener('click', handleAction);
  root.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-info]');
    if (!button) return;
    pointerInfoTarget = button;
    pointerInfoAt = performance.now();
  }, true);
  root.addEventListener('focusin', event => {
    const button = event.target.closest('[data-info]');
    if (button && !pointerRecentlyFocused(button)) setInfoOpen(button, true);
  });
  root.addEventListener('pointerenter', event => {
    const button = event.target.closest('[data-info]');
    if (button && matchMedia('(hover: hover)').matches) setInfoOpen(button, true);
  }, true);
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-info], .builder-popover')) closeInfoPopovers();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeInfoPopovers();
  });
  [nameInput, businessInput].forEach(input => input.addEventListener('input', updateLink));
  whatsapp.addEventListener('click', event => {
    updateLink();
    if (!selectedItems().length) event.preventDefault();
  });
  const updateBar = () => { bar.hidden = !mobile.matches || !sectionVisible || sheet.open; };
  let closeTimer;
  let closing = false;
  const closeSheet = () => {
    if (!sheet.open || closing) return;
    closing = true;
    sheet.classList.add('is-closing');
    closeTimer = setTimeout(() => sheet.close(), reduced.matches ? 0 : 180);
  };
  openSummary.addEventListener('click', () => {
    if (sheet.open) return;
    sheet.showModal();
    document.documentElement.classList.add('builder-modal-open');
    openSummary.setAttribute('aria-expanded', 'true');
    updateBar();
  });
  sheet.querySelector('.builder-close').addEventListener('click', closeSheet);
  sheet.addEventListener('cancel', event => { event.preventDefault(); closeSheet(); });
  sheet.addEventListener('click', event => {
    if (event.target !== sheet) return;
    const bounds = sheet.getBoundingClientRect();
    if (event.clientY < bounds.top || event.clientX < bounds.left || event.clientX > bounds.right) closeSheet();
  });
  sheet.addEventListener('close', () => {
    clearTimeout(closeTimer);
    closing = false;
    sheet.classList.remove('is-closing');
    document.documentElement.classList.remove('builder-modal-open');
    openSummary.setAttribute('aria-expanded', 'false');
    updateBar();
    if (mobile.matches && !bar.hidden) openSummary.focus({ preventScroll: true });
  });
  const placeSummary = () => {
    if (sheet.open) sheet.close();
    (mobile.matches ? sheetBody : summaryHome).append(summary);
    updateBar();
  };
  mobile.addEventListener('change', placeSummary);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { sectionVisible = entries[0].isIntersecting; updateBar(); }, { rootMargin: '-90px 0px 0px 0px' });
    observer.observe(root);
  } else sectionVisible = true;
  window.addEventListener('storage', event => {
    if (event.key !== CONFIG.storageKey && event.key !== null) return;
    try { state = sanitize(JSON.parse(event.newValue)); render(); } catch { /* Ignore invalid storage. */ }
  });
  placeSummary();
  render();
  root.dataset.ready = 'true';
})();
