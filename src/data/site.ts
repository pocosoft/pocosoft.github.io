export const site = {
  name: '株式会社ポコソフト',
  shortName: 'Pocosoft',
  url: 'https://www.pocosoft.jp',
  gaId: 'G-T4Y6HC88E2',
  contactUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSes34fwJy28yyStVuRQCEqVR5ErI-nJwoWnhgzEofW2-dBPPA/viewform?usp=sf_link',
  themeColor: '#070B08',
} as const;

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: '仕組み', href: '/#mechanism' },
  { label: '事業内容', href: '/business.html' },
  { label: '実績', href: '/business.html#works' },
  { label: '会社概要', href: '/company.html' },
];
