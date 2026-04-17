import { describe, it, expect } from 'vitest';
import { classifyUrl } from '../../audit-links/classify-url';

describe('classifyUrl', () => {
  it('http(s) → external', () => {
    expect(classifyUrl('https://example.com/foo')).toBe('external');
    expect(classifyUrl('http://example.com/foo')).toBe('external');
  });

  it('protocol-relative // → external', () => {
    expect(classifyUrl('//cdn.example.com/lib.js')).toBe('external');
  });

  it('# / #anchor → anchor', () => {
    expect(classifyUrl('#top')).toBe('anchor');
    expect(classifyUrl('#')).toBe('anchor');
  });

  it('data: → data', () => {
    expect(classifyUrl('data:image/svg+xml,...')).toBe('data');
  });

  it('/blog/ 開頭 → internal', () => {
    expect(classifyUrl('/blog/2021/01/01/foo/')).toBe('internal');
    expect(classifyUrl('/blog/tags/javascript/')).toBe('internal');
  });

  it('/ 開頭但不是 /blog/ → internal（後續 checkBasePrefix 會 fail）', () => {
    expect(classifyUrl('/foo/')).toBe('internal');
    expect(classifyUrl('/assets/logo.png')).toBe('internal');
  });

  it('空字串 → anchor（退化）', () => {
    expect(classifyUrl('')).toBe('anchor');
  });

  it('mailto: tel: javascript: → external（不驗）', () => {
    expect(classifyUrl('mailto:foo@example.com')).toBe('external');
    expect(classifyUrl('tel:+886912345678')).toBe('external');
    expect(classifyUrl('javascript:void(0)')).toBe('external');
  });
});
