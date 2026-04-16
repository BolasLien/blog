import { describe, it, expect } from 'vitest';
import { normalizeCategories } from '../../migrate-posts/normalize-categories.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(categories: unknown, tags: string[] = []): MigratedPost {
  return {
    sourceFile: '/x/a.md',
    slug: 'a',
    frontmatter: {
      title: '', date: new Date(), description: '',
      tags,
      categories,
    },
    body: '',
    assets: new Map(),
    warnings: [],
  };
}

describe('normalizeCategories', () => {
  describe('drop 類 category', () => {
    const dropCats = ['筆記', '心得分享', '技術心得', '觀點', '測試'];
    for (const cat of dropCats) {
      it(`${cat} 直接丟，不進 tags`, () => {
        const post = makePost(cat, ['existing']);
        const result = normalizeCategories(post);
        expect(result.frontmatter.tags).toEqual(['existing']);
        expect(result.frontmatter.categories).toBeUndefined();
      });
    }
  });

  describe('convert 類 category', () => {
    const convertCats = ['前端技術', '軟體開發', 'claude code'];
    for (const cat of convertCats) {
      it(`${cat} 轉成 tag`, () => {
        const post = makePost(cat, ['existing']);
        const result = normalizeCategories(post);
        expect(result.frontmatter.tags).toEqual(['existing', cat]);
      });
    }
  });

  describe('tag 去重', () => {
    it('category 跟既有 tag 撞名時不重複加', () => {
      const post = makePost('前端技術', ['前端技術', 'css']);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['前端技術', 'css']);
    });
  });

  describe('block-scalar 陣列（flat）', () => {
    it('單一項目 block: ["筆記"] → 全丟', () => {
      const post = makePost(['筆記'], ['existing']);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['existing']);
      expect(result.frontmatter.categories).toBeUndefined();
    });

    it('陣列中 convert 類 + drop 類混雜', () => {
      const post = makePost(['筆記', '前端技術'], []);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['前端技術']);
    });
  });

  describe('nested 陣列（gray-matter 實際吐的形狀）', () => {
    it('[["筆記","css"]] flatten 後：筆記丟掉，css 加進 tags', () => {
      const post = makePost([['筆記', 'css']], ['existing']);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['existing', 'css']);
      expect(result.frontmatter.categories).toBeUndefined();
    });

    it('[["前端技術", "css"]] 兩個都進 tags', () => {
      const post = makePost([['前端技術', 'css']], []);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['前端技術', 'css']);
    });
  });

  describe('無 category 欄位', () => {
    it('undefined / null / 空陣列', () => {
      const a = normalizeCategories(makePost(undefined, ['x']));
      expect(a.frontmatter.tags).toEqual(['x']);
      const b = normalizeCategories(makePost(null, ['x']));
      expect(b.frontmatter.tags).toEqual(['x']);
      const c = normalizeCategories(makePost([], ['x']));
      expect(c.frontmatter.tags).toEqual(['x']);
    });
  });
});
