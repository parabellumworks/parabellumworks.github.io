(() => {
  const home = document.querySelector('.clarity-home');
  if (!home || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 961px)');
  const hero = home.querySelector('.clarity-hero');
  const options = [...home.querySelectorAll('[data-diagnostic-option]')];
  const visuals = home.querySelectorAll('.home-work .project-media, .home-case-secondary-media');
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in-view'); reveal.unobserve(entry.target); }
    });
  }, { threshold: .18 });
  visuals.forEach(el => reveal.observe(el));
  if (reduced.matches) return;
  const problemScroll = new IntersectionObserver(entries => {
    if (!desktop.matches) return;
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('is-active')) entry.target.click();
    });
  }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });
  options.forEach(el => problemScroll.observe(el));
  let frame = 0;
  const update = () => {
    frame = 0;
    if (!desktop.matches || !hero) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
    hero.style.setProperty('--hero-progress', String(progress));
  };
  addEventListener('scroll', () => {
    if (!frame && desktop.matches) frame = requestAnimationFrame(update);
  }, { passive: true });
  update();
})();
