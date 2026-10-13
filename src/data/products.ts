import type { ImageMetadata } from 'astro';
import mahjongIcon from '../assets/apps/mahjong-monsters.png';
import pocomemoIcon from '../assets/apps/pocomemo.png';
import alarmIcon from '../assets/apps/poco-alarm.png';

export type StoreId = 'appstore' | 'googleplay' | 'microsoft';
export type Product = {
  id: string;
  name: string;
  tagline: string;
  platforms: string;
  icon: ImageMetadata;
  site?: string;
  stores: { id: StoreId; url: string }[];
};

export const products: Product[] = [
  {
    id: 'mahjong-monsters',
    name: '麻雀モンスターズ',
    tagline: '上海パズルで戦うダンジョンRPG',
    platforms: 'iOS / Android',
    icon: mahjongIcon,
    site: 'https://mahjongmonsters.games.pocosoft.jp/',
    stores: [
      { id: 'appstore', url: 'https://apps.apple.com/jp/app/%E9%BA%BB%E9%9B%80%E3%83%A2%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA/id6808062953' },
      { id: 'googleplay', url: 'https://play.google.com/store/apps/details?id=jp.pocosoft.mahjong_crash' },
    ],
  },
  {
    id: 'pocomemo',
    name: 'PocoMemo',
    tagline: 'パソコン同期する付箋アプリ',
    platforms: 'iOS / Windows',
    icon: pocomemoIcon,
    stores: [
      { id: 'appstore', url: 'https://apps.apple.com/jp/app/pc%E3%81%AE%E3%82%88%E3%81%86%E3%81%AA%E4%BB%98%E7%AE%8B%E3%82%A2%E3%83%97%E3%83%AA-pocomemo/id1537357819' },
      { id: 'microsoft', url: 'https://apps.microsoft.com/store/detail/pocomemo/9P1153N83JSC' },
    ],
  },
  {
    id: 'poco-alarm',
    name: 'Pocoアラーム',
    tagline: '祝日は鳴らないアラームアプリ',
    platforms: 'iOS',
    icon: alarmIcon,
    stores: [
      { id: 'appstore', url: 'https://apps.apple.com/jp/app/poco%E3%82%A2%E3%83%A9%E3%83%BC%E3%83%A0-%E7%A5%9D%E6%97%A5%E3%81%AF%E9%B3%B4%E3%82%89%E3%81%AA%E3%81%84%E3%82%A2%E3%83%A9%E3%83%BC%E3%83%A0%E3%82%A2%E3%83%97%E3%83%AA/id6754181243' },
    ],
  },
];
