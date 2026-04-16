import { describe, it, expect } from 'vitest';
import { parseFrontmatterDate, formatTaipeiIso, formatDateParams } from './dates';

describe('formatDateParams', () => {
  it('台北時間 00:00 不會倒退到前一天', () => {
    const date = new Date('2020-08-28T00:00:00+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });

  it('台北時間 23:59 不會跳到隔天', () => {
    const date = new Date('2020-08-28T23:59:59+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });

  it('跨年邊界（台北時間）', () => {
    const date = new Date('2021-01-01T00:00:00+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2021', month: '01', day: '01',
    });
  });

  it('跨月邊界', () => {
    const date = new Date('2020-08-31T23:59:00+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '08', day: '31',
    });
  });

  it('單位數月日補 0', () => {
    const date = new Date('2020-03-05T12:00:00+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '03', day: '05',
    });
  });

  it('UTC 環境下建構的 Date（模擬 CI runner）也能抽對 Taipei 日期', () => {
    // 同一個絕對時間點：UTC 15:00 = Taipei 23:00，日期還是同一天
    const date = new Date('2020-08-28T15:00:00Z');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });
});

describe('parseFrontmatterDate', () => {
  it('gray-matter 解出的 UTC Date 會被重解讀成 Taipei 牆上時間', () => {
    const yamlParsed = new Date('2020-08-28T16:03:47.000Z');
    const result = parseFrontmatterDate(yamlParsed);
    expect(formatDateParams(result)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });

  it('quoted string 無 TZ 時視為 Taipei 時間', () => {
    const result = parseFrontmatterDate('2020-08-28 13:55:28');
    expect(formatDateParams(result)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });

  it('quoted string 有 +08:00 offset 時照原樣解析', () => {
    const result = parseFrontmatterDate('2020-08-28T23:59:00+08:00');
    expect(formatDateParams(result)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });
});

describe('formatTaipeiIso', () => {
  it('已經是 Taipei wall-clock 的 Date 會輸出 +08:00 ISO', () => {
    const date = parseFrontmatterDate(new Date('2021-07-05T15:41:56.000Z'));
    expect(formatTaipeiIso(date)).toBe('2021-07-05T15:41:56+08:00');
  });

  it('午夜邊界不會漂移', () => {
    const date = parseFrontmatterDate(new Date('2020-08-28T00:00:00.000Z'));
    expect(formatTaipeiIso(date)).toBe('2020-08-28T00:00:00+08:00');
  });

  it('往返 round-trip：parseFrontmatterDate → formatTaipeiIso → parseFrontmatterDate 同一個 instant', () => {
    const original = new Date('2022-01-15T06:30:00.000Z');
    const parsed1 = parseFrontmatterDate(original);
    const iso = formatTaipeiIso(parsed1);
    const parsed2 = parseFrontmatterDate(iso);
    expect(parsed2.getTime()).toBe(parsed1.getTime());
  });
});
