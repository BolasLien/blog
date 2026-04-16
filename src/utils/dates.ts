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

/**
 * 把 gray-matter / YAML 解出的日期（可能是 Date 物件或字串）
 * 正規化成代表 Taipei wall-clock 的 Date 物件。
 */
export function parseFrontmatterDate(raw: unknown): Date {
  if (raw instanceof Date) {
    const y = raw.getUTCFullYear();
    const m = String(raw.getUTCMonth() + 1).padStart(2, '0');
    const d = String(raw.getUTCDate()).padStart(2, '0');
    const hh = String(raw.getUTCHours()).padStart(2, '0');
    const mm = String(raw.getUTCMinutes()).padStart(2, '0');
    const ss = String(raw.getUTCSeconds()).padStart(2, '0');
    return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}+08:00`);
  }
  const s = String(raw);
  const isoish = s.replace(' ', 'T');
  const hasTz = /[+-]\d{2}:?\d{2}$|Z$/.test(isoish);
  return new Date(hasTz ? isoish : `${isoish}+08:00`);
}

/**
 * 把 Date 序列化成帶 +08:00 offset 的 ISO string，例如
 * `2021-07-05T15:41:56+08:00`。
 */
export function formatTaipeiIso(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((p) => p.type === type);
    if (!part) throw new Error(`formatTaipeiIso: 找不到 part ${type}`);
    return part.value;
  };

  const year = pick('year');
  const month = pick('month');
  const day = pick('day');
  const rawHour = pick('hour');
  const hour = rawHour === '24' ? '00' : rawHour;
  const minute = pick('minute');
  const second = pick('second');
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`;
}
