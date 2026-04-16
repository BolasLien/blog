import type { MigratedPost } from './types.ts';

export function normalizeTags(post: MigratedPost): MigratedPost {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const t of post.frontmatter.tags) {
    const lc = t.toLowerCase();
    if (seen.has(lc)) continue;
    seen.add(lc);
    tags.push(lc);
  }
  return { ...post, frontmatter: { ...post.frontmatter, tags } };
}
