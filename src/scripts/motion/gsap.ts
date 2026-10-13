import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const refresh = () => ScrollTrigger.refresh();
document.fonts?.ready.then(refresh);
window.addEventListener('load', refresh, { once: true });
window.addEventListener('pageshow', (e) => e.persisted && refresh());

export { gsap, ScrollTrigger };
