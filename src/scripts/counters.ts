import { reducedMotion } from './env';

const els = document.querySelectorAll<HTMLElement>('[data-count]');

const format = (v: number, decimals: number) =>
  v.toLocaleString('ja-JP', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const run = (el: HTMLElement) => {
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimals ?? 0);
  if (!Number.isFinite(target)) return;
  const duration = 1400;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(2, -10 * t);
    el.textContent = format(t === 1 ? target : target * eased, decimals);
    if (t < 1) requestAnimationFrame(tick);
  };
  el.textContent = format(0, decimals);
  requestAnimationFrame(tick);
};

if (!reducedMotion() && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        run(e.target as HTMLElement);
      }
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
}
