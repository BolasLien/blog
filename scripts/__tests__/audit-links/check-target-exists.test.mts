import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { checkTargetExists } from '../../audit-links/check-target-exists';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TREE = resolve(__dirname, 'fixtures/tree');

describe('checkTargetExists', () => {
  it('dir URL 存在（/page/）→ null', () => {
    expect(checkTargetExists('/blog/page/', TREE)).toBeNull();
  });

  it('file URL 存在（/style.css）→ null', () => {
    expect(checkTargetExists('/blog/style.css', TREE)).toBeNull();
  });

  it('root URL /blog/ → 檢查 index.html', () => {
    expect(checkTargetExists('/blog/', TREE)).toBeNull();
  });

  it('nested dir URL → null', () => {
    expect(checkTargetExists('/blog/nested/', TREE)).toBeNull();
  });

  it('dir URL 不存在 → violation', () => {
    expect(checkTargetExists('/blog/missing/', TREE)).not.toBeNull();
  });

  it('file URL 不存在 → violation', () => {
    expect(checkTargetExists('/blog/missing.css', TREE)).not.toBeNull();
  });

  it('不是 /blog/ 開頭 → 回 violation（defense-in-depth）', () => {
    expect(checkTargetExists('/foo/', TREE)).not.toBeNull();
  });

  it('URL 含 query → 切掉後檢查', () => {
    expect(checkTargetExists('/blog/page/?q=1', TREE)).toBeNull();
  });

  it('URL 含 hash → 切掉後檢查', () => {
    expect(checkTargetExists('/blog/page/#top', TREE)).toBeNull();
  });
});
