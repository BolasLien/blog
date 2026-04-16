import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadImgur } from '../../migrate-posts/download-imgur.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(body: string): MigratedPost {
  return {
    sourceFile: '/x/a.md', slug: 'a',
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body, assets: new Map(), warnings: [],
  };
}

const mockPng = new Uint8Array([137, 80, 78, 71]);
const origFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = origFetch;
});

describe('downloadImgur', () => {
  it('下載一張圖並改寫 URL', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => mockPng.buffer,
    });

    const body = '前文\n\n![alt](https://i.imgur.com/abc.png)\n\n後文';
    const result = await downloadImgur(makePost(body), { skipDownload: false });

    expect(result.body).toContain('![alt](./imgur-abc.png)');
    expect(result.body).not.toContain('i.imgur.com');
    expect(result.assets.size).toBe(1);
  });

  it('多張連續 imgur', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, status: 200,
      arrayBuffer: async () => mockPng.buffer,
    });

    const body = [
      '![](https://i.imgur.com/aaa.png)',
      '![](https://i.imgur.com/bbb.jpg)',
      '![](https://i.imgur.com/ccc.gif)',
    ].join('\n\n');
    const result = await downloadImgur(makePost(body), { skipDownload: false });
    expect(result.body).toContain('./imgur-aaa.png');
    expect(result.body).toContain('./imgur-bbb.jpg');
    expect(result.body).toContain('./imgur-ccc.gif');
    expect(result.assets.size).toBe(3);
  });

  it('非 imgur 的 URL 不被誤傷', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, status: 200,
      arrayBuffer: async () => mockPng.buffer,
    });

    const body = '![](https://example.com/a.png)\n\n![](https://imgur.com/gallery/xyz) 不是 i.imgur.com';
    const result = await downloadImgur(makePost(body), { skipDownload: false });

    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('404 → warning 保留原 URL', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0),
    });

    const body = '![](https://i.imgur.com/deadlink.png)';
    const result = await downloadImgur(makePost(body), { skipDownload: false });

    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
    expect(result.warnings[0]).toContain('404');
    expect(result.warnings[0]).toContain('deadlink');
  });

  it('--skip-download 時不呼叫 fetch 也不動 body', async () => {
    const body = '![](https://i.imgur.com/abc.png)';
    const result = await downloadImgur(makePost(body), { skipDownload: true });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
  });
});
