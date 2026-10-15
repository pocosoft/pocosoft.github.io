import { gsap } from './gsap';
import { BP } from '../env';

/** 文節ごとの不透明度をスクロールに合わせて上げていく */
export function init(root: HTMLElement): () => void {
  const phrases = root.querySelectorAll<HTMLElement>('[data-phrase]');
  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: BP.nav }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    root.dataset.motion = 'on';
    // 薄い状態でも大きな文字のコントラスト基準（3:1）を満たす不透明度から始める
    gsap.fromTo(
      phrases,
      { opacity: (_i: number, el: HTMLElement) => (el.classList.contains('is-em') ? 0.62 : 0.42) },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: {
          trigger: root,
          start: ctx.conditions.wide ? 'top 70%' : 'top 85%',
          end: ctx.conditions.wide ? 'bottom 55%' : 'bottom 70%',
          scrub: 0.4,
        },
      },
    );
    return () => delete root.dataset.motion;
  });
  return () => mm.revert();
}
