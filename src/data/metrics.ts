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

// 自動テストの件数は、CI（pocosoft-inc/mahjong_crash の ci.yml）の最新の成功した実行で
// 通ったテストの数（2026-10-14 時点で 2,916 件）を、切り捨てて載せている。
export const caseMahjong: CaseStudy = {
  product: '麻雀モンスターズ',
  source: '自社調べ',
  asOf: '2026年10月',
  metrics: [
    { id: 'period', pillar: 'speed', label: '企画からリリースまで', value: 1, unit: 'か月' },
    { id: 'team', pillar: 'cost', label: '開発体制', value: 1.5, unit: '名', decimals: 1 },
    { id: 'tests', pillar: 'quality', label: '変更のたびに回す自動テスト', value: 2900, unit: '件以上' },
  ],
};

export const isPending = (v: unknown): v is Pending => v === 'TODO';

export const formatValue = (m: Metric): string =>
  isPending(m.value)
    ? 'TODO'
    : m.value.toLocaleString('ja-JP', { minimumFractionDigits: m.decimals ?? 0, maximumFractionDigits: m.decimals ?? 0 });
