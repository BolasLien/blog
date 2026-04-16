import type { MigratedPost } from './types.ts';

const DROP_CATEGORIES = new Set(['筆記', '心得分享', '技術心得', '觀點', '測試']);
const CONVERT_CATEGORIES = new Set(['前端技術', '軟體開發', 'claude code']);

function flattenCategories(raw: unknown): string[] {
  if (raw == null || raw === '') return [];
  if (!Array.isArray(raw)) return [String(raw)];
  const out: string[] = [];
  for (const item of raw) {
    if (Array.isArray(item)) {
      for (const inner of item) out.push(String(inner));
    } else {
      out.push(String(item));
    }
  }
  return out;
}

export function normalizeCategories(post: MigratedPost): MigratedPost {
  const raw = post.frontmatter.categories;
  const values = flattenCategories(raw);
  const wasArrayInput = Array.isArray(raw);

  const tags = [...post.frontmatter.tags];
  const warnings = [...post.warnings];

  for (const v of values) {
    if (DROP_CATEGORIES.has(v)) continue;
    if (CONVERT_CATEGORIES.has(v)) {
      if (!tags.includes(v)) tags.push(v);
      continue;
    }
    if (wasArrayInput) {
      if (!tags.includes(v)) tags.push(v);
      continue;
    }
    if (!tags.includes(v)) {
      warnings.push(`[normalize-categories] unknown category "${v}" in ${post.slug}，當 tag 處理`);
      tags.push(v);
    }
  }

  const nextFrontmatter = { ...post.frontmatter, tags };
  delete nextFrontmatter.categories;

  return { ...post, frontmatter: nextFrontmatter, warnings };
}
