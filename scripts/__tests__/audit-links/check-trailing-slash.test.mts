import { describe, it, expect } from 'vitest';
import { checkTrailingSlash } from '../../audit-links/check-trailing-slash';

describe('checkTrailingSlash', () => {
  it('page route with trailing slash → null', () => {
    expect(checkTrailingSlash('/blog/2021/01/01/foo/')).toBeNull();
    expect(checkTrailingSlash('/blog/tags/javascript/')).toBeNull();
    expect(checkTrailingSlash('/blog/')).toBeNull();
  });

  it('page route without trailing slash → violation', () => {
    expect(checkTrailingSlash('/blog/2021/01/01/foo')).not.toBeNull();
    expect(checkTrailingSlash('/blog/tags/javascript')).not.toBeNull();
  });

  it('asset with whitelisted ext → null (trailing 不強制)', () => {
    expect(checkTrailingSlash('/blog/_astro/hash.css')).toBeNull();
    expect(checkTrailingSlash('/blog/favicon.ico')).toBeNull();
    expect(checkTrailingSlash('/blog/rss.xml')).toBeNull();
    expect(checkTrailingSlash('/blog/404.html')).toBeNull();
    expect(checkTrailingSlash('/blog/fonts/noto.woff2')).toBeNull();
  });

  it('URL 含 query string / hash → 忽略 q/h 判斷 slash', () => {
    expect(checkTrailingSlash('/blog/tags/javascript/?page=2')).toBeNull();
    expect(checkTrailingSlash('/blog/tags/javascript/#top')).toBeNull();
    expect(checkTrailingSlash('/blog/tags/javascript?page=2')).not.toBeNull();
  });
});
