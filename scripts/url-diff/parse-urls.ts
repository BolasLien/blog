export function normalizeUrl(url: string): string {
  return url.trim().split('?')[0].split('#')[0];
}

export function parseUrlLines(text: string): Set<string> {
  const set = new Set<string>();
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    set.add(normalizeUrl(trimmed));
  }
  return set;
}
