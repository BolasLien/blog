import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MigratedPost } from './types.ts';

const HEXO_LOGO_URL = 'https://bolaslien.github.io/blog/img/logo.png';
const LOGO_SOURCE = resolve('source/img/logo.svg');
const LOGO_OUTPUT_FILENAME = 'logo.svg';

export function fixHardcodeUrl(post: MigratedPost): MigratedPost {
  if (post.slug !== 'hexo-blog-setup-notes') return post;
  if (!post.body.includes(HEXO_LOGO_URL)) return post;

  if (!existsSync(LOGO_SOURCE)) {
    return {
      ...post,
      warnings: [
        ...post.warnings,
        `[fix-hardcode-url] ${post.slug}: 找不到 source logo (${LOGO_SOURCE})，URL 不改`,
      ],
    };
  }

  const body = post.body.split(HEXO_LOGO_URL).join(`./${LOGO_OUTPUT_FILENAME}`);
  const assets = new Map(post.assets);
  assets.set(LOGO_SOURCE, LOGO_OUTPUT_FILENAME);
  return { ...post, body, assets };
}
