#!/usr/bin/env tsx
/**
 * verify-ga4: 跑過 dist/**\/*.html，確認每頁都用瀏覽器會直接執行的方式載入 GA4：
 *   - gtag.js loader 是一般 async script（不是 text/partytown）
 *   - inline gtag('config', ...) 也是一般 script
 * 只看 HTML 有沒有追蹤碼不夠：type 不對時瀏覽器會略過，事件就不會送出。
 *
 * Usage: tsx scripts/verify-ga4.mts [--dist <path>] [--public <path>]
 */
import { existsSync, readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { checkGa4 } from './verify-ga4/check-ga4.ts';

const { values } = parseArgs({
  options: {
    dist: { type: 'string', default: 'dist' },
    public: { type: 'string', default: 'public' },
  },
});
const DIST = resolve(values.dist!);
const PUBLIC = resolve(values.public!);

const failures: Array<{ file: string; problems: string[] }> = [];
let htmlCount = 0;
let skipped = 0;

for await (const htmlPath of glob('**/*.html', { cwd: DIST })) {
  // public/ 的靜態檔（轉址頁、OG 圖模板）原樣複製、不經 BaseLayout，不檢查
  if (existsSync(resolve(PUBLIC, htmlPath))) {
    skipped++;
    continue;
  }
  htmlCount++;
  const problems = checkGa4(readFileSync(resolve(DIST, htmlPath), 'utf-8'));
  if (problems.length > 0) failures.push({ file: htmlPath, problems });
}

console.log(`[verify-ga4] scanned ${htmlCount} HTML files (skipped ${skipped} from public/)`);

if (htmlCount === 0) {
  console.error(`❌ ${DIST} 沒有 HTML，先跑 npm run build`);
  process.exit(2);
}

if (failures.length > 0) {
  console.error(`\n❌ ${failures.length} files failed:\n`);
  for (const f of failures) {
    console.error(`  ${f.file}`);
    for (const p of f.problems) console.error(`    - ${p}`);
  }
  process.exit(1);
}

console.log('✓ verify-ga4 passed');
process.exit(0);
