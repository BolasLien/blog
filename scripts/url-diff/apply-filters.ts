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

// Hexo tag URL case/format: P2 lowercased tags (+ space in multi-word), 舊 URL 無法對上
const HEXO_CASED_TAG_URLS = new Set([
  '/blog/tags/AI-Agents/',
  '/blog/tags/AI-Coding/',
  '/blog/tags/AI-輔助開發/',
  '/blog/tags/AI-開發工具/',
  '/blog/tags/AI協作/',
  '/blog/tags/ChatGPT/',
  '/blog/tags/Claude-Code/',
  '/blog/tags/Claude/',
  '/blog/tags/Codex/',
  '/blog/tags/Express/',
  '/blog/tags/GitHub-Copilot/',
  '/blog/tags/HTML/',
  '/blog/tags/Hexo/',
  '/blog/tags/Ownership/',
]);
// P2 tag rename: 前端開發 → 前端技術（intentional content decision）
const RENAMED_TAG_URLS = new Set([
  '/blog/tags/前端開發/',
]);

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
    if (HEXO_CASED_TAG_URLS.has(url)) continue;
    if (RENAMED_TAG_URLS.has(url)) continue;
    result.add(url);
  }
  return result;
}
