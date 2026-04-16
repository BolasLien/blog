// scripts/migrate-posts/rename-slug.ts
import type { MigratedPost } from './types.ts';

const SLUG_RENAMES: Record<string, string> = {
  'HTML-把header做成template': 'html-reusable-header-template',
  'putty使用ssh登入遠端無須密碼': 'ssh-passwordless-login-with-putty',
  'Vue元件溝通-子傳父-emit': 'vue-child-to-parent-emit',
  '如何做一個Line機器人': 'build-a-line-bot',
  '實作JWT機制的登入驗證': 'jwt-login-authentication',
  '架設Hexo部落格': 'hexo-blog-setup-notes',
  '為什麼我不繼續做聖騎士PM': 'leaving-game-industry-pm',
};

export function renameSlug(post: MigratedPost): MigratedPost {
  const newSlug = SLUG_RENAMES[post.slug];
  if (newSlug === undefined) return post;
  return { ...post, slug: newSlug };
}
