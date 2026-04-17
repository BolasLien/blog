import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 檢查 URL 對應的實體檔案是否存在於 dist root。
 * - 目錄型 URL（以 "/" 結尾）→ 檢查 `<dir>/index.html`
 * - 檔案型 URL → 直接檢查路徑
 * - 非 /blog/ 開頭的 URL 視為 violation（defense-in-depth）
 * 回 null 代表 pass，回字串代表 violation 說明。
 */
export function checkTargetExists(url: string, distRoot: string): string | null {
  if (!url.startsWith('/blog/') && url !== '/blog') {
    return `target check skipped: "${url}" not under /blog/`;
  }

  const pathOnly = url.split('?')[0].split('#')[0];
  const relPath = pathOnly.replace(/^\/blog\/?/, '');

  let targetPath: string;
  if (relPath === '' || relPath.endsWith('/')) {
    targetPath = join(distRoot, relPath, 'index.html');
  } else {
    targetPath = join(distRoot, relPath);
  }

  if (!existsSync(targetPath)) {
    return `target missing: "${url}" → ${targetPath}`;
  }
  return null;
}
