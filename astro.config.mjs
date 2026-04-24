// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** @param {Date} date */
function formatDateParams(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  /** @param {Intl.DateTimeFormatPartTypes} t */
  const pick = (t) => {
    const part = parts.find((p) => p.type === t);
    if (!part) throw new Error(`formatDateParams: missing ${t}`);
    return part.value;
  };
  return { year: pick('year'), month: pick('month'), day: pick('day') };
}

/** @param {unknown} raw */
function parseFrontmatterDate(raw) {
  const s = String(raw).trim().replace(/^['"]|['"]$/g, '');
  const isoish = s.replace(' ', 'T');
  const hasTz = /[+-]\d{2}:?\d{2}$|Z$/.test(isoish);
  return new Date(hasTz ? isoish : `${isoish}+08:00`);
}

function buildLastmodMap() {
  const postsDir = 'src/content/posts';
  const map = new Map();
  for (const entry of readdirSync(postsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const mdPath = join(postsDir, entry.name, 'index.md');
    try {
      const content = readFileSync(mdPath, 'utf8');
      const m = content.match(/^---\n([\s\S]*?)\n---/);
      if (!m) continue;
      const dateMatch = m[1].match(/^date:\s*(.+)$/m);
      if (!dateMatch) continue;
      const date = parseFrontmatterDate(dateMatch[1]);
      const { year, month, day } = formatDateParams(date);
      const path = `/blog/${year}/${month}/${day}/${entry.name}/`;
      map.set(path, date.toISOString());
    } catch {}
  }
  return map;
}

const lastmodMap = buildLastmodMap();

export default defineConfig({
  site: 'https://bolaslien.github.io',
  base: '/blog',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400, 500, 700],
      styles: ['normal', 'italic'],
    },
  ],
  integrations: [
    sitemap({
      serialize(item) {
        const url = new URL(item.url);
        const lastmod = lastmodMap.get(url.pathname);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
});
