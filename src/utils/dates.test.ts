import { describe, it, expect } from 'vitest';
import { formatDateParams } from './dates';

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
