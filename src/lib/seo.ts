import { site } from '../data/site';

export type PageMeta = { path: string; title: string; description: string; noindex?: boolean };

const suffix = '株式会社ポコソフト';

export const pages = {
  home: {
    path: '/',
    title: `止まらないAI開発を、仕組みにする。｜${suffix}`,
    description:
      'ポコソフトは、AIエージェントが休まず実装とテストを回し続ける開発体制で、ゲームとシステムをつくる埼玉県春日部市の会社です。ゲーム制作、AI動作確認支援、AI開発の仕組みづくり支援、SES。',
  },
  business: {
    path: '/business.html',
    title: `事業内容｜${suffix}`,
    description:
      'ゲーム制作事業、AIがテストを回し続けるAI動作確認支援事業、AI開発の仕組みづくり支援、SES事業。ポコソフトの事業と実績、自社プロダクトをご紹介します。',
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
