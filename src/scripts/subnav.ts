const nav = document.querySelector<HTMLElement>('[data-subnav]');

if (nav && 'IntersectionObserver' in window) {
  const scroller = nav.querySelector<HTMLElement>('[data-subnav-scroller]')!;
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const sections = links
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter((s): s is HTMLElement => s !== null);

  const setActive = (id: string) => {
    for (const a of links) {
      const active = a.hash === `#${id}`;
      if (active) {
        a.setAttribute('aria-current', 'true');
        const left = a.offsetLeft - (scroller.clientWidth - a.offsetWidth) / 2;
        scroller.scrollTo({ left, behavior: 'smooth' });
      } else {
        a.removeAttribute('aria-current');
      }
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length) setActive(visible[0]!.target.id);
    },
    { rootMargin: '-35% 0px -60% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}
