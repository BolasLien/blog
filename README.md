# blog

Bolas 的技術 blog（Astro），網址 https://bolaslien.github.io/blog/

- 文章：`src/content/posts/`
- 本機開發：`npm run dev`
- 建置：`npm run build`（含 GA4 檢查 `verify:ga4`）

## 部署

推 `master` 就會由 `.github/workflows/deploy.yml` 部署到 GitHub Pages（`npm run deploy` ＝ `git push origin master`）。

2026-10-31 起 bolaslien.com 改由另一個 repo（bolaslien-site）負責，本 repo 已和 Cloudflare 斷開，`release` 分支與 `wrangler.jsonc` 不再使用。
