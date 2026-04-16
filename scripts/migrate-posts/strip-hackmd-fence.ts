import type { MigratedPost } from './types.ts';

const HACKMD_FENCE_RE = /^```([a-zA-Z0-9_+-]+)=[^\n]*$/gm;

export function stripHackmdFence(post: MigratedPost): MigratedPost {
  const body = post.body.replace(HACKMD_FENCE_RE, '```$1');
  return { ...post, body };
}
