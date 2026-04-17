import { describe, it, expect } from 'vitest';
import { applyAcceptedLossFilters } from '../../url-diff/apply-filters';

describe('applyAcceptedLossFilters', () => {
  const CHINESE_SLUG_URLS = [
    '/blog/2020/04/29/如何做一個Line機器人/',
    '/blog/2020/08/18/實作JWT機制的登入驗證/',
    '/blog/2020/08/19/為什麼我不繼續做聖騎士PM/',
    '/blog/2020/08/28/架設Hexo部落格/',
    '/blog/2020/09/21/putty使用ssh登入遠端無須密碼/',
    '/blog/2020/10/13/Vue元件溝通-子傳父-emit/',
    '/blog/2020/11/02/HTML-把header做成template/',
  ];

  it('濾掉 7 篇中文 slug post URL', () => {
    const input = new Set([
      ...CHINESE_SLUG_URLS,
      '/blog/2021/01/01/english-slug/',
    ]);
    const result = applyAcceptedLossFilters(input, { chineseTagEncoding: 'keep' });
    expect(result.size).toBe(1);
    expect(result.has('/blog/2021/01/01/english-slug/')).toBe(true);
  });

  it('濾掉 tags 分頁', () => {
    const input = new Set([
      '/blog/tags/javascript/',
      '/blog/tags/javascript/page/2/',
      '/blog/tags/javascript/page/3/',
    ]);
    const result = applyAcceptedLossFilters(input, { chineseTagEncoding: 'keep' });
    expect(result.has('/blog/tags/javascript/')).toBe(true);
    expect(result.has('/blog/tags/javascript/page/2/')).toBe(false);
  });

  it('濾掉 categories / archives / hexo-specific', () => {
    const input = new Set([
      '/blog/categories/前端技術/',
      '/blog/archives/',
      '/blog/archives/2021/',
      '/blog/sitemap.xml',
      '/blog/manifest.json',
      '/blog/robots.txt',
      '/blog/img/og_image.png',
      '/blog/page/2/',
      '/blog/foo/',
    ]);
    const result = applyAcceptedLossFilters(input, { chineseTagEncoding: 'keep' });
    expect(result.size).toBe(1);
    expect(result.has('/blog/foo/')).toBe(true);
  });

  it('chineseTagEncoding = "encoded" 時濾掉中文 tag URL', () => {
    const input = new Set([
      '/blog/tags/前端開發/',
      '/blog/tags/javascript/',
    ]);
    const result = applyAcceptedLossFilters(input, { chineseTagEncoding: 'encoded' });
    expect(result.size).toBe(1);
    expect(result.has('/blog/tags/javascript/')).toBe(true);
  });

  it('chineseTagEncoding = "keep" 時保留中文 tag URL', () => {
    const input = new Set([
      '/blog/tags/前端開發/',
      '/blog/tags/javascript/',
    ]);
    const result = applyAcceptedLossFilters(input, { chineseTagEncoding: 'keep' });
    expect(result.size).toBe(2);
  });

  it('英文 post / 英文 tag / /blog/ / /blog/about/ 永遠保留', () => {
    const input = new Set([
      '/blog/',
      '/blog/about/',
      '/blog/tags/',
      '/blog/tags/javascript/',
      '/blog/2021/01/01/foo-bar/',
    ]);
    const result = applyAcceptedLossFilters(input, { chineseTagEncoding: 'keep' });
    expect(result.size).toBe(5);
  });
});
