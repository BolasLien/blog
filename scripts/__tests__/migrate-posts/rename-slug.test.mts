import { describe, it, expect } from 'vitest';
import { renameSlug } from '../../migrate-posts/rename-slug.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(slug: string): MigratedPost {
  return {
    sourceFile: `/x/${slug}.md`,
    slug,
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body: '',
    assets: new Map(),
    warnings: [],
  };
}

describe('renameSlug', () => {
  const mappings: Array<[string, string]> = [
    ['HTML-把header做成template', 'html-reusable-header-template'],
    ['putty使用ssh登入遠端無須密碼', 'ssh-passwordless-login-with-putty'],
    ['Vue元件溝通-子傳父-emit', 'vue-child-to-parent-emit'],
    ['如何做一個Line機器人', 'build-a-line-bot'],
    ['實作JWT機制的登入驗證', 'jwt-login-authentication'],
    ['架設Hexo部落格', 'hexo-blog-setup-notes'],
    ['為什麼我不繼續做聖騎士PM', 'leaving-game-industry-pm'],
  ];

  for (const [from, to] of mappings) {
    it(`rename ${from} → ${to}`, () => {
      const post = makePost(from);
      const result = renameSlug(post);
      expect(result.slug).toBe(to);
    });
  }

  it('英文 slug 不被改動', () => {
    const post = makePost('js-array-prototype-find');
    const result = renameSlug(post);
    expect(result.slug).toBe('js-array-prototype-find');
  });

  it('不修改其他欄位', () => {
    const post = makePost('HTML-把header做成template');
    post.frontmatter.title = 'Test';
    const result = renameSlug(post);
    expect(result.frontmatter.title).toBe('Test');
    expect(result.body).toBe('');
    expect(result.assets.size).toBe(0);
  });
});
