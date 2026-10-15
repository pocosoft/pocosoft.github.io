// 本番ビルドの前に、実績の数値に仮の値が残っていないか確かめる。
// ローカルで見た目を確認したいときは ALLOW_TODO=1 で飛ばせる（npm run build:preview）。
import { caseMahjong, isPending } from '../src/data/metrics.ts';

const problems: string[] = [];
if (isPending(caseMahjong.asOf)) problems.push(`${caseMahjong.product}: 時点（asOf）が TODO`);
if (!caseMahjong.source.trim()) problems.push(`${caseMahjong.product}: 出典（source）が空`);
for (const m of caseMahjong.metrics) {
  if (isPending(m.value)) problems.push(`${caseMahjong.product}: ${m.label}（${m.id}）が TODO`);
}

if (problems.length) {
  if (process.env.ALLOW_TODO === '1') {
    console.warn(`[check-content] 未入力の数値があります（ALLOW_TODO=1 のため続行）:\n  - ${problems.join('\n  - ')}`);
  } else {
    console.error(`[check-content] 未入力の数値があります。src/data/metrics.ts を埋めてください:\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
  }
} else {
  console.log('[check-content] OK');
}
