import { describe, it, expect } from 'vitest';
import { checkGa4 } from '../../verify-ga4/check-ga4';

const ID = 'G-TEST123';
const LOADER = `<script async src="https://www.googletagmanager.com/gtag/js?id=${ID}"></script>`;
const CONFIG = `<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${ID}');
</script>`;

const page = (head: string) => `<!DOCTYPE html><html><head>${head}</head><body></body></html>`;

describe('checkGa4', () => {
  it('一般 async gtag.js + inline config → 沒有問題', () => {
    expect(checkGa4(page(LOADER + CONFIG), ID)).toEqual([]);
  });

  it('script 交給 Partytown → 報錯', () => {
    const html = page(
      LOADER.replace('<script ', '<script type="text/partytown" ') +
        CONFIG.replace('<script>', '<script type="text/partytown">'),
    );
    const problems = checkGa4(html, ID);
    expect(problems.some((p) => p.includes('partytown'))).toBe(true);
    expect(problems.some((p) => p.includes('loader 的 type'))).toBe(true);
    expect(problems.some((p) => p.includes('config script 的 type'))).toBe(true);
  });

  it('缺 loader → 報錯', () => {
    expect(checkGa4(page(CONFIG), ID)).toContain('gtag.js loader 應出現 1 次，實際 0 次');
  });

  it('loader 沒有 async → 報錯', () => {
    const html = page(LOADER.replace('async ', '') + CONFIG);
    expect(checkGa4(html, ID)).toContain('gtag.js loader 缺少 async');
  });

  it('缺 config → 報錯', () => {
    expect(checkGa4(page(LOADER), ID)).toContain(`gtag('config', '${ID}') 應出現 1 次，實際 0 次`);
  });

  it('Measurement ID 不同 → 報錯', () => {
    expect(checkGa4(page(LOADER + CONFIG), 'G-OTHER')).toHaveLength(2);
  });
});
