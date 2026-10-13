import type { APIRoute } from 'astro';
import { canonicalOf, pages } from '../lib/seo';

// @astrojs/sitemap は .html なしの URL を出すため、canonical と揃えて自前で出力する
export const GET: APIRoute = () => {
  const urls = Object.values(pages)
    .filter((p) => !('noindex' in p && p.noindex))
    .map((p) => `  <url><loc>${canonicalOf(p.path)}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
