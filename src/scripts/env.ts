export const BP = {
  nav: '(min-width: 48em)',
  stage: '(min-width: 48em) and (min-height: 35em)',
  stack: 'not all and (min-width: 48em) and (min-height: 35em)',
} as const;

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 要素が画面に近づいたら一度だけ cb を呼ぶ */
export const whenNear = (el: Element, cb: () => void, rootMargin = '100% 0px'): void => {
  if (!('IntersectionObserver' in window)) return cb();
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin },
  );
  io.observe(el);
};

/** 要素が画面内にあるかどうかを監視する */
export const watchVisibility = (el: Element, cb: (visible: boolean) => void, rootMargin = '0px'): (() => void) => {
  const io = new IntersectionObserver((entries) => cb(entries[entries.length - 1]!.isIntersecting), { rootMargin });
  io.observe(el);
  return () => io.disconnect();
};
