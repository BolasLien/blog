import { describe, it, expect } from 'vitest';
import { stripMoreTag } from '../../migrate-posts/strip-more-tag.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(body: string): MigratedPost {
  return {
    sourceFile: '/x/a.md', slug: 'a',
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body,
    assets: new Map(),
    warnings: [],
  };
}

describe('stripMoreTag', () => {
  it('單行 <!-- more --> 被整行移除', () => {
    const body = 'intro paragraph\n\n<!-- more -->\n\nrest of body';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe('intro paragraph\n\n\nrest of body');
  });

  it('沒有 <!-- more --> 的 body 不動', () => {
    const body = 'just plain content\n\n## header\n\nbody';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe(body);
  });

  it('開頭就是 <!-- more -->', () => {
    const body = '<!-- more -->\n\nbody';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe('\nbody');
  });

  it('結尾就是 <!-- more -->', () => {
    const body = 'intro\n<!-- more -->';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe('intro\n');
  });

  it('不誤傷 inline 的文字', () => {
    const body = 'this is <!-- more --> inline comment';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe(body);
  });
});
