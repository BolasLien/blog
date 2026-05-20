import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { checkTargetExists } from '../../audit-links/check-target-exists';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TREE = resolve(__dirname, 'fixtures/tree');

describe('checkTargetExists', () => {
  it('dir URL 存在（/page/）→ null', () => {
    expect(checkTargetExists('/page/', TREE)).toBeNull();
  });

  it('file URL 存在（/style.css）→ null', () => {
    expect(checkTargetExists('/style.css', TREE)).toBeNull();
  });

  it('root URL / → 檢查 index.html', () => {
    expect(checkTargetExists('/', TREE)).toBeNull();
  });

  it('nested dir URL → null', () => {
    expect(checkTargetExists('/nested/', TREE)).toBeNull();
  });

  it('dir URL 不存在 → violation', () => {
    expect(checkTargetExists('/missing/', TREE)).not.toBeNull();
  });

  it('file URL 不存在 → violation', () => {
    expect(checkTargetExists('/missing.css', TREE)).not.toBeNull();
  });

  it('URL 含 query → 切掉後檢查', () => {
    expect(checkTargetExists('/page/?q=1', TREE)).toBeNull();
  });

  it('URL 含 hash → 切掉後檢查', () => {
    expect(checkTargetExists('/page/#top', TREE)).toBeNull();
  });
});

