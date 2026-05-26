#!/usr/bin/env node
/**
 * generate-gh-pages-redirects.mjs
 *
 * Replaces every HTML file under dist/ with a minimal redirect page
 * that sends visitors to the equivalent URL on the new domain.
 *
 * Usage: node scripts/generate-gh-pages-redirects.mjs [distDir] [newBase]
 *   distDir  – path to built output (default: ./dist)
 *   newBase  – new site base URL   (default: https://bolaslien.com)
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const distDir = process.argv[2] ?? './dist';
const newBase = (process.argv[3] ?? 'https://bolaslien.com').replace(/\/$/, '');

function walkHtml(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

function redirectHtml(url) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${url}">
<link rel="canonical" href="${url}">
<title>Redirecting…</title>
</head>
<body>
<script>window.location.replace(${JSON.stringify(url)})</script>
</body>
</html>
`;
}

const files = walkHtml(distDir);
for (const file of files) {
  const rel = relative(distDir, file);
  const urlPath = rel === 'index.html' ? '/' : '/' + rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '/');
  writeFileSync(file, redirectHtml(newBase + urlPath));
}
console.log(`Replaced ${files.length} HTML files with redirects → ${newBase}`);
