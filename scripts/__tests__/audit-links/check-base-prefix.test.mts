import { describe, it, expect } from 'vitest';
import { checkBasePrefix } from '../../audit-links/check-base-prefix';

describe('checkBasePrefix', () => {
  it('以 /blog/ 開頭 → null（pass）', () => {
    expect(checkBasePrefix('/blog/')).toBeNull();
    expect(checkBasePrefix('/blog/2021/01/01/foo/')).toBeNull();
    expect(checkBasePrefix('/blog/_astro/hash.css')).toBeNull();
  });

  it('以 / 開頭但非 /blog/ → 回 violation message', () => {
    const result = checkBasePrefix('/foo/');
    expect(result).toMatch(/base/i);
  });

  it('以 /blog 開頭但無 trailing slash（e.g. /blogsomething）→ violation', () => {
    expect(checkBasePrefix('/blogsomething/')).not.toBeNull();
  });

  it('非 / 開頭 → 視為 relative，不檢查（回 null）', () => {
    expect(checkBasePrefix('foo')).toBeNull();
    expect(checkBasePrefix('./foo')).toBeNull();
  });
});
