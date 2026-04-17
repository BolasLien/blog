/**
 * 檢查 URL 是否具 trailing slash。
 * Astro trailingSlash: 'always' 策略下，page route 必須以 "/" 結尾；
 * 靜態資源（白名單副檔名）則不強制。
 * 回 null 代表 pass，回字串代表 violation 說明。
 */
const ASSET_EXTS = new Set([
  '.xml', '.html', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.css',
  '.js', '.mjs', '.ico', '.woff', '.woff2', '.json', '.txt', '.pdf',
  '.mp4', '.webm', '.avif',
]);

export function checkTrailingSlash(url: string): string | null {
  const pathOnly = url.split('?')[0].split('#')[0];
  const ext = pathOnly.match(/\.[a-z0-9]+$/i)?.[0].toLowerCase();
  if (ext && ASSET_EXTS.has(ext)) return null;
  if (pathOnly.endsWith('/')) return null;
  return `trailing slash violation: "${url}" should end with "/"`;
}
