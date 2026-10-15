import { gsap, ScrollTrigger } from './gsap';
import { BP } from '../env';

/**
 * 仕組みセクション。
 * PC（stage）: sticky のステージ上で、スクロールに合わせてループ図を進め、ステップを切り替える。
 * スマホ（stack）: ループ図はゆっくり回り続け、縦のレールがスクロールに合わせて伸びる。
 */
export function init(root: HTMLElement): () => void {
  const path = root.querySelector<SVGPathElement>('[data-loop-path]')!;
  const progress = root.querySelector<SVGPathElement>('[data-loop-progress]')!;
  const dot = root.querySelector<SVGGElement>('[data-loop-dot]')!;
  const nodes = [...root.querySelectorAll<SVGElement>('[data-loop-node]')];
  const labels = [...root.querySelectorAll<HTMLElement>('[data-loop-label]')];
  const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  const track = root.querySelector<HTMLElement>('[data-mech-track]')!;
  const rail = root.querySelector<HTMLElement>('[data-mech-rail]');
  const stepList = root.querySelector<HTMLElement>('[data-steps]')!;
  const total = path.getTotalLength();
  const initialDot = dot.getAttribute('transform');
  progress.style.strokeDasharray = `${total}`;

  const placeDot = (p: number) => {
    const pt = path.getPointAtLength((((p % 1) + 1) % 1) * total);
    dot.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
  };
  const setProgress = (p: number) => {
    progress.style.strokeDashoffset = `${total * (1 - p)}`;
  };
  const setActive = (index: number) => {
    steps.forEach((s, k) => s.classList.toggle('is-active', k === index));
    nodes.forEach((n, k) => n.classList.toggle('is-lit', k <= index));
    labels.forEach((l, k) => l.classList.toggle('is-lit', k === index));
  };
  const reset = () => {
    progress.style.strokeDashoffset = '';
    if (initialDot) dot.setAttribute('transform', initialDot);
    else dot.removeAttribute('transform');
    setActive(0);
    nodes.forEach((n) => n.classList.remove('is-lit'));
  };

  const mm = gsap.matchMedia();
  mm.add({ stage: BP.stage, motion: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
    const { stage, motion } = ctx.conditions!;
    if (!motion) return;
    root.dataset.motion = 'on';

    if (stage) {
      const state = { p: 0 };
      const render = () => {
        setProgress(state.p);
        placeDot(state.p);
        setActive(Math.min(steps.length - 1, Math.floor(state.p * steps.length)));
      };
      render();
      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      });
    } else {
      const loop = { p: 0 };
      const tween = gsap.to(loop, {
        p: 1,
        duration: 9,
        ease: 'none',
        repeat: -1,
        paused: true,
        onUpdate: () => {
          placeDot(loop.p);
          setProgress(loop.p);
          nodes.forEach((n, k) => n.classList.toggle('is-lit', loop.p >= k / nodes.length));
        },
      });
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
      });
      if (rail) {
        gsap.fromTo(
          rail,
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: stepList, start: 'top 75%', end: 'bottom 55%', scrub: 0.4 } },
        );
      }
    }
    ScrollTrigger.refresh();
    return () => {
      delete root.dataset.motion;
      reset();
    };
  });
  return () => mm.revert();
}
