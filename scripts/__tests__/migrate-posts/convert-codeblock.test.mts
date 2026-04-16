import { describe, it, expect } from 'vitest';
import { convertCodeblock } from '../../migrate-posts/convert-codeblock.ts';
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

describe('convertCodeblock', () => {
  it('無 title', () => {
    const body = '{% codeblock lang:javascript %}\nconst x = 1;\n{% endcodeblock %}';
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe('```javascript\nconst x = 1;\n```');
  });

  it('有 title → title 丟掉 + warning', () => {
    const body = '{% codeblock 範例標題 lang:typescript %}\nlet x: number;\n{% endcodeblock %}';
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe('```typescript\nlet x: number;\n```');
    expect(result.warnings.some((w) => w.includes('範例標題'))).toBe(true);
  });

  it('多個連續 codeblock', () => {
    const body = [
      '{% codeblock lang:js %}',
      'a',
      '{% endcodeblock %}',
      '',
      '{% codeblock lang:css %}',
      'b',
      '{% endcodeblock %}',
    ].join('\n');
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe('```js\na\n```\n\n```css\nb\n```');
  });

  it('文中其他內容不動', () => {
    const body = '前面有文字\n\n{% codeblock lang:js %}\nx\n{% endcodeblock %}\n\n後面也有';
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe('前面有文字\n\n```js\nx\n```\n\n後面也有');
  });

  it('沒有任何 codeblock 的 body 不動', () => {
    const body = 'plain\n\n## header\n\nbody';
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe(body);
  });
});
