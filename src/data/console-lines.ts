// ヒーローのエージェントコンソールに流す「動作イメージ」のログ。実際の稼働データではない。
export type ConsoleLine = { agent: string; kind: 'plan' | 'impl' | 'test' | 'pass' | 'ship'; text: string };

export const consoleLines: ConsoleLine[] = [
  { agent: 'planner', kind: 'plan', text: '仕様をタスク12件に分解' },
  { agent: 'impl-01', kind: 'impl', text: 'feat: バトル画面のコンボ演出' },
  { agent: 'impl-02', kind: 'impl', text: 'fix: 通信切断時の再接続' },
  { agent: 'tester', kind: 'test', text: 'iOS 実機で回帰テスト開始' },
  { agent: 'tester', kind: 'pass', text: 'regression 128/128 PASS' },
  { agent: 'impl-03', kind: 'impl', text: 'refactor: 状態管理を整理' },
  { agent: 'tester', kind: 'test', text: 'Android でタップ操作を検証' },
  { agent: 'reviewer', kind: 'plan', text: '差分レビュー → 人に確認依頼' },
  { agent: 'tester', kind: 'pass', text: 'UI 自動テスト 64/64 PASS' },
  { agent: 'impl-01', kind: 'impl', text: 'feat: ステージ選択画面' },
  { agent: 'tester', kind: 'test', text: 'Web で購入フローを確認' },
  { agent: 'release', kind: 'ship', text: 'build #2048 をステージングへ' },
];
