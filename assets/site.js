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
    "brand-systems": "Brand Systems",
    "content-production": "Content Production",
    "performance-marketing": "Performance Marketing",
    "growth-revenue": "Growth / Revenue",
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
      const lines = ["Merhaba Eightfold,", "", "Yeni bir proje için görüşmek istiyorum.", ""];
      Object.entries(labels).forEach(([key, label]) => {
        const value = String(data.get(key) || "").trim();
        if (value) lines.push(`${label}: ${value}`);
      });
      lines.push("", "Bu talep Eightfold proje formundan oluşturuldu.");
      const status = form.querySelector("[data-form-status]");
      if (status) status.textContent = "Proje özetiniz hazır. Gönderimi açılan e-posta uygulamasından tamamlayın. Uygulama açılmazsa hello@parabellum.works adresine doğrudan yazabilirsiniz. Bu form bilgilerinizi sunucuya kaydetmez.";
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(`Yeni proje talebi — ${company || name}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
    });
  });
})();
