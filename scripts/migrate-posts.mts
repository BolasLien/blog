#!/usr/bin/env tsx
/**
 * Migrate 60 Hexo posts from source/_posts/*.md to Astro Content Collection
 * under src/content/posts/<slug>/index.md (co-located pattern).
 *
 * Pure function: source/_posts/ is read-only, src/content/posts/ is completely
 * rebuilt on every run. Idempotent.
 *
 * Usage:
 *   npm run migrate:posts              # 實際寫檔
 *   npm run migrate:posts -- --dry-run # 僅印報告不寫檔
 *   npm run migrate:posts -- --skip-download # 跳過 imgur 下載（dev 迭代）
 */
import { parseArgs } from 'node:util';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import matter from 'gray-matter';
import { parseFrontmatterDate } from '../src/utils/dates.ts';
import type { MigratedPost } from './migrate-posts/types.ts';
import { renameSlug } from './migrate-posts/rename-slug.ts';
import { normalizeCategories } from './migrate-posts/normalize-categories.ts';
import { normalizeTags } from './migrate-posts/normalize-tags.ts';
import { stripMoreTag } from './migrate-posts/strip-more-tag.ts';
import { extractDescription } from './migrate-posts/extract-description.ts';

const SOURCE_DIR = 'source/_posts';
const OUTPUT_DIR = 'src/content/posts';

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'skip-download': { type: 'boolean', default: false },
    'audit-categories': { type: 'boolean', default: false },
  },
});

const DRY_RUN = values['dry-run'] ?? false;
const SKIP_DOWNLOAD = values['skip-download'] ?? false;
const AUDIT_CATEGORIES = values['audit-categories'] ?? false;

function loadSourcePosts(): MigratedPost[] {
  const entries = readdirSync(SOURCE_DIR);
  const mdFiles = entries.filter((name) => {
    const full = join(SOURCE_DIR, name);
    return name.endsWith('.md') && statSync(full).isFile();
  });

  return mdFiles.map((file): MigratedPost => {
    const sourceFile = resolve(SOURCE_DIR, file);
    const raw = readFileSync(sourceFile, 'utf-8');

    // TZ-aware YAML guard: 與 verify-dates.mts 同一條防線
    const rawDateLine = raw.match(/^date:\s*(.+?)\s*$/m)?.[1]?.trim() ?? '';
    if (/(?:[+-]\d{2}:?\d{2}|Z)\s*$/.test(rawDateLine)) {
      throw new Error(
        `${file}: 含 TZ suffix 的 YAML timestamp (${rawDateLine}) — ` +
        `parseFrontmatterDate 的 UTC-to-Taipei 重解讀假設會錯。` +
        `請改寫 frontmatter 或擴充 helper。`,
      );
    }

    const { data, content } = matter(raw);
    const slug = file.replace(/\.md$/, '');

    const date = parseFrontmatterDate(data.date);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`${file}: invalid date after parseFrontmatterDate`);
    }

    return {
      sourceFile,
      slug,
      frontmatter: {
        ...data,
        title: String(data.title ?? ''),
        date,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        description: String(data.description ?? ''),
      },
      body: content,
      assets: new Map(),
      warnings: [],
    };
  });
}

type Transform = (p: MigratedPost) => MigratedPost | Promise<MigratedPost>;

async function runPipeline(posts: MigratedPost[]): Promise<MigratedPost[]> {
  const transforms: Transform[] = [
    renameSlug,
    normalizeCategories,
    normalizeTags,
    stripMoreTag,
    extractDescription,
    // extractDescription,  ← Task 7
    // normalizeTags,       ← Task 5
    // stripMoreTag,        ← Task 6
    // extractDescription,  ← Task 7
    // convertCodeblock,    ← Task 8
    // stripHackmdFence,    ← Task 9
    // fixHardcodeUrl,      ← Task 10
    // collectSiblingAssets,← Task 12
    // downloadImgur,       ← Task 11（async）
  ];

  const result: MigratedPost[] = [];
  for (const post of posts) {
    let current: MigratedPost = post;
    for (const transform of transforms) {
      current = await transform(current);
    }
    result.push(current);
  }
  return result;
}

function printDryRunReport(posts: MigratedPost[]): void {
  console.log(`[dry-run] 共載入 ${posts.length} 篇 post`);
  console.log(`[dry-run] SKIP_DOWNLOAD=${SKIP_DOWNLOAD}`);
  console.log('');
  for (const p of posts) {
    console.log(`- ${p.slug}`);
    for (const w of p.warnings) {
      console.log(`  WARN: ${w}`);
    }
  }
}

function auditCategories(posts: MigratedPost[]): void {
  const seen = new Map<string, string[]>();
  for (const p of posts) {
    const rawCat = p.frontmatter.categories;
    const key = JSON.stringify(rawCat ?? null);
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(p.slug);
  }
  console.log(`[audit] 共 ${posts.length} 篇 post，${seen.size} 種 category shape\n`);
  const sortedKeys = [...seen.keys()].sort();
  for (const key of sortedKeys) {
    const slugs = seen.get(key)!;
    console.log(`  shape: ${key}`);
    console.log(`  count: ${slugs.length}`);
    console.log(`  examples: ${slugs.slice(0, 3).join(', ')}${slugs.length > 3 ? ', ...' : ''}`);
    console.log('');
  }
}

// Main
const posts = loadSourcePosts();

if (AUDIT_CATEGORIES) {
  auditCategories(posts);
  process.exit(0);
}

const transformed = await runPipeline(posts);

if (DRY_RUN) {
  printDryRunReport(transformed);
  process.exit(0);
}

console.log(`[migrate] 共 ${transformed.length} 篇 post — 寫檔邏輯未實作 (Task 12)`);
