// 実績の数値はこのファイルにだけ書く。
// 'TODO' が残っていると本番ビルド（npm run build）が失敗する。
export type Pending = 'TODO';
export type Metric = {
  id: string;
  pillar: 'speed' | 'quality' | 'cost';
  label: string;
  value: number | Pending;
  unit: string;
  decimals?: number;
  note?: string;
};

export type CaseStudy = {
  product: string;
  source: string;
  asOf: string | Pending;
  metrics: Metric[];
};

export const caseMahjong: CaseStudy = {
  product: '麻雀モンスターズ',
  source: '自社調べ',
  asOf: 'TODO',
  metrics: [
    { id: 'period', pillar: 'speed', label: '企画からリリースまで', value: 'TODO', unit: 'か月' },
    { id: 'team', pillar: 'cost', label: '開発メンバー', value: 'TODO', unit: '名' },
    { id: 'agent-hours', pillar: 'quality', label: 'AIエージェントの稼働', value: 'TODO', unit: '時間' },
    { id: 'test-runs', pillar: 'quality', label: 'AIによる動作確認', value: 'TODO', unit: '回' },
  ],
};

export const isPending = (v: unknown): v is Pending => v === 'TODO';

export const formatValue = (m: Metric): string =>
  isPending(m.value)
    ? 'TODO'
    : m.value.toLocaleString('ja-JP', { minimumFractionDigits: m.decimals ?? 0, maximumFractionDigits: m.decimals ?? 0 });
