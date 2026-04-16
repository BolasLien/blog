import { describe, it, expect } from 'vitest';
import { stripHackmdFence } from '../../migrate-posts/strip-hackmd-fence.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(body: string): MigratedPost {
  return {
    sourceFile: '/x/a.md', slug: 'a',
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body, assets: new Map(), warnings: [],
  };
}

describe('stripHackmdFence', () => {
  it('```javascript= → ```javascript', () => {
    const body = '```javascript=\nconst x = 1;\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```javascript\nconst x = 1;\n```');
  });

  it('```js=123 → ```js', () => {
    const body = '```js=123\nconsole.log();\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```js\nconsole.log();\n```');
  });

  it('```css= → ```css', () => {
    const body = '```css=\n.a { color: red; }\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```css\n.a { color: red; }\n```');
  });

  it('```bash= → ```bash（git-cross-os-config-setting 實際 case）', () => {
    const body = '```bash=\ngit config --global core.autocrlf input\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```bash\ngit config --global core.autocrlf input\n```');
  });

  it('多個 fence 都處理', () => {
    const body = '```js=\nA\n```\n\n```ts=\nB\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```js\nA\n```\n\n```ts\nB\n```');
  });

  it('正常 fence 不動', () => {
    const body = '```javascript\nconst x = 1;\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe(body);
  });

  it('內文包含 = 字元不誤傷', () => {
    const body = 'inline `x === y` check\n\n```js\nconst a = 1;\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe(body);
  });
});
