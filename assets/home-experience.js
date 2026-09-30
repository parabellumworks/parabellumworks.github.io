(() => {
  const home = document.querySelector('.editorial-home');
  if (!home) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 961px) and (min-height: 650px)');
  const hero = home.querySelector('[data-scroll-hero]');
  const lines = [...hero.querySelectorAll('.hero-type-line')];
  const brand = hero.querySelector('.hero-moving-brand');
  const specialisms = home.querySelector('[data-scroll-specialisms]');
  const rows = [...specialisms.querySelectorAll('.specialism-row')];
  const note = specialisms.querySelector('[data-specialism-note]');
  const work = [...home.querySelectorAll('.work-case')];
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0, active = -1, hover = -1, enabled = false;
  const select = index => {
    if (active === index) return;
    active = index;
    rows.forEach((row, i) => row.classList.toggle('is-active', i === index));
    note.textContent = rows[index].dataset.problem;
  };
  const update = () => {
    frame = 0;
    if (reduced.matches) return;
    const vh = innerHeight;
    if (enabled) {
      const h = hero.getBoundingClientRect();
      const hp = clamp((78 - h.top) / Math.max(1, h.height - (vh - 78)));
      lines[0].style.transform = `translate3d(${-hp * 18}vw,${-hp * 7}vh,0)`;
      lines[1].style.transform = `translate3d(${hp * 15}vw,${-hp * 3}vh,0) skewX(-7deg)`;
      lines[2].style.transform = `translate3d(${-hp * 9}vw,${hp * 4}vh,0)`;
      brand.style.transform = `translate3d(${(1-hp) * 110}%,0,0)`;
      const s = specialisms.getBoundingClientRect();
      const sp = clamp((78 - s.top) / Math.max(1, s.height - (vh - 78)));
      const position = sp * (rows.length - 1);
      select(hover >= 0 ? hover : Math.round(position));
      rows.forEach((row, i) => {
        const dominance = hover >= 0 ? (i === hover ? 1 : 0) : clamp(1 - Math.abs(position - i));
        row.querySelector('a').style.transform = `translate3d(${(i%2 ? 1 : -1) * (1-dominance) * 2}vw,0,0) scale(${.83 + dominance * .17})`;
      });
    }
    work.forEach(item => {
      const rect = item.getBoundingClientRect();
      const progress = clamp((vh - rect.top) / (vh * .8));
      const media = item.querySelector('.work-case-media');
      const image = media.querySelector('img');
      // Scrubbed crop, scale and image travel: reverses when scrolling back.
      media.style.clipPath = `inset(${(1-progress)*22}% ${(1-progress)*12}% ${(1-progress)*8}% ${(1-progress)*12}%)`;
      image.style.transform = `translate3d(0,${(1-progress)*4}%,0) scale(${1.12-progress*.12})`;
      if (enabled) {
        const takeover = clamp((78 - rect.top) / Math.max(1, vh));
        media.style.transform = `scale(${1 - takeover*.04})`;
      }
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const configure = () => {
    enabled = desktop.matches && !reduced.matches;
    home.classList.toggle('motion-ready', enabled);
    lines.forEach(line => line.style.removeProperty('transform'));
    brand.style.removeProperty('transform');
    rows.forEach(row => row.querySelector('a').style.removeProperty('transform'));
    work.forEach(item => {
      const media = item.querySelector('.work-case-media');
      media.style.removeProperty('clip-path'); media.style.removeProperty('transform');
      media.querySelector('img').style.removeProperty('transform');
    });
    active = -1; hover = -1; select(0); schedule();
  };
  rows.forEach((row, index) => {
    const enter = () => { if (enabled) { hover = index; select(index); schedule(); } };
    const leave = () => { hover = -1; schedule(); };
    row.addEventListener('pointerenter', enter); row.addEventListener('pointerleave', leave);
    row.addEventListener('focusin', enter); row.addEventListener('focusout', leave);
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', configure, { passive: true });
  reduced.addEventListener('change', configure);
  desktop.addEventListener('change', configure);
  configure();
})();
