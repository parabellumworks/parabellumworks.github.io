// Lead forms: multi-step brief, shoot request, meeting request, quick contact.
// Submissions go to the endpoint in content/site.json (FormSubmit AJAX by default).
// If delivery fails, the visitor gets a prefilled WhatsApp / e-posta fallback.
const loadContent = name => fetch(`/content/${name}.json`, { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null)).catch(() => null);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
// The delivery endpoint lives only in content/site.json.
const FALLBACK = { whatsapp: '905369471196' };

const SUBJECTS = {
  brief: 'Yeni proje briefi',
  shoot: 'Yeni çekim talebi',
  meeting: 'Tanışma görüşmesi talebi',
  contact: 'Yeni iletişim mesajı'
};

const SERVICE_FROM_SLUG = {
  'marka-kimligi': 'Marka Kimliği', 'brand-systems': 'Marka Kimliği',
  'fotograf-ve-video': 'Fotoğraf / Video Çekimi', 'fotograf-video': 'Fotoğraf / Video Çekimi',
  'sosyal-medya-ve-icerik': 'Sosyal Medya', 'sosyal-medya': 'Sosyal Medya', 'content-production': 'Sosyal Medya', 'icerik-stratejisi': 'Sosyal Medya',
  'kreatif-kampanyalar': 'Kreatif Kampanya',
  'dijital-reklam': 'Dijital Reklam', 'performance-marketing': 'Dijital Reklam', 'reklam-performance': 'Dijital Reklam',
  'web-ve-dijital-deneyim': 'Web Tasarım', 'growth-revenue': 'Web Tasarım', 'web-deneyim': 'Web Tasarım'
};

const PACKAGES = { essential: 'ESSENTIAL', studio: 'STUDIO', growth: 'GROWTH', full: 'FULL' };

function message(field) {
  const v = field.validity;
  if (v.valueMissing) return field.type === 'checkbox' ? 'Devam etmek için bu kutuyu işaretleyin.' : 'Bu alanı doldurun.';
  if (v.typeMismatch && field.type === 'email') return 'Geçerli bir e-posta adresi yazın (ör. ad@marka.com).';
  if (v.typeMismatch && field.type === 'url') return 'Bağlantıyı https:// ile başlayarak yazın.';
  if (v.patternMismatch) return field.dataset.patternMessage || 'Biçimi kontrol edin.';
  if (v.tooShort) return `En az ${field.minLength} karakter yazın.`;
  if (v.rangeUnderflow) return 'Bugünden önceki bir tarih seçilemez.';
  return field.validationMessage;
}

function setError(wrapper, text) {
  if (!wrapper) return;
  wrapper.classList.toggle('is-invalid', Boolean(text));
  const out = $('.field-error', wrapper);
  if (out) out.textContent = text || '';
}

function validate(scope) {
  let firstBad = null;
  $$('[data-group-required]', scope).forEach(group => {
    const ok = $$('input', group).some(i => i.checked);
    setError(group.closest('.field'), ok ? '' : group.dataset.groupRequired);
    if (!ok && !firstBad) firstBad = $('input', group);
  });
  $$('input, select, textarea', scope).forEach(field => {
    if (field.closest('[data-group-required]') || field.closest('.hp') || field.type === 'hidden') return;
    const ok = field.checkValidity();
    const wrap = field.closest('.field') || field.closest('.consent');
    if (wrap?.classList.contains('consent')) wrap.classList.toggle('is-invalid', !ok);
    else setError(wrap, ok ? '' : message(field));
    if (!ok && !firstBad) firstBad = field;
  });
  if (firstBad) firstBad.focus({ preventScroll: false });
  return !firstBad;
}

function labelFor(form, el) {
  if (el.dataset.label) return el.dataset.label;
  const fs = el.closest('fieldset');
  if (fs && (el.type === 'checkbox' || el.type === 'radio')) return $('legend', fs)?.textContent.trim() || el.name;
  return form.querySelector(`label[for="${el.id}"]`)?.textContent.replace('*', '').trim() || el.name;
}

function collect(form) {
  const out = [];
  const seen = new Set();
  $$('input, select, textarea', form).forEach(el => {
    if (!el.name || el.name.startsWith('_') || el.closest('.hp') || seen.has(el.name)) return;
    if (el.type === 'checkbox' && el.name === 'kvkk') return;
    let value;
    if (el.type === 'checkbox' || el.type === 'radio') {
      seen.add(el.name);
      value = $$(`[name="${CSS.escape(el.name)}"]:checked`, form).map(i => i.value).join(', ');
    } else value = el.value.trim();
    if (value) out.push([labelFor(form, el), value]);
  });
  return out;
}

const textOf = (kind, pairs) => [`${SUBJECTS[kind] || 'Talep'} | KROMAKOPIA`, '', ...pairs.map(([k, v]) => `${k}: ${v}`)].join('\n');

function fallbackLinks(kind, pairs, cfg) {
  const text = textOf(kind, pairs);
  return {
    wa: `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text)}`
  };
}

async function send(kind, form, pairs, cfg) {
  const payload = Object.fromEntries(pairs);
  const email = $('input[type="email"]', form)?.value.trim();
  Object.assign(payload, {
    _subject: `${SUBJECTS[kind]} — ${payload['Marka / şirket'] || payload['Ad soyad'] || 'web sitesi'}`,
    _template: 'table',
    _captcha: 'false',
    _honey: '',
    'Form': SUBJECTS[kind],
    'Sayfa': location.href
  });
  if (email) payload._replyto = email;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  if (!cfg.endpoint) throw new Error('Form adresi tanımlı değil');
  try {
    const res = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || `HTTP ${res.status}`);
    return true;
  } finally { clearTimeout(timer); }
}

function initSteps(form) {
  const steps = $$('.form-step', form);
  if (steps.length < 2) return { show: () => {} };
  const marks = $$('.steps-nav li', form);
  let index = 0;
  const show = (i, scroll = true) => {
    index = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach((s, n) => { s.hidden = n !== index; });
    marks.forEach((m, n) => {
      m.classList.toggle('is-current', n === index);
      m.classList.toggle('is-done', n < index);
      if (n === index) m.setAttribute('aria-current', 'step'); else m.removeAttribute('aria-current');
    });
    const summary = $('[data-service-summary]', form);
    if (summary) {
      const chosen = $$('[name="hizmetler"]:checked', form).map(i => i.value);
      summary.textContent = chosen.length ? chosen.join(', ') : 'Henüz seçilmedi';
    }
    const heading = $('.step-title', steps[index]);
    if (!scroll) return;
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  form.addEventListener('click', e => {
    if (e.target.closest('[data-next]')) { if (validate(steps[index])) show(index + 1); }
    if (e.target.closest('[data-prev]')) show(index - 1);
    const jump = e.target.closest('[data-goto]');
    if (jump) { e.preventDefault(); show(Number(jump.dataset.goto)); }
  });
  // Enter inside a step advances instead of submitting early.
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && index < steps.length - 1) { e.preventDefault(); if (validate(steps[index])) show(index + 1); }
  });
  show(0, false);
  return { show, last: () => index === steps.length - 1 };
}

function prefill(form) {
  const q = new URLSearchParams(location.search);
  const svc = SERVICE_FROM_SLUG[q.get('hizmet') || q.get('service') || ''];
  if (svc) {
    const box = $(`[name="hizmetler"][value="${CSS.escape(svc)}"]`, form);
    if (box) box.checked = true;
    const select = $('select[name="konu"]', form);
    if (select && [...select.options].some(o => o.value === svc)) select.value = svc;
  }
  const pkg = PACKAGES[q.get('paket') || q.get('package') || ''];
  const pkgField = $('[name="paket"]', form);
  if (pkg && pkgField) pkgField.value = `${pkg} paketi`;
  // Today as the earliest selectable date.
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  $$('input[type="date"]', form).forEach(d => { d.min = today; });
}

function initForm(form, cfg) {
  const kind = form.dataset.kform;
  const status = $('[data-form-status]', form);
  const done = document.querySelector(`[data-done="${form.id}"]`);
  const started = Date.now();
  const steps = initSteps(form);
  prefill(form);

  form.addEventListener('input', e => {
    const wrap = e.target.closest('.field');
    if (wrap?.classList.contains('is-invalid')) {
      const group = e.target.closest('[data-group-required]');
      if (group) setError(wrap, $$('input', group).some(i => i.checked) ? '' : group.dataset.groupRequired);
      else setError(wrap, e.target.checkValidity() ? '' : message(e.target));
    }
    if (e.target.closest('.consent')) e.target.closest('.consent').classList.toggle('is-invalid', !e.target.checked);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (steps.last && !steps.last()) return;
    if (!validate(form)) return;
    const submit = $('[type="submit"]', form);
    const pairs = collect(form);
    const links = fallbackLinks(kind, pairs, cfg);
    // Bots fill the hidden field or submit instantly.
    if ($('[name="_honey"]', form)?.value || Date.now() - started < 2500) {
      status.dataset.state = 'error';
      status.textContent = 'Gönderim tamamlanamadı. Lütfen birkaç saniye sonra tekrar deneyin.';
      return;
    }
    submit.disabled = true;
    status.dataset.state = 'pending';
    status.textContent = 'Gönderiliyor…';
    try {
      await send(kind, form, pairs, cfg);
      status.textContent = '';
      delete status.dataset.state;
      if (done) {
        const list = $('[data-done-summary]', done);
        if (list) list.innerHTML = pairs.slice(0, 6).map(([k, v]) => `<div><b>${k}:</b> ${v.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</div>`).join('');
        const wa = $('[data-done-wa]', done);
        if (wa) wa.href = links.wa;
        form.hidden = true;
        done.hidden = false;
        const h = $('h2', done); h.tabIndex = -1; h.focus();
      } else {
        status.dataset.state = 'pending';
        status.textContent = 'Mesajınız bize ulaştı. En geç bir iş günü içinde dönüş yapıyoruz.';
        form.reset();
      }
    } catch (err) {
      status.dataset.state = 'error';
      status.innerHTML = `Talebiniz şu an iletilemedi. Bilgileriniz kaybolmadı: <a href="${links.wa}" target="_blank" rel="noopener">WhatsApp ile gönderin</a>; birkaç dakika sonra yeniden de deneyebilirsiniz.`;
      console.warn('[form]', err.message);
    } finally {
      submit.disabled = false;
    }
  });
}

async function initBooking(cfg) {
  const slot = $('[data-cal]');
  if (!slot) return;
  const link = (cfg.calLink || '').trim().replace(/^https?:\/\/(app\.)?cal\.com\//, '');
  if (!link) return; // No booking account connected yet: the request form stays.
  slot.innerHTML = `<iframe class="cal-frame" src="https://cal.com/${encodeURI(link)}?embed=true&theme=dark&layout=month_view" title="Görüşme takvimi" loading="lazy" allow="payment"></iframe>`;
  slot.hidden = false;
  $$('[data-cal-fallback]').forEach(el => { el.hidden = true; });
}

(async () => {
  const forms = $$('form[data-kform]');
  const site = await loadContent('site');
  const cfg = {
    endpoint: site?.forms?.endpoint || '',
    whatsapp: site?.contact?.whatsapp || FALLBACK.whatsapp,
    calLink: site?.booking?.calLink || ''
  };
  // Budget ranges are edited in content/site.json.
  $$('select[data-options]').forEach(sel => {
    const list = sel.dataset.options === 'shoot' ? site?.forms?.shootBudgets : site?.forms?.budgets;
    if (!Array.isArray(list) || !list.length) return;
    const keep = sel.options[0];
    sel.replaceChildren(keep, ...list.map(v => new Option(v, v)));
  });
  forms.forEach(f => initForm(f, cfg));
  initBooking(cfg);

  // Check-up keeps its WhatsApp hand-off.
  $$('[data-checkup-form]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate(form)) return;
    const d = new FormData(form);
    const lines = ['Merhaba KROMAKOPIA,', '', 'Dijital check-up talep ediyorum.', ''];
    if (d.get('business')) lines.push(`İşletme: ${d.get('business')}`);
    lines.push(`Instagram / web sitesi: ${d.get('target')}`);
    location.href = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  }));
})();
