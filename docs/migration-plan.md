# Astro 遷移計劃

從 Hexo (Icarus theme) 遷移到 AstroPaper。

---

## 目標與原則

1. **URL 完整保留** — 現有所有文章 URL 在遷移後仍可訪問(中文檔名 7 篇透過 redirect 到英文 slug)
2. **不影響 GA4** — `G-SG50KRG586` 繼續收 pageview,含 view transitions soft navigation
3. **不影響 SEO** — sitemap / canonical / OG / JSON-LD / robots.txt 全部延續或升級
4. **視覺重做** — 不沿用 Icarus 風格,採 AstroPaper 極簡風(配色待調整)
5. **零 downtime 切換** — 保留 `gh-pages-hexo-backup` branch,有問題一行指令 revert

---

## 決策紀錄

| # | 決策 | 日期 |
|---|------|------|
| 1 | Starter 採 AstroPaper(satnaing/astro-paper) | 2026-04-13 |
| 2 | 新外觀,不沿用 Icarus 配色 | 2026-04-13 |
| 3 | 配色細節列為後續調整項,不在首次上線範圍 | 2026-04-13 |
| 4 | 砍 Insight search、recent posts/archives widget、progressbar、gallery、archives 頁面 | 2026-04-13 |
| 5 | 採單欄無側欄佈局,profile/社群連結移至 `/about` | 2026-04-13 |
| 6 | 7 篇中文檔名改英文 slug + Astro `redirects` 設定 | 2026-04-14 |
| 7 | 備份策略:切換前建立 `gh-pages-hexo-backup` branch | 2026-04-14 |
| 8 | 部署改 GitHub Actions workflow,淘汰 `hexo-deployer-git` | 2026-04-14 |
| 9 | 切換後人工驗證 GA4 Realtime + 發一篇測試文章完整走流程 | 2026-04-14 |

---

## 現況盤點

### 文章與結構
- 62 篇 markdown(`source/_posts/*.md`),分類:筆記 38、心得分享 10、教學實作 9、其他 5
- 7 篇中文檔名(需改 slug + redirect)
- 2 個 post asset folder(`ai-frontend-workflow/` 空、`refactor-with-ai-agents/` 含 5 張 PNG)
- 26 處 image ref,其中 21 張 imgur 外連、5 張 `refactor-with-ai-agents/` 內部相對路徑

### 現有 URL 結構
- Base: `https://bolaslien.github.io/blog/`
- Permalink: `/YYYY/MM/DD/<title>/`(trailing slash)
- 中文標題 URL 編碼範例: `/2020/08/19/%E7%82%BA%E4%BB%80%E9%BA%BC...`

### Hexo 語法需清理
- `<!-- more -->` × 59 處
- ` ```javascript=` 類非標準 fence × 8 檔
- `{% codeblock lang:xxx %}...{% endcodeblock %}` 巨集 × 4 檔

### 其他現況
- GA4 tracking ID: `G-SG50KRG586`
- `sitemap.xml` 排除 `archives/**`, `categories/**`, `tags/**`
- 無 RSS feed(未安裝 `hexo-generator-feed`)
- 部署:`hexo-deployer-git` 推到 `gh-pages` branch

---

## 7 篇中文檔名 → 英文 slug 對照表

| 原 URL (encoded 後) | 英文 slug | 原始日期 |
|---|---|---|
| `/2020/04/29/如何做一個Line機器人/` | `how-to-build-a-line-bot` | 2020-04-29 |
| `/2020/08/18/實作JWT機制的登入驗證/` | `jwt-login-implementation` | 2020-08-18 |
| `/2020/08/19/為什麼我不繼續做聖騎士PM/` | `why-i-stopped-being-paladin-pm` | 2020-08-19 |
| `/2020/08/28/架設Hexo部落格/` | `setup-hexo-blog` | 2020-08-28 |
| `/2020/11/02/[HTML]把header做成template/` | `html-reusable-header-template` | 2020-11-02 |
| `/2020/XX/XX/Vue元件溝通-子傳父-emit/` | `vue-emit-child-to-parent` | 待 front-matter 確認 |
| `/2020/XX/XX/putty使用ssh登入遠端無須密碼/` | `putty-ssh-passwordless-login` | 待 front-matter 確認 |

> 後兩筆日期在執行 Phase 2 轉換腳本時會從 front-matter 自動讀出,上面留白不影響實作。

每一筆會透過 `astro.config.ts` 的 `redirects` map 自動產出靜態 meta-refresh 頁面,舊 URL 仍可訪問並 canonical 指向新 URL(Google soft 301,PageRank 會流過去,視窗約 2–4 週)。

---

## 技術方案

### A. URL 保留:改 `getPath.ts`

AstroPaper 預設輸出 `/posts/[slug]/`,需改為 `/YYYY/MM/DD/[slug]/`(無 `/posts/` 前綴)。

**需改檔案:**
- `src/utils/getPath.ts` — 接收 `pubDatetime` 參數,組出 `/YYYY/MM/DD/slug` 格式
- `src/pages/posts/[...slug]/index.astro` — 傳入 `post.data.pubDatetime` 給 `getPath()`

**自動 cascade(不用改):** RSS (`rss.xml.ts`)、sitemap (`@astrojs/sitemap`)、prev/next (`PostDetails.astro`)、card 列表 (`Card.astro`)、canonical URL(`Layout.astro` 從 `Astro.url.pathname` 自動推)。

> 註:AstroPaper 預設把 post 頁面放在 `/posts/[...slug]/`,為了完全 match 舊 URL 不含 `/posts/` 前綴,需要把 `src/pages/posts/` 資料夾重命名或移到 `src/pages/[...slug]/`。執行時會確認此結構調整對 tags/archives 頁面的影響,必要時以 dynamic route 實作。

### B. Base path `/blog`

`astro.config.ts`:
```ts
export default defineConfig({
  site: "https://bolaslien.github.io",   // 不含 /blog
  base: "/blog",                          // 所有路由自動 prefix
  trailingSlash: "always",
  integrations: [sitemap({ filter: p => !p.includes("/tags") && !p.includes("/archives") })],
  redirects: { /* 7 筆中文 slug → 英文 slug */ },
});
```

`src/config.ts` 對應更新:
```ts
export const SITE = {
  website: "https://bolaslien.github.io/blog/",
  // ...
};
```

### C. GA4 整合

`src/layouts/Layout.astro` `<head>` 內加:
```astro
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SG50KRG586"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-SG50KRG586');
</script>
```

View Transitions soft navigation 補:
```astro
<script>
  document.addEventListener('astro:after-swap', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_path: window.location.pathname,
        page_location: window.location.href,
      });
    }
  });
</script>
```

**驗收:**切換後第一時間開 GA4 Realtime,手動點幾篇文章確認事件進來。

### D. Redirects 設定

7 筆中文 URL 在 `astro.config.ts`:
```ts
redirects: {
  '/2020/04/29/如何做一個Line機器人/': '/2020/04/29/how-to-build-a-line-bot/',
  '/2020/08/18/實作JWT機制的登入驗證/': '/2020/08/18/jwt-login-implementation/',
  '/2020/08/19/為什麼我不繼續做聖騎士PM/': '/2020/08/19/why-i-stopped-being-paladin-pm/',
  '/2020/08/28/架設Hexo部落格/': '/2020/08/28/setup-hexo-blog/',
  '/2020/11/02/[HTML]把header做成template/': '/2020/11/02/html-reusable-header-template/',
  // Vue、putty 兩筆執行時依 front-matter 日期補
}
```

Astro 會在 build 時於每個舊 URL 產出 `index.html`,包含:
- `<meta http-equiv="refresh" content="0;url=/blog/新路徑/">`
- `<link rel="canonical" href="/blog/新路徑/">`

Google 判讀為 soft 301,PageRank 轉移。

### E. 內容轉換腳本

寫一支 Node 腳本(`scripts/migrate-posts.mjs`)一次處理 62 篇:

**Front-matter 轉換:**
- `title` → `title`
- `date: 2020-08-19 13:42:11` → `pubDatetime: 2020-08-19T05:42:11Z`(轉 UTC)
- `updated` → `modDatetime`
- `tags: [...]` + `categories: [...]` → `tags: [...]`(合併去重)
- `categories: 筆記` → 加進 `tags`
- 缺 `description` → 從內文第一段取 100 字以內
- 補 `author: "Bolas Lien"`
- 7 篇中文檔名補 `slug: "英文-slug"` 欄位

**內文清理:**
- 刪 `<!-- more -->`(全局)
- ` ```javascript=` → ` ```javascript`(去掉結尾 `=`)
- `{% codeblock lang:xxx %}...{% endcodeblock %}` → 標準 fence
- `ai-frontend-development-flow` 等已測試過的 post 可略過

**圖片處理:**
- 21 張 imgur 外連:不動
- 5 張 `refactor-with-ai-agents/*.png`:複製到 `public/images/refactor-with-ai-agents/`,內文 `![alt](image.png)` → `![alt](/blog/images/refactor-with-ai-agents/image.png)`

**輸出:**寫到 `astro-paper/src/data/blog/*.md`。

### F. 部署 workflow

新增 `.github/workflows/deploy.yml`(用 `withastro/action`):
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

> 部署目標從「push 到 `gh-pages` branch」改為「GitHub Pages 直接吃 Actions artifact」,設定在 repo Settings → Pages → Source: GitHub Actions。

---

## 遷移執行步驟

### Phase 0:備份與環境準備 ⏱ ~15 min
- [ ] `git branch gh-pages-hexo-backup origin/gh-pages`
- [ ] `git push origin gh-pages-hexo-backup`
- [ ] 匯出現行 `public/sitemap.xml` 存證
- [ ] 在 Google Search Console 記錄當前 coverage / impressions(後續比對用)
- [ ] 關閉 Preview dev servers(astro-paper、astro-micro)

### Phase 1:建立新專案骨架 ⏱ ~30 min
- [ ] 以 AstroPaper 為基底,在 `/` 建立 `astro/` 子目錄或 fork 成獨立 repo(見決策點)
- [ ] 複製預覽階段的 AstroPaper 內容
- [ ] 套用 `base: "/blog"`、`trailingSlash: "always"`、`SITE.website`
- [ ] 修改 `src/utils/getPath.ts` 加入 `pubDatetime` 參數
- [ ] 調整 post route 從 `/posts/[...slug]/` 改為 `/[...slug]/`(或保持目錄結構,改 `getStaticPaths` 輸出)
- [ ] `pnpm build` 確認空殼能 build,無 error

**決策點:** 新專案要直接覆蓋現有 repo(要刪掉 Hexo 檔案),還是放在 `astro/` 子目錄平行共存一段時間?建議直接覆蓋,但先跑完 Phase 2–3 再砍 Hexo 檔案。

### Phase 2:內容遷移 ⏱ ~1 hr
- [ ] 撰寫 `scripts/migrate-posts.mjs`(front-matter + 內文清理 + slug 映射)
- [ ] 跑腳本產出 62 篇 `.md` 到 `src/data/blog/`
- [ ] 拷貝 5 張圖到 `public/images/refactor-with-ai-agents/`
- [ ] `pnpm build` 確認全部 62 篇通過 schema 驗證、無 markdown render error
- [ ] 本地 `pnpm preview` 目視抽檢 5–10 篇(中文檔名、有 code block 的、有圖的、心得分享長文)

### Phase 3:URL 驗收 ⏱ ~30 min
- [ ] 寫 `scripts/verify-urls.mjs`:讀 `public/sitemap.xml`(從 `gh-pages-hexo-backup` checkout),對照 `dist/` 輸出的每一個 URL 是否都存在(含 redirect 頁面)
- [ ] 跑驗收腳本,列出任何 missing / mismatched URL
- [ ] 修到 100% 命中(含 7 筆 redirect)

### Phase 4:GA / SEO 植入 ⏱ ~30 min
- [ ] `src/layouts/Layout.astro` 加 GA4 gtag 片段
- [ ] 加 `astro:after-swap` listener
- [ ] 檢查 `SITE.ogImage`、`SITE.desc`、`SITE.author` 更新為現有內容
- [ ] 確認 sitemap filter 排除 tags/categories(match 原 Hexo 設定)
- [ ] build 後檢查 `dist/sitemap-index.xml` 內容符合預期

### Phase 5:部署 workflow ⏱ ~30 min
- [ ] 新增 `.github/workflows/deploy.yml`
- [ ] repo Settings → Pages → Source 改為 GitHub Actions
- [ ] 停用 / 刪除舊的 `hexo-deployer-git` 相關腳本(`package.json` scripts、`.gitignore`、`_config.yml` 的 `deploy:` 段)
- [ ] 先推到一個 feature branch 跑一次 dry-run workflow,確認 artifact 產出正常

### Phase 6:切換上線 ⏱ ~20 min
- [ ] 確認 `gh-pages-hexo-backup` 已在 remote
- [ ] merge PR 到 `master`(或你的預設分支),觸發 Actions 部署
- [ ] 等 deploy 綠燈(約 2–5 分鐘)
- [ ] 開 https://bolaslien.github.io/blog/ 確認首頁能載入
- [ ] 隨機點 10 篇文章(含中文 slug redirect 的 2 篇)確認無 404

### Phase 7:遷移後驗收 ⏱ 切換後 24 小時內
- [ ] GA4 Realtime 確認 pageview 有進(手動點文章 → 等 30 秒 → 看 Realtime)
- [ ] 發一篇測試草稿走完「寫作 → build → deploy」完整流程
- [ ] Google Search Console 提交新 `sitemap.xml`
- [ ] 從 GSC 抽 5 個高流量頁面,URL Inspection 確認 canonical、indexable 狀態
- [ ] 檢查 `robots.txt` 內容正確
- [ ] 社群貼文抽一則手動測試 OG card(Twitter Card Validator、FB Debugger)

### Phase 8:兩週觀察期
- [ ] D+3:GSC Coverage 報告比對,確認無新 404
- [ ] D+7:GA4 流量比對前一週,落差超過 20% 需警戒
- [ ] D+14:7 筆 redirect 頁面檢查 GSC 是否已開始將權重轉移到新 URL
- [ ] 兩週穩定後,可刪除 `gh-pages-hexo-backup` branch(或保留一個月保險)

---

## 驗收 Checklist(切換前必過)

### URL
- [ ] 舊 sitemap 所有 URL 在 `dist/` 都有對應檔案(含 7 筆 redirect 頁)
- [ ] 中文 slug redirect 頁面含 `<meta http-equiv="refresh">` 跟 canonical
- [ ] 所有 URL 結尾有 trailing slash
- [ ] canonical URL 指向 `https://bolaslien.github.io/blog/...` 而非根網域

### GA / SEO
- [ ] 每一頁 `<head>` 都有 GA4 gtag 片段
- [ ] sitemap.xml 內 URL 全部 200,無 404
- [ ] OG image、Twitter Card 在 debugger 中正確渲染
- [ ] JSON-LD BlogPosting 在 `view-source:` 中可見
- [ ] robots.txt 不阻擋正式路由

### 內容
- [ ] 62 篇全部通過 AstroPaper content schema
- [ ] 無 `<!-- more -->` 殘留
- [ ] 無 ` ```lang=` 殘留
- [ ] 無 `{% codeblock %}` 殘留
- [ ] 5 張本地圖片在新位置可載入

### 部署
- [ ] GitHub Actions workflow 至少跑過一次綠燈
- [ ] `gh-pages-hexo-backup` branch 存在 remote
- [ ] Pages settings source 為 Actions

---

## 風險與回滾

### 風險清單
| 風險 | 可能性 | 影響 | 緩解 |
|---|---|---|---|
| URL mismatch 漏掉某些文章 | 中 | 高 | Phase 3 自動化驗收腳本 |
| GA4 漏抓 view transitions pageview | 中 | 中 | `astro:after-swap` listener + 切換後 Realtime 人工驗證 |
| 中文 slug redirect Google 不認 | 低 | 中 | 兩週觀察期,必要時補 canonical 加強訊號 |
| AstroPaper 改 `getPath` 破壞其他路由 | 低 | 中 | Phase 3 全站 URL 掃描、本地 `pnpm build` + preview 驗證 |
| GitHub Actions 部署失敗 | 低 | 低 | backup branch 一行 revert |
| 舊站還有外部連結指向沒在 sitemap 的 URL | 低 | 低 | GSC coverage 報告 D+7 監測 |

### 回滾策略
切換後若在 24 小時內發現嚴重問題:
```bash
# 回滾 GitHub Pages source 為 branch
# 在 repo Settings → Pages → Source 改回 Branch: gh-pages-hexo-backup
```
這樣會立即恢復 Hexo 版本網站,時間成本 < 5 分鐘,無數據損失。

---

## 遷移後待辦(不在首次上線範圍)

- 🎨 **配色調整** — 依個人偏好微調 AstroPaper tailwind theme tokens
- 📝 **重寫 `/write` `/publish` `/seo` skills** — 對齊新架構(skills 目前暫時閒置)
- 🔍 **考慮啟用 Pagefind 搜尋** — AstroPaper 內建,零 runtime JS,如果兩週觀察後覺得需要再加回
- 📊 **Web Vitals 量測** — 切換後用 PageSpeed Insights 跑首頁 + 文章頁,跟 Hexo 時期對照(預期 LCP 會顯著改善)
- 🗂️ **分類頁重新設計** — 三大類(筆記/心得分享/教學實作)目前在 Hexo 有獨立頁,AstroPaper 需確認是否改用 tag filter 實作

---

## 參考

- AstroPaper repo: https://github.com/satnaing/astro-paper
- Astro redirects 文件: https://docs.astro.build/en/reference/configuration-reference/#redirects
- Astro base path: https://docs.astro.build/en/reference/configuration-reference/#base
- GA4 + Astro View Transitions 官方指南:參考 `astro:after-swap` 事件
