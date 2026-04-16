import { describe, it, expect } from 'vitest';
import { normalizeTags } from '../../migrate-posts/normalize-tags.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(tags: string[]): MigratedPost {
  return {
    sourceFile: '/x/a.md',
    slug: 'a',
    frontmatter: { title: '', date: new Date(), tags, description: '' },
    body: '',
    assets: new Map(),
    warnings: [],
  };
}

describe('normalizeTags', () => {
  it('全部 lowercase', () => {
    const result = normalizeTags(makePost(['CSS', 'HTML', 'Express']));
    expect(result.frontmatter.tags).toEqual(['css', 'html', 'express']);
  });

  it('lowercase 後去重', () => {
    const result = normalizeTags(makePost(['CSS', 'css', 'Css', 'html']));
    expect(result.frontmatter.tags).toEqual(['css', 'html']);
  });

  it('空陣列', () => {
    const result = normalizeTags(makePost([]));
    expect(result.frontmatter.tags).toEqual([]);
  });

  it('中文 tag 不動', () => {
    const result = normalizeTags(makePost(['前端技術', 'CSS', '前端技術']));
    expect(result.frontmatter.tags).toEqual(['前端技術', 'css']);
  });

  it('保留原順序（第一次出現的位置）', () => {
    const result = normalizeTags(makePost(['Vue', 'CSS', 'vue', 'HTML']));
    expect(result.frontmatter.tags).toEqual(['vue', 'css', 'html']);
  });
});
