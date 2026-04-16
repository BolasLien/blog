import { describe, it, expect } from 'vitest';
import { fixHardcodeUrl } from '../../migrate-posts/fix-hardcode-url.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(slug: string, body: string): MigratedPost {
  return {
    sourceFile: `/x/${slug}.md`, slug,
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body, assets: new Map(), warnings: [],
  };
}

describe('fixHardcodeUrl', () => {
  it('hexo-blog-setup-notes 的 logo URL 改成 ./logo.svg（同時修正副檔名）', () => {
    const body = '前言\n\n![](https://bolaslien.github.io/blog/img/logo.png)\n\n後文';
    const result = fixHardcodeUrl(makePost('hexo-blog-setup-notes', body));
    expect(result.body).toContain('![](./logo.svg)');
    expect(result.body).not.toContain('bolaslien.github.io/blog/img/logo');
    expect(result.body).not.toContain('logo.png');
    expect(result.assets.size).toBe(1);
  });

  it('asset map 註冊了 source/img/logo.svg → logo.svg', () => {
    const body = '![](https://bolaslien.github.io/blog/img/logo.png)';
    const result = fixHardcodeUrl(makePost('hexo-blog-setup-notes', body));
    const entry = [...result.assets.entries()][0];
    expect(entry[0]).toMatch(/source\/img\/logo\.svg$/);
    expect(entry[1]).toBe('logo.svg');
  });

  it('其他 slug 不動（連內文都不檢查）', () => {
    const body = '某篇文章隨便提到 bolaslien.github.io/blog/img/logo.png';
    const result = fixHardcodeUrl(makePost('random-post', body));
    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
  });

  it('hexo-blog-setup-notes 但內文沒 hard-code URL', () => {
    const body = '普通內文';
    const result = fixHardcodeUrl(makePost('hexo-blog-setup-notes', body));
    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
  });
});
