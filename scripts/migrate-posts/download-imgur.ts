import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { MigratedPost } from './types.ts';

const IMGUR_RE = /!\[([^\]]*)\]\(https:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)\.(png|jpg|jpeg|gif|webp)\)/g;

const FETCH_TIMEOUT_MS = 10_000;
const REQUEST_DELAY_MS = 200;

export interface DownloadImgurOptions {
  skipDownload: boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function downloadImgur(
  post: MigratedPost,
  options: DownloadImgurOptions,
): Promise<MigratedPost> {
  const matches: Array<{ alt: string; hash: string; ext: string; full: string }> = [];
  IMGUR_RE.lastIndex = 0;
  let m;
  while ((m = IMGUR_RE.exec(post.body)) !== null) {
    matches.push({ alt: m[1]!, hash: m[2]!, ext: m[3]!, full: m[0]! });
  }

  if (matches.length === 0 || options.skipDownload) {
    return post;
  }

  const assets = new Map(post.assets);
  const warnings = [...post.warnings];
  let body = post.body;

  const tempDir = join(tmpdir(), 'migrate-imgur', post.slug);
  mkdirSync(tempDir, { recursive: true });

  for (let i = 0; i < matches.length; i++) {
    const { alt, hash, ext, full } = matches[i]!;
    const filename = `imgur-${hash}.${ext}`;
    const url = `https://i.imgur.com/${hash}.${ext}`;

    if (i > 0) await sleep(REQUEST_DELAY_MS);

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!response.ok) {
        warnings.push(`[download-imgur] ${post.slug}: ${url} → ${response.status}，保留原 URL`);
        continue;
      }
      const buf = Buffer.from(await response.arrayBuffer());
      const tempPath = join(tempDir, filename);
      writeFileSync(tempPath, buf);
      assets.set(tempPath, filename);
      body = body.split(full).join(`![${alt}](./${filename})`);
    } catch (err) {
      const reason = (err as Error).name === 'TimeoutError'
        ? `timeout after ${FETCH_TIMEOUT_MS}ms`
        : (err as Error).message;
      warnings.push(`[download-imgur] ${post.slug}: ${url} → ${reason}，保留原 URL`);
    }
  }

  return { ...post, body, assets, warnings };
}
