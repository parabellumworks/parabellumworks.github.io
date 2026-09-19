(() => {
  const nav = document.querySelector('.service-outcome-nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('[data-outcome]')];
  const groups = [...document.querySelectorAll('[data-service-group]')];
  const desktop = matchMedia('(min-width: 761px)');
  let selected = groups[0].dataset.serviceGroup;
  const render = () => {
    groups.forEach(group => { group.hidden = desktop.matches && group.dataset.serviceGroup !== selected; });
    links.forEach(link => {
      if (link.dataset.outcome === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };
  const followHash = () => {
    const target = document.getElementById(location.hash.slice(1));
    const group = target?.closest('[data-service-group]');
    if (group) selected = group.dataset.serviceGroup;
    render();
    if (group) requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
  };
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    selected = link.dataset.outcome;
    history.replaceState(null, '', link.getAttribute('href'));
    render();
  }));
  desktop.addEventListener('change', render);
  window.addEventListener('hashchange', followHash);
  followHash();
})();
