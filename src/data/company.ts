// 会社概要。表記は旧サイト（company.html）の文言をそのまま使う。
export const profile: { term: string; desc: string }[] = [
  { term: '商号', desc: '株式会社ポコソフト' },
  { term: '住所', desc: '〒344-0032 埼玉県春日部市備後東2丁目31-19' },
  { term: '法人番号', desc: '4030001139715' },
  { term: '設立', desc: '2020年12月' },
  { term: '資本金', desc: '100万円' },
  { term: '代表取締役', desc: '折笠 明弘' },
  { term: '定休日', desc: '土日祝日' },
];

export const address = {
  postalCode: '344-0032',
  region: '埼玉県',
  locality: '春日部市',
  street: '備後東2丁目31-19',
} as const;

export const corporateNumber = '4030001139715';
export const foundingDate = '2020-12';

// 登記上の事業内容
export const purposes: string[] = [
  '各種アプリケーションソフトの企画、設計、開発及び販売並びに保守及び顧客へのサポート業務',
  'インターネット及びソフトウェア開発に関する総合コンサルティング業務',
  'ウェブサイトの企画、設計、開発、運営及び販売',
  'インターネットを利用した各種情報提供サービス',
  'インターネット等のオンラインを利用した市場調査、宣伝及び広告等の受託',
  'インターネット等のネットワークシステムを利用した通信販売業',
  '前各号に附帯又は関連する一切の業務',
];
