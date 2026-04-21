#!/bin/bash
# Compare Hexo baseline vs Astro post-migration metrics side-by-side.
set -eu

HEXO=docs/migration-baselines/hexo-pre-migration.json
ASTRO=docs/migration-baselines/astro-post-migration.json

[ -f "$HEXO" ] || { echo "missing $HEXO"; exit 1; }
[ -f "$ASTRO" ] || { echo "missing $ASTRO"; exit 1; }

jq -r --slurpfile a "$ASTRO" '
  .pages | to_entries[] |
  .key as $k |
  .value.metrics as $h |
  $a[0].pages[$k].metrics as $x |
  [
    "=== \($k) ===",
    "  FCP:          \($h.fcp_ms)ms → \($x.fcp_ms)ms  (\((($x.fcp_ms - $h.fcp_ms) * 100 / $h.fcp_ms) | round)%)",
    "  DOM Complete: \($h.dom_complete_ms)ms → \($x.dom_complete_ms)ms  (\((($x.dom_complete_ms - $h.dom_complete_ms) * 100 / $h.dom_complete_ms) | round)%)",
    "  Load:         \($h.load_event_ms)ms → \($x.load_event_ms)ms  (\((($x.load_event_ms - $h.load_event_ms) * 100 / $h.load_event_ms) | round)%)",
    "  Requests:     \($h.total_requests) → \($x.total_requests)",
    "  Total:        \(($h.total_transfer_bytes/1024)|floor)KB → \(($x.total_transfer_bytes/1024)|floor)KB",
    "  JS:           \(($h.js_bytes/1024)|floor)KB → \(($x.js_bytes/1024)|floor)KB",
    "  CSS:          \(($h.css_bytes/1024)|floor)KB → \(($x.css_bytes/1024)|floor)KB",
    ""
  ] | .[]
' "$HEXO"
