import type { MigratedPost } from './types.ts';

const MIN_LENGTH = 40;
const MAX_LENGTH = 120;

function stripMarkdown(text: string): string {
  return text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '$1')
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

function splitParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function extractDescription(post: MigratedPost): MigratedPost {
  if (post.frontmatter.description && post.frontmatter.description.trim()) return post;

  const paragraphs = splitParagraphs(post.body);
  for (const para of paragraphs) {
    const stripped = stripMarkdown(para);
    if (stripped.length >= MIN_LENGTH) {
      const preview = stripped.slice(0, MAX_LENGTH);
      return {
        ...post,
        frontmatter: { ...post.frontmatter, description: preview },
        warnings: [
          ...post.warnings,
          `[extract-description] ${post.slug}: auto-filled "${preview.slice(0, 30)}..."`,
        ],
      };
    }
  }

  return {
    ...post,
    frontmatter: { ...post.frontmatter, description: post.frontmatter.title },
    warnings: [
      ...post.warnings,
      `[extract-description] ${post.slug}: 降級用 title（body 無 >=${MIN_LENGTH}字段落）`,
    ],
  };
}
