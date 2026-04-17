import { describe, it, expect } from 'vitest';
import { getAllTags, getPostsByTag } from './tags';

type FakePost = {
  id: string;
  data: { title: string; date: Date; tags: string[]; description: string };
};

function makePost(id: string, tags: string[], dateStr: string): FakePost {
  return {
    id,
    data: {
      title: id,
      date: new Date(dateStr),
      tags,
      description: '',
    },
  };
}

describe('getAllTags', () => {
  it('aggregate tag 出現次數並去重', () => {
    const posts = [
      makePost('a', ['css', 'javascript'], '2021-01-01'),
      makePost('b', ['css'], '2021-02-01'),
      makePost('c', ['javascript', 'css'], '2021-03-01'),
    ];
    expect(getAllTags(posts)).toEqual([
      { tag: 'css', count: 3 },
      { tag: 'javascript', count: 2 },
    ]);
  });

  it('count 相同時 tag 依字母 asc 排序', () => {
    const posts = [
      makePost('a', ['ab', 'cd'], '2021-01-01'),
    ];
    expect(getAllTags(posts)).toEqual([
      { tag: 'ab', count: 1 },
      { tag: 'cd', count: 1 },
    ]);
  });

  it('中文 tag 大小寫原樣保留不 lowercase', () => {
    const posts = [
      makePost('a', ['前端開發', 'AI-Coding'], '2021-01-01'),
    ];
    const tags = getAllTags(posts).map((t) => t.tag);
    expect(tags).toContain('前端開發');
    expect(tags).toContain('AI-Coding');
  });

  it('empty posts 陣列回 []', () => {
    expect(getAllTags([])).toEqual([]);
  });

  it('post 無 tags 時不崩', () => {
    const posts = [makePost('a', [], '2021-01-01')];
    expect(getAllTags(posts)).toEqual([]);
  });
});

describe('getPostsByTag', () => {
  it('只回該 tag 的 posts', () => {
    const posts = [
      makePost('a', ['css'], '2021-01-01'),
      makePost('b', ['javascript'], '2021-02-01'),
      makePost('c', ['css', 'javascript'], '2021-03-01'),
    ];
    const result = getPostsByTag(posts, 'css');
    expect(result.map((p) => p.id)).toEqual(['c', 'a']); // date desc
  });

  it('tag 不存在時回 []', () => {
    const posts = [makePost('a', ['css'], '2021-01-01')];
    expect(getPostsByTag(posts, 'nonexistent')).toEqual([]);
  });

  it('tag 大小寫 / 中文都精確匹配', () => {
    const posts = [
      makePost('a', ['前端開發'], '2021-01-01'),
      makePost('b', ['前端'], '2021-01-01'),
      makePost('c', ['AI-Coding'], '2021-01-01'),
      makePost('d', ['ai-coding'], '2021-01-01'),
    ];
    expect(getPostsByTag(posts, '前端開發').map((p) => p.id)).toEqual(['a']);
    expect(getPostsByTag(posts, 'AI-Coding').map((p) => p.id)).toEqual(['c']);
  });
});
