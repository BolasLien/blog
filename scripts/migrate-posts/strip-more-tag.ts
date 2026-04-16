import type { MigratedPost } from './types.ts';

export function stripMoreTag(post: MigratedPost): MigratedPost {
  const body = post.body.replace(/^<!-- more -->\n?/gm, '');
  return { ...post, body };
}
