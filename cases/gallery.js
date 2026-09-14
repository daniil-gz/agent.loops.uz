/* Progressive enhancement: image links still work without JavaScript. */
(() => {
  const gallery = document.querySelector('.case-gallery');
  if (!gallery) return;
  const rail = gallery.querySelector('.cg-rail');
  const links = [...gallery.querySelectorAll('[data-creative]')];
  const dialog = gallery.querySelector('dialog');
  const image = dialog.querySelector('[data-lightbox-image]');
  const previous = gallery.querySelector('[data-rail-prev]');
  const next = gallery.querySelector('[data-rail-next]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let opener;
  function updateRail() {
    previous.disabled = rail.scrollLeft < 4;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
  }
  function moveRail(direction) {
    rail.scrollBy({left: direction * (links[0].closest('figure').getBoundingClientRect().width + parseFloat(getComputedStyle(rail).gap)), behavior: motion.matches ? 'instant' : 'smooth'});
  }
  previous.addEventListener('click', () => moveRail(-1));
  next.addEventListener('click', () => moveRail(1));
  gallery.querySelector('.cg-controls').hidden = false;
  rail.addEventListener('scroll', updateRail, {passive:true});
  new ResizeObserver(updateRail).observe(rail);
  updateRail();
  function show(nextIndex) {
    index = (nextIndex + links.length) % links.length;
    const link = links[index];
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    dialog.querySelector('#cg-lightbox-title').textContent = link.dataset.title;
    dialog.querySelector('[data-lightbox-caption]').textContent = link.dataset.caption;
    dialog.querySelector('[data-lightbox-count]').textContent = `${index + 1} / ${links.length}`;
    dialog.querySelector('[data-lightbox-original]').href = link.href;
  }
  if (typeof dialog.showModal !== 'function') return;
  links.forEach((link, i) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
    event.preventDefault();
    opener = link;
    show(i);
    dialog.showModal();
    dialog.querySelector('[data-lightbox-close]').focus();
  }));
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
})();
