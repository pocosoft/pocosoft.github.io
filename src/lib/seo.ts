import { site } from '../data/site';

export type PageMeta = { path: string; title: string; description: string; noindex?: boolean };

const suffix = '株式会社ポコソフト';

export const pages = {
  home: {
    path: '/',
    title: `AIに、休みはない。｜${suffix}`,
    description:
      'ポコソフトは、AIエージェントを昼も夜も徹底的に動かし続ける開発環境をつくり、ゲームとシステムを開発する埼玉県春日部市の会社です。SES、ゲーム制作、AI動作確認支援、AIフル稼働環境の構築支援。',
  },
  business: {
    path: '/business.html',
    title: `事業内容｜${suffix}`,
    description:
      'AIを使い倒すエンジニアが参画するSES事業、ゲーム制作事業、AIがテストを回し続けるAI動作確認支援事業、AIフル稼働環境の構築支援。ポコソフトの事業と実績、自社プロダクトをご紹介します。',
  },
  company: {
    path: '/company.html',
    title: `会社概要｜${suffix}`,
    description: '株式会社ポコソフトの会社概要と沿革。埼玉県春日部市備後東2丁目31-19。',
  },
  notFound: {
    path: '/404.html',
    title: `ページが見つかりません｜${suffix}`,
    description: 'お探しのページは見つかりませんでした。',
    noindex: true,
  },
} satisfies Record<string, PageMeta>;

export const canonicalOf = (path: string): string => new URL(path, site.url).href;
