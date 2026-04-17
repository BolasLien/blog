#!/usr/bin/env tsx
/**
 * audit-links: 跑過 dist/**\/*.html，驗證所有內部連結符合：
 *   - base prefix (/blog/ 開頭)
 *   - trailing slash（page route 結尾）
 *   - target 存在（在 dist/ 下能找到）
 *
 * Usage: tsx scripts/audit-links.mts [--dist <path>]
 */
import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { extractUrls } from './audit-links/extract-urls.ts';
import { classifyUrl } from './audit-links/classify-url.ts';
import { checkBasePrefix } from './audit-links/check-base-prefix.ts';
import { checkTrailingSlash } from './audit-links/check-trailing-slash.ts';
import { checkTargetExists } from './audit-links/check-target-exists.ts';

const { values } = parseArgs({
  options: {
    dist: { type: 'string', default: 'dist' },
  },
});
const DIST = resolve(values.dist!);

interface Violation {
  file: string;
  url: string;
  rule: string;
  message: string;
}

const violations: Violation[] = [];
let htmlCount = 0;
let urlCount = 0;

for await (const htmlPath of glob('**/*.html', { cwd: DIST })) {
  htmlCount++;
  const fullPath = resolve(DIST, htmlPath);
  const html = readFileSync(fullPath, 'utf-8');
  const urls = extractUrls(html);

  for (const { url } of urls) {
    urlCount++;
    const category = classifyUrl(url);
    if (category !== 'internal') continue;

    const rules: Array<[string, string | null]> = [
      ['base-prefix', checkBasePrefix(url)],
      ['trailing-slash', checkTrailingSlash(url)],
      ['target-exists', checkTargetExists(url, DIST)],
    ];

    for (const [rule, msg] of rules) {
      if (msg) {
        violations.push({ file: relative(DIST, fullPath), url, rule, message: msg });
      }
    }
  }
}

console.log(`[audit-links] scanned ${htmlCount} HTML files, ${urlCount} URLs`);

if (violations.length > 0) {
  console.error(`\n❌ ${violations.length} violations:\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}`);
    console.error(`    url: ${v.url}`);
    console.error(`    msg: ${v.message}`);
  }
  process.exit(1);
}

console.log(`✓ audit-links passed`);
process.exit(0);
