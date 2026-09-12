(() => {
  'use strict';

  // All custom-package prices and variants live here; amounts are integer TL.
  const CONFIG = {
    storageKey: 'eightfold.custom-package.v1',
    whatsapp: '905369471196',
    services: [
      { id: 'brand', number: '01', title: 'Marka Kimliği', description: 'Markanız için ortak bir görsel dil.', billing: 'once', options: [
        { id: 'mini', label: 'Mini', name: 'Mini Marka Kimliği', price: 14900 },
        { id: 'full', label: 'Tam', name: 'Tam Marka Kimliği', price: 24900 }
      ] },
      { id: 'social', number: '02', title: 'Sosyal Medya Yönetimi', description: 'Profilleriniz için düzenli yayın yönetimi.', billing: 'monthly', options: [
        { id: 'standard', name: 'Sosyal Medya Yönetimi', price: 9900 }
      ] },
      { id: 'content', number: '03', title: 'İçerik Stratejisi', description: 'Ne söyleyeceğiniz ve nasıl söyleyeceğiniz.', billing: 'monthly', options: [
        { id: 'standard', name: 'İçerik Stratejisi', price: 4900 }
      ] },
      { id: 'design', number: '04', title: 'Grafik Tasarım', description: '8 adet sosyal medya kreatifi / ay.', billing: 'monthly', options: [
        { id: 'standard', name: 'Grafik Tasarım', price: 6000 }
      ] },
      { id: 'production', number: '05', title: 'Fotoğraf & Video', description: 'İşletmenize özel içerik çekimi.', billing: 'once', unit: 'çekim', options: [
        { id: 'two-hours', label: '2 Saat', name: '2 Saat İçerik Çekimi', price: 7500 },
        { id: 'half-day', label: 'Yarım Gün', name: 'Yarım Gün İçerik Çekimi', price: 11500 }
      ] },
      { id: 'ads', number: '06', title: 'Reklam & Performance', description: 'Meta Ads kampanya yönetimi.', billing: 'monthly', options: [
        { id: 'standard', name: 'Meta Ads Yönetimi', price: 7500 }
      ], extra: { id: 'ads-setup', name: 'Meta Ads Kurulum / Audit', price: 5000, billing: 'once' } },
      { id: 'web', number: '07', title: 'Web & Dijital Deneyim', description: 'İşletmenizin dijital adresi.', billing: 'once', options: [
        { id: 'landing', label: 'Landing Page', name: 'Landing Page', price: 12500 },
        { id: 'corporate', label: 'Kurumsal Site', name: 'Kurumsal Web Sitesi', price: 22500 }
      ] },
      { id: 'growth', number: '08', title: 'Growth & Dijital Sistemler', description: 'Dijital süreçlerinize gelişim desteği.', billing: 'monthly', options: [
        { id: 'standard', name: 'Growth & Dijital Sistemler', price: 7500 }
      ] }
    ]
  };
  const root = document.querySelector('[data-package-builder]');
  if (!root) return;
  const money = value => new Intl.NumberFormat('tr-TR').format(value);
  const rate = item => `${money(item.price)} TL${item.billing === 'monthly' ? ' / ay' : item.unit ? ' / çekim' : ''}`;
  const blankState = () => ({ selected: {}, variants: Object.fromEntries(CONFIG.services.map(s => [s.id, s.options[0].id])), setup: false });
  const sanitize = raw => {
    const next = blankState();
    if (!raw || typeof raw !== 'object') return next;
    CONFIG.services.forEach(service => {
      const variant = raw.variants?.[service.id];
      if (service.options.some(option => option.id === variant)) next.variants[service.id] = variant;
      if (raw.selected?.[service.id] === true) next.selected[service.id] = true;
    });
    next.setup = raw.setup === true;
    return next;
  };
  let state = blankState();
  try { state = sanitize(JSON.parse(localStorage.getItem(CONFIG.storageKey))); } catch { /* Storage is optional. */ }
  const selectedItems = () => CONFIG.services.flatMap(service => {
    const items = [];
    if (state.selected[service.id]) items.push({ ...service.options.find(o => o.id === state.variants[service.id]), key: service.id, billing: service.billing, unit: service.unit });
    if (service.extra && state.setup) items.push({ ...service.extra, key: service.extra.id });
    return items;
  });
  const totalsFor = items => items.reduce((totals, item) => {
    totals[item.billing === 'monthly' ? 'monthly' : 'once'] += item.price;
    return totals;
  }, { monthly: 0, once: 0 });

  root.querySelector('[data-builder-mount]').innerHTML = `
    <div class="builder-layout">
      <div class="builder-services" aria-label="Seçilebilir hizmetler">
        ${CONFIG.services.map(service => `
          <article class="builder-card" data-service="${service.id}">
            <button class="builder-select" type="button" data-select="${service.id}" aria-pressed="false" aria-labelledby="builder-title-${service.id}" aria-describedby="builder-price-${service.id}">
              <span class="builder-card-top"><span class="builder-number">${service.number}</span><span class="builder-selection"><span data-selection-text>Pakete ekle</span><span class="builder-check" aria-hidden="true">+</span></span></span>
              <span class="builder-card-title" id="builder-title-${service.id}">${service.title}</span>
              <span class="builder-description">${service.description}</span>
              <span class="builder-card-price" id="builder-price-${service.id}"></span>
            </button>
            ${service.options.length > 1 ? `<div class="builder-variants" role="group" aria-label="${service.title} seçenekleri">${service.options.map(option => `<button type="button" data-variant="${option.id}" data-group="${service.id}" aria-pressed="false">${option.label}</button>`).join('')}</div>` : ''}
            ${service.extra ? `<button type="button" class="builder-extra" data-setup aria-pressed="false"><span><span class="builder-extra-label">İsteğe bağlı kurulum</span>${service.extra.name}<small>${rate(service.extra)} · Tek seferlik</small></span><span class="builder-check" aria-hidden="true">+</span></button><p class="builder-card-note">Meta reklam bütçesi bu fiyata dahil değildir ve doğrudan Meta’ya ödenir.</p>` : ''}
          </article>`).join('')}
      </div>
      <aside class="builder-summary-home" aria-label="Özel paket özeti">
        <div class="builder-summary" data-builder-summary>
          <div class="builder-summary-head"><div><p class="builder-kicker">PAKETİNİZ</p><h3>Özel Paketiniz</h3></div><span class="builder-summary-mark" aria-hidden="true">08</span></div>
          <div class="builder-summary-tools"><p data-builder-count>0 hizmet seçildi</p><button type="button" class="builder-text-button" data-builder-reset disabled>Seçimleri Temizle</button></div>
          <p class="builder-empty" data-builder-empty>Henüz bir hizmet seçmediniz.</p>
          <ul class="builder-items" data-builder-items aria-label="Seçilen hizmetler"></ul>
          <div class="builder-totals" data-builder-totals>
            <div><span>Aylık Hizmet Bedeli</span><p><strong data-monthly-total>0</strong> <small>TL / ay</small></p></div>
            <div><span>Tek Seferlik / Proje Bedeli</span><p><strong data-once-total>0</strong> <small>TL</small></p></div>
          </div>
          <p class="builder-meta-note" data-builder-meta hidden>Meta reklam bütçesi bu fiyata dahil değildir ve doğrudan Meta’ya ödenir.</p>
          <div class="builder-contact"><label for="builder-name">Ad Soyad <span>(isteğe bağlı)</span></label><input id="builder-name" name="builder-name" type="text" autocomplete="name" maxlength="80"><label for="builder-business">İşletme Adı <span>(isteğe bağlı)</span></label><input id="builder-business" name="builder-business" type="text" autocomplete="organization" maxlength="100"></div>
          <a class="button button-light builder-whatsapp" data-builder-whatsapp role="link" aria-disabled="true" tabindex="-1" target="_blank" rel="noopener noreferrer">WhatsApp’tan Teklif İste <span aria-hidden="true">↗</span></a>
          <p class="builder-send-note">Mesaj WhatsApp’ta açılır. Göndermek sizin kontrolünüzde.</p>
          <p class="builder-test-note">Test fiyatlarıdır. Nihai kapsam ve ücret görüşmede netleştirilir.</p>
        </div>
      </aside>
    </div>
    <p class="builder-sr-only" role="status" aria-live="polite" aria-atomic="true" data-builder-announcement></p>
    <div class="builder-mobile-bar" data-builder-bar hidden><button type="button" aria-haspopup="dialog" aria-controls="builder-sheet" aria-expanded="false" data-open-summary><span><strong data-mobile-monthly>0 TL / ay</strong><span data-mobile-once>Tek seferlik: 0 TL</span></span><span class="builder-bar-action"><span data-mobile-count>0 hizmet</span><strong>Paketi Gör <span aria-hidden="true">↗</span></strong></span></button></div>`;
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
  const announcement = root.querySelector('[data-builder-announcement]');
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
    if (items.some(item => item.key === 'ads' || item.key === 'ads-setup')) lines.push('', 'Not: Meta reklam bütçesinin hizmet bedeline dahil olmadığını biliyorum.');
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
  const render = (feedback = false) => {
    const items = selectedItems();
    const totals = totalsFor(items);
    CONFIG.services.forEach(service => {
      const card = root.querySelector(`[data-service="${service.id}"]`);
      const selected = !!state.selected[service.id];
      card.classList.toggle('is-selected', selected || (service.id === 'ads' && state.setup));
      card.querySelector('[data-select]').setAttribute('aria-pressed', String(selected));
      card.querySelector('[data-selection-text]').textContent = selected ? 'Seçildi' : 'Pakete ekle';
      card.querySelector('.builder-select .builder-check').textContent = selected ? '✓' : '+';
      const option = service.options.find(o => o.id === state.variants[service.id]);
      card.querySelector('.builder-card-price').innerHTML = `<strong>${money(option.price)}</strong><span>TL${service.billing === 'monthly' ? ' / ay' : service.unit ? ' / çekim' : ''}</span>${service.billing === 'once' ? '<small>Tek seferlik / proje</small>' : ''}`;
      card.querySelectorAll('[data-variant]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.variant === option.id)));
      if (service.extra) {
        card.querySelector('[data-setup]').setAttribute('aria-pressed', String(state.setup));
        card.querySelector('[data-setup] .builder-check').textContent = state.setup ? '✓' : '+';
      }
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
    monthly.textContent = money(totals.monthly);
    once.textContent = money(totals.once);
    metaNote.hidden = !items.some(item => item.key === 'ads' || item.key === 'ads-setup');
    root.querySelector('[data-mobile-monthly]').textContent = `${money(totals.monthly)} TL / ay`;
    root.querySelector('[data-mobile-once]').textContent = `Tek seferlik: ${money(totals.once)} TL`;
    root.querySelector('[data-mobile-count]').textContent = `${items.length} hizmet`;
    updateLink();
    if (feedback) {
      animate(summary.querySelector('[data-builder-totals]'), [{ opacity: .55 }, { opacity: 1 }]);
      clearTimeout(announceTimer);
      announceTimer = setTimeout(() => { announcement.textContent = `${items.length} hizmet seçildi. Aylık ${money(totals.monthly)} TL. Tek seferlik ${money(totals.once)} TL.`; }, 150);
    }
  };
  const saveAndRender = () => {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch { /* Selection still works without storage. */ }
    render(true);
  };
  const handleAction = event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-select')) state.selected[button.dataset.select] = !state.selected[button.dataset.select];
    else if (button.hasAttribute('data-variant')) { state.variants[button.dataset.group] = button.dataset.variant; state.selected[button.dataset.group] = true; }
    else if (button.hasAttribute('data-setup')) state.setup = !state.setup;
    else if (button.hasAttribute('data-remove')) {
      if (button.dataset.remove === 'ads-setup') state.setup = false;
      else delete state.selected[button.dataset.remove];
    } else if (button.hasAttribute('data-builder-reset')) state = blankState();
    else return;
    saveAndRender();
  };
  root.addEventListener('click', handleAction);
  sheet.addEventListener('click', handleAction);
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
