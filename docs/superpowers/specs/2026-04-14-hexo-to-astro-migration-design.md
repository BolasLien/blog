# Hexo → Astro 遷移設計

- **日期**：2026-04-14
- **狀態**：P0 — 設計定案中
- **作者**：Bolas Lien（與 Claude 協作）

## 背景

目前 blog 是 Hexo 6 + Icarus theme，63 篇文章，部署在 GitHub Pages project site (`bolaslien.github.io/blog/`)。

實際痛點：
- **效能問題**：近三個 commit 都在修 LCP / font loading 補丁（`font-display: optional`、async Google Fonts）。治標不治本
- **部署流程**：`hexo-deployer-git` 從本地 push `gh-pages` branch，沒有 CI workflow，換電腦就要重設
- **Stack 冷門**：Icarus theme 基於 Inferno.js，社群小、升級難度高

Astro 對應這些痛點的結構性解法：
- 預設 zero-JS output（Islands Architecture）→ LCP / JS cost 結構性減少
- `astro:assets` 內建 image optimization
- Vite-based build，速度與 DX 提升
- 活躍的 Markdown-first 生態，適合 blog 場景

## 目標

1. 把 63 篇文章遷移到 Astro 6，內容無遺失
2. **56 篇英文 slug 文章** URL 完全保留（`/blog/:year/:month/:day/:slug/` 含 trailing slash）
3. 7 篇中文 slug 文章以定好的英文 slug 取代，**放棄舊 URL**
4. Deploy 改成 GitHub Actions 自動化，不再從本地 push
5. 解決 LCP / font loading 問題的根因（不靠補丁）

## 非目標

- 不重寫文章內容
- 不改寫歷史分類系統做學術分類（見決策 A）
- 不做 PoC（用 backup 保底，見決策 E）
- 不遷移到 user site `bolaslien.github.io`（維持 project site，避免更動 root URL）

## 已確認的設計決策

### A. 廢掉 frontmatter 的 `categories`，只用 `tags`

**理由**：Icarus navbar 只有 `Home / Archives / Tags / About`，sidebar widgets 也沒開 categories。Categories 在現行網站**實際上不是讀者導航入口**，只是 metadata。既然沒 expose，保留只增加 schema 複雜度。

**Category 值處理規則**：

| 原 category 值 | 處理 |
|---|---|
| 筆記 | 丟 |
| 心得分享 | 丟 |
| 技術心得 | 丟 |
| 觀點 | 丟 |
| 測試 | 丟（`cypress` tag 已足夠具體） |
| 前端技術 | 轉成 tag `前端技術` |
| 軟體開發 | 轉成 tag `軟體開發` |
| claude code | 轉成 tag `claude code` |

轉 tag 時若跟既有 tag 撞名，去重合併。

**多層分類 `[筆記, css]`**（`css-height.md`、`css-flexbox.md`）：
- 「筆記」直接丟
- 「css」加入 tags（若 tag 已有 `css` 則不重複）

### B. 7 篇中文 slug 的英文取代

| 原檔名 | 新 slug |
|---|---|
| `HTML-把header做成template.md` | `html-reusable-header-template` |
| `putty使用ssh登入遠端無須密碼.md` | `ssh-passwordless-login-with-putty` |
| `Vue元件溝通-子傳父-emit.md` | `vue-child-to-parent-emit` |
| `如何做一個Line機器人.md` | `build-a-line-bot` |
| `實作JWT機制的登入驗證.md` | `jwt-login-authentication` |
| `架設Hexo部落格.md` | `hexo-blog-setup-notes` |
| `為什麼我不繼續做聖騎士PM.md` | `leaving-game-industry-pm` |

這 7 篇原本的中文 URL（如 `/blog/2020/08/28/架設Hexo部落格/`）**放棄相容**，新 URL 為英文 slug。

### C. `hexo-blog-setup-notes.md` 內 hard-code URL

原文第 31 行的 `https://bolaslien.github.io/blog/img/logo.png` 改為 **co-located asset**：

- P1 時確認來源檔案（目前 Hexo 的 `source/img/logo.svg` 或 `source/img/logo.png`）
- 遷移腳本把檔案複製到 `src/content/posts/hexo-blog-setup-notes/logo.png`
- Markdown 改寫為 `![](./logo.png)`
- Build 時自動經 `astro:assets` 優化（responsive `srcset` + width/height）

### D. Archives / Categories / Tags 頁面

| 頁面 | 保留 | 說明 |
|---|---|---|
| `/tags/` + `/tags/[tag]/` | ✅ | 唯一導航入口 |
| `/archives/` | ❌ | Bolas 決定不留，避免跟 tags 功能重複 |
| `/categories/` | ❌ | navbar 沒、sidebar 沒，呼應決策 A |

**連帶影響**：
- Navbar 只剩 `Home / Tags / About`（原 Icarus 的 Archives 入口移除）
- Sidebar 不再有 archives widget
- 首頁仍然是全部文章按日期倒序列表，代替 archives 功能

### E. 不做 PoC，用 backup 保底

遷移前做完整 snapshot（包含 `public/` build 產物），放保留 branch。任一階段不滿意可以 rollback。

### F. URL 結構

- Base: `/blog`
- Post URL: `/blog/:year/:month/:day/:slug/`（trailing slash 保留）
- 從 Content Collection entry 的 `date` frontmatter 抽 year / month / day（補 0 到兩位）

### G. 技術棧（依 2026-04 web research 定案）

- **Astro 6**（Content Layer API 已於 5.0 stable；6.0 內建 Fonts API stable，直接處理 LCP 根因）
- TypeScript first
- **整合**：`@astrojs/sitemap`（對應現有 `hexo-generator-sitemap`）
- **Markdown 處理**：
    - 廢掉 `<!-- more -->`，用 frontmatter `description` 代替（你現有文章大多已有該欄位）
    - Content config 檔位置：`src/content.config.ts`（Astro 5 之後的新位置）
- **trailingSlash / format**：`trailingSlash: 'always'` + `build.format: 'directory'`（避免 GH Pages 對沒斜線 URL 做 301 redirect，研究指出最多 60% LCP penalty）
- **程式碼 highlight**：Shiki（Astro 預設）
    - Bundled themes 無 `atom-one-light`。先採用最接近的 `one-light`（bundled，零設定）
    - 若視覺差異不能接受，P3 階段再 import VS Code 的 `atom-one-light.json` custom theme
- **Fonts**：Astro 6 內建 Fonts API（`astro:fonts`），自動下載 self-host + 產生 fallback metric override + 加 preload。**不使用** `astro-font`、`@astrojs/fontsource` 等外部整合
    - ⚠ **具體載入哪些字體延到 P3 決定**（Bolas 要先釐清自己偏好）。由於 LCP 是本次遷移 #1 目標，這個決策 P3 進行時必須把 font 選擇當成 LCP-critical 看待，而非 cosmetic
- **Images**：`astro:assets` 處理 co-located post asset folder（`src/content/posts/<slug>/index.md` + 同目錄圖片，`![](./xxx.png)` 自動優化）
- **Analytics**：保留 GA4 `G-SG50KRG586`，用 `@astrojs/partytown` 包起來，把 `gtag.js` 丟到 Web Worker，避免 sync script 打擊 LCP（呼應 review issue 1.3）
- **RSS**：加 `@astrojs/rss`，在 `src/pages/rss.xml.ts` 產生 `/blog/rss.xml`（原 Hexo 沒 RSS，此次順手補上）
- **Deploy**：`withastro/action@v6` + `actions/deploy-pages`（Actions-based deploy，非 branch-based）
- **Base URL 地雷注意**：Markdown 內的絕對路徑 `/foo.png` **不會自動 prepend `/blog`**。所有圖片資源一律走 co-located relative path（`![](./xxx.png)`）或 `import.meta.env.BASE_URL` 拼接

## Frontmatter Schema（Zod）

檔案位置：`src/content.config.ts`（Astro 5+ 新位置，**不是** `src/content/config.ts`）

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    description: z.string(),   // 必填，取代 <!-- more --> 的 excerpt 角色
  }),
});

export const collections = { posts };
```

**注意**：
- 所有 categories 欄位在遷移腳本階段就移除，schema 完全不認 categories，打錯或忘刪會 build fail
- `description` 改為必填。遷移腳本檢查：若原 frontmatter 沒 description，從文章第一段抽出前 120 字補上，並 print warning 清單給 Bolas review

## 內容遷移規則

### 執行模式

遷移腳本 `scripts/migrate-posts.mjs` 設計為**純函式**（pure function）：

- **Source**：`source/_posts/*.md`（read-only，腳本絕不修改）
- **Output**：`src/content/posts/`（可覆寫，重跑腳本會完全重建該目錄）
- **Idempotent**：可任意重跑，output 只由 source + 腳本邏輯決定
- **`--dry-run` flag**：只 print unified diff 不寫檔，P2 第一次跑務必先用 dry-run 檢視 63 篇的 diff

### 遷移步驟

1. **讀入** `source/_posts/*.md`
2. **rename** 7 篇中文檔名（依 B 的 mapping）
3. **frontmatter normalize**：
   - **第一步：dump category distinct 值跟 YAML 型態**：腳本跑第一遍只讀不寫，print 所有 category 出現過的 distinct 值與 YAML 型態（單一字串 / inline array / block array / 多層 `[筆記, css]`），讓 Bolas 先 review 實際資料型態再定 transform 規則。避免猜錯
   - 刪 `categories` 欄位（依決策 A 的規則把其中部分轉成 tag）
   - 處理多層分類 `[筆記, css]`
   - **tag 大小寫統一成 lowercase**（`CSS` → `css`、`HTML` → `html`、`Express` → `express`）。tag 無語意 case，統一最乾淨
   - 去重 tags（lowercase 後做 exact match dedup）
4. **內文轉換**：
   - `{% codeblock [title] lang:xxx %}` / `{% endcodeblock %}` → 三引號 fenced code block（4 個檔案、20 處）
   - `javascript=` 這類非標準 fence language（HackMD `=` 是 line-numbers marker，Shiki 不認）統一 strip 尾端 `=`
   - `<!-- more -->` 整行刪掉（不再處理 excerpt，改靠 frontmatter `description`）
   - **description 補法（聰明抽取 + title 降級）**：若原 frontmatter 無 `description`，腳本先 strip markdown 語法（header `#`、bold、link、blockquote `>`、html comment）後抽 `<!-- more -->` 前第一段的前 120 字；若抽不到 60 字以上，降級用 `title` 作 description。全部補過的項目 print warning 清單
5. **資產搬移**：
   - 原本就有 post asset folder 的 2 篇（`my-ai-coding-journey/`、`refactor-with-ai-agents/`）整個搬到 `src/content/posts/<slug>/`
   - **imgur 外連圖下載**（依 review issue 4.2 決議）：掃 5 個有 imgur 的檔案（`build-a-line-bot`/15、`js-dev-tools`/2、`js-type-coercion`/1、`js-variables`/1、`git-cross-os-config-setting`/1，共 20 張），對每張：
     - HTTP GET 下載到 `src/content/posts/<slug>/imgur-<hash>.<ext>`（用 imgur 原 hash 當 filename，確保 idempotent）
     - Rewrite markdown `![](https://i.imgur.com/abc.png)` → `![](./imgur-abc.png)`
     - 404 → print warning 保留原 URL 不改（不中斷流程）
     - 加 `--skip-download` flag 給 dev 迭代時跳過
   - 上述 5 篇原本是 flat `.md`，下載後變成 `<slug>/index.md` 的 co-located 結構，納入 `astro:assets` 優化
6. **hard-code URL 修正**：`hexo-blog-setup-notes.md` 第 31 行（依決策 C）
7. **About page 搬移**：讀 `source/about/index.md`，將內容 inline 到 `src/pages/about.astro`（手動一次，不是 script 範疇，但列在這裡追蹤）
8. **輸出**到 `src/content/posts/`

## URL / Link Audit（P3 實作，P4 gate）

`scripts/audit-links.mjs` 是 URL 保留的最後防線，也是 Spec 目標 #2 的唯一驗證機制。具體檢查規則：

### Scope
跑完 `npm run build` 後，crawl `dist/**/*.html`，抽出所有以下屬性值：
- `<a href="...">`
- `<img src="...">`
- `<link href="...">`（rel stylesheet / preload / icon / sitemap / canonical）
- `<script src="...">`

### 檢查項目

1. **Base prefix**：所有以 `/` 開頭（非 `//`、非 `http(s)://`）的路徑必須以 `/blog/` 開頭。違反 = fail
2. **Trailing slash**：指向 page route 的連結（非 `.xml`/`.png`/`.jpg`/`.webp`/`.css`/`.js`/`.svg`/`.ico` 等副檔名）必須以 `/` 結尾。違反 = fail
3. **Target 存在性**：所有內部連結的目標檔案必須實際存在於 `dist/`。404 的內部連結 = fail
4. **Image resolve**：`<img src>` 相對路徑必須 resolve 到 `dist/` 內實際的 `astro:assets` 優化輸出（通常在 `dist/_astro/` 下）

### URL 保留 diff（P4 執行）

另外跑一次 `scripts/url-diff.mjs`：
- 輸入 A：舊 `public/**/index.html` 的 relative path 集合（P1 snapshot 的 tar.gz）
- 輸入 B：新 `dist/**/index.html` 的 relative path 集合
- 過濾掉 7 篇中文 slug（已放棄相容，依決策 B）
- 過濾掉新增的頁面（`/rss.xml`、`/404.html`、`/tags/[tag]/` 等）
- 剩下的差集必須是 **empty**，否則 fail

### 失敗處理

兩個腳本任一 fail → exit code 非 0。P4 不過 audit 就不進 P5（不切 GH Pages Source）。

## Tests

### `scripts/migrate-posts.mjs` 的 transform unit tests（P2 撰寫）

每條 transform rule 一個 fixture pair（`input.md` + `expected.md`），Vitest 跑 golden file 比對。測試檔放 `scripts/__tests__/migrate-posts/`。

要測的 rules：

| Rule | Fixture 要涵蓋 |
|---|---|
| category → tag transform | 決策 A 的 8 種 category 值各一例 + 撞名去重 + 多層 `[筆記, css]` |
| tag lowercase + dedup | `CSS` → `css`、大小寫 dedup、空 tags array |
| `{% codeblock %}` → fenced | 有 title / 無 title / 嵌套 / 多個連續 |
| `javascript=` strip | 結尾 `=`、中間不動、其他 HackMD 語法不誤傷 |
| `<!-- more -->` 移除 | 單行、前後空行、一篇沒有 |
| description 聰明抽取 | 首段為普通文字（正常抽）、首段為 `## header`（跳過 header）、首段為 `>` quote、抽不到 60 字 → 降級用 title |
| 7 篇中文檔名 rename | mapping 表每項一 case |
| hard-code URL fix | decision C 那一行精確 match |
| imgur URL rewrite (4.2) | `![](https://i.imgur.com/abc.png)` → `![](./imgur-abc.png)`、多張連續、非 imgur URL 不誤傷、404 時保留原 URL |

失敗任一 golden 比對 → exit 非 0。

### `formatDateParams` 時區 unit tests（P1 撰寫）

位置：`src/utils/dates.test.ts`。

要測的邊界：
- 台北時間 `2020-08-28 00:00:00+08:00` → year/month/day 是否為 2020-08-28（不能因為 UTC 倒退到 08-27）
- 台北時間 `2020-08-28 23:59:59+08:00` → 同樣是 2020-08-28
- 跨年：`2021-01-01 00:00:00+08:00` → 2021-01-01
- 跨月：`2020-08-31 23:59:00+08:00` → 2020-08-31
- 補 0：`2020-03-05` → `month: '03'`、`day: '05'`

### 時區驗證腳本（P1 執行，非 unit test）

`scripts/verify-dates.mjs`：
- 輸入 A：63 篇的 frontmatter date
- 輸入 B：舊 `public/` 實際出現過的 path（用 `find public -type d -regex '.*/[0-9]{4}/[0-9]{2}/[0-9]{2}'` 抽）
- 兩邊套用 `formatDateParams` 後比對，任一不一致 → print diff，exit 非 0

Unit test 負責邊界，驗證腳本負責真實資料一致性，兩個目的不同都要跑。

## Astro 專案結構

```
blog/                              # 現有 repo root
├─ src/
│  ├─ content.config.ts            # Content Collections schema（Astro 5+ 新位置）
│  ├─ content/
│  │  └─ posts/
│  │     ├─ [~51 篇 flat .md]              # 沒有內嵌資產的
│  │     ├─ my-ai-coding-journey/          # 原本就 co-located
│  │     │  ├─ index.md
│  │     │  └─ [assets]
│  │     ├─ refactor-with-ai-agents/       # 原本就 co-located
│  │     │  ├─ index.md
│  │     │  └─ [assets]
│  │     ├─ hexo-blog-setup-notes/         # 決策 C，co-locate logo
│  │     │  ├─ index.md
│  │     │  └─ logo.png
│  │     ├─ build-a-line-bot/              # 4.2: 下載 15 張 imgur
│  │     │  ├─ index.md
│  │     │  └─ imgur-*.png
│  │     ├─ js-dev-tools/                  # 4.2: 下載 2 張
│  │     │  ├─ index.md
│  │     │  └─ imgur-*.png
│  │     ├─ js-type-coercion/              # 4.2: 下載 1 張
│  │     │  ├─ index.md
│  │     │  └─ imgur-*.png
│  │     ├─ js-variables/                  # 4.2: 下載 1 張
│  │     │  ├─ index.md
│  │     │  └─ imgur-*.png
│  │     └─ git-cross-os-config-setting/   # 4.2: 下載 1 張
│  │        ├─ index.md
│  │        └─ imgur-*.png
│  ├─ layouts/
│  │  ├─ BaseLayout.astro
│  │  └─ PostLayout.astro
│  ├─ components/
│  │  ├─ Header.astro
│  │  ├─ Footer.astro
│  │  ├─ Sidebar.astro
│  │  ├─ Profile.astro
│  │  ├─ Toc.astro
│  │  └─ RecentPosts.astro
│  ├─ pages/
│  │  ├─ index.astro                        # 首頁（全部文章按日期倒序）
│  │  ├─ [year]/[month]/[day]/[slug].astro  # 文章頁
│  │  ├─ tags/index.astro                   # /tags/
│  │  ├─ tags/[tag].astro                   # /tags/<tag>/
│  │  ├─ about.astro                        # 從 source/about/index.md inline
│  │  ├─ rss.xml.ts                         # @astrojs/rss → /blog/rss.xml
│  │  └─ 404.astro
│  └─ styles/
├─ public/
│  └─ img/                          # 搬過來的靜態資源
├─ astro.config.mjs                 # base: '/blog', trailingSlash: 'always'
├─ tsconfig.json
├─ package.json                     # 全新（換掉 hexo 版本）
├─ .github/workflows/deploy.yml     # Build → Pages artifact → actions/deploy-pages
└─ scripts/
   └─ migrate-posts.mjs
```

## Routing

**動態路由**：`src/pages/[year]/[month]/[day]/[slug].astro`

```ts
// 偽代碼 —— 時區 / slug id 規則在 P1 以真實 Astro 6 行為驗證
export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map(post => ({
    params: formatDateParams(post.data.date, post.id),  // 時區策略 P1 定案
    props: { post },
  }));
}
```

**時區決策延到 P1**：Hexo `_config.yml` 的 `timezone: Asia/Taipei`，文章 date 是台北時間。若 routing 用 `getUTCFullYear`/`getUTCMonth`/`getUTCDate`，接近午夜的文章會落到前一天，造成 URL 跟舊站不符。P1 寫 diff 驗證腳本跑完 63 篇比對舊 `public/` 的實際路徑，決定：
- (a) 遷移腳本把 date 序列化成 `YYYY-MM-DDTHH:mm:ss+08:00` 存進 frontmatter
- (b) Routing 一律用 local method（`getFullYear` 等），並在 build 環境設 `TZ=Asia/Taipei`
- (c) 兩者都做（保險）

**slug id 規則**：Astro Content Layer 的 `post.id` 對 co-located `my-ai-coding-journey/index.md` 實際 format 還沒 literal 驗證，P1 用真實 Astro 6 跑一次確認後再 freeze 正則。

## GitHub Actions Workflow（Actions-based deploy）

**2026-04 research 指出**：`peaceiris/actions-gh-pages` + `gh-pages` branch 模式已過時，官方推薦 `withastro/action@v6` + `actions/deploy-pages`（Pages artifact + `deploy-pages` action），由 GitHub Pages 直接 serve artifact，不再需要 `gh-pages` branch。

`.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v6
        # 官方 action 自動偵測 package manager、Node 版本、base path
        # 產出 Pages artifact

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**切換步驟**（P5 執行）：
1. Repo Settings → Pages → Source 從「Deploy from a branch: `gh-pages`」改成「GitHub Actions」
2. 保留 `gh-pages` branch 不動 —— 若 rollback 需要，切回 branch 模式即可秒回舊站

## Phasing

每個 phase 結束都有可驗收產出，任一階段不滿意可停。

| Phase | 內容 | 可驗收產出 |
|---|---|---|
| **P0** | 本文件（拍板 A/B/C/D/E/F/G + 寫 spec） | 本份 `.md` 提交 |
| **P1** | Backup + Astro scaffold + schema 定義 + `base/trailingSlash` + `formatDateParams` + 其 unit tests + `verify-dates.mjs` + **co-located image spike（gate）** | `npm run dev` 可跑的空殼、`formatDateParams` test 通過、`verify-dates.mjs` 跑 63 篇 exit 0、co-located image 確認 Astro 6 已修（若未修則 STOP 重新決定 src/assets fallback） |
| **P2** | 遷移腳本（含 `--dry-run`）+ 每條 transform rule 的 golden unit tests + dry-run review + 63 篇內容落地到 `src/content/posts/` + About page 手動搬移 | Content Collection build 通過、文章齊全、所有 golden tests 通過 |
| **P3** | Routing + layouts + Tags/About/404 + 首頁 + `astro:fonts` + `@astrojs/partytown` (GA4) + `@astrojs/rss` + link audit 腳本 | 本地 `npm run build` 成功、`npm run preview` 可完整瀏覽、`/blog/rss.xml` 可訪 |
| **P4** | 本地 `npm run build` + `audit-links.mjs` + `url-diff.mjs` 都通過 + 撰寫 GH Actions workflow（**尚未切 GH Pages source**） | 兩個 audit 腳本都 exit 0、workflow yaml review 完成 |
| **P5** | Merge 到 master → GH Actions 跑 build → **切 GH Pages Source** 到 Actions → 驗證 prod → 清 Hexo 檔案 | Prod 上線、舊 URL 可訪 |

**P4 的 preview 策略**：Astro 的 Actions-based deploy 沒有 preview branch 概念。P4 不做線上 preview，改用**本地 `npm run build && npm run preview`** 加上「舊 `public/` vs 新 `dist/` 的 URL diff 腳本」取代。Prod 站台在 P5 切換之前都還是舊 Hexo，完全不受影響。

## Backup 策略

P1 第一件事：

1. `git tag pre-astro-migration` — 標記遷移前的最後一個 commit
2. `git branch hexo-archive` — 備份 master 上的 Hexo 原始碼狀態
3. **`gh-pages` branch 整個 migration 期間不動** — 這就是你的「已 build 的 Hexo 站」快照，天然的 rollback 目標
4. `public/` 目錄在本地跑一次 `hexo clean && hexo generate`，存 `snapshot-pre-astro.tar.gz` 放專案外，作為 `gh-pages` 的額外保險

若遷移任一階段決定放棄：`git reset --hard pre-astro-migration` 即可。GH Pages source 也還沒切，網站完全不受影響。

## 風險與不確定

| 項目 | 風險 | 緩解 |
|---|---|---|
| Astro 6 相對新（2026 初 release） | 生態系整合可能還在追版本 | P1 scaffold 時先 `npm create astro@latest` 跑官方 template，確認 `@astrojs/sitemap` 等整合支援 6.x |
| Astro 5 co-located image 404 regression（issue #12772） | `src/content/posts/<slug>/` 內的圖片可能 build 時 404 | P1 P2 階段跑一張圖 spike，確認 Astro 6 已修；若未修，改成 `src/assets/posts/<slug>/` |
| 時區處理（Hexo `timezone: Asia/Taipei`） | `date` 用 UTC 還是 local 會影響 year/month/day 補 0 結果 | P1 寫 unit 驗證腳本跑完 63 篇比對，決定用 `getFullYear`/`getMonth`/`getDate`（local）還是 UTC |
| 我沒 scan 過所有 frontmatter 邊緣 case | 可能某幾篇有我沒預期的欄位（如 `updated`、`author`、`cover`） | 遷移腳本 print 遇到 unknown field 的清單，review 後決定處理 |
| `{% %}` 只 grep 了 codeblock，可能還有其他 Hexo tag | 腳本轉換沒覆蓋到的會在文章裡留下 `{% %}` 字樣 | 遷移腳本 normalize 後跑一次 grep verify「沒有剩餘 `{% %}`」 |
| `javascript=` 等 HackMD-style fence language | Shiki fallback 成 plain text，code block 不高亮 | 遷移腳本統一 strip 尾端 `=` |
| 56 篇英文 slug 的舊 URL 驗證 | 有任一篇路由錯了就破壞 SEO | P4 強制跑 `audit-links.mjs` + `url-diff.mjs`（定義於 URL / Link Audit 章節），兩者 exit 0 才進 P5 |
| Google Search Console 既有 index 的中文 URL | 7 篇中文 URL 會出現 404 | 可接受，舊文且已同意放棄 |
| `trailingSlash` / `base` 地雷 | 內部連結漏加 base、或 trailing slash 不一致 → GH Pages 301 redirect → LCP penalty | P3 寫一個 link audit 腳本掃 `dist/`，確認所有內連都有 `/blog/` prefix + trailing slash |
| Shiki `one-light` vs `atom-one-light` 視覺差異 | 色調可能不完全一致 | P3 視覺對比，若無法接受再 import custom theme JSON |
| imgur 圖 404 / 下架（2020 年老文，imgur 近年清理 inactive 資源） | 20 張內可能有死鏈 | Migrate 腳本下載時 404 → print warning 保留原 URL，Bolas P2 review warning 清單決定要不要補圖 |
| 字體選擇延到 P3 | LCP #1 目標被延後決策 | P3 進場第一件事就是定字體，不當 cosmetic decision 看待 |

## Rollback

- **P1–P3 階段**：`git reset --hard pre-astro-migration`，GH Pages 完全沒動
- **P4 preview 階段**：GH Pages 還是指向 `gh-pages` branch（舊 Hexo），preview 壞了不影響 prod
- **P5 切換後才發現大問題**：Repo Settings → Pages → Source 切回「Deploy from a branch: `gh-pages`」—— 秒回舊站（因為 `gh-pages` branch 從頭到尾都沒動過）
- **最後手段**：若連 `gh-pages` branch 都被意外清掉，用 P1 存的 `snapshot-pre-astro.tar.gz` 解壓後重建 branch

## 下一步

本 spec 確認後進 P1，寫 P1 的 implementation plan（backup + Astro scaffold + schema + base 設定 + 時區驗證腳本）。
