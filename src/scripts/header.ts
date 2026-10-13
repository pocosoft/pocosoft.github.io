const header = document.querySelector<HTMLElement>('[data-site-header]');

if (header) {
  let ticking = false;
  const update = () => {
    header.toggleAttribute('data-scrolled', window.scrollY > 8);
    ticking = false;
  };
  update();
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );

  // メニュー内のリンクを押したら閉じる
  const menu = document.getElementById('site-menu');
  menu?.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) menu.hidePopover?.();
  });
}
