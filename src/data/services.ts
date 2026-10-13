export type Step = { title: string; text: string };
export type Service = {
  id: 'game' | 'ai-testing' | 'ai-dev' | 'ses';
  code: string;
  title: string;
  status: string;
  summary: string;
  lead: string;
  points: string[];
  flow?: Step[];
};

export const services: Service[] = [
  {
    id: 'game',
    code: 'GAME STUDIO',
    title: 'ゲーム制作事業',
    status: '強化中',
    summary: 'AIを開発チームに組み込み、企画から運用まで少人数・短期間でゲームを届けます。',
    lead: 'AIエージェントを開発チームの一員として組み込み、企画・実装・動作確認・運用までを少人数で回しています。自社タイトル『麻雀モンスターズ』も、この体制で開発・運用しています。',
    points: ['企画・ゲームデザイン', 'スマートフォンゲームの開発', 'AIによる実装・動作確認の自動化', 'リリース後の運用・アップデート'],
  },
  {
    id: 'ai-testing',
    code: 'AI TESTING',
    title: 'AI動作確認支援事業',
    status: '強化中',
    summary: 'AIエージェントがアプリやWebを実際に操作し、動作確認と回帰テストを24時間回し続けます。',
    lead: 'リリースのたびに人の手で画面を触って確かめる――その作業を、AIエージェントが引き受けます。アプリやWebを人と同じように操作し、動作確認と回帰テストを昼も夜も回し続ける仕組みを提供します。',
    points: ['iOS / Android アプリ', 'Webアプリケーション', 'スマートフォンゲーム', '既存の手動テストの置き換え'],
    flow: [
      { title: 'ヒアリング', text: '確かめたい操作と、合格とする基準を伺います。' },
      { title: 'シナリオ化', text: 'AIが実行できるテストシナリオに落とし込みます。' },
      { title: '実行環境の構築', text: '実機・シミュレータ・ブラウザで、AIエージェントが動く環境を用意します。' },
      { title: '24時間運用・レポート', text: 'テストを回し続け、結果をスクリーンショットや録画とあわせて報告します。' },
    ],
  },
  {
    id: 'ai-dev',
    code: 'AUTONOMOUS DEV',
    title: 'AI開発の仕組みづくり支援',
    status: '提供中',
    summary: '自社で回している「止まらない開発体制」を、あなたのチームにも。',
    lead: 'ポコソフトが自社で回している「AIが休まず開発し続ける体制」を、あなたのチームに導入します。ツールを入れて終わりではなく、人が決めてAIが動き続けるワークフローを、現状に合わせて設計・構築し、内製化まで伴走します。',
    points: ['開発フローの現状診断', 'AIエージェント前提のワークフロー設計', '実装・テスト・レビューの自動化', '運用ルールづくりと内製化支援'],
    flow: [
      { title: '現状診断', text: '開発の流れとボトルネックを洗い出します。' },
      { title: 'ワークフロー設計', text: '人が決めること、AIに任せることを切り分けます。' },
      { title: '構築', text: 'AIエージェントが休まず動く環境を組み上げます。' },
      { title: '伴走・内製化', text: 'チームが自走できるまで、一緒に回します。' },
    ],
  },
  {
    id: 'ses',
    code: 'ENGINEERING',
    title: 'SES事業',
    status: '継続',
    summary: 'テックリード・PM・エンジニアとして開発の現場に参画し、品質とスピードの課題を解決します。',
    lead: '私たちはクライアントの事業を深く理解し、技術的なサポートは当然のこと、開発体制や運用管理等、様々な観点でアドバイス、解決してきました。もし既存の体制について、品質やスピード感にお困りの方、是非お問い合わせください。',
    points: ['テックリード・PMとしての参画', 'スマートフォンアプリ開発', 'テスト・CI環境の整備', '開発プロセスの改善'],
  },
];

export const serviceById = (id: Service['id']): Service => {
  const s = services.find((x) => x.id === id);
  if (!s) throw new Error(`unknown service: ${id}`);
  return s;
};
