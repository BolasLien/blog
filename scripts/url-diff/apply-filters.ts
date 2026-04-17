export interface FilterOptions {
  chineseTagEncoding: 'keep' | 'encoded';
}

const CHINESE_SLUG_DATES: ReadonlyArray<[string, string]> = [
  ['/blog/2020/04/29/', '如何做一個Line機器人'],
  ['/blog/2020/08/18/', '實作JWT機制的登入驗證'],
  ['/blog/2020/08/19/', '為什麼我不繼續做聖騎士PM'],
  ['/blog/2020/08/28/', '架設Hexo部落格'],
  ['/blog/2020/09/21/', 'putty使用ssh登入遠端無須密碼'],
  ['/blog/2020/10/13/', 'Vue元件溝通-子傳父-emit'],
  ['/blog/2020/11/02/', 'HTML-把header做成template'],
];

function isChineseSlugPost(url: string): boolean {
  return CHINESE_SLUG_DATES.some(([prefix, slug]) => url === `${prefix}${slug}/`);
}

function hasChineseChar(str: string): boolean {
  return /[\u4e00-\u9fff]/.test(str);
}

export function applyAcceptedLossFilters(
  urls: Set<string>,
  opts: FilterOptions,
): Set<string> {
  const result = new Set<string>();
  for (const url of urls) {
    if (isChineseSlugPost(url)) continue;
    if (/^\/blog\/tags\/.+\/page\/\d+\/?$/.test(url)) continue;
    if (url.startsWith('/blog/categories/')) continue;
    if (url === '/blog/archives/' || url.startsWith('/blog/archives/')) continue;
    if (url === '/blog/sitemap.xml') continue;
    if (url === '/blog/manifest.json') continue;
    if (url === '/blog/robots.txt') continue;
    if (url === '/blog/img/og_image.png') continue;
    if (/^\/blog\/page\/\d+\/?$/.test(url)) continue;
    if (opts.chineseTagEncoding === 'encoded' && /^\/blog\/tags\/[^/]+\/?$/.test(url)) {
      const tag = url.replace(/^\/blog\/tags\//, '').replace(/\/$/, '');
      if (hasChineseChar(tag)) continue;
    }
    result.add(url);
  }
  return result;
}
