/**
 * 檢查 internal URL 是否以 /blog/ 開頭。
 * 回 null 代表 pass，回字串代表 violation 說明。
 */
export function checkBasePrefix(url: string): string | null {
  if (!url.startsWith('/')) return null;
  if (url === '/blog' || url.startsWith('/blog/')) return null;
  return `base prefix violation: "${url}" should start with "/blog/"`;
}
