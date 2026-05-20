import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 檢查 URL 對應的實體檔案是否存在於 dist root。
 * - 目錄型 URL（以 "/" 結尾）→ 檢查 `<dir>/index.html`
 * - 檔案型 URL → 直接檢查路徑
 * 回 null 代表 pass，回字串代表 violation 說明。
 */
export function checkTargetExists(url: string, distRoot: string): string | null {
  const pathOnly = url.split('?')[0].split('#')[0];

  let targetPath: string;
  if (pathOnly.endsWith('/')) {
    targetPath = join(distRoot, pathOnly, 'index.html');
  } else {
    targetPath = join(distRoot, pathOnly);
  }

  if (!existsSync(targetPath)) {
    return `target missing: "${url}" → ${targetPath}`;
  }
  return null;
}

