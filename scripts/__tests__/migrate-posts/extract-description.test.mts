import { describe, it, expect } from 'vitest';
import { extractDescription } from '../../migrate-posts/extract-description.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(body: string, description = '', title = 'Test Post'): MigratedPost {
  return {
    sourceFile: '/x/a.md', slug: 'a',
    frontmatter: { title, date: new Date(), tags: [], description },
    body,
    assets: new Map(),
    warnings: [],
  };
}

describe('extractDescription', () => {
  it('已有 description 不動', () => {
    const post = makePost('body', 'existing description');
    const result = extractDescription(post);
    expect(result.frontmatter.description).toBe('existing description');
    expect(result.warnings).toHaveLength(0);
  });

  it('首段為普通文字 → 取前 120 字', () => {
    const body = '這是一段長度足夠的普通文字段落，目的是讓 extractDescription 能夠從裡面拿出至少 60 個字元的內容作為 description 的填充材料，請不要誤傷它。';
    const post = makePost(body);
    const result = extractDescription(post);
    expect(result.frontmatter.description.length).toBeGreaterThanOrEqual(60);
    expect(result.frontmatter.description.length).toBeLessThanOrEqual(120);
    expect(result.warnings[0]).toContain('[extract-description]');
  });

  it('首段為 ## header → 跳過往下找', () => {
    const body = '## 只是個 header\n\n這才是真正有內容的段落，長度超過 60 字的樣子，然後會被抽出來當 description 的。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).toContain('這才是真正有內容');
    expect(result.frontmatter.description).not.toContain('只是個 header');
  });

  it('首段為 > quote → strip 掉 > 字元仍可抽', () => {
    const body = '> 這是一個 blockquote 裡面寫的一段文字，strip 掉尖括號後長度還是很夠抽成 description 用的材料，請加油。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).not.toContain('>');
    expect(result.frontmatter.description.length).toBeGreaterThanOrEqual(60);
  });

  it('抽不到 60 字 → 降級用 title', () => {
    const body = '太短\n\n又一個短段\n\n還是短';
    const post = makePost(body, '', 'Fallback Title');
    const result = extractDescription(post);
    expect(result.frontmatter.description).toBe('Fallback Title');
    expect(result.warnings[0]).toContain('降級');
  });

  it('strip link 的 url 部分，留 text', () => {
    const body = '這段有 [連結文字](https://example.com/a/b) 混在中間，整體長度仍足以抽出足夠的 description 內容作為自動填充的結果。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).toContain('連結文字');
    expect(result.frontmatter.description).not.toContain('https://example.com');
  });

  it('strip bold', () => {
    const body = '這段有 **粗體字** 混在中間，整體長度仍足以抽出足夠的 description 內容作為自動填充的結果，不要把星號留下來喔。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).toContain('粗體字');
    expect(result.frontmatter.description).not.toContain('**');
  });

  it('strip html comment', () => {
    const body = '<!-- something -->\n\n這段才是真正的段落，長度超過 60 個字，請把上方的 html comment 當成不存在，從這段開始抽 description。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).toContain('真正的段落');
    expect(result.frontmatter.description).not.toContain('something');
  });
});
