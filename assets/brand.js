/* Working public identity. Change this name to update the live wordmark. */
window.publicBrand = Object.freeze({ name: 'VYVYEN' });
document.querySelectorAll('[data-brand-name]').forEach(node => {
  node.textContent = window.publicBrand.name;
});
document.querySelectorAll('[data-brand-initial]').forEach(node => {
  node.textContent = window.publicBrand.name.charAt(0);
});
