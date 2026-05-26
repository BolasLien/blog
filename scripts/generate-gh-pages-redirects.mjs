#!/usr/bin/env node
/**
 * generate-gh-pages-redirects.mjs
 *
 * Replaces every HTML file under dist/ with a redirect page pointing to the
 * equivalent URL on the new domain. 404.html gets a special path-preserving
 * redirect so old GitHub Pages URLs (e.g. /blog/2021/09/01/slug/) land on
 * the correct page at the new domain instead of the 404 page.
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

// 404.html gets a path-preserving redirect so old post URLs land correctly.
// e.g. bolaslien.github.io/blog/2021/09/01/slug/ → bolaslien.com/blog/2021/09/01/slug/
const notFoundHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<script>window.location.replace(${JSON.stringify(newBase)} + window.location.pathname + window.location.search + window.location.hash)</script>
</head>
<body>
</body>
</html>
`;

const files = walkHtml(distDir);
let count = 0;
for (const file of files) {
  const rel = relative(distDir, file);
  if (rel === '404.html') {
    writeFileSync(file, notFoundHtml);
  } else {
    const urlPath = rel === 'index.html' ? '/' : '/' + rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '/');
    writeFileSync(file, redirectHtml(newBase + urlPath));
  }
  count++;
}
console.log(`Replaced ${files.length} HTML files with redirects → ${newBase}`);
