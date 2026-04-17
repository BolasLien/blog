import { describe, it, expect } from 'vitest';
import { parseUrlLines, normalizeUrl } from '../../url-diff/parse-urls';

describe('normalizeUrl', () => {
  it('已正常 URL 原樣回', () => {
    expect(normalizeUrl('/blog/2021/01/01/foo/')).toBe('/blog/2021/01/01/foo/');
  });

  it('去除 query / hash', () => {
    expect(normalizeUrl('/blog/foo/?q=1')).toBe('/blog/foo/');
    expect(normalizeUrl('/blog/foo/#top')).toBe('/blog/foo/');
  });

  it('trim whitespace', () => {
    expect(normalizeUrl('  /blog/foo/  ')).toBe('/blog/foo/');
  });
});

describe('parseUrlLines', () => {
  it('多行字串 → Set', () => {
    const text = [
      '/blog/foo/',
      '/blog/bar/',
      '/blog/foo/',
    ].join('\n');
    const result = parseUrlLines(text);
    expect(result.size).toBe(2);
    expect(result.has('/blog/foo/')).toBe(true);
    expect(result.has('/blog/bar/')).toBe(true);
  });

  it('空行 / comment 行忽略', () => {
    const text = '/blog/foo/\n\n# comment\n/blog/bar/';
    expect(parseUrlLines(text).size).toBe(2);
  });
});
