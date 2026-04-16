#!/usr/bin/env tsx
/**
 * 驗證每篇 Hexo post 的 frontmatter date 套用 formatDateParams 後
 * 對應的 year/month/day 都能在 legacy/hexo-public 日期目錄清單中找到。
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { formatDateParams } from '../src/utils/dates.ts';

const POSTS_DIR = 'source/_posts';
const LEGACY_DATES_FILE = 'scripts/legacy-public-dates.txt';

if (!existsSync(LEGACY_DATES_FILE)) {
  console.error(`ERROR: 找不到 ${LEGACY_DATES_FILE}（應該在 Task 1 Step 1.5 產生）`);
  process.exit(2);
}

const legacyDates = new Set(
  readFileSync(LEGACY_DATES_FILE, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
);

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
const mismatches: string[] = [];

// 使用 JSON_SCHEMA 讓 gray-matter 不自動把 YAML date string 轉成 Date 物件
// （預設行為會把無 TZ 的 date 當 UTC 解析，造成台北時間 +8h 後跨日）
const matterOpts: matter.GrayMatterOption<string, matter.GrayMatterOption<string, never>> = {
  engines: {
    yaml: (s: string) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
  },
};

for (const file of files) {
  const raw = readFileSync(join(POSTS_DIR, file), 'utf-8');
  const { data } = matter(raw, matterOpts);

  if (!data.date) {
    mismatches.push(`[NO DATE] ${file}`);
    continue;
  }

  // frontmatter 的 date 可能是 "2020-08-28 13:55:28"（無 TZ）或已經有 offset
  // 視為台北時間處理：若無 offset 就補 +08:00
  const rawStr = typeof data.date === 'string' ? data.date : data.date.toISOString();
  const isoish = rawStr.replace(' ', 'T');
  const hasTz = /[+-]\d{2}:?\d{2}$|Z$/.test(isoish);
  const normalized = hasTz ? isoish : `${isoish}+08:00`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    mismatches.push(`[INVALID DATE] ${file}: ${rawStr}`);
    continue;
  }

  const { year, month, day } = formatDateParams(date);
  const key = `${year}/${month}/${day}`;

  if (!legacyDates.has(key)) {
    mismatches.push(`[DRIFT] ${file} → ${key} 不在 legacy/hexo-public 日期集合中`);
  }
}

if (mismatches.length > 0) {
  console.error(`\n❌ ${mismatches.length} 個 post 出現問題：\n`);
  for (const m of mismatches) console.error(`  ${m}`);
  process.exit(1);
}

console.log(`✓ ${files.length} 篇 post 的日期抽取全部在 legacy 日期集合中`);
