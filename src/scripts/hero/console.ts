import type { ConsoleLine } from '../../data/console-lines';

const KIND_LABEL: Record<ConsoleLine['kind'], string> = { plan: 'PLAN', impl: 'IMPL', test: 'TEST', pass: 'PASS', ship: 'SHIP' };

const clockFormat = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export type AgentConsole = { start(): void; stop(): void };

export function createConsole(root: HTMLElement, lines: ConsoleLine[]): AgentConsole {
  const list = root.querySelector<HTMLElement>('[data-console-lines]')!;
  const clock = root.querySelector<HTMLElement>('[data-console-clock]');
  let cursor = Number(list.dataset.start ?? 0);
  let timer = 0;
  let clockTimer = 0;
  let typing = 0;

  const maxLines = () => Number(getComputedStyle(list).getPropertyValue('--max-lines')) || 6;
  const now = () => clockFormat.format(new Date());

  const tickClock = () => {
    if (clock) clock.textContent = now();
  };

  const push = () => {
    const line = lines[cursor % lines.length]!;
    cursor++;
    const li = document.createElement('li');
    li.className = `line line--${line.kind}`;
    li.innerHTML = '<span class="line__time"></span><span class="line__tag"></span><span class="line__agent"></span><span class="line__text"></span>';
    li.querySelector('.line__time')!.textContent = now().slice(0, 8);
    li.querySelector('.line__tag')!.textContent = KIND_LABEL[line.kind];
    li.querySelector('.line__agent')!.textContent = line.agent;
    const text = li.querySelector<HTMLElement>('.line__text')!;
    list.append(li);
    while (list.children.length > maxLines()) list.firstElementChild?.remove();

    // 1文字ずつ打ち込む
    window.clearInterval(typing);
    let i = 0;
    text.classList.add('is-typing');
    typing = window.setInterval(() => {
      i += 2;
      text.textContent = line.text.slice(0, i);
      if (i >= line.text.length) {
        window.clearInterval(typing);
        text.classList.remove('is-typing');
      }
    }, 28);
  };

  return {
    start() {
      if (timer) return;
      tickClock();
      // 事前に描画した行の時刻を今の時刻にそろえる
      list.querySelectorAll<HTMLElement>('.line__time').forEach((t) => (t.textContent = now()));
      clockTimer = window.setInterval(tickClock, 1000);
      timer = window.setInterval(push, 1100);
      root.dataset.running = 'true';
    },
    stop() {
      window.clearInterval(timer);
      window.clearInterval(clockTimer);
      timer = 0;
      root.dataset.running = 'false';
    },
  };
}
