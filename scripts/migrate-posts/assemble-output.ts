// scripts/migrate-posts/assemble-output.ts
import { rmSync, mkdirSync, writeFileSync, copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import matter from 'gray-matter';
import { formatTaipeiIso } from '../../src/utils/dates.ts';
import type { MigratedPost } from './types.ts';

const SOURCE_DIR = 'source/_posts';
const OUTPUT_DIR = 'src/content/posts';

/** Collect sibling asset folder (e.g. source/_posts/<slug>/) into post.assets */
export function collectSiblingAssets(post: MigratedPost): MigratedPost {
  // Use original slug (before rename) to find sibling directory
  const originalSlug = basename(post.sourceFile, '.md');
  const siblingDir = resolve(SOURCE_DIR, originalSlug);
  if (!existsSync(siblingDir) || !statSync(siblingDir).isDirectory()) return post;

  const assets = new Map(post.assets);
  for (const entry of readdirSync(siblingDir)) {
    const full = join(siblingDir, entry);
    if (statSync(full).isFile()) {
      assets.set(full, entry);
    }
  }
  return { ...post, assets };
}

/** Write transformed post to src/content/posts/<slug>/index.md + copy assets */
export function writePost(post: MigratedPost): void {
  const outDir = resolve(OUTPUT_DIR, post.slug);
  mkdirSync(outDir, { recursive: true });

  const frontmatter = {
    title: post.frontmatter.title,
    date: formatTaipeiIso(post.frontmatter.date),
    description: post.frontmatter.description,
    tags: post.frontmatter.tags,
  };

  const fileContent = matter.stringify(post.body, frontmatter);
  writeFileSync(join(outDir, 'index.md'), fileContent, 'utf-8');

  for (const [source, filename] of post.assets) {
    if (!existsSync(source)) {
      console.warn(`[assemble] ${post.slug}: asset source not found: ${source}`);
      continue;
    }
    copyFileSync(source, join(outDir, filename));
  }
}

/** Clean output dir before writing, but keep .gitkeep */
export function cleanOutputDir(): void {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    return;
  }
  for (const entry of readdirSync(OUTPUT_DIR)) {
    if (entry === '.gitkeep') continue;
    rmSync(join(OUTPUT_DIR, entry), { recursive: true, force: true });
  }
}
