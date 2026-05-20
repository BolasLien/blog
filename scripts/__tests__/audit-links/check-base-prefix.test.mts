import { describe, it, expect } from 'vitest';
import { checkBasePrefix } from '../../audit-links/check-base-prefix';

describe('checkBasePrefix', () => {
  it('以 /blog/ 開頭 → null（pass）', () => {
    expect(checkBasePrefix('/blog/')).toBeNull();
    expect(checkBasePrefix('/blog/2021/01/01/foo/')).toBeNull();
    expect(checkBasePrefix('/blog/_astro/hash.css')).toBeNull();
  });

  it('以 / 開頭（非 /blog/）→ null（base prefix 已移除）', () => {
    expect(checkBasePrefix('/foo/')).toBeNull();
    expect(checkBasePrefix('/about/')).toBeNull();
  });

  it('/blogsomething/ → null（無 prefix 限制）', () => {
    expect(checkBasePrefix('/blogsomething/')).toBeNull();
  });

  it('非 / 開頭 → null', () => {
    expect(checkBasePrefix('foo')).toBeNull();
    expect(checkBasePrefix('./foo')).toBeNull();
  });
});

