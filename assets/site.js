(() => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const mobileNav = window.matchMedia("(max-width: 960px)");
  const closeNav = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menüyü aç");
    nav.classList.remove("is-open");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
      nav.classList.toggle("is-open", open);
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

  const path = window.location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll("[data-nav] a").forEach((link) => {
    const target = new URL(link.href).pathname.replace(/index\.html$/, "");
    if ((target === "/" && path === "/") || (target !== "/" && path.startsWith(target))) link.setAttribute("aria-current", "page");
  });

  document.querySelectorAll("[data-year]").forEach((item) => { item.textContent = String(new Date().getFullYear()); });

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
      const labels = { name: "Ad soyad", company: "Marka / şirket", email: "E-posta", phone: "Telefon", website: "Web sitesi / sosyal hesap", service: "Öncelikli ihtiyaç", budget: "Aylık medya bütçesi", timeline: "Başlangıç zamanı", goal: "Hedef / mevcut sorun" };
      const lines = ["Merhaba EIGHTFOLD,", "", "Yeni bir proje için görüşmek istiyorum.", ""];
      Object.entries(labels).forEach(([key, label]) => {
        const value = String(data.get(key) || "").trim();
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
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 961px)');
  const disciplines = [...document.querySelectorAll('.discipline')];
  const counter = document.querySelector('[data-discipline-count]');
  disciplines.forEach((item, index) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      disciplines.forEach(other => { if (other !== item) other.open = false; });
      if (counter) {
        counter.textContent = String(index + 1).padStart(2, '0');
        const wrapper = counter.parentElement;
        wrapper.classList.remove('is-changing');
        requestAnimationFrame(() => wrapper.classList.add('is-changing'));
      }
    });
  });
  const openHashDiscipline = () => {
    const target = disciplines.find(item => '#' + item.id === window.location.hash);
    if (target) target.open = true;
  };
  openHashDiscipline();
  window.addEventListener('hashchange', openHashDiscipline);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!reducedMotion.matches) entry.target.classList.add('is-entering');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => observer.observe(el));
  }

  const hero = document.querySelector('.eightfold-hero');
  const mark = document.querySelector('[data-hero-mark]');
  const buttons = [...document.querySelectorAll('[data-magnetic]')];
  let frame = 0;
  const resetMotion = () => {
    cancelAnimationFrame(frame);
    if (mark) { mark.style.removeProperty('--rx'); mark.style.removeProperty('--ry'); }
    buttons.forEach(button => { button.style.removeProperty('--mx'); button.style.removeProperty('--my'); });
  };
  if (hero && mark) {
    hero.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        mark.style.setProperty('--ry', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 9}deg`);
        mark.style.setProperty('--rx', `${-(event.clientY - rect.top - rect.height / 2) / rect.height * 6}deg`);
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', resetMotion);
  }
  buttons.forEach(button => {
    button.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--mx', `${(event.clientX - rect.left - rect.width / 2) * .055}px`);
      button.style.setProperty('--my', `${(event.clientY - rect.top - rect.height / 2) * .075}px`);
    }, { passive: true });
    button.addEventListener('pointerleave', () => { button.style.removeProperty('--mx'); button.style.removeProperty('--my'); });
    button.addEventListener('blur', resetMotion);
  });
  reducedMotion.addEventListener('change', resetMotion);
  finePointer.addEventListener('change', resetMotion);
})();
