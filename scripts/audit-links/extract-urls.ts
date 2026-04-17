import { parse } from 'node-html-parser';

export interface ExtractedUrl {
  url: string;
  source: 'a' | 'img' | 'link' | 'script';
}

export function extractUrls(html: string): ExtractedUrl[] {
  const root = parse(html);
  const result: ExtractedUrl[] = [];

  for (const el of root.querySelectorAll('a[href]')) {
    result.push({ url: el.getAttribute('href')!, source: 'a' });
  }
  for (const el of root.querySelectorAll('img[src]')) {
    result.push({ url: el.getAttribute('src')!, source: 'img' });
  }
  for (const el of root.querySelectorAll('link[href]')) {
    result.push({ url: el.getAttribute('href')!, source: 'link' });
  }
  for (const el of root.querySelectorAll('script[src]')) {
    result.push({ url: el.getAttribute('src')!, source: 'script' });
  }

  return result;
}
