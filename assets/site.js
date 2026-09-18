(() => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const mobileNav = window.matchMedia("(max-width: 960px)");
  const closeNav = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menüyü aç");
    nav.classList.remove("is-open");
    nav.inert = mobileNav.matches;
  };

  if (toggle && nav) {
    nav.inert = mobileNav.matches;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
      nav.classList.toggle("is-open", open);
      nav.inert = !open && mobileNav.matches;
    });
    nav.addEventListener("click", (event) => { if (event.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeNav();
        toggle.focus();
      }
    });
    mobileNav.addEventListener("change", closeNav);
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".site-header")) closeNav();
    });
  }

  if (nav) {
    nav.querySelectorAll('a').forEach(link => {
      const href = new URL(link.href).pathname;
      if (href === '/surec/') link.remove();
      else if (href === '/calismalar/') link.textContent = 'Çalışmalar';
      else if (href === '/fiyatlar/' || href === '/paketler/') { link.href = '/paketler/'; link.textContent = 'Paketler'; }
    });
    const packageLink = nav.querySelector('a[href="/paketler/"]');
    const aboutLink = nav.querySelector('a[href="/hakkimizda/"]');
    if (packageLink && aboutLink) nav.insertBefore(packageLink, aboutLink);
  }
  document.querySelectorAll('.footer-nav a[href="/fiyatlar/"]').forEach(link => { link.href = '/paketler/'; link.textContent = 'Paketler'; });

  const headerActions = document.querySelector('.header-actions');
  const startSource = headerActions?.querySelector('.header-contact');
  if (headerActions && startSource) {
    const startMenuId = 'start-menu';
    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.className = startSource.className + ' start-toggle';
    startButton.dataset.startToggle = '';
    startButton.setAttribute('aria-controls', startMenuId);
    startButton.setAttribute('aria-expanded', 'false');
    startButton.innerHTML = `Başlayalım <span aria-hidden="true"><svg class="ui-icon ui-icon-down" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M4 7l6 6 6-6"></path></svg></span>`;
    startSource.replaceWith(startButton);
    const startMenu = document.createElement('div');
    startMenu.id = startMenuId;
    startMenu.className = 'start-menu';
    startMenu.hidden = true;
    startMenu.innerHTML = `<p>Başlangıç seçin</p><a href="/paketler/"><span>Hazır paketler</span><svg class="ui-icon ui-icon-right" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M3 10h14M11 4l6 6-6 6"></path></svg></a><a href="/paket-olustur/"><span>Kendi paketimi oluştur</span><svg class="ui-icon ui-icon-right" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M3 10h14M11 4l6 6-6 6"></path></svg></a><a href="/check-up/"><span>Dijital Check-up</span><svg class="ui-icon ui-icon-right" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M3 10h14M11 4l6 6-6 6"></path></svg></a>`;
    headerActions.append(startMenu);
    const mobileStart = document.createElement('button');
    mobileStart.type = 'button';
    mobileStart.className = 'nav-start-mobile';
    mobileStart.textContent = 'Başlayalım';
    mobileStart.setAttribute('aria-controls', startMenuId);
    mobileStart.setAttribute('aria-expanded', 'false');
    nav?.append(mobileStart);
    const controls = [startButton, mobileStart];
    const setStartOpen = open => {
      startMenu.hidden = !open;
      controls.forEach(control => control.setAttribute('aria-expanded', String(open)));
      document.querySelector('.site-header')?.classList.toggle('has-start-menu', open);
    };
    controls.forEach(control => control.addEventListener('click', event => {
      event.stopPropagation();
      const open = startMenu.hidden;
      if (control === mobileStart) closeNav();
      setStartOpen(open);
      if (open) startMenu.querySelector('a')?.focus();
    }));
    startMenu.addEventListener('click', event => { if (event.target.closest('a')) setStartOpen(false); });
    document.addEventListener('click', event => { if (!event.target.closest('.start-menu,[data-start-toggle],.nav-start-mobile')) setStartOpen(false); });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || startMenu.hidden) return;
      setStartOpen(false);
      (getComputedStyle(startButton).display === 'none' ? toggle : startButton)?.focus();
    });
  }

  const path = window.location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll("[data-nav] a").forEach((link) => {
    const target = new URL(link.href).pathname.replace(/index\.html$/, "");
    if ((target === "/" && path === "/") || (target !== "/" && path.startsWith(target))) link.setAttribute("aria-current", "page");
  });

  document.querySelectorAll("[data-year]").forEach((item) => { item.textContent = String(new Date().getFullYear()); });

  document.querySelectorAll('[data-diagnostic]').forEach(section => {
    const options = [...section.querySelectorAll('[data-diagnostic-option]')];
    const areaList = section.querySelector('[data-diagnostic-areas]');
    const result = section.querySelector('[data-diagnostic-result]');
    const select = option => {
      options.forEach(item => {
        const active = item === option;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const areas = (option.dataset.areas || '').split('|').filter(Boolean);
      areaList.replaceChildren(...areas.map(area => {
        const item = document.createElement('li');
        item.textContent = area;
        return item;
      }));
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && result?.animate) {
        result.animate([{ opacity: .55, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    };
    options.forEach(option => option.addEventListener('click', () => select(option)));
  });

  document.querySelectorAll('[data-checkup-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const target = String(data.get('target') || '').trim();
      const business = String(data.get('business') || '').trim();
      const lines = ['Merhaba EIGHTFOLD,', '', 'Dijital Check-up talep ediyorum.', ''];
      if (business) lines.push('İşletme:', business, '');
      lines.push('Instagram / Website:', target, '', 'İlk değerlendirmeyi konuşabilir miyiz?');
      const status = form.querySelector('[data-checkup-status]');
      if (status) status.textContent = 'Talebiniz WhatsApp’ta açılıyor.';
      window.location.href = `https://wa.me/905369471196?text=${encodeURIComponent(lines.join('\n'))}`;
    });
  });

  const requestedService = new URLSearchParams(window.location.search).get("service");
  const serviceNames = {
    "marka-kimligi": "Marka Kimliği", "sosyal-medya": "Sosyal Medya Yönetimi",
    "icerik-stratejisi": "İçerik Stratejisi", "grafik-tasarim": "Grafik Tasarım",
    "fotograf-video": "Fotoğraf & Video", "reklam-performance": "Reklam & Performance",
    "web-deneyim": "Web & Dijital Deneyim", "growth-sistemler": "Growth & Dijital Sistemler",
    "brand-systems": "Marka Kimliği", "content-production": "İçerik Stratejisi",
    "performance-marketing": "Reklam & Performance", "growth-revenue": "Growth & Dijital Sistemler"
  };
  if (requestedService && serviceNames[requestedService]) {
    document.querySelectorAll('select[name="service"]').forEach((select) => { select.value = serviceNames[requestedService]; });
  }
  const packageNames = { essential: "ESSENTIAL — 14.900 TL / ay", studio: "STUDIO — 19.900 TL / ay", growth: "GROWTH — 29.900 TL / ay", full: "EIGHTFOLD FULL — 44.900 TL / ay" };
  const readyPackageMessages = {
    essential: "Merhaba EIGHTFOLD,\n\nEssential paketi hakkında görüşmek istiyorum.\n\nPaket bedeli:\n14.900 TL / ay\n\nDetayları konuşabilir miyiz?",
    studio: "Merhaba EIGHTFOLD,\n\nStudio paketi hakkında görüşmek istiyorum.\n\nPaket bedeli:\n19.900 TL / ay\n\nDetayları konuşabilir miyiz?",
    growth: "Merhaba EIGHTFOLD,\n\nGrowth paketi hakkında görüşmek istiyorum.\n\nPaket bedeli:\n29.900 TL / ay\n\nMeta reklam bütçesinin paket bedeline dahil olmadığını biliyorum.\n\nDetayları konuşabilir miyiz?",
    full: "Merhaba EIGHTFOLD,\n\nEIGHTFOLD Full paketi hakkında görüşmek istiyorum.\n\nAjans bedeli:\n44.900 TL / ay\n\nÖnerilen Meta reklam bütçesi:\n20.000–30.000 TL / ay\n\nToplam önerilen aylık dijital yatırım:\n64.900–74.900 TL / ay\n\nMeta reklam bütçesinin doğrudan Meta’ya ödendiğini biliyorum.\n\nDetayları konuşabilir miyiz?"
  };
  document.querySelectorAll('.package-cta').forEach(link => {
    const packageId = link.closest('.package-card')?.id.replace('paket-', '');
    const message = readyPackageMessages[packageId];
    if (!message) return;
    link.href = `https://wa.me/905369471196?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.whatsappSource = `ready-${packageId}`;
  });
  const requestedPackage = new URLSearchParams(window.location.search).get("package");
  if (Object.hasOwn(packageNames, requestedPackage)) {
    document.querySelectorAll('select[name="package"]').forEach(select => { select.value = requestedPackage; });
  }
  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    button.addEventListener("click", async () => {
      const email = button.getAttribute("data-copy-email");
      try { await navigator.clipboard.writeText(email); button.textContent = "E-posta kopyalandı"; }
      catch { button.textContent = email; }
    });
  });

  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const recipient = form.getAttribute("data-recipient") || "hello@parabellum.works";
      const name = String(data.get("name") || "").trim();
      const company = String(data.get("company") || "").trim();
      const labels = { name: "Ad soyad", company: "Marka / şirket", email: "E-posta", phone: "Telefon", website: "Web sitesi / sosyal hesap", service: "Öncelikli ihtiyaç", budget: "Aylık medya bütçesi", timeline: "Başlangıç zamanı", package: "İlgilenilen paket", goal: "Hedef / mevcut sorun" };
      const lines = ["Merhaba EIGHTFOLD,", "", "Yeni bir proje için görüşmek istiyorum.", ""];
      Object.entries(labels).forEach(([key, label]) => {
        const raw = String(data.get(key) || "").trim();
        const value = key === "package" ? (packageNames[raw] || "") : raw;
        if (value) lines.push(`${label}: ${value}`);
      });
      lines.push("", "Bu talep EIGHTFOLD proje formundan oluşturuldu.");
      const status = form.querySelector("[data-form-status]");
      if (status) status.textContent = "Proje özetiniz hazır. Gönderimi açılan e-posta uygulamasından tamamlayın. Uygulama açılmazsa hello@parabellum.works adresine doğrudan yazabilirsiniz. Bu form bilgilerinizi sunucuya kaydetmez.";
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(`Yeni proje talebi — ${company || name}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
    });
  });
})();

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 961px) and (hover: hover) and (pointer: fine)');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const section = document.querySelector('.discipline-section');
  const items = [...document.querySelectorAll('.discipline')];
  const counter = document.querySelector('[data-discipline-count]');
  let active = Math.max(0, items.findIndex(item => item.open));
  let sequencing = false;
  const disclosures = new Map();

  // Native details remain the no-JS and reduced-motion fallback.
  document.querySelectorAll('.discipline, [data-disclosure]').forEach(item => {
    const summary = item.querySelector('summary');
    const body = summary.nextElementSibling;
    const state = { animation: null, fade: null, target: item.open };
    const finish = () => {
      state.animation?.cancel();
      state.fade?.cancel();
      state.animation = state.fade = null;
      item.open = state.target;
      item.style.height = '';
      item.style.overflow = '';
      body.inert = false;
    };
    const setOpen = (open, animate = true) => {
      const from = item.getBoundingClientRect().height;
      state.animation?.cancel();
      state.fade?.cancel();
      state.animation = state.fade = null;
      state.target = open;
      if (!animate || reduced.matches || typeof item.animate !== 'function') { finish(); return; }
      item.style.height = '';
      item.open = true;
      const to = open ? item.getBoundingClientRect().height : summary.getBoundingClientRect().height + 2;
      item.style.overflow = 'hidden';
      body.inert = !open;
      if (!open && body.contains(document.activeElement)) summary.focus({ preventScroll: true });
      state.animation = item.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 380, easing: ease });
      state.fade = body.animate([{ opacity: open ? 0 : 1, transform: open ? 'translateY(5px)' : 'none' }, { opacity: open ? 1 : 0, transform: 'none' }], { duration: open ? 320 : 180, easing: ease });
      state.animation.onfinish = finish;
    };
    disclosures.set(item, { setOpen, finish, state });
    summary.addEventListener('click', event => {
      event.preventDefault();
      if (item.classList.contains('discipline')) {
        const index = items.indexOf(item);
        if (sequencing) { select(index); return; }
        const open = !state.target;
        items.forEach(other => { if (other !== item && other.open) disclosures.get(other).setOpen(false); });
        setOpen(open);
        if (open) select(index);
      } else setOpen(!state.target);
    });
    item.addEventListener('toggle', () => {
      if (!state.animation) state.target = item.open;
    });
  });

  let progress;
  if (section) {
    progress = document.createElement('div');
    progress.className = 'discipline-progress';
    progress.setAttribute('aria-hidden', 'true');
    items.forEach(() => progress.append(document.createElement('span')));
    section.querySelector('.discipline-intro').append(progress);
  }
  function select(index) {
    active = index;
    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    if (progress) [...progress.children].forEach((bar, i) => {
      bar.classList.toggle('is-past', i < index);
      bar.classList.toggle('is-current', i === index);
    });
  }
  const syncSequence = () => {
    sequencing = desktop.matches && !reduced.matches;
    section?.classList.toggle('is-sequenced', sequencing);
    items.forEach((item, i) => disclosures.get(item).setOpen(sequencing || i === active, false));
    select(active);
  };
  const openHash = () => {
    const index = items.findIndex(item => '#' + item.id === location.hash);
    if (index < 0) return;
    select(index);
    if (!sequencing) items.forEach((item, i) => disclosures.get(item).setOpen(i === index, false));
  };
  syncSequence();
  openHash();
  addEventListener('hashchange', openHash);
  items.forEach((item, index) => item.addEventListener('focusin', () => select(index)));

  // Mask only deliberate line breaks. Natural wrapping and accessible text survive.
  const headings = [...document.querySelectorAll('.section-heading h2, .diagnostic-heading h2, .problem-section h2, .discipline-intro h2, .role-section h2, .home-cta h2, .page-hero h1, .checkup-hero h1, .case-heading h1, .film-copy h2, .statement-band h2, .project-caption h3')];
  headings.forEach(heading => {
    heading.classList.add('motion-heading');
    if (![...heading.childNodes].some(node => node.nodeName === 'BR')) return;
    const nodes = [...heading.childNodes];
    let line = document.createElement('span');
    line.className = 'heading-line';
    let index = 0;
    heading.replaceChildren();
    const appendLine = () => {
      const inner = document.createElement('span');
      inner.append(...line.childNodes);
      line.append(inner);
      line.style.setProperty('--line', index++);
      heading.append(line);
    };
    nodes.forEach(node => {
      if (node.nodeName === 'BR') { appendLine(); line = document.createElement('span'); line.className = 'heading-line'; }
      else line.append(node);
    });
    if (line.childNodes.length) appendLine();
  });
  const reveals = [...document.querySelectorAll('.reveal:not(.is-visible), .project-media, .motion-heading')]
    .filter(el => el.classList.contains('motion-heading') || !el.querySelector('.motion-heading'));
  document.querySelectorAll('.package-grid, .concept-grid, .three-stages').forEach(grid => {
    [...grid.children].forEach((child, index) => child.style.setProperty('--stagger', `${Math.min(index, 3) * 65}ms`));
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!reduced.matches) entry.target.classList.add('is-entering');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    [...new Set(reveals)].forEach(el => observer.observe(el));
  }

  const hero = document.querySelector('.eightfold-hero');
  const mark = document.querySelector('[data-hero-mark]');
  let figure;
  if (mark) {
    figure = document.createElement('div');
    figure.className = 'hero-figure';
    mark.before(figure);
    figure.append(mark);
    const reflection = document.createElement('span');
    reflection.className = 'hero-reflection';
    reflection.setAttribute('aria-hidden', 'true');
    figure.append(reflection);
  }
  let heroVisible = false, sectionVisible = false, frame = 0;
  let pointer = null;
  const schedule = () => {
    if (frame || reduced.matches || (!heroVisible && !sectionVisible)) return;
    frame = requestAnimationFrame(updateScroll);
  };
  function updateScroll() {
    frame = 0;
    if (reduced.matches) return;
    // All layout reads precede style writes; no perpetual animation loop.
    const heroRect = heroVisible && desktop.matches && hero ? hero.getBoundingClientRect() : null;
    let next = active;
    if (sectionVisible && sequencing && !section.contains(document.activeElement)) {
      const aim = innerHeight * .46;
      let nearest = Infinity;
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height * .45 - aim);
        if (distance < nearest) { nearest = distance; next = index; }
      });
    }
    if (heroRect && figure) {
      const distance = clamp(-heroRect.top / heroRect.height, 0, 1);
      figure.style.setProperty('--sy', `${distance * 8}px`);
      figure.style.setProperty('--scale', String(1 - distance * .012));
      if (pointer) {
        const x = clamp((pointer.x - heroRect.left) / heroRect.width - .5, -.5, .5);
        const y = clamp((pointer.y - heroRect.top) / heroRect.height - .5, -.5, .5);
        figure.style.setProperty('--rx', `${-y * 1.5}deg`);
        figure.style.setProperty('--ry', `${x * 2}deg`);
        figure.style.setProperty('--light', `${x * 18}%`);
      }
    }
    if (next !== active) select(next);
  }
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === section) sectionVisible = entry.isIntersecting;
      });
      schedule();
    }, { rootMargin: '100px 0px' });
    if (hero) visibility.observe(hero);
    if (section) visibility.observe(section);
    if (hero || section) addEventListener('scroll', schedule, { passive: true });
  }
  hero?.addEventListener('pointermove', event => {
    if (!desktop.matches || reduced.matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  }, { passive: true });
  hero?.addEventListener('pointerleave', () => {
    pointer = null;
    if (figure) ['--rx','--ry','--light'].forEach(key => figure.style.removeProperty(key));
  });

  const tactile = [...document.querySelectorAll('[data-magnetic], .package-cta')];
  const resets = [];
  tactile.forEach(element => {
    let raf = 0;
    const button = element.classList.contains('button');
    const reset = () => {
      cancelAnimationFrame(raf); raf = 0;
      ['--mx','--my','--card-x','--card-y'].forEach(key => element.style.removeProperty(key));
    };
    resets.push(reset);
    element.addEventListener('pointermove', event => {
      if (!desktop.matches || reduced.matches) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = element.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width - .5, -.5, .5);
        const y = clamp((event.clientY - rect.top) / rect.height - .5, -.5, .5);
        element.style.setProperty(button ? '--mx' : '--card-y', button ? `${x * 2}px` : '0deg');
        element.style.setProperty(button ? '--my' : '--card-x', button ? `${y * 1.5}px` : '0deg');
      });
    }, { passive: true });
    element.addEventListener('pointerleave', reset);
    element.addEventListener('blur', reset);
  });
  const reset = () => {
    cancelAnimationFrame(frame); frame = 0; pointer = null;
    figure?.removeAttribute('style');
    resets.forEach(fn => fn());
    disclosures.forEach(control => control.finish());
    syncSequence();
    schedule();
  };
  reduced.addEventListener('change', reset);
  desktop.addEventListener('change', reset);
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pagehide', () => { cancelAnimationFrame(frame); resets.forEach(fn => fn()); });
})();

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  document.querySelectorAll('[data-package-carousel]').forEach(gallery => {
    const viewport = gallery.querySelector('.carousel-viewport');
    const track = gallery.querySelector('.package-grid');
    const originals = [...track.children];
    if (originals.length !== 4 || typeof track.animate !== 'function') return;
    let step = 0, visible = 1, animation = null, pending = 0, drag = null, dragFrame = 0;
    let suppressClick = false, suppressTimer = 0, width = 0;
    const base = () => `translate3d(${-step}px,0,0)`;
    originals.forEach(card => {
      card.classList.remove('reveal', 'is-entering');
      card.setAttribute('aria-roledescription', 'slayt');
    });
    track.prepend(originals[3]);
    gallery.classList.add('is-ready');
    const heightFor = focus => {
      const ordered = [...track.children];
      const start = Math.max(0, ordered.indexOf(focus));
      const cards = ordered.slice(start, start + visible);
      const tallest = Math.max(0, ...cards.map(card => card.offsetHeight));
      const style = getComputedStyle(viewport);
      return Math.ceil(tallest + (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0));
    };
    const syncHeight = (focus = track.children[1], immediate = false) => {
      const height = heightFor(focus);
      if (!height) return;
      if (immediate) viewport.style.transition = 'none';
      viewport.style.height = `${height}px`;
      if (immediate) requestAnimationFrame(() => viewport.style.removeProperty('transition'));
    };
    const describe = () => {
      const ordered = [...track.children];
      const current = ordered[1];
      const index = originals.indexOf(current);
      gallery.querySelector('[data-package-current]').textContent = String(index + 1).padStart(2, '0');
      ordered.forEach((card, i) => {
        const hidden = i < 1 || i > visible;
        if (hidden && card.contains(document.activeElement)) viewport.focus({ preventScroll: true });
        card.inert = hidden;
        if (hidden) card.setAttribute('aria-hidden', 'true'); else card.removeAttribute('aria-hidden');
      });
    };
    const settle = (updateHeight = true) => {
      const direction = pending;
      pending = 0;
      if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
      if (direction > 0) track.append(track.firstElementChild);
      else if (direction < 0) track.prepend(track.lastElementChild);
      track.style.transform = base();
      gallery.classList.remove('is-dragging');
      describe();
      if (updateHeight) syncHeight();
    };
    const move = (direction, offset = 0) => {
      if (animation || !step) return;
      pending = direction;
      const ordered = [...track.children];
      const target = ordered[direction > 0 ? 2 : direction < 0 ? 0 : 1];
      syncHeight(target);
      if (reduced.matches) { settle(); return; }
      animation = track.animate([
        { transform: `translate3d(${-step + offset}px,0,0)` },
        { transform: `translate3d(${-step - direction * step}px,0,0)` }
      ], { duration: direction ? 520 : 300, easing: ease, fill: 'forwards' });
      animation.onfinish = settle;
    };
    const measure = () => {
      const newWidth = viewport.clientWidth;
      if (Math.abs(newWidth - width) < 1 && step) return;
      width = newWidth;
      settle(false);
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      step = parseFloat(getComputedStyle(track.firstElementChild).width) + gap;
      visible = Math.max(1, Math.min(2, Math.floor((width + gap + 1) / step)));
      track.style.transform = base();
      describe();
      syncHeight(track.children[1], true);
    };
    viewport.addEventListener('pointerdown', event => {
      if (animation || event.button !== 0 || event.target.closest('a,button,summary,input,select,textarea')) return;
      suppressClick = false;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, started: false };
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.started) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
        drag.started = true;
        viewport.setPointerCapture(event.pointerId);
        gallery.classList.add('is-dragging');
      }
      event.preventDefault();
      drag.dx = Math.max(-step * .95, Math.min(step * .95, dx));
      if (!dragFrame) dragFrame = requestAnimationFrame(() => {
        dragFrame = 0;
        if (drag) track.style.transform = `translate3d(${-step + drag.dx}px,0,0)`;
      });
    });
    const endDrag = event => {
      if (!drag || drag.id !== event.pointerId) return;
      const last = drag; drag = null;
      cancelAnimationFrame(dragFrame); dragFrame = 0;
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      if (!last.started) return;
      suppressClick = true;
      clearTimeout(suppressTimer);
      suppressTimer = setTimeout(() => { suppressClick = false; }, 350);
      const direction = event.type === 'pointercancel' ? 0 : Math.abs(last.dx) > Math.min(70, step * .16) ? (last.dx < 0 ? 1 : -1) : 0;
      move(direction, last.dx);
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('click', event => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
        clearTimeout(suppressTimer);
      }
    }, true);
    viewport.tabIndex = 0;
    viewport.setAttribute('aria-label', 'Paket galerisi; kaydırın veya sağ ve sol ok tuşlarını kullanın');
    viewport.addEventListener('keydown', event => {
      if (event.target !== viewport || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });
    const revealHash = () => {
      const target = originals.find(card => '#' + card.id === location.hash);
      if (!target) return;
      settle();
      while (track.children[1] !== target) track.append(track.firstElementChild);
      track.style.transform = base(); describe(); syncHeight(track.children[1], true);
    };
    measure(); revealHash();
    addEventListener('hashchange', revealHash);
    let viewportObserver = null, cardObserver = null;
    if ('ResizeObserver' in window) {
      viewportObserver = new ResizeObserver(measure);
      viewportObserver.observe(viewport);
      cardObserver = new ResizeObserver(entries => {
        const visibleCards = [...track.children].slice(1, visible + 1);
        if (entries.some(entry => visibleCards.includes(entry.target))) syncHeight();
      });
      originals.forEach(card => cardObserver.observe(card));
    } else addEventListener('resize', measure, { passive: true });
    reduced.addEventListener('change', settle);
    addEventListener('pagehide', () => {
      cancelAnimationFrame(dragFrame);
      clearTimeout(suppressTimer);
      viewportObserver?.disconnect();
      cardObserver?.disconnect();
      settle();
    });
  });

  const dialog = document.querySelector('.case-lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    const triggers = [...document.querySelectorAll('[data-case-view]')];
    const views = triggers.map((button, index) => {
      const image = button.querySelector('img');
      return {
        key: button.dataset.caseView || `view-${index + 1}`,
        title: button.dataset.caseTitle || `Görsel ${index + 1}`,
        src: image?.currentSrc || image?.getAttribute('src') || '',
        alt: image?.alt || `İtalyan Chef Pizza görseli ${index + 1}`,
        style: 'view-editorial'
      };
    });
    let current = 0, opener;
    const frame = dialog.querySelector('[data-lightbox-frame]');
    if (!views.length || !frame) return;
    const show = index => {
      current = (index + views.length) % views.length;
      const view = views[current];
      frame.className = 'lightbox-image ' + view.style;
      const image = frame.querySelector('img');
      image.src = view.src;
      image.alt = view.alt;
      dialog.querySelector('#case-lightbox-title').textContent = view.title;
      dialog.querySelector('[data-case-position]').textContent = `${String(current + 1).padStart(2, '0')} / ${String(views.length).padStart(2, '0')}`;
    };
    triggers.forEach(button => button.addEventListener('click', () => {
      opener = button;
      const index = views.findIndex(view => view.key === button.dataset.caseView);
      if (index < 0) return;
      show(index);
      dialog.showModal();
      document.documentElement.classList.add('has-media-dialog');
    }));
    dialog.querySelector('[data-case-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-case-prev]').addEventListener('click', () => show(current - 1));
    dialog.querySelector('[data-case-next]').addEventListener('click', () => show(current + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('has-media-dialog');
      opener?.focus({ preventScroll: true });
    });
  }

  const film = document.querySelector('[data-case-video]');
  if (film) {
    const video = film.querySelector('video');
    const fallback = film.querySelector('.case-film-fallback');
    const restore = () => { video.pause(); video.hidden = true; fallback.hidden = false; };
    const mediaURL = value => {
      if (typeof value !== 'string' || !value.trim()) return '';
      try { const url = new URL(value, location.href); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
    };
    fetch(film.dataset.mediaConfig).then(response => {
      if (!response.ok) throw new Error('Media configuration unavailable');
      return response.json();
    }).then(config => {
      const src = mediaURL(config.videoSrc);
      if (!src) return;
      const source = document.createElement('source');
      source.src = src;
      if (['video/mp4','video/webm'].includes(config.videoType)) source.type = config.videoType;
      source.addEventListener('error', restore);
      video.append(source);
      const poster = mediaURL(config.posterSrc);
      if (poster) video.poster = poster;
      const captions = mediaURL(config.captionsSrc);
      if (captions) {
        const track = document.createElement('track');
        track.kind = 'captions'; track.label = 'Türkçe'; track.srclang = 'tr'; track.src = captions;
        video.append(track);
      }
      video.hidden = false; fallback.hidden = true;
      video.load();
    }).catch(restore);
    video.addEventListener('error', restore);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) video.pause();
    }).observe(video);
    document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  }
})();
