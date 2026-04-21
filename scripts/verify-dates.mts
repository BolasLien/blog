#!/usr/bin/env tsx
/**
 * 驗證每篇 post 的 frontmatter date 套用 formatDateParams 後
 * 對應的 year/month/day 都能在 legacy/hexo-public 日期目錄清單中找到。
 * 若有 drift，代表 URL 路徑跟舊站不相容，可能造成 404。
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { formatDateParams, parseFrontmatterDate } from '../src/utils/dates.ts';

const POSTS_DIR = 'src/content/posts';
const LEGACY_DATES_FILE = 'scripts/legacy-public-dates.txt';

if (!existsSync(LEGACY_DATES_FILE)) {
  console.error(`ERROR: 找不到 ${LEGACY_DATES_FILE}`);
  process.exit(2);
}

const legacyDates = new Set(
  readFileSync(LEGACY_DATES_FILE, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
);

const files = readdirSync(POSTS_DIR)
  .filter((entry) => statSync(join(POSTS_DIR, entry)).isDirectory())
  .map((slug) => ({ slug, path: join(POSTS_DIR, slug, 'index.md') }))
  .filter((e) => existsSync(e.path));
const mismatches: string[] = [];

// 使用 JSON_SCHEMA 讓 gray-matter 不自動把 YAML date string 轉成 Date 物件
// （預設行為會把無 TZ 的 date 當 UTC 解析，造成台北時間 +8h 後跨日）
const matterOpts = {
  engines: {
    yaml: (s: string) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
  },
};

for (const entry of files) {
  const raw = readFileSync(entry.path, 'utf-8');
  const { data } = matter(raw, matterOpts);

  if (!data.date) {
    mismatches.push(`[NO DATE] ${entry.slug}`);
    continue;
  }

  const date = parseFrontmatterDate(data.date);

  if (Number.isNaN(date.getTime())) {
    mismatches.push(`[INVALID DATE] ${entry.slug}: ${String(data.date)}`);
    continue;
  }

  const { year, month, day } = formatDateParams(date);
  const key = `${year}/${month}/${day}`;

  if (!legacyDates.has(key)) {
    mismatches.push(`[DRIFT] ${entry.slug} → ${key} 不在 legacy/hexo-public 日期集合中`);
  }
}

if (mismatches.length > 0) {
  console.error(`\n❌ ${mismatches.length} 個 post 出現問題：\n`);
  for (const m of mismatches) console.error(`  ${m}`);
  process.exit(1);
}

console.log(`✓ ${files.length} 篇 post 的日期抽取全部在 legacy 日期集合中`);
