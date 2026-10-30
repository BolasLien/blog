#!/usr/bin/env tsx
/**
 * url-diff: 比對 Hexo snapshot 的 legacy URL 集合與目前 dist/ 產出的 URL 集合。
 *
 * 輸入：
 *   - scripts/legacy-public-urls.txt（committed）
 *   - dist/**\/*.html
 *
 * 輸出：
 *   - 濾掉 accepted loss 後若有 legacy URL 在 dist 找不到 → exit 1
 *
 * Usage: tsx scripts/url-diff.mts [--dist <path>] [--chinese-tag keep|encoded]
 */
import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { parseUrlLines, normalizeUrl } from './url-diff/parse-urls.ts';
import { applyAcceptedLossFilters } from './url-diff/apply-filters.ts';

const { values } = parseArgs({
  options: {
    dist: { type: 'string', default: 'dist' },
    'chinese-tag': { type: 'string', default: 'keep' },
    legacy: { type: 'string', default: 'scripts/legacy-public-urls.txt' },
  },
});

const DIST = resolve(values.dist!);
const LEGACY_FILE = resolve(values.legacy!);
const chineseTagEncoding = values['chinese-tag'] as 'keep' | 'encoded';

if (!['keep', 'encoded'].includes(chineseTagEncoding)) {
  console.error(`--chinese-tag must be "keep" or "encoded", got "${chineseTagEncoding}"`);
  process.exit(2);
}

const legacyRaw = parseUrlLines(readFileSync(LEGACY_FILE, 'utf-8'));
const legacyRequired = applyAcceptedLossFilters(legacyRaw, { chineseTagEncoding });

const distUrls = new Set<string>();
for await (const htmlPath of glob('**/*.html', { cwd: DIST })) {
  let url: string;
  if (htmlPath === 'index.html') {
    url = '/blog/';
  } else if (htmlPath.endsWith('/index.html')) {
    url = '/blog/' + htmlPath.replace(/\/index\.html$/, '/');
  } else {
    url = '/blog/' + htmlPath;
  }
  distUrls.add(normalizeUrl(url));
}

const missing: string[] = [];
for (const url of legacyRequired) {
  if (!distUrls.has(url)) {
    missing.push(url);
  }
}

console.log(
  `[url-diff] legacy=${legacyRaw.size} → required=${legacyRequired.size}, dist=${distUrls.size}`,
);

if (missing.length > 0) {
  console.error(`\n❌ ${missing.length} URL 在 dist 中找不到：\n`);
  for (const url of missing.sort()) console.error(`  ${url}`);
  process.exit(1);
}

console.log(`✓ url-diff passed — 所有保留 URL 都在 dist 中`);
process.exit(0);
