import { describe, it, expect } from 'vitest';
import { extractUrls } from '../../audit-links/extract-urls';

describe('extractUrls', () => {
  it('抽 <a href>', () => {
    const html = '<html><body><a href="/blog/foo/">link</a></body></html>';
    expect(extractUrls(html)).toEqual([{ url: '/blog/foo/', source: 'a' }]);
  });

  it('抽 <img src>', () => {
    const html = '<img src="/blog/img/logo.svg" alt="">';
    expect(extractUrls(html)).toEqual([{ url: '/blog/img/logo.svg', source: 'img' }]);
  });

  it('抽 <link href> (stylesheet / preload / icon / canonical)', () => {
    const html = `
      <link rel="stylesheet" href="/blog/style.css">
      <link rel="preload" href="/blog/fonts/noto.woff2" as="font">
      <link rel="icon" href="/blog/favicon.ico">
      <link rel="canonical" href="https://example.com/blog/foo/">
    `;
    const urls = extractUrls(html).map((e) => e.url);
    expect(urls).toContain('/blog/style.css');
    expect(urls).toContain('/blog/fonts/noto.woff2');
    expect(urls).toContain('/blog/favicon.ico');
    expect(urls).toContain('https://example.com/blog/foo/');
  });

  it('抽 <script src>', () => {
    const html = '<script src="/blog/_astro/hash.js"></script>';
    expect(extractUrls(html)).toEqual([{ url: '/blog/_astro/hash.js', source: 'script' }]);
  });

  it('multiple sources 一起抽', () => {
    const html = `
      <link rel="stylesheet" href="/a.css">
      <a href="/b/">b</a>
      <img src="/c.png">
      <script src="/d.js"></script>
    `;
    expect(extractUrls(html)).toHaveLength(4);
  });

  it('忽略 inline script body（無 src）', () => {
    const html = '<script>var x = 1;</script>';
    expect(extractUrls(html)).toEqual([]);
  });

  it('忽略 <a> 無 href', () => {
    const html = '<a>text</a>';
    expect(extractUrls(html)).toEqual([]);
  });

  it('空 HTML 回空陣列', () => {
    expect(extractUrls('')).toEqual([]);
    expect(extractUrls('<html></html>')).toEqual([]);
  });

  it('handle data: URL（不崩）', () => {
    const html = '<img src="data:image/svg+xml,<svg></svg>">';
    expect(extractUrls(html)).toEqual([
      { url: 'data:image/svg+xml,<svg></svg>', source: 'img' },
    ]);
  });
});
