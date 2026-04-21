#!/bin/bash
# Capture Hexo pre-migration baseline across 4 URLs.
# Uses gstack browse ($B js) for metrics, restarts browse between URLs to avoid cache.
# Re-run post-migration with OUT path changed to produce astro-post-migration.json for diff.
set -eu

B=~/.claude/skills/gstack/browse/dist/browse
OUT=${OUT:-docs/migration-baselines/hexo-pre-migration.json}

URLS=(
  "homepage|https://bolaslien.github.io/blog/"
  "long-post|https://bolaslien.github.io/blog/2022/06/02/js-closure/"
  "tag-page|https://bolaslien.github.io/blog/tags/javascript/"
  "about|https://bolaslien.github.io/blog/about/"
)

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

JS_METRICS='
(() => {
  const n = performance.getEntriesByType("navigation")[0];
  const paints = performance.getEntriesByType("paint");
  const fcp = paints.find(p => p.name === "first-contentful-paint");
  const fp = paints.find(p => p.name === "first-paint");
  const r = performance.getEntriesByType("resource");
  const js = r.filter(x => x.initiatorType === "script");
  const css = r.filter(x => x.initiatorType === "link" || x.initiatorType === "css");
  const imgs = r.filter(x => x.initiatorType === "img");
  const fonts = r.filter(x => /font|\.woff|\.ttf|\.otf/i.test(x.name) || x.initiatorType === "font");
  const top = r.map(x => ({
    name: x.name.split("/").pop().split("?")[0].slice(0,60),
    type: x.initiatorType,
    size: x.transferSize || 0,
    duration: Math.round(x.duration)
  })).sort((a,b) => b.duration - a.duration).slice(0,10);
  return JSON.stringify({
    ttfb_ms: Math.round(n.responseStart - n.requestStart),
    dom_interactive_ms: Math.round(n.domInteractive),
    dom_complete_ms: Math.round(n.domComplete),
    load_event_ms: Math.round(n.loadEventEnd),
    encoded_body_bytes: n.encodedBodySize,
    transfer_size_bytes: n.transferSize,
    fp_ms: fp ? Math.round(fp.startTime) : null,
    fcp_ms: fcp ? Math.round(fcp.startTime) : null,
    total_requests: r.length,
    total_transfer_bytes: r.reduce((s,e) => s + (e.transferSize || 0), 0),
    js_count: js.length,
    js_bytes: js.reduce((s,e) => s + (e.transferSize || 0), 0),
    css_count: css.length,
    css_bytes: css.reduce((s,e) => s + (e.transferSize || 0), 0),
    img_count: imgs.length,
    img_bytes: imgs.reduce((s,e) => s + (e.transferSize || 0), 0),
    font_count: fonts.length,
    font_bytes: fonts.reduce((s,e) => s + (e.transferSize || 0), 0),
    top_resources: top
  });
})()
'

{
  echo "{"
  echo "  \"label\": \"hexo-pre-migration\","
  echo "  \"timestamp\": \"$TIMESTAMP\","
  echo "  \"branch\": \"master\","
  echo "  \"note\": \"Measured via gstack browse. Browse restarted between URLs to approximate cold-cache load.\","
  echo "  \"pages\": {"
} > "$OUT"

first=1
for entry in "${URLS[@]}"; do
  IFS='|' read -r key url <<< "$entry"
  echo "=== $key ==="

  # Restart browse to clear cache between URLs
  $B restart >/dev/null 2>&1 || true
  sleep 1

  $B goto "$url" >/dev/null 2>&1
  sleep 3

  DATA=$($B js "$JS_METRICS" 2>/dev/null | tail -1)
  if [ -z "$DATA" ]; then
    echo "  WARN: empty metrics for $url"
    DATA='{}'
  fi
  echo "  $DATA" | head -c 200
  echo ''

  if [ $first -eq 1 ]; then
    first=0
  else
    echo "," >> "$OUT"
  fi
  {
    echo -n "    \"$key\": {"
    echo -n "\"url\": \"$url\", "
    echo -n "\"metrics\": $DATA"
    echo -n "}"
  } >> "$OUT"
done

{
  echo ""
  echo "  }"
  echo "}"
} >> "$OUT"

echo "Wrote $OUT"
