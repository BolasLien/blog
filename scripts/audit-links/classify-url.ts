export type UrlCategory = 'external' | 'anchor' | 'internal' | 'data';

export function classifyUrl(url: string): UrlCategory {
  if (url.startsWith('data:')) return 'data';
  if (url === '' || url.startsWith('#')) return 'anchor';
  if (url.startsWith('//')) return 'external';
  if (/^[a-z][a-z0-9+\-.]*:/i.test(url)) return 'external';
  if (url.startsWith('/')) return 'internal';
  return 'internal';
}
