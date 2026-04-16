export interface DateParams {
  year: string;
  month: string;
  day: string;
}

/**
 * 抽出 Date 在台北時區下的 year/month/day（均為字串、月日補 0）。
 * 用 Intl.DateTimeFormat 避開 process TZ 變動造成的漂移。
 */
export function formatDateParams(date: Date): DateParams {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const pick = (type: 'year' | 'month' | 'day') => {
    const part = parts.find((p) => p.type === type);
    if (!part) throw new Error(`formatDateParams: 找不到 part ${type}`);
    return part.value;
  };

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
  };
}
