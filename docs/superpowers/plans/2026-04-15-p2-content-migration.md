# P2 — Content Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 60 篇 Hexo post 從 `source/_posts/*.md` 搬成 Astro Content Collection 的 co-located `src/content/posts/<slug>/index.md` 結構，每條 frontmatter / content 轉換規則各配 golden unit test，通過 Zod schema 驗證與 `astro build`，並同時修正 verify-dates 留下的共用 helper 債。

**Architecture:** 在 P1 worktree 上追加實作。先把 `parseFrontmatterDate` 抽成 `src/utils/dates.ts` 的共用 helper（P1 發現的 YAML-UTC bug fix 現在一次到位），再寫 `scripts/migrate-posts.mts` — 純函式 transform pipeline，source 嚴禁改寫、output 可覆寫重跑、帶 `--dry-run` 與 `--skip-download` 兩個 flag。每條 transform rule 獨立 module + 獨立 Vitest golden test，最後 assembly 步驟把 post 攤成 `<slug>/index.md` + sibling assets 寫入。

**Tech Stack:**
- Astro 6 Content Collections（schema 於 P1 Task 7 已定義）
- TypeScript strict + Vitest（P1 Task 5 已配置）
- gray-matter 4.x（已安裝，frontmatter parsing）
- tsx 4.x（已安裝，runs `.mts` scripts）
- Node built-ins：`node:fs`、`node:path`、`node:util.parseArgs`、`fetch`

**Spec 來源:**
- `docs/superpowers/specs/2026-04-14-hexo-to-astro-migration-design.md`（P0 設計定案，P1 完成時狀態標記已更新）
- Pre-flight audit 結果（本文 Pre-flight 章節）
- P1 執行期間發現的 plan 偏差（本文 P1 繼承 context 章節）

---

## P1 繼承 context（必讀）

P2 Implementer 必須在動手前掌握的上游修正與決定：

1. **文章數是 60，不是 spec 寫的 63**。`source/_posts/` 有 60 個 flat `.md` 檔 + 1 個 sibling 資產目錄 `refactor-with-ai-agents/`。所有 spec / P1 plan 中寫「63 篇」的地方都應以 60 為準。
2. **Sibling 資產目錄只有 1 個**（spec 誤記為 2 個）。`refactor-with-ai-agents/` 裡有 5 張 PNG（`ai-refactoring-execution.png`、`new-ui-design-desktop.png`、`new-ui-design-mobile.png`、`old-ui-design.png`、`update-readme.png`）。`my-ai-coding-journey.md` 是 flat 檔案，沒有 sibling 目錄，內文引用路徑需要 P2 時再看一次。
3. **60 篇全部 co-located**。Bolas 於 P1 acceptance 後決定：每篇 post（無論有沒有資產）都一律搬成 `src/content/posts/<slug>/index.md` 結構。這消除「這篇要不要改 layout」的 editorial friction。
4. **`@astrojs/sitemap` 裝的是 `3.7.2`**（spec 原本寫 `^4.0.0` 但 sitemap 4.x 不存在）。不影響 P2，只要不誤升版即可。
5. **Astro 6 的 `import { z } from 'astro:content'` 已棄用**。若 P2 新增 Zod schema，**必須** `import { z } from 'astro/zod'`。
6. **`parseFrontmatterDate` 共用 helper 是 P2 Task 0**。P1 的 `scripts/verify-dates.mts` 內含一段偵測 gray-matter/js-yaml UTC parse 然後重建 Taipei wall-clock 的 fix；如果 migrate script 不共用這段邏輯，60 篇裡有 26 篇會 silently 偏移一天。
7. **TZ-aware YAML guard** 已加在 verify-dates.mts。P2 migrate script 也要帶同樣的 guard，否則未來某篇 post 加 `+08:00` 會 silently double-offset。
8. **`_` 前綴的目錄不會被 Content Collection 自動排除**。Astro 6 + `glob({ pattern: '**/*.md', base: './src/content/posts' })` 沒有 underscore ignore — P1 Task 10 的 spike 已驗證。這影響 P2：若 migrate script 在 output 下留任何 `_` 開頭的暫存目錄，會被 Zod schema build fail。
9. **`.github/` 從來沒被 track**。P4 的 GitHub Actions workflow 要從零建立，不是 P2 範圍，但如果 P2 順手要建 workflow，記得不是 replace 而是 create。
10. **Astro 6 co-located image 已修 #12772**，`src/content/posts/<slug>/index.md` 旁邊的 `./image.png` 會被 `astro:assets` 優化成 hashed webp。P2 Task 12 可以直接依賴這個行為。

---

## Pre-flight audit（2026-04-15 實測結果）

以下數據是寫 plan 當下在 worktree 裡 grep 出來的實況，migrate script 的每條 rule 都必須對齊這些數字：

**檔案總覽：**
- 60 個 flat `.md` 檔（`ls source/_posts/*.md | wc -l` = 60）
- 1 個 sibling 資產目錄 `refactor-with-ai-agents/`（5 PNG）
- 7 個中文檔名（見下）

**7 個中文檔名（需 rename，對應 spec 決策 B）：**

| 原檔名 | 新 slug |
|---|---|
| `HTML-把header做成template.md` | `html-reusable-header-template` |
| `putty使用ssh登入遠端無須密碼.md` | `ssh-passwordless-login-with-putty` |
| `Vue元件溝通-子傳父-emit.md` | `vue-child-to-parent-emit` |
| `如何做一個Line機器人.md` | `build-a-line-bot` |
| `實作JWT機制的登入驗證.md` | `jwt-login-authentication` |
| `架設Hexo部落格.md` | `hexo-blog-setup-notes` |
| `為什麼我不繼續做聖騎士PM.md` | `leaving-game-industry-pm` |

**Categories 實測（8 個 distinct 值）：**

```
categories:
categories: claude code
categories: 前端技術
categories: 心得分享
categories: 技術心得
categories: 測試
categories: 筆記
categories: 觀點
categories: 軟體開發
```

第一行（只有 `categories:` 無值）出現 3 次，是 block-scalar 形式：

```yaml
categories:
  - 筆記
  - css
```

出現在 `ai-frontend-development-flow.md`、`css-flexbox.md`、`css-height.md`。

**Transform rule 實際觸及的檔案：**

| Rule | 檔案數 | 具體檔案 |
|---|---|---|
| `{% codeblock %}` → fenced | 4 | `css-specificity.md`、`cypress-in-docker.md`、`HTML-把header做成template.md`、`vscode-git-config.md` |
| HackMD `=` fence marker strip | 8 | `實作JWT機制的登入驗證.md`、`vue-parent-emit.md`、`js-type-coercion.md`、`js-saveral-way-for-compare-strings.md`、`js-expression-and-statement.md`、`js-array-prototype-sort.md`、`Vue元件溝通-子傳父-emit.md`、`git-cross-os-config-setting.md`（後者用 `bash=`，不只 `javascript=`） |
| imgur 下載改寫 | 5 | `git-cross-os-config-setting.md`、`js-dev-tools.md`、`js-type-coercion.md`、`js-variables.md`、`如何做一個Line機器人.md` |
| `<!-- more -->` 移除 | 58 |（2 篇沒有：`ai-frontend-development-flow.md`、`git-rebase-remote-branch.md`）|
| description 自動抽取 | 1 | `ai-frontend-development-flow.md`（其他 59 篇皆已有 description）|
| hard-code URL fix | 1 | `架設Hexo部落格.md` / 新 slug `hexo-blog-setup-notes`（logo 路徑；source URL 寫 `.png` 但實際檔案是 `source/img/logo.svg`，Hexo 原本就是 broken link，P2 順手修）|
| Chinese filename rename | 7 |（同上表）|
| Nested-array categories（`- [筆記, css]`） | 2 | `css-flexbox.md`、`css-height.md`（gray-matter 解成 `[["筆記","css"]]`，normalizeCategories 必須 flatten）|
| Single-item block categories（`- 筆記`） | 1 | `ai-frontend-development-flow.md`（gray-matter 解成 `["筆記"]`，flat，normalizeCategories 原路處理）|
| 新 tag `前端開發` | 1 | `ai-frontend-development-flow.md` — 這是既有 tag 不是 category，normalizeCategories 不動它。Bolas 要在 Task 14 review 時確認要不要 rename 成 `前端技術` 以對齊其他文章 |

**既有資產：**
- `refactor-with-ai-agents/` 的 5 張 PNG（sibling → co-located 直接搬）
- `my-ai-coding-journey.md` 的資產（需 P2 Task 1 audit 內文找出引用的路徑，可能是 imgur / 可能是內嵌 base64 / 可能是 Hexo `asset_path`）
- `hexo-blog-setup-notes` 的 hard-code logo URL → 改 co-located（需從現有 `source/img/logo.*` 找來源檔）

---

## 目標

1. 60 篇 post 全部輸出到 `src/content/posts/<slug>/index.md`，內容與原 Hexo 行為一致
2. 每條 transform rule 有獨立 golden unit test，fixture 涵蓋 spec Tests 章節列的所有 case
3. `scripts/migrate-posts.mts` 是 idempotent 純函式：任意重跑輸出都一樣
4. `--dry-run` flag 讓 Bolas 可以在寫檔前 review 60 篇的 unified diff
5. `--skip-download` flag 讓 imgur download 在 dev 迭代時可跳過
6. `parseFrontmatterDate` 抽成 `src/utils/dates.ts` 共用 helper，verify-dates.mts 改用，所有現有測試仍綠
7. `astro sync` 與 `astro build` 在 60 篇 post 全數落地後成功，zero Zod schema validation error
8. `src/pages/about.astro` 從 `source/about/index.md` 內容 inline 完成
9. P2 結束時 `npm test`、`npm run verify:dates`、`npm run build` 全綠，working tree 乾淨

## 非目標（P3 或之後處理）

- Routing / layouts / components / 實際首頁設計（P3）
- `/tags/` 與 `/tags/[tag]/` 頁面（P3）
- Font API / Partytown / RSS integration（P3）
- Link audit / URL diff 腳本（P3/P4）
- GitHub Actions workflow（P4）
- GH Pages source 切換（P5）
- 清 `legacy/hexo/`、`db.json`（P5）

---

## File Structure

```
blog/                                           # P1 worktree root
├─ src/
│  ├─ content.config.ts                         # P1 Task 7（不動）
│  ├─ content/posts/
│  │  └─ <slug>/                                # × 60，P2 Task 12 產出
│  │     ├─ index.md                            # 含 transformed frontmatter + body
│  │     └─ [assets]                            # co-located PNG/WebP/JPG/GIF
│  ├─ pages/
│  │  ├─ index.astro                            # P1 placeholder（不動，P3 才改）
│  │  └─ about.astro                            # P2 Task 13 新增
│  ├─ utils/
│  │  ├─ dates.ts                               # P2 Task 0 追加 parseFrontmatterDate
│  │  └─ dates.test.ts                          # P2 Task 0 追加 3 個 case
├─ scripts/
│  ├─ legacy-public-dates.txt                   # P1 Task 1（不動）
│  ├─ verify-dates.mts                          # P2 Task 0 refactor 改用 helper
│  ├─ migrate-posts.mts                         # P2 Task 1 新增（主腳本）
│  ├─ migrate-posts/                            # P2 Task 1 新增（transform modules）
│  │  ├─ types.ts                               # MigratedPost 型別
│  │  ├─ rename-slug.ts                         # Task 3: 7 篇中文檔名 rename
│  │  ├─ normalize-categories.ts                # Task 4: category → tag + block-scalar
│  │  ├─ normalize-tags.ts                      # Task 5: lowercase + dedup
│  │  ├─ strip-more-tag.ts                      # Task 6: <!-- more --> 移除
│  │  ├─ extract-description.ts                 # Task 7: 自動抽取 description
│  │  ├─ convert-codeblock.ts                   # Task 8: {% codeblock %} → fenced
│  │  ├─ strip-hackmd-fence.ts                  # Task 9: `javascript=` 尾綴移除
│  │  ├─ fix-hardcode-url.ts                    # Task 10: hexo-blog-setup-notes logo 路徑
│  │  ├─ download-imgur.ts                      # Task 11: imgur 下載 + URL rewrite
│  │  └─ assemble-output.ts                     # Task 12: 寫 index.md + copy assets
│  └─ __tests__/
│     └─ migrate-posts/
│        ├─ rename-slug.test.mts                # Task 3
│        ├─ normalize-categories.test.mts       # Task 4
│        ├─ normalize-tags.test.mts             # Task 5
│        ├─ strip-more-tag.test.mts             # Task 6
│        ├─ extract-description.test.mts        # Task 7
│        ├─ convert-codeblock.test.mts          # Task 8
│        ├─ strip-hackmd-fence.test.mts         # Task 9
│        ├─ fix-hardcode-url.test.mts           # Task 10
│        └─ download-imgur.test.mts             # Task 11（mock fetch）
```

**設計原則：**
- 每個 transform 是一個 pure function `(post: MigratedPost) => MigratedPost`（imgur 是 async）
- `migrate-posts.mts` 主流程只負責 CLI parsing、載入 fixture、跑 pipeline、output（或 dry-run print）
- 所有檔案的 `node_modules` / `package.json` 相依都已在 P1 安裝好
- Test file 放 `scripts/__tests__/migrate-posts/` 與 transform module 平行，`vitest.config.ts` 已 include `scripts/**/*.test.mts`（P1 Task 5 設定）

---

## MigratedPost 型別（共用）

這是所有 transform 的輸入輸出型別。Task 1 建立 `scripts/migrate-posts/types.ts` 時務必用這個定義：

```ts
// scripts/migrate-posts/types.ts

export interface MigratedPost {
  /** Absolute path to the source .md file */
  sourceFile: string;
  /** Output slug (post-rename if Chinese filename) */
  slug: string;
  /** Parsed & transformed frontmatter */
  frontmatter: {
    title: string;
    date: Date;
    tags: string[];
    description: string;
    [key: string]: unknown;
  };
  /** Transformed markdown body (no <!-- more -->, no {% codeblock %}, etc) */
  body: string;
  /** Assets to copy into <slug>/. Map of source abs path → output filename */
  assets: Map<string, string>;
  /** Non-fatal warnings surfaced to Bolas at end of dry-run */
  warnings: string[];
}
```

---

## Pre-flight 確認（在寫 plan 時已驗證）

- P1 完成於 commit `35ec74c`（worktree branch `feat/astro-p1-scaffold`）
- `origin/gh-pages` 未被動到
- `scripts/legacy-public-dates.txt` 存在（54 行）
- `scripts/verify-dates.mts` 在 HEAD 上可跑，exit 0，印 `✓ 60 篇 post 的日期抽取全部在 legacy 日期集合中`
- `src/utils/dates.ts` 已有 `formatDateParams` 與 6 個測試
- `src/content/posts/` 僅含 `.gitkeep`
- `db.json` 仍在 root（gitignored，P5 處理，P2 不管）
- Node `v22.17.1`、npm `10.9.2`、astro `6.1.6`、vitest `3.2.4`

**Worktree 策略（Controller 決定）：**
- 選項 A：繼續在 `.worktrees/wt-4000-astro-p1-scaffold` 上追加 P2 commits
- 選項 B：基於 `feat/astro-p1-scaffold` 開新 worktree 為 `feat/astro-p2-content-migration`
- 建議 B（branch 命名清楚、review 顆粒度對齊 phase、不會意外把 P1 + P2 混成一個 PR）。但 plan 內容對兩者等價。

---

## Task 0: 把 `parseFrontmatterDate` + `formatTaipeiIso` 抽成共用 helper（TDD）

**目標：** 做兩件事：

1. 把 P1 `scripts/verify-dates.mts` 內嵌的 gray-matter/js-yaml UTC-to-Taipei 重解讀邏輯抽成 `src/utils/dates.ts` 的 `parseFrontmatterDate(raw: unknown): Date`
2. 新增 `formatTaipeiIso(date: Date): string` — 把 Date 序列化成帶 `+08:00` offset 的 ISO string（`2021-07-05T15:41:56+08:00`），Task 12 `writePost` 用它寫入 frontmatter，避免 `.toISOString()` 吐 UTC 導致 P3 routing 的日期計算漂移。

兩個 helper 一起加進 dates.ts 並一起 commit。verify-dates.mts 則只改用 `parseFrontmatterDate`（不需要 formatTaipeiIso）。

**Files:**
- Modify: `src/utils/dates.ts`
- Modify: `src/utils/dates.test.ts`
- Modify: `scripts/verify-dates.mts`

- [ ] **Step 0.1: 先寫 3 個失敗測試（TDD red）**

在 `src/utils/dates.test.ts` 檔案底部（既有的 `describe('formatDateParams', ...)` 之後）加入：

```ts
import { parseFrontmatterDate, formatTaipeiIso, formatDateParams } from './dates';

describe('parseFrontmatterDate', () => {
  it('gray-matter 解出的 UTC Date 會被重解讀成 Taipei 牆上時間', () => {
    // gray-matter → js-yaml 會把 "2020-08-28 16:03:47" (no TZ) 解成 UTC Date
    const yamlParsed = new Date('2020-08-28T16:03:47.000Z');
    const result = parseFrontmatterDate(yamlParsed);
    // 作者的語意是 Taipei 16:03:47，換成 Taipei date/time formatter 應得 2020-08-28
    expect(formatDateParams(result)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });

  it('quoted string 無 TZ 時視為 Taipei 時間', () => {
    const result = parseFrontmatterDate('2020-08-28 13:55:28');
    expect(formatDateParams(result)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });

  it('quoted string 有 +08:00 offset 時照原樣解析', () => {
    const result = parseFrontmatterDate('2020-08-28T23:59:00+08:00');
    expect(formatDateParams(result)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });
});

describe('formatTaipeiIso', () => {
  it('已經是 Taipei wall-clock 的 Date 會輸出 +08:00 ISO', () => {
    // 由 parseFrontmatterDate 產出的 Date（already Taipei wall-clock）
    const date = parseFrontmatterDate(new Date('2021-07-05T07:41:56.000Z'));
    // Taipei wall-clock 應是 15:41:56
    expect(formatTaipeiIso(date)).toBe('2021-07-05T15:41:56+08:00');
  });

  it('午夜邊界不會漂移', () => {
    const date = parseFrontmatterDate(new Date('2020-08-28T00:00:00.000Z'));
    // 作者語意是 Taipei 00:00:00 → 應回 2020-08-28T00:00:00+08:00
    expect(formatTaipeiIso(date)).toBe('2020-08-28T00:00:00+08:00');
  });

  it('往返 round-trip：parseFrontmatterDate → formatTaipeiIso → parseFrontmatterDate 同一個 instant', () => {
    const original = new Date('2022-01-15T06:30:00.000Z');
    const parsed1 = parseFrontmatterDate(original);
    const iso = formatTaipeiIso(parsed1);
    const parsed2 = parseFrontmatterDate(iso);
    expect(parsed2.getTime()).toBe(parsed1.getTime());
  });
});
```

- [ ] **Step 0.2: 執行測試確認全部 FAIL**

```bash
npm test -- src/utils/dates.test.ts
```

期望：6 個新測試 fail（`parseFrontmatterDate is not exported` 或類似），6 個既有 `formatDateParams` 測試仍 pass。

- [ ] **Step 0.3: 在 `src/utils/dates.ts` 加入 `parseFrontmatterDate` 與 `formatTaipeiIso`**

在檔案底部追加（不要動既有 `formatDateParams`）：

```ts
/**
 * 把 gray-matter / YAML 解出的日期（可能是 Date 物件或字串）
 * 正規化成代表 Taipei wall-clock 的 Date 物件。
 *
 * 背景：js-yaml 會把無 TZ 的 YAML timestamp 如 "2020-08-28 16:03:47"
 * 解析成 UTC Date → .toISOString() 會輸出 2020-08-28T16:03:47.000Z。
 * 作者的語意其實是台北時間，若直接交給 formatDateParams 會偏移一天。
 * 本 helper 偵測到 Date 輸入時，把它的 UTC wall-clock 元件搬成 +08:00
 * wall-clock，還原作者原意。
 *
 * 字串輸入則依慣例：若無 TZ 後綴則補 +08:00，有則保留。
 */
export function parseFrontmatterDate(raw: unknown): Date {
  if (raw instanceof Date) {
    const y = raw.getUTCFullYear();
    const m = String(raw.getUTCMonth() + 1).padStart(2, '0');
    const d = String(raw.getUTCDate()).padStart(2, '0');
    const hh = String(raw.getUTCHours()).padStart(2, '0');
    const mm = String(raw.getUTCMinutes()).padStart(2, '0');
    const ss = String(raw.getUTCSeconds()).padStart(2, '0');
    return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}+08:00`);
  }
  const s = String(raw);
  const isoish = s.replace(' ', 'T');
  const hasTz = /[+-]\d{2}:?\d{2}$|Z$/.test(isoish);
  return new Date(hasTz ? isoish : `${isoish}+08:00`);
}

/**
 * 把 Date 序列化成帶 +08:00 offset 的 ISO string，例如
 * `2021-07-05T15:41:56+08:00`。用 Intl.DateTimeFormat 抽 Taipei 牆上時間，
 * 不依賴 process.env.TZ。
 *
 * 為什麼不用 `.toISOString()`：`.toISOString()` 固定吐 UTC，讀者拿去
 * 算 `getFullYear() / getMonth() / getDate()` 時會因為 process TZ
 * 不同而漂移。frontmatter 要寫進檔案時用這個 helper，對 P3 routing
 * 才能產出穩定的 year/month/day。
 */
export function formatTaipeiIso(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((p) => p.type === type);
    if (!part) throw new Error(`formatTaipeiIso: 找不到 part ${type}`);
    return part.value;
  };

  const year = pick('year');
  const month = pick('month');
  const day = pick('day');
  // hour 在 en-CA hour12:false 下可能是 "24" — 改回 "00"（午夜場景）
  const rawHour = pick('hour');
  const hour = rawHour === '24' ? '00' : rawHour;
  const minute = pick('minute');
  const second = pick('second');
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`;
}
```

- [ ] **Step 0.4: 執行測試確認 12 個全綠**

```bash
npm test -- src/utils/dates.test.ts
```

期望：`12 passed (12)`（6 個 formatDateParams + 3 個 parseFrontmatterDate + 3 個 formatTaipeiIso）。

- [ ] **Step 0.5: Refactor `scripts/verify-dates.mts` 改用 helper**

使用 Edit 工具做以下 3 個改動：

1. Import 行追加 `parseFrontmatterDate`：

```ts
// Before
import { formatDateParams } from '../src/utils/dates.ts';
// After
import { formatDateParams, parseFrontmatterDate } from '../src/utils/dates.ts';
```

2. 刪除舊的 inline normalization 區塊（從 `let date: Date;` 到閉合 `}` 的 if/else block；P1 Task 9 fix 加進去的行數），替換為：

```ts
const rawStr = data.date instanceof Date ? data.date.toISOString() : String(data.date);
const date = parseFrontmatterDate(data.date);
```

3. TZ-aware YAML guard 區塊（Task 9 加進來的 4 行）**保留不動**。它仍然是 verify-dates 的上游防線。

- [ ] **Step 0.6: 執行 verify:dates 確認 60/60 仍通過**

```bash
npm run verify:dates
```

期望輸出：`✓ 60 篇 post 的日期抽取全部在 legacy 日期集合中`

若任一 post 開始 DRIFT → stop，`parseFrontmatterDate` 實作有 regression。

- [ ] **Step 0.7: 執行所有測試確認無 regression**

```bash
npm test
```

期望：`Tests 9 passed (9)`。

- [ ] **Step 0.8: Commit**

```bash
git add src/utils/dates.ts src/utils/dates.test.ts scripts/verify-dates.mts
git commit -m "refactor(utils): 抽出 parseFrontmatterDate 共用 helper 與測試，verify-dates 改用"
```

---

## Task 1: `migrate-posts.mts` 骨架 + CLI + dry-run infra

**目標：** 寫 migrate script 的主結構 — 解析 CLI flags、掃 60 個 source 檔、建立 MigratedPost 初始 shape、print 空 dry-run 報告（暫不跑任何 transform）。這讓後續 Task 3-11 可以各自加 transform 而不動主流程。

**Files:**
- Create: `scripts/migrate-posts.mts`
- Create: `scripts/migrate-posts/types.ts`
- Modify: `package.json`（加 `migrate:posts` script）

- [ ] **Step 1.1: 建立 `scripts/migrate-posts/types.ts`**

```ts
// scripts/migrate-posts/types.ts

export interface MigratedPost {
  /** Absolute path to the source .md file */
  sourceFile: string;
  /** Output slug (post-rename if Chinese filename) */
  slug: string;
  /** Parsed & transformed frontmatter */
  frontmatter: {
    title: string;
    date: Date;
    tags: string[];
    description: string;
    [key: string]: unknown;
  };
  /** Transformed markdown body */
  body: string;
  /** Assets to copy into <slug>/. Map of source abs path → output filename */
  assets: Map<string, string>;
  /** Non-fatal warnings surfaced to Bolas at end of dry-run */
  warnings: string[];
}
```

- [ ] **Step 1.2: 建立 `scripts/migrate-posts.mts` 主腳本**

```ts
#!/usr/bin/env tsx
/**
 * Migrate 60 Hexo posts from source/_posts/*.md to Astro Content Collection
 * under src/content/posts/<slug>/index.md (co-located pattern).
 *
 * Pure function: source/_posts/ is read-only, src/content/posts/ is completely
 * rebuilt on every run. Idempotent.
 *
 * Usage:
 *   npm run migrate:posts              # 實際寫檔
 *   npm run migrate:posts -- --dry-run # 僅印報告不寫檔
 *   npm run migrate:posts -- --skip-download # 跳過 imgur 下載（dev 迭代）
 */
import { parseArgs } from 'node:util';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import matter from 'gray-matter';
import { parseFrontmatterDate } from '../src/utils/dates.ts';
import type { MigratedPost } from './migrate-posts/types.ts';

const SOURCE_DIR = 'source/_posts';
const OUTPUT_DIR = 'src/content/posts';

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'skip-download': { type: 'boolean', default: false },
  },
});

const DRY_RUN = values['dry-run'] ?? false;
const SKIP_DOWNLOAD = values['skip-download'] ?? false;

function loadSourcePosts(): MigratedPost[] {
  const entries = readdirSync(SOURCE_DIR);
  const mdFiles = entries.filter((name) => {
    const full = join(SOURCE_DIR, name);
    return name.endsWith('.md') && statSync(full).isFile();
  });

  return mdFiles.map((file): MigratedPost => {
    const sourceFile = resolve(SOURCE_DIR, file);
    const raw = readFileSync(sourceFile, 'utf-8');

    // TZ-aware YAML guard: 與 verify-dates.mts 同一條防線
    const rawDateLine = raw.match(/^date:\s*(.+?)\s*$/m)?.[1]?.trim() ?? '';
    if (/(?:[+-]\d{2}:?\d{2}|Z)\s*$/.test(rawDateLine)) {
      throw new Error(
        `${file}: 含 TZ suffix 的 YAML timestamp (${rawDateLine}) — ` +
        `parseFrontmatterDate 的 UTC-to-Taipei 重解讀假設會錯。` +
        `請改寫 frontmatter 或擴充 helper。`,
      );
    }

    const { data, content } = matter(raw);
    const slug = file.replace(/\.md$/, '');

    const date = parseFrontmatterDate(data.date);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`${file}: invalid date after parseFrontmatterDate`);
    }

    return {
      sourceFile,
      slug,
      frontmatter: {
        // 先 spread 保留 categories 等未知欄位供 transform 清理，
        // 再用 explicit 欄位 override 回 sanitized 值（date 用 parseFrontmatterDate
        // 出來的 Taipei wall-clock，而不是 gray-matter 的 UTC raw Date）。
        ...data,
        title: String(data.title ?? ''),
        date,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        description: String(data.description ?? ''),
      },
      body: content,
      assets: new Map(),
      warnings: [],
    };
  });
}

function runPipeline(posts: MigratedPost[]): MigratedPost[] {
  // Task 3-11 會在這裡依序加入 transform。P1 骨架先 identity 回傳。
  const transforms: Array<(p: MigratedPost) => MigratedPost | Promise<MigratedPost>> = [
    // renameSlug,          ← Task 3
    // normalizeCategories, ← Task 4
    // normalizeTags,       ← Task 5
    // stripMoreTag,        ← Task 6
    // extractDescription,  ← Task 7
    // convertCodeblock,    ← Task 8
    // stripHackmdFence,    ← Task 9
    // fixHardcodeUrl,      ← Task 10
    // downloadImgur,       ← Task 11（async）
  ];

  // Identity pipeline 當前直接回傳
  return posts;
}

function printDryRunReport(posts: MigratedPost[]): void {
  console.log(`[dry-run] 共載入 ${posts.length} 篇 post`);
  console.log(`[dry-run] SKIP_DOWNLOAD=${SKIP_DOWNLOAD}`);
  console.log('');
  for (const p of posts) {
    console.log(`- ${p.slug}`);
  }
}

// Main
const posts = loadSourcePosts();
const transformed = runPipeline(posts);

if (DRY_RUN) {
  printDryRunReport(transformed);
  process.exit(0);
}

// P2 Task 12 會在這裡寫檔。P1 骨架先印個提示就結束。
console.log(`[migrate] 共 ${transformed.length} 篇 post — 寫檔邏輯未實作 (P2 Task 12)`);
```

- [ ] **Step 1.3: 加 `migrate:posts` npm script**

使用 Edit 工具在 `package.json` 的 `scripts` 區塊，於 `verify:dates` 之後、`}` 之前加入：

```json
    "migrate:posts": "tsx scripts/migrate-posts.mts"
```

記得前一行末尾加逗號。最終 scripts 區應含：

```json
"scripts": {
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run",
  "test:watch": "vitest",
  "verify:dates": "tsx scripts/verify-dates.mts",
  "migrate:posts": "tsx scripts/migrate-posts.mts"
}
```

- [ ] **Step 1.4: 執行 dry-run 確認可跑且列出 60 篇**

```bash
npm run migrate:posts -- --dry-run
```

期望輸出：
```
[dry-run] 共載入 60 篇 post
[dry-run] SKIP_DOWNLOAD=false

- 2022-retrospective
- ai-amplifies-output-but-not-validation
- ...（共 60 行）
```

若輸出數字不是 60，STOP 先驗證 source 檔有沒有在 Task 0 之後被改動。

- [ ] **Step 1.5: 驗證 tsc / vitest 無 regression**

```bash
./node_modules/.bin/tsc --noEmit 2>&1
npm test
```

兩者都應該零錯誤（9/9 tests passing）。

- [ ] **Step 1.6: Commit**

```bash
git add scripts/migrate-posts.mts scripts/migrate-posts/types.ts package.json package-lock.json
git commit -m "feat(migration): 建立 migrate-posts 主腳本骨架與 MigratedPost 型別"
```

---

## Task 2: 第一次 dry-run 產出 Category audit dump（read-only 診斷）

**目標：** 實作 spec「第一步：dump category distinct 值跟 YAML 型態」。這是純讀取，不動 source 也不動 output。讓我們在寫 category→tag transform 前先看一眼實況。

**Files:**
- Modify: `scripts/migrate-posts.mts`（追加 `--audit-categories` flag）

- [ ] **Step 2.1: 加 `--audit-categories` flag 到 parseArgs**

使用 Edit 工具把 `parseArgs` 的 options 區塊改成：

```ts
const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'skip-download': { type: 'boolean', default: false },
    'audit-categories': { type: 'boolean', default: false },
  },
});

const DRY_RUN = values['dry-run'] ?? false;
const SKIP_DOWNLOAD = values['skip-download'] ?? false;
const AUDIT_CATEGORIES = values['audit-categories'] ?? false;
```

- [ ] **Step 2.2: 加 `auditCategories` function**

在 `printDryRunReport` function 之後加：

```ts
function auditCategories(posts: MigratedPost[]): void {
  // Map: category value JSON → list of posts
  const seen = new Map<string, string[]>();

  for (const p of posts) {
    const rawCat = p.frontmatter.categories;
    // 用 JSON.stringify 當 key，才能把 string / array / null 區分開
    const key = JSON.stringify(rawCat ?? null);
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(p.slug);
  }

  console.log(`[audit] 共 ${posts.length} 篇 post，${seen.size} 種 category shape\n`);

  // 按 key 字典序印出
  const sortedKeys = [...seen.keys()].sort();
  for (const key of sortedKeys) {
    const slugs = seen.get(key)!;
    console.log(`  shape: ${key}`);
    console.log(`  count: ${slugs.length}`);
    console.log(`  examples: ${slugs.slice(0, 3).join(', ')}${slugs.length > 3 ? ', ...' : ''}`);
    console.log('');
  }
}
```

- [ ] **Step 2.3: 在 Main 區塊呼叫 audit**

在 Main 區塊最前面（載入 posts 之後、`transformed` 之前）加：

```ts
const posts = loadSourcePosts();

if (AUDIT_CATEGORIES) {
  auditCategories(posts);
  process.exit(0);
}

const transformed = runPipeline(posts);
```

- [ ] **Step 2.4: 執行 audit 並驗證輸出**

```bash
npm run migrate:posts -- --audit-categories
```

期望：至少看到 8 種 string category 值 + 1 種 array（block-scalar `[筆記, css]`）+ 1 種 null/undefined（沒 category 的 post）。大概長這樣：

```
[audit] 共 60 篇 post，N 種 category shape

  shape: "claude code"
  count: ...
  examples: ...

  shape: "前端技術"
  count: ...
  ...

  shape: ["筆記","css"]
  count: 2
  examples: css-flexbox, css-height
```

實測值應該對得上 Pre-flight 章節「8 個 categories + 3 篇 block-scalar」。若有新的 shape（e.g. `null`、`"軟體工程"` 這種 spec 沒列過的）**記錄到報告**並停下來問 Bolas 怎麼處理。

- [ ] **Step 2.5: Commit**

```bash
git add scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 --audit-categories dry-run flag"
```

---

## Task 3: Transform — Chinese filename → slug rename（TDD）

**目標：** 實作 `renameSlug(post)` 把 7 篇中文檔名 post 的 slug 改成 spec 決策 B 的英文 slug。其他 53 篇 slug 不動。

**Files:**
- Create: `scripts/migrate-posts/rename-slug.ts`
- Create: `scripts/__tests__/migrate-posts/rename-slug.test.mts`
- Modify: `scripts/migrate-posts.mts`（在 transforms 陣列加入）

- [ ] **Step 3.1: 寫失敗測試**

`scripts/__tests__/migrate-posts/rename-slug.test.mts`：

```ts
import { describe, it, expect } from 'vitest';
import { renameSlug } from '../../migrate-posts/rename-slug.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(slug: string): MigratedPost {
  return {
    sourceFile: `/x/${slug}.md`,
    slug,
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body: '',
    assets: new Map(),
    warnings: [],
  };
}

describe('renameSlug', () => {
  const mappings: Array<[string, string]> = [
    ['HTML-把header做成template', 'html-reusable-header-template'],
    ['putty使用ssh登入遠端無須密碼', 'ssh-passwordless-login-with-putty'],
    ['Vue元件溝通-子傳父-emit', 'vue-child-to-parent-emit'],
    ['如何做一個Line機器人', 'build-a-line-bot'],
    ['實作JWT機制的登入驗證', 'jwt-login-authentication'],
    ['架設Hexo部落格', 'hexo-blog-setup-notes'],
    ['為什麼我不繼續做聖騎士PM', 'leaving-game-industry-pm'],
  ];

  for (const [from, to] of mappings) {
    it(`rename ${from} → ${to}`, () => {
      const post = makePost(from);
      const result = renameSlug(post);
      expect(result.slug).toBe(to);
    });
  }

  it('英文 slug 不被改動', () => {
    const post = makePost('js-array-prototype-find');
    const result = renameSlug(post);
    expect(result.slug).toBe('js-array-prototype-find');
  });

  it('不修改其他欄位', () => {
    const post = makePost('HTML-把header做成template');
    post.frontmatter.title = 'Test';
    const result = renameSlug(post);
    expect(result.frontmatter.title).toBe('Test');
    expect(result.body).toBe('');
    expect(result.assets.size).toBe(0);
  });
});
```

- [ ] **Step 3.2: 跑測試確認 9 個 FAIL**

```bash
npm test -- scripts/__tests__/migrate-posts/rename-slug.test.mts
```

期望：8 個 mapping tests + 1 個 no-op test + 1 個 side-effect test 全部 fail（module not found）。

- [ ] **Step 3.3: 實作 `rename-slug.ts`**

```ts
// scripts/migrate-posts/rename-slug.ts
import type { MigratedPost } from './types.ts';

const SLUG_RENAMES: Record<string, string> = {
  'HTML-把header做成template': 'html-reusable-header-template',
  'putty使用ssh登入遠端無須密碼': 'ssh-passwordless-login-with-putty',
  'Vue元件溝通-子傳父-emit': 'vue-child-to-parent-emit',
  '如何做一個Line機器人': 'build-a-line-bot',
  '實作JWT機制的登入驗證': 'jwt-login-authentication',
  '架設Hexo部落格': 'hexo-blog-setup-notes',
  '為什麼我不繼續做聖騎士PM': 'leaving-game-industry-pm',
};

export function renameSlug(post: MigratedPost): MigratedPost {
  const newSlug = SLUG_RENAMES[post.slug];
  if (newSlug === undefined) return post;
  return { ...post, slug: newSlug };
}
```

- [ ] **Step 3.4: 跑測試確認全綠**

```bash
npm test -- scripts/__tests__/migrate-posts/rename-slug.test.mts
```

期望：全部 10 個 test pass。

- [ ] **Step 3.5: 把 `renameSlug` 加入 pipeline**

Edit `scripts/migrate-posts.mts`：

1. 檔案頂端 import 區追加：
```ts
import { renameSlug } from './migrate-posts/rename-slug.ts';
```

2. `runPipeline` 的 transforms 陣列取消註解第一行並改成：
```ts
const transforms: Array<(p: MigratedPost) => MigratedPost | Promise<MigratedPost>> = [
  renameSlug,
  // normalizeCategories, ← Task 4
  // ...
];
```

3. 主函式直接寫成 async 版本（Task 11 會加 async transform，提早 async 化可省掉中途 refactor）：

```ts
type Transform = (p: MigratedPost) => MigratedPost | Promise<MigratedPost>;

async function runPipeline(posts: MigratedPost[]): Promise<MigratedPost[]> {
  const result: MigratedPost[] = [];
  for (const post of posts) {
    let current: MigratedPost = post;
    for (const transform of transforms) {
      current = await transform(current);
    }
    result.push(current);
  }
  return result;
}
```

並且把 Main 區塊改成 top-level await：

```ts
const transformed = await runPipeline(posts);
```

Node 22 + ESM 支援 top-level await。Task 11 時 transforms 陣列加 async transform 就直接 work。

- [ ] **Step 3.6: 驗證 dry-run 的 slug 列表改變**

```bash
npm run migrate:posts -- --dry-run | grep -E "(html-reusable|build-a-line|hexo-blog-setup|jwt-login|ssh-passwordless|vue-child-to-parent|leaving-game)"
```

期望看到 7 行：對應 7 個新 slug。若還看到原中文 slug → renameSlug 沒被呼叫，回去查 Step 3.5。

- [ ] **Step 3.7: Commit**

```bash
git add scripts/migrate-posts/rename-slug.ts scripts/__tests__/migrate-posts/rename-slug.test.mts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 renameSlug transform 與 7 篇中文檔名 golden tests"
```

---

## Task 4: Transform — Category → tag + block-scalar 處理（TDD）

**目標：** 實作 `normalizeCategories(post)` 依 spec 決策 A 把 `frontmatter.categories` 依表格處理：

| 原 category 值 | 處理 |
|---|---|
| 筆記 / 心得分享 / 技術心得 / 觀點 / 測試 | **丟掉**（不轉 tag）|
| 前端技術 | 轉成 tag `前端技術` |
| 軟體開發 | 轉成 tag `軟體開發` |
| claude code | 轉成 tag `claude code` |

**重要：gray-matter 會把不同 YAML 寫法解成不同 JS 形狀**（實測）：

```yaml
# Flat inline
categories: 筆記
# → "筆記"

# Single-item block
categories:
  - 筆記
# → ["筆記"]

# Nested inline inside block（`css-flexbox.md`、`css-height.md` 走這個）
categories:
  - [筆記, css]
# → [["筆記","css"]]
```

`normalizeCategories` 必須在處理前 **flatten 一層**，把 `[["筆記","css"]]` 拉平成 `["筆記", "css"]`，然後「筆記」丟掉、「css」加進 tags。

轉 tag 時若跟既有 tag 撞名要去重（exact match，大小寫 sensitive — Task 5 再 lowercase）。

結尾要把 `frontmatter.categories` 這個 key **刪掉**。

**Files:**
- Create: `scripts/migrate-posts/normalize-categories.ts`
- Create: `scripts/__tests__/migrate-posts/normalize-categories.test.mts`
- Modify: `scripts/migrate-posts.mts`

- [ ] **Step 4.1: 寫失敗測試**

`scripts/__tests__/migrate-posts/normalize-categories.test.mts`：

```ts
import { describe, it, expect } from 'vitest';
import { normalizeCategories } from '../../migrate-posts/normalize-categories.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(categories: unknown, tags: string[] = []): MigratedPost {
  return {
    sourceFile: '/x/a.md',
    slug: 'a',
    frontmatter: {
      title: '', date: new Date(), description: '',
      tags,
      categories,
    },
    body: '',
    assets: new Map(),
    warnings: [],
  };
}

describe('normalizeCategories', () => {
  describe('drop 類 category', () => {
    const dropCats = ['筆記', '心得分享', '技術心得', '觀點', '測試'];
    for (const cat of dropCats) {
      it(`${cat} 直接丟，不進 tags`, () => {
        const post = makePost(cat, ['existing']);
        const result = normalizeCategories(post);
        expect(result.frontmatter.tags).toEqual(['existing']);
        expect(result.frontmatter.categories).toBeUndefined();
      });
    }
  });

  describe('convert 類 category', () => {
    const convertCats = ['前端技術', '軟體開發', 'claude code'];
    for (const cat of convertCats) {
      it(`${cat} 轉成 tag`, () => {
        const post = makePost(cat, ['existing']);
        const result = normalizeCategories(post);
        expect(result.frontmatter.tags).toEqual(['existing', cat]);
      });
    }
  });

  describe('tag 去重', () => {
    it('category 跟既有 tag 撞名時不重複加', () => {
      const post = makePost('前端技術', ['前端技術', 'css']);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['前端技術', 'css']);
    });
  });

  describe('block-scalar 陣列（flat）', () => {
    it('單一項目 block: ["筆記"] → 全丟', () => {
      const post = makePost(['筆記'], ['existing']);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['existing']);
      expect(result.frontmatter.categories).toBeUndefined();
    });

    it('陣列中 convert 類 + drop 類混雜', () => {
      const post = makePost(['筆記', '前端技術'], []);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['前端技術']);
    });
  });

  describe('nested 陣列（gray-matter 實際吐的形狀）', () => {
    it('[["筆記","css"]] flatten 後：筆記丟掉，css 加進 tags', () => {
      // 這是 css-flexbox.md / css-height.md 的實際 gray-matter 輸出
      const post = makePost([['筆記', 'css']], ['existing']);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['existing', 'css']);
      expect(result.frontmatter.categories).toBeUndefined();
    });

    it('[["前端技術", "css"]] 兩個都進 tags', () => {
      const post = makePost([['前端技術', 'css']], []);
      const result = normalizeCategories(post);
      expect(result.frontmatter.tags).toEqual(['前端技術', 'css']);
    });
  });

  describe('無 category 欄位', () => {
    it('undefined / null / 空陣列', () => {
      const a = normalizeCategories(makePost(undefined, ['x']));
      expect(a.frontmatter.tags).toEqual(['x']);
      const b = normalizeCategories(makePost(null, ['x']));
      expect(b.frontmatter.tags).toEqual(['x']);
      const c = normalizeCategories(makePost([], ['x']));
      expect(c.frontmatter.tags).toEqual(['x']);
    });
  });
});
```

- [ ] **Step 4.2: 跑測試確認失敗**

```bash
npm test -- scripts/__tests__/migrate-posts/normalize-categories.test.mts
```

期望：module not found → 全 fail。

- [ ] **Step 4.3: 實作**

```ts
// scripts/migrate-posts/normalize-categories.ts
import type { MigratedPost } from './types.ts';

const DROP_CATEGORIES = new Set(['筆記', '心得分享', '技術心得', '觀點', '測試']);
const CONVERT_CATEGORIES = new Set(['前端技術', '軟體開發', 'claude code']);

/**
 * 把 gray-matter 解出的各種 categories 形狀 flatten 成 string[]。
 *  - "筆記"              → ["筆記"]
 *  - ["筆記"]           → ["筆記"]
 *  - [["筆記", "css"]]  → ["筆記", "css"]   ← gray-matter 對 `- [筆記, css]` 的實際輸出
 *  - null / undefined / "" → []
 */
function flattenCategories(raw: unknown): string[] {
  if (raw == null || raw === '') return [];
  if (!Array.isArray(raw)) return [String(raw)];
  const out: string[] = [];
  for (const item of raw) {
    if (Array.isArray(item)) {
      for (const inner of item) out.push(String(inner));
    } else {
      out.push(String(item));
    }
  }
  return out;
}

export function normalizeCategories(post: MigratedPost): MigratedPost {
  const raw = post.frontmatter.categories;
  const values = flattenCategories(raw);
  const wasArrayInput = Array.isArray(raw);

  const tags = [...post.frontmatter.tags];
  const warnings = [...post.warnings];

  for (const v of values) {
    if (DROP_CATEGORIES.has(v)) continue;
    if (CONVERT_CATEGORIES.has(v)) {
      if (!tags.includes(v)) tags.push(v);
      continue;
    }
    // 陣列輸入中的未列名值（e.g. "css"）視為 tag 加入
    if (wasArrayInput) {
      if (!tags.includes(v)) tags.push(v);
      continue;
    }
    // String 輸入但不在 drop/convert 名單 → unknown，記 warning 但仍加入
    if (!tags.includes(v)) {
      warnings.push(`[normalize-categories] unknown category "${v}" in ${post.slug}，當 tag 處理`);
      tags.push(v);
    }
  }

  const nextFrontmatter = { ...post.frontmatter, tags };
  delete nextFrontmatter.categories;

  return { ...post, frontmatter: nextFrontmatter, warnings };
}
```

- [ ] **Step 4.4: 跑測試確認全綠**

```bash
npm test -- scripts/__tests__/migrate-posts/normalize-categories.test.mts
```

期望：所有 tests pass。若 drop 類任一測試失敗，表示 `DROP_CATEGORIES` set 漏了某個值，回去對 Pre-flight 章節的實測 8 個值。

- [ ] **Step 4.5: 把 `normalizeCategories` 加入 pipeline**

Edit `scripts/migrate-posts.mts`：

1. Import 追加：
```ts
import { normalizeCategories } from './migrate-posts/normalize-categories.ts';
```

2. transforms 陣列：
```ts
const transforms: Array<(p: MigratedPost) => MigratedPost | Promise<MigratedPost>> = [
  renameSlug,
  normalizeCategories,
  // ...
];
```

- [ ] **Step 4.6: 跑 `--audit-categories` 再跑 `--dry-run` 確認 category 被清掉**

```bash
npm run migrate:posts -- --audit-categories 2>&1 | head -5
```

（這步還會看到 raw categories，因為 audit 是在 transform 前執行的 — 這是預期行為。）

接著跑：
```bash
npm test
```

期望：現有 9 + 新 rename 10 + 新 normalize-categories 10 = 29 個測試全綠。

- [ ] **Step 4.7: Commit**

```bash
git add scripts/migrate-posts/normalize-categories.ts scripts/__tests__/migrate-posts/normalize-categories.test.mts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 normalizeCategories transform 與 golden tests"
```

---

## Task 5: Transform — Tag lowercase + dedup（TDD）

**目標：** 實作 `normalizeTags(post)` 把 tags 全部 lowercase，再 dedup。舉例：`['CSS', 'html', 'Express', 'css']` → `['css', 'html', 'express']`。空陣列維持空陣列。

**Files:**
- Create: `scripts/migrate-posts/normalize-tags.ts`
- Create: `scripts/__tests__/migrate-posts/normalize-tags.test.mts`
- Modify: `scripts/migrate-posts.mts`

- [ ] **Step 5.1: 寫失敗測試**

```ts
// scripts/__tests__/migrate-posts/normalize-tags.test.mts
import { describe, it, expect } from 'vitest';
import { normalizeTags } from '../../migrate-posts/normalize-tags.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(tags: string[]): MigratedPost {
  return {
    sourceFile: '/x/a.md',
    slug: 'a',
    frontmatter: { title: '', date: new Date(), tags, description: '' },
    body: '',
    assets: new Map(),
    warnings: [],
  };
}

describe('normalizeTags', () => {
  it('全部 lowercase', () => {
    const result = normalizeTags(makePost(['CSS', 'HTML', 'Express']));
    expect(result.frontmatter.tags).toEqual(['css', 'html', 'express']);
  });

  it('lowercase 後去重', () => {
    const result = normalizeTags(makePost(['CSS', 'css', 'Css', 'html']));
    expect(result.frontmatter.tags).toEqual(['css', 'html']);
  });

  it('空陣列', () => {
    const result = normalizeTags(makePost([]));
    expect(result.frontmatter.tags).toEqual([]);
  });

  it('中文 tag 不動', () => {
    const result = normalizeTags(makePost(['前端技術', 'CSS', '前端技術']));
    expect(result.frontmatter.tags).toEqual(['前端技術', 'css']);
  });

  it('保留原順序（第一次出現的位置）', () => {
    const result = normalizeTags(makePost(['Vue', 'CSS', 'vue', 'HTML']));
    expect(result.frontmatter.tags).toEqual(['vue', 'css', 'html']);
  });
});
```

- [ ] **Step 5.2: 跑測試確認失敗**

```bash
npm test -- scripts/__tests__/migrate-posts/normalize-tags.test.mts
```

- [ ] **Step 5.3: 實作**

```ts
// scripts/migrate-posts/normalize-tags.ts
import type { MigratedPost } from './types.ts';

export function normalizeTags(post: MigratedPost): MigratedPost {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const t of post.frontmatter.tags) {
    const lc = t.toLowerCase();
    if (seen.has(lc)) continue;
    seen.add(lc);
    tags.push(lc);
  }
  return { ...post, frontmatter: { ...post.frontmatter, tags } };
}
```

- [ ] **Step 5.4: 跑測試確認全綠**

```bash
npm test -- scripts/__tests__/migrate-posts/normalize-tags.test.mts
```

- [ ] **Step 5.5: 加入 pipeline**

Edit `scripts/migrate-posts.mts`：import + transforms 陣列追加 `normalizeTags`（**順序很重要：必須在 `normalizeCategories` 之後，才能把 converted 的中文 tag 一起 lowercase**）。

```ts
import { normalizeTags } from './migrate-posts/normalize-tags.ts';

const transforms: Array<...> = [
  renameSlug,
  normalizeCategories,
  normalizeTags,
];
```

- [ ] **Step 5.6: 驗證**

```bash
npm test
```

期望：29 + 5 = 34 個測試全綠。

- [ ] **Step 5.7: Commit**

```bash
git add scripts/migrate-posts/normalize-tags.ts scripts/__tests__/migrate-posts/normalize-tags.test.mts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 normalizeTags transform 與 lowercase/dedup 測試"
```

---

## Task 6: Transform — `<!-- more -->` 移除（TDD）

**目標：** 實作 `stripMoreTag(post)` 把內文的 `<!-- more -->` 單行整行刪掉。前後空行會變成一個空行（不做額外整理）。57 篇會被處理、3 篇沒有該 tag 的不動。

**Files:**
- Create: `scripts/migrate-posts/strip-more-tag.ts`
- Create: `scripts/__tests__/migrate-posts/strip-more-tag.test.mts`
- Modify: `scripts/migrate-posts.mts`

- [ ] **Step 6.1: 寫失敗測試**

```ts
// scripts/__tests__/migrate-posts/strip-more-tag.test.mts
import { describe, it, expect } from 'vitest';
import { stripMoreTag } from '../../migrate-posts/strip-more-tag.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(body: string): MigratedPost {
  return {
    sourceFile: '/x/a.md', slug: 'a',
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body,
    assets: new Map(),
    warnings: [],
  };
}

describe('stripMoreTag', () => {
  it('單行 <!-- more --> 被整行移除', () => {
    const body = 'intro paragraph\n\n<!-- more -->\n\nrest of body';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe('intro paragraph\n\n\nrest of body');
  });

  it('沒有 <!-- more --> 的 body 不動', () => {
    const body = 'just plain content\n\n## header\n\nbody';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe(body);
  });

  it('開頭就是 <!-- more -->', () => {
    const body = '<!-- more -->\n\nbody';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe('\nbody');
  });

  it('結尾就是 <!-- more -->', () => {
    const body = 'intro\n<!-- more -->';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe('intro\n');
  });

  it('不誤傷 inline 的文字', () => {
    const body = 'this is <!-- more --> inline comment';
    const result = stripMoreTag(makePost(body));
    expect(result.body).toBe(body); // 整行模式 → inline 不被刪
  });
});
```

- [ ] **Step 6.2: 跑測試確認失敗**

```bash
npm test -- scripts/__tests__/migrate-posts/strip-more-tag.test.mts
```

- [ ] **Step 6.3: 實作**

```ts
// scripts/migrate-posts/strip-more-tag.ts
import type { MigratedPost } from './types.ts';

export function stripMoreTag(post: MigratedPost): MigratedPost {
  // 整行 mode: ^<!-- more -->$ + trailing newline
  // 不動 inline 出現的 <!-- more --> 文字
  const body = post.body.replace(/^<!-- more -->\n?/gm, '');
  return { ...post, body };
}
```

- [ ] **Step 6.4: 跑測試全綠**

```bash
npm test -- scripts/__tests__/migrate-posts/strip-more-tag.test.mts
```

- [ ] **Step 6.5: 加入 pipeline**

Edit `scripts/migrate-posts.mts`：

```ts
import { stripMoreTag } from './migrate-posts/strip-more-tag.ts';

const transforms: Array<...> = [
  renameSlug,
  normalizeCategories,
  normalizeTags,
  stripMoreTag,
];
```

- [ ] **Step 6.6: 驗證**

```bash
npm test
```

期望：34 + 5 = 39 個測試全綠。

- [ ] **Step 6.7: Commit**

```bash
git add scripts/migrate-posts/strip-more-tag.ts scripts/__tests__/migrate-posts/strip-more-tag.test.mts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 stripMoreTag transform 整行模式測試"
```

---

## Task 7: Transform — description 聰明抽取（TDD）

**目標：** 實作 `extractDescription(post)` 當 `post.frontmatter.description` 是空字串時，自動從 body 抽前段內容填入。聰明規則：

1. 先 strip markdown 語法：header `#`、bold `**`、link `[text](url)` → `text`、blockquote `>`、HTML comment
2. 用 double-newline 切段落，找第一段
3. 若 strip 後長度 < 60 字 → 跳下一段
4. 找到合適段落 → 取前 120 字
5. 全部都抽不到 60 字 → 降級用 `title` 當 description
6. 記一條 `warnings`：`[extract-description] ${slug}: auto-filled "${preview}"`

Pre-flight 實測：只有 `ai-frontend-development-flow.md` 一篇需要抽取。但 test 要涵蓋 spec Tests 章節列的 4 種邊界 case。

**Files:**
- Create: `scripts/migrate-posts/extract-description.ts`
- Create: `scripts/__tests__/migrate-posts/extract-description.test.mts`
- Modify: `scripts/migrate-posts.mts`

- [ ] **Step 7.1: 寫失敗測試**

```ts
// scripts/__tests__/migrate-posts/extract-description.test.mts
import { describe, it, expect } from 'vitest';
import { extractDescription } from '../../migrate-posts/extract-description.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(body: string, description = '', title = 'Test Post'): MigratedPost {
  return {
    sourceFile: '/x/a.md', slug: 'a',
    frontmatter: { title, date: new Date(), tags: [], description },
    body,
    assets: new Map(),
    warnings: [],
  };
}

describe('extractDescription', () => {
  it('已有 description 不動', () => {
    const post = makePost('body', 'existing description');
    const result = extractDescription(post);
    expect(result.frontmatter.description).toBe('existing description');
    expect(result.warnings).toHaveLength(0);
  });

  it('首段為普通文字 → 取前 120 字', () => {
    const body = '這是一段長度足夠的普通文字段落，目的是讓 extractDescription 能夠從裡面拿出至少 60 個字元的內容作為 description 的填充材料，請不要誤傷它。';
    const post = makePost(body);
    const result = extractDescription(post);
    expect(result.frontmatter.description.length).toBeGreaterThanOrEqual(60);
    expect(result.frontmatter.description.length).toBeLessThanOrEqual(120);
    expect(result.warnings[0]).toContain('[extract-description]');
  });

  it('首段為 ## header → 跳過往下找', () => {
    const body = '## 只是個 header\n\n這才是真正有內容的段落，長度超過 60 字的樣子，然後會被抽出來當 description 的。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).toContain('這才是真正有內容');
    expect(result.frontmatter.description).not.toContain('只是個 header');
  });

  it('首段為 > quote → strip 掉 > 字元仍可抽', () => {
    const body = '> 這是一個 blockquote 裡面寫的一段文字，strip 掉尖括號後長度還是很夠抽成 description 用的材料，請加油。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).not.toContain('>');
    expect(result.frontmatter.description.length).toBeGreaterThanOrEqual(60);
  });

  it('抽不到 60 字 → 降級用 title', () => {
    const body = '太短\n\n又一個短段\n\n還是短';
    const post = makePost(body, '', 'Fallback Title');
    const result = extractDescription(post);
    expect(result.frontmatter.description).toBe('Fallback Title');
    expect(result.warnings[0]).toContain('降級');
  });

  it('strip link 的 url 部分，留 text', () => {
    const body = '這段有 [連結文字](https://example.com/a/b) 混在中間，整體長度仍足以抽出足夠的 description 內容作為自動填充的結果。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).toContain('連結文字');
    expect(result.frontmatter.description).not.toContain('https://example.com');
  });

  it('strip bold', () => {
    const body = '這段有 **粗體字** 混在中間，整體長度仍足以抽出足夠的 description 內容作為自動填充的結果，不要把星號留下來喔。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).toContain('粗體字');
    expect(result.frontmatter.description).not.toContain('**');
  });

  it('strip html comment', () => {
    const body = '<!-- something -->\n\n這段才是真正的段落，長度超過 60 個字，請把上方的 html comment 當成不存在，從這段開始抽 description。';
    const result = extractDescription(makePost(body));
    expect(result.frontmatter.description).toContain('真正的段落');
    expect(result.frontmatter.description).not.toContain('something');
  });
});
```

- [ ] **Step 7.2: 跑測試確認失敗**

```bash
npm test -- scripts/__tests__/migrate-posts/extract-description.test.mts
```

- [ ] **Step 7.3: 實作**

```ts
// scripts/migrate-posts/extract-description.ts
import type { MigratedPost } from './types.ts';

const MIN_LENGTH = 60;
const MAX_LENGTH = 120;

function stripMarkdown(text: string): string {
  return text
    // HTML comment <!-- ... -->
    .replace(/<!--[\s\S]*?-->/g, '')
    // Code fences
    .replace(/```[\s\S]*?```/g, '')
    // Inline code
    .replace(/`[^`]*`/g, '')
    // Bold **x** 和 __x__
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Italic *x* 與 _x_（保守：不吃單字 apostrophe）
    .replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '$1')
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, '$1')
    // Link [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Image ![alt](url) → alt
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Blockquote marker at line start
    .replace(/^>\s?/gm, '')
    // Heading marker
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

function splitParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function extractDescription(post: MigratedPost): MigratedPost {
  if (post.frontmatter.description && post.frontmatter.description.trim()) return post;

  const paragraphs = splitParagraphs(post.body);
  for (const para of paragraphs) {
    const stripped = stripMarkdown(para);
    if (stripped.length >= MIN_LENGTH) {
      const preview = stripped.slice(0, MAX_LENGTH);
      return {
        ...post,
        frontmatter: { ...post.frontmatter, description: preview },
        warnings: [
          ...post.warnings,
          `[extract-description] ${post.slug}: auto-filled "${preview.slice(0, 30)}..."`,
        ],
      };
    }
  }

  // 抽不到 → 降級用 title
  return {
    ...post,
    frontmatter: { ...post.frontmatter, description: post.frontmatter.title },
    warnings: [
      ...post.warnings,
      `[extract-description] ${post.slug}: 降級用 title（body 無 >=${MIN_LENGTH}字段落）`,
    ],
  };
}
```

- [ ] **Step 7.4: 跑測試確認全綠**

```bash
npm test -- scripts/__tests__/migrate-posts/extract-description.test.mts
```

若 strip 相關測試失敗，很可能是 regex 順序問題或 non-greedy match 沒處理好。逐條 debug。

- [ ] **Step 7.5: 加入 pipeline**

Edit `scripts/migrate-posts.mts`：

```ts
import { extractDescription } from './migrate-posts/extract-description.ts';

const transforms: Array<...> = [
  renameSlug,
  normalizeCategories,
  normalizeTags,
  stripMoreTag,
  extractDescription,  // 必須在 stripMoreTag 之後，避免 <!-- more --> 被當成段落分隔
];
```

- [ ] **Step 7.6: 驗證 + 查實際 warning**

```bash
npm test
npm run migrate:posts -- --dry-run 2>&1 | grep extract-description || echo "no warnings"
```

期望 `npm test` 全綠（39 + 8 = 47 個測試）。`grep` 應該至少看到一條 `ai-frontend-development-flow` 相關的 warning（因為只有這篇沒 description）。若看到超過 1 條，其他 post 的 description 欄位可能有空字串、需要回 audit。

- [ ] **Step 7.7: Commit**

```bash
git add scripts/migrate-posts/extract-description.ts scripts/__tests__/migrate-posts/extract-description.test.mts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 extractDescription transform 與 8 個 edge case 測試"
```

---

## Task 8: Transform — `{% codeblock %}` → fenced（TDD）

**目標：** 實作 `convertCodeblock(post)` 把 Hexo `{% codeblock [title] lang:xxx %} ... {% endcodeblock %}` 語法改成標準 Markdown fenced code block。Pre-flight 實測 4 篇會觸發。

Hexo 語法形式：

```
{% codeblock lang:javascript %}
const x = 1;
{% endcodeblock %}
```

或帶 title：

```
{% codeblock 標題 lang:javascript %}
const x = 1;
{% endcodeblock %}
```

轉成：

```
```javascript
const x = 1;
```

（有 title 的話暫時丟掉 title — Astro Shiki 不支援原生 title 語法，若未來要保留再另加一層 rehype plugin。這個決定記到 warnings。）

**Files:**
- Create: `scripts/migrate-posts/convert-codeblock.ts`
- Create: `scripts/__tests__/migrate-posts/convert-codeblock.test.mts`
- Modify: `scripts/migrate-posts.mts`

- [ ] **Step 8.1: 寫失敗測試**

```ts
// scripts/__tests__/migrate-posts/convert-codeblock.test.mts
import { describe, it, expect } from 'vitest';
import { convertCodeblock } from '../../migrate-posts/convert-codeblock.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(body: string): MigratedPost {
  return {
    sourceFile: '/x/a.md', slug: 'a',
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body,
    assets: new Map(),
    warnings: [],
  };
}

describe('convertCodeblock', () => {
  it('無 title', () => {
    const body = '{% codeblock lang:javascript %}\nconst x = 1;\n{% endcodeblock %}';
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe('```javascript\nconst x = 1;\n```');
  });

  it('有 title → title 丟掉 + warning', () => {
    const body = '{% codeblock 範例標題 lang:typescript %}\nlet x: number;\n{% endcodeblock %}';
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe('```typescript\nlet x: number;\n```');
    expect(result.warnings.some((w) => w.includes('範例標題'))).toBe(true);
  });

  it('多個連續 codeblock', () => {
    const body = [
      '{% codeblock lang:js %}',
      'a',
      '{% endcodeblock %}',
      '',
      '{% codeblock lang:css %}',
      'b',
      '{% endcodeblock %}',
    ].join('\n');
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe('```js\na\n```\n\n```css\nb\n```');
  });

  it('文中其他內容不動', () => {
    const body = '前面有文字\n\n{% codeblock lang:js %}\nx\n{% endcodeblock %}\n\n後面也有';
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe('前面有文字\n\n```js\nx\n```\n\n後面也有');
  });

  it('沒有任何 codeblock 的 body 不動', () => {
    const body = 'plain\n\n## header\n\nbody';
    const result = convertCodeblock(makePost(body));
    expect(result.body).toBe(body);
  });
});
```

- [ ] **Step 8.2: 跑測試失敗**

```bash
npm test -- scripts/__tests__/migrate-posts/convert-codeblock.test.mts
```

- [ ] **Step 8.3: 實作**

```ts
// scripts/migrate-posts/convert-codeblock.ts
import type { MigratedPost } from './types.ts';

// Match: {% codeblock [title] lang:xxx %} ... {% endcodeblock %}
// Non-greedy, multiline
const CODEBLOCK_RE = /\{%\s*codeblock(?:\s+([^%]*?))?\s+lang:([a-zA-Z0-9_+-]+)\s*%\}\n([\s\S]*?)\n\{%\s*endcodeblock\s*%\}/g;

export function convertCodeblock(post: MigratedPost): MigratedPost {
  const warnings: string[] = [...post.warnings];
  const body = post.body.replace(CODEBLOCK_RE, (_match, title, lang, code) => {
    const trimmedTitle = title?.trim();
    if (trimmedTitle) {
      warnings.push(`[convert-codeblock] ${post.slug}: 丟掉 codeblock title "${trimmedTitle}"（Shiki 不支援）`);
    }
    return `\`\`\`${lang}\n${code}\n\`\`\``;
  });

  return { ...post, body, warnings };
}
```

- [ ] **Step 8.4: 跑測試確認全綠**

```bash
npm test -- scripts/__tests__/migrate-posts/convert-codeblock.test.mts
```

- [ ] **Step 8.5: 加入 pipeline**

```ts
import { convertCodeblock } from './migrate-posts/convert-codeblock.ts';

const transforms: Array<...> = [
  renameSlug,
  normalizeCategories,
  normalizeTags,
  stripMoreTag,
  extractDescription,
  convertCodeblock,
];
```

- [ ] **Step 8.6: 驗證**

```bash
npm test
```

- [ ] **Step 8.7: Commit**

```bash
git add scripts/migrate-posts/convert-codeblock.ts scripts/__tests__/migrate-posts/convert-codeblock.test.mts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 convertCodeblock transform（Hexo → fenced）"
```

---

## Task 9: Transform — HackMD `=` fence marker strip（TDD）

**目標：** 把 HackMD 風格的 fence 語言尾綴 `=`（用來標記 line numbers）移除。Shiki 不認 `javascript=` 也不認 `bash=`，會 fallback 成 plain text。Pre-flight 實測 **8 篇** 會觸發（7 篇用 `javascript=`、1 篇用 `bash=`）。這個 transform 對任何 `^```<lang>=...$` 形式都生效，不限於 `javascript`。

轉換範例：
- ```javascript= → ```javascript
- ```js=123 → ```js
- ```css= → ```css
- ```bash= → ```bash

**Files:**
- Create: `scripts/migrate-posts/strip-hackmd-fence.ts`
- Create: `scripts/__tests__/migrate-posts/strip-hackmd-fence.test.mts`
- Modify: `scripts/migrate-posts.mts`

- [ ] **Step 9.1: 寫失敗測試**

```ts
// scripts/__tests__/migrate-posts/strip-hackmd-fence.test.mts
import { describe, it, expect } from 'vitest';
import { stripHackmdFence } from '../../migrate-posts/strip-hackmd-fence.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(body: string): MigratedPost {
  return {
    sourceFile: '/x/a.md', slug: 'a',
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body, assets: new Map(), warnings: [],
  };
}

describe('stripHackmdFence', () => {
  it('```javascript= → ```javascript', () => {
    const body = '```javascript=\nconst x = 1;\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```javascript\nconst x = 1;\n```');
  });

  it('```js=123 → ```js', () => {
    const body = '```js=123\nconsole.log();\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```js\nconsole.log();\n```');
  });

  it('```css= → ```css', () => {
    const body = '```css=\n.a { color: red; }\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```css\n.a { color: red; }\n```');
  });

  it('```bash= → ```bash（git-cross-os-config-setting 實際 case）', () => {
    const body = '```bash=\ngit config --global core.autocrlf input\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```bash\ngit config --global core.autocrlf input\n```');
  });

  it('多個 fence 都處理', () => {
    const body = '```js=\nA\n```\n\n```ts=\nB\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe('```js\nA\n```\n\n```ts\nB\n```');
  });

  it('正常 fence 不動', () => {
    const body = '```javascript\nconst x = 1;\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe(body);
  });

  it('內文包含 = 字元不誤傷', () => {
    const body = 'inline `x === y` check\n\n```js\nconst a = 1;\n```';
    const result = stripHackmdFence(makePost(body));
    expect(result.body).toBe(body);
  });
});
```

- [ ] **Step 9.2: 跑測試失敗**

```bash
npm test -- scripts/__tests__/migrate-posts/strip-hackmd-fence.test.mts
```

- [ ] **Step 9.3: 實作**

```ts
// scripts/migrate-posts/strip-hackmd-fence.ts
import type { MigratedPost } from './types.ts';

// 只 match line start 的 ```<lang>=<anything until newline>
const HACKMD_FENCE_RE = /^```([a-zA-Z0-9_+-]+)=[^\n]*$/gm;

export function stripHackmdFence(post: MigratedPost): MigratedPost {
  const body = post.body.replace(HACKMD_FENCE_RE, '```$1');
  return { ...post, body };
}
```

- [ ] **Step 9.4: 跑測試全綠**

```bash
npm test -- scripts/__tests__/migrate-posts/strip-hackmd-fence.test.mts
```

- [ ] **Step 9.5: 加入 pipeline**

```ts
import { stripHackmdFence } from './migrate-posts/strip-hackmd-fence.ts';

const transforms: Array<...> = [
  renameSlug,
  normalizeCategories,
  normalizeTags,
  stripMoreTag,
  extractDescription,
  convertCodeblock,
  stripHackmdFence,
];
```

- [ ] **Step 9.6: 驗證**

```bash
npm test
```

- [ ] **Step 9.7: Commit**

```bash
git add scripts/migrate-posts/strip-hackmd-fence.ts scripts/__tests__/migrate-posts/strip-hackmd-fence.test.mts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 stripHackmdFence transform（去除 HackMD 行號尾綴）"
```

---

## Task 10: Transform — `hexo-blog-setup-notes` logo 路徑 hard-code URL fix（TDD）

**目標：** 實作 `fixHardcodeUrl(post)` 把 `hexo-blog-setup-notes` post 的 hard-code logo URL 改成 co-located asset reference，並把 source logo 檔案註冊到 `post.assets` 讓 Task 12 assembly 複製。

**重要背景（P2 review 發現）：** 原文寫的是 `https://bolaslien.github.io/blog/img/logo.png`，但 `source/img/` 底下**不存在 `logo.png`**，只有 `logo.svg`。Hexo 原本就是 broken link（讀者點圖會 404），這次遷移順手把它修成正確的 `./logo.svg`。

原行：
```md
![](https://bolaslien.github.io/blog/img/logo.png)
```

改成：
```md
![](./logo.svg)
```

同時把 `source/img/logo.svg` 加入 `post.assets`，target filename `logo.svg`。這個 transform 只針對 slug 為 `hexo-blog-setup-notes` 的 post（前置 Task 3 已 rename 完成）。

**為什麼 Astro 6 支援：** Task 10 spike 已確認 `astro:assets` 處理 co-located SVG，`<img src="/blog/_astro/logo.HASH.svg">` 會正確產出，base prefix 也會加對。

**Files:**
- Create: `scripts/migrate-posts/fix-hardcode-url.ts`
- Create: `scripts/__tests__/migrate-posts/fix-hardcode-url.test.mts`
- Modify: `scripts/migrate-posts.mts`

- [ ] **Step 10.1: 先確認 source logo 實際在哪**

```bash
ls source/img/logo.* 2>/dev/null
ls source/img/ | head
```

期望看到 `logo.svg`（Pre-flight 已驗證：`source/img/` 下只有 `logo.svg`，**沒有** `logo.png`）。

若實況與 Pre-flight 不符（例如真的有 `logo.png` 或兩者都在），**STOP** 先跟 controller 對齊，不要自行決定要搬哪個。

- [ ] **Step 10.2: 寫失敗測試**

測試檔：

```ts
// scripts/__tests__/migrate-posts/fix-hardcode-url.test.mts
import { describe, it, expect } from 'vitest';
import { fixHardcodeUrl } from '../../migrate-posts/fix-hardcode-url.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(slug: string, body: string): MigratedPost {
  return {
    sourceFile: `/x/${slug}.md`, slug,
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body, assets: new Map(), warnings: [],
  };
}

describe('fixHardcodeUrl', () => {
  it('hexo-blog-setup-notes 的 logo URL 改成 ./logo.svg（同時修正副檔名）', () => {
    // 原文寫 logo.png 但實際檔案是 logo.svg — Hexo broken link，遷移順手修
    const body = '前言\n\n![](https://bolaslien.github.io/blog/img/logo.png)\n\n後文';
    const result = fixHardcodeUrl(makePost('hexo-blog-setup-notes', body));
    expect(result.body).toContain('![](./logo.svg)');
    expect(result.body).not.toContain('bolaslien.github.io/blog/img/logo');
    expect(result.body).not.toContain('logo.png');
    expect(result.assets.size).toBe(1);
  });

  it('asset map 註冊了 source/img/logo.svg → logo.svg', () => {
    const body = '![](https://bolaslien.github.io/blog/img/logo.png)';
    const result = fixHardcodeUrl(makePost('hexo-blog-setup-notes', body));
    const entry = [...result.assets.entries()][0];
    expect(entry[0]).toMatch(/source\/img\/logo\.svg$/);
    expect(entry[1]).toBe('logo.svg');
  });

  it('其他 slug 不動（連內文都不檢查）', () => {
    const body = '某篇文章隨便提到 bolaslien.github.io/blog/img/logo.png';
    const result = fixHardcodeUrl(makePost('random-post', body));
    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
  });

  it('hexo-blog-setup-notes 但內文沒 hard-code URL', () => {
    const body = '普通內文';
    const result = fixHardcodeUrl(makePost('hexo-blog-setup-notes', body));
    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
  });
});
```

- [ ] **Step 10.3: 跑測試失敗**

```bash
npm test -- scripts/__tests__/migrate-posts/fix-hardcode-url.test.mts
```

- [ ] **Step 10.4: 實作**

```ts
// scripts/migrate-posts/fix-hardcode-url.ts
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MigratedPost } from './types.ts';

// 原文寫的是 .png（Hexo broken link）
const HEXO_LOGO_URL = 'https://bolaslien.github.io/blog/img/logo.png';
// 實際 source 檔案是 .svg（順手修正）
const LOGO_SOURCE = resolve('source/img/logo.svg');
const LOGO_OUTPUT_FILENAME = 'logo.svg';

export function fixHardcodeUrl(post: MigratedPost): MigratedPost {
  if (post.slug !== 'hexo-blog-setup-notes') return post;
  if (!post.body.includes(HEXO_LOGO_URL)) return post;

  if (!existsSync(LOGO_SOURCE)) {
    return {
      ...post,
      warnings: [
        ...post.warnings,
        `[fix-hardcode-url] ${post.slug}: 找不到 source logo (${LOGO_SOURCE})，URL 不改`,
      ],
    };
  }

  const body = post.body.split(HEXO_LOGO_URL).join(`./${LOGO_OUTPUT_FILENAME}`);
  const assets = new Map(post.assets);
  assets.set(LOGO_SOURCE, LOGO_OUTPUT_FILENAME);
  return { ...post, body, assets };
}
```

- [ ] **Step 10.5: 跑測試全綠**

```bash
npm test -- scripts/__tests__/migrate-posts/fix-hardcode-url.test.mts
```

如果 `asset map 註冊了 logo` test fail，多半是 `resolve()` 產生的絕對路徑跟測試 regex 不 match — 用 relative 或改寫 expect 斷言。

- [ ] **Step 10.6: 加入 pipeline**

```ts
import { fixHardcodeUrl } from './migrate-posts/fix-hardcode-url.ts';

const transforms: Array<...> = [
  renameSlug,
  normalizeCategories,
  normalizeTags,
  stripMoreTag,
  extractDescription,
  convertCodeblock,
  stripHackmdFence,
  fixHardcodeUrl,
];
```

- [ ] **Step 10.7: 驗證**

```bash
npm test
npm run migrate:posts -- --dry-run 2>&1 | grep fix-hardcode || echo "no fix-hardcode warnings"
```

- [ ] **Step 10.8: Commit**

```bash
git add scripts/migrate-posts/fix-hardcode-url.ts scripts/__tests__/migrate-posts/fix-hardcode-url.test.mts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 fixHardcodeUrl transform 處理 hexo-blog-setup-notes logo"
```

---

## Task 11: Transform — imgur 下載 + URL rewrite（async TDD + mock fetch）

**目標：** 實作 async `downloadImgur(post)` 掃 post body 的 imgur URL，下載到 `assets` map，改寫 markdown。支援 `--skip-download` flag 在 dev 迭代時略過。

Spec 章節決策 4.2：
- HTTP GET `https://i.imgur.com/<hash>.<ext>`
- 下載到 `src/content/posts/<slug>/imgur-<hash>.<ext>`（Task 12 assembly 階段會真正寫檔；Task 11 只放進 `post.assets` map）
- Rewrite markdown `![](https://i.imgur.com/abc.png)` → `![](./imgur-abc.png)`
- 404 → 保留原 URL + warning
- 非 imgur URL 不誤傷

Pre-flight 實測 5 篇、20 張圖（spec 原估的數字）。

因為 async 引入 Promise 到 pipeline，這也是 migrate-posts.mts 主流程需要改成 `runPipelineAsync` 的時機。

**Files:**
- Create: `scripts/migrate-posts/download-imgur.ts`
- Create: `scripts/__tests__/migrate-posts/download-imgur.test.mts`
- Modify: `scripts/migrate-posts.mts`

- [ ] **Step 11.1: 寫失敗測試（mock fetch）**

```ts
// scripts/__tests__/migrate-posts/download-imgur.test.mts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadImgur } from '../../migrate-posts/download-imgur.ts';
import type { MigratedPost } from '../../migrate-posts/types.ts';

function makePost(body: string): MigratedPost {
  return {
    sourceFile: '/x/a.md', slug: 'a',
    frontmatter: { title: '', date: new Date(), tags: [], description: '' },
    body, assets: new Map(), warnings: [],
  };
}

const mockPng = new Uint8Array([137, 80, 78, 71]); // PNG magic bytes
const origFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = origFetch;
});

describe('downloadImgur', () => {
  it('下載一張圖並改寫 URL', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => mockPng.buffer,
    });

    const body = '前文\n\n![alt](https://i.imgur.com/abc.png)\n\n後文';
    const result = await downloadImgur(makePost(body), { skipDownload: false });

    expect(result.body).toContain('![alt](./imgur-abc.png)');
    expect(result.body).not.toContain('i.imgur.com');
    expect(result.assets.size).toBe(1);
  });

  it('多張連續 imgur', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, status: 200,
      arrayBuffer: async () => mockPng.buffer,
    });

    const body = [
      '![](https://i.imgur.com/aaa.png)',
      '![](https://i.imgur.com/bbb.jpg)',
      '![](https://i.imgur.com/ccc.gif)',
    ].join('\n\n');
    const result = await downloadImgur(makePost(body), { skipDownload: false });

    expect(result.body).toContain('./imgur-aaa.png');
    expect(result.body).toContain('./imgur-bbb.jpg');
    expect(result.body).toContain('./imgur-ccc.gif');
    expect(result.assets.size).toBe(3);
  });

  it('非 imgur 的 URL 不被誤傷', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, status: 200,
      arrayBuffer: async () => mockPng.buffer,
    });

    const body = '![](https://example.com/a.png)\n\n![](https://imgur.com/gallery/xyz) 不是 i.imgur.com';
    const result = await downloadImgur(makePost(body), { skipDownload: false });

    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('404 → warning 保留原 URL', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0),
    });

    const body = '![](https://i.imgur.com/deadlink.png)';
    const result = await downloadImgur(makePost(body), { skipDownload: false });

    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
    expect(result.warnings[0]).toContain('404');
    expect(result.warnings[0]).toContain('deadlink');
  });

  it('--skip-download 時不呼叫 fetch 也不動 body', async () => {
    const body = '![](https://i.imgur.com/abc.png)';
    const result = await downloadImgur(makePost(body), { skipDownload: true });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.body).toBe(body);
    expect(result.assets.size).toBe(0);
  });
});
```

- [ ] **Step 11.2: 跑測試失敗**

```bash
npm test -- scripts/__tests__/migrate-posts/download-imgur.test.mts
```

- [ ] **Step 11.3: 實作**

```ts
// scripts/migrate-posts/download-imgur.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { MigratedPost } from './types.ts';

// match ![alt](https://i.imgur.com/<hash>.<ext>)
const IMGUR_RE = /!\[([^\]]*)\]\(https:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)\.(png|jpg|jpeg|gif|webp)\)/g;

const FETCH_TIMEOUT_MS = 10_000;
const REQUEST_DELAY_MS = 200; // 避免 imgur rate-limit

export interface DownloadImgurOptions {
  skipDownload: boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function downloadImgur(
  post: MigratedPost,
  options: DownloadImgurOptions,
): Promise<MigratedPost> {
  // 收集所有 match
  const matches: Array<{ alt: string; hash: string; ext: string; full: string }> = [];
  IMGUR_RE.lastIndex = 0;
  let m;
  while ((m = IMGUR_RE.exec(post.body)) !== null) {
    matches.push({ alt: m[1]!, hash: m[2]!, ext: m[3]!, full: m[0]! });
  }

  if (matches.length === 0 || options.skipDownload) {
    return post;
  }

  const assets = new Map(post.assets);
  const warnings = [...post.warnings];
  let body = post.body;

  // 暫存目錄（avoid 在 worktree 裡留殘渣，Task 12 assembly 才寫到 output）
  const tempDir = join(tmpdir(), 'migrate-imgur', post.slug);
  mkdirSync(tempDir, { recursive: true });

  for (let i = 0; i < matches.length; i++) {
    const { alt, hash, ext, full } = matches[i]!;
    const filename = `imgur-${hash}.${ext}`;
    const url = `https://i.imgur.com/${hash}.${ext}`;

    if (i > 0) await sleep(REQUEST_DELAY_MS);

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!response.ok) {
        warnings.push(`[download-imgur] ${post.slug}: ${url} → ${response.status}，保留原 URL`);
        continue;
      }
      const buf = Buffer.from(await response.arrayBuffer());
      const tempPath = join(tempDir, filename);
      writeFileSync(tempPath, buf);
      assets.set(tempPath, filename);
      body = body.split(full).join(`![${alt}](./${filename})`);
    } catch (err) {
      const reason = (err as Error).name === 'TimeoutError'
        ? `timeout after ${FETCH_TIMEOUT_MS}ms`
        : (err as Error).message;
      warnings.push(`[download-imgur] ${post.slug}: ${url} → ${reason}，保留原 URL`);
    }
  }

  return { ...post, body, assets, warnings };
}
```

- [ ] **Step 11.4: 跑測試全綠**

```bash
npm test -- scripts/__tests__/migrate-posts/download-imgur.test.mts
```

- [ ] **Step 11.5: 把 `downloadImgur` 加入 pipeline**

`runPipeline` 從 Task 3 Step 3.5 開始就已經是 async 版本，所以這裡只要把 async transform 加進 transforms 陣列就好。

Edit `scripts/migrate-posts.mts`：

1. Import：
```ts
import { downloadImgur } from './migrate-posts/download-imgur.ts';
```

2. Transforms 陣列追加一行 async transform：
```ts
const transforms: Transform[] = [
  renameSlug,
  normalizeCategories,
  normalizeTags,
  stripMoreTag,
  extractDescription,
  convertCodeblock,
  stripHackmdFence,
  fixHardcodeUrl,
  (p) => downloadImgur(p, { skipDownload: SKIP_DOWNLOAD }),
];
```

**注意**：Task 12 的 `collectSiblingAssets` 會在 Task 12.4 插在 `fixHardcodeUrl` 之後、`downloadImgur` 之前。目前只加 `downloadImgur`。

- [ ] **Step 11.6: 執行 dry-run + --skip-download 驗證**

```bash
npm run migrate:posts -- --dry-run --skip-download
```

期望：60 篇列出，不跑 fetch（因為 skip-download）。

執行全部測試：
```bash
npm test
```

- [ ] **Step 11.7: Commit**

```bash
git add scripts/migrate-posts/download-imgur.ts scripts/__tests__/migrate-posts/download-imgur.test.mts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 downloadImgur async transform（支援 --skip-download）"
```

---

## Task 12: Assembly — 寫 `<slug>/index.md` 與 co-located assets

**目標：** Migrate script 的 output 階段。把 transformed post 寫到 `src/content/posts/<slug>/index.md`，同時把 `post.assets` 的每個檔案複製到 `<slug>/` 底下。還要：

- 每次執行先把 `src/content/posts/` **整個清空並重建**（idempotent），但保留 `.gitkeep`
- 處理 `refactor-with-ai-agents` sibling 資產目錄 → 5 張 PNG 進 assets map
- 處理 `my-ai-coding-journey.md` 的資產引用（audit 後決定：若用 imgur → Task 11 處理；若用其他路徑 → 這步補 asset map）
- Dry-run 模式下不寫檔，改印摘要（數量、assets 數、warnings）

**Files:**
- Create: `scripts/migrate-posts/assemble-output.ts`
- Modify: `scripts/migrate-posts.mts`

- [ ] **Step 12.1: 確認 `my-ai-coding-journey.md` 無圖片引用**

Pre-flight 實測：`my-ai-coding-journey.md` 內文**沒有任何** `![](...)` 或 `<img>` tag，所以不需要任何資產處理。但正式執行前再確認一次避免漂移：

```bash
grep -cE '!\[|<img' source/_posts/my-ai-coding-journey.md
```

期望：`0`。

若輸出非 0（表示有人加了圖），**STOP** 並印出實際內容：

```bash
grep -nE '!\[|<img' source/_posts/my-ai-coding-journey.md
```

然後回報 controller，討論這些新圖的來源形式（imgur? hard-code? 相對路徑？）要走哪個 transform 處理。不要讓 post 最後留下 broken URL。

若確認為 0 → 繼續 Step 12.2。

- [ ] **Step 12.2: 處理 `refactor-with-ai-agents` sibling 資產目錄**

建立一個新 sub-transform 處理這種「原生 sibling 目錄」的 Hexo pattern。可以寫在 `scripts/migrate-posts/collect-sibling-assets.ts`，或直接 inline 到 `assemble-output.ts` 的前置步驟。

選 inline：`assembleOutput` 在寫檔前掃 `source/_posts/<slug>/` 是否存在，若有則整個目錄的檔案登記到 `post.assets`。

- [ ] **Step 12.3: 實作 `assemble-output.ts`**

```ts
// scripts/migrate-posts/assemble-output.ts
import { rmSync, mkdirSync, writeFileSync, copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import matter from 'gray-matter';
import { formatTaipeiIso } from '../../src/utils/dates.ts';
import type { MigratedPost } from './types.ts';

const SOURCE_DIR = 'source/_posts';
const OUTPUT_DIR = 'src/content/posts';

/** Collect sibling asset folder (e.g. source/_posts/<slug>/) into post.assets */
export function collectSiblingAssets(post: MigratedPost): MigratedPost {
  // 原 slug（rename 前的）用來找 sibling 目錄
  const originalSlug = basename(post.sourceFile, '.md');
  const siblingDir = resolve(SOURCE_DIR, originalSlug);
  if (!existsSync(siblingDir) || !statSync(siblingDir).isDirectory()) return post;

  const assets = new Map(post.assets);
  for (const entry of readdirSync(siblingDir)) {
    const full = join(siblingDir, entry);
    if (statSync(full).isFile()) {
      assets.set(full, entry);
    }
  }
  return { ...post, assets };
}

/** Write transformed post to src/content/posts/<slug>/index.md + copy assets */
export function writePost(post: MigratedPost): void {
  const outDir = resolve(OUTPUT_DIR, post.slug);
  mkdirSync(outDir, { recursive: true });

  // frontmatter: 挑要保留的欄位，順序固定
  // date 用 formatTaipeiIso 寫入 `YYYY-MM-DDTHH:mm:ss+08:00`，
  // 而不是 .toISOString() 的 UTC 形式 — 讓 P3 routing 的 year/month/day
  // 計算不依賴 process.env.TZ
  const frontmatter = {
    title: post.frontmatter.title,
    date: formatTaipeiIso(post.frontmatter.date),
    description: post.frontmatter.description,
    tags: post.frontmatter.tags,
  };

  const fileContent = matter.stringify(post.body, frontmatter);
  writeFileSync(join(outDir, 'index.md'), fileContent, 'utf-8');

  for (const [source, filename] of post.assets) {
    if (!existsSync(source)) {
      console.warn(`[assemble] ${post.slug}: asset source not found: ${source}`);
      continue;
    }
    copyFileSync(source, join(outDir, filename));
  }
}

/** Clean output dir before writing, but keep .gitkeep */
export function cleanOutputDir(): void {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    return;
  }
  for (const entry of readdirSync(OUTPUT_DIR)) {
    if (entry === '.gitkeep') continue;
    rmSync(join(OUTPUT_DIR, entry), { recursive: true, force: true });
  }
}
```

- [ ] **Step 12.4: 加 `collectSiblingAssets` 到 pipeline（before imgur）**

Edit `scripts/migrate-posts.mts`：

```ts
import { collectSiblingAssets, cleanOutputDir, writePost } from './migrate-posts/assemble-output.ts';

const transforms: Transform[] = [
  renameSlug,
  normalizeCategories,
  normalizeTags,
  stripMoreTag,
  extractDescription,
  convertCodeblock,
  stripHackmdFence,
  fixHardcodeUrl,
  collectSiblingAssets,  // ← 新增
  (p) => downloadImgur(p, { skipDownload: SKIP_DOWNLOAD }),
];
```

- [ ] **Step 12.5: 寫檔路徑啟用**

Edit `scripts/migrate-posts.mts` Main 區塊的結尾：

```ts
if (DRY_RUN) {
  printDryRunReport(transformed);
  process.exit(0);
}

// 實際寫檔
cleanOutputDir();
for (const post of transformed) {
  writePost(post);
}
console.log(`[migrate] 寫入 ${transformed.length} 篇 post 到 ${OUTPUT_DIR}`);

// 列出所有 warnings 給 Bolas review
const allWarnings = transformed.flatMap((p) => p.warnings);
if (allWarnings.length > 0) {
  console.log(`\n[warnings] 共 ${allWarnings.length} 條：`);
  for (const w of allWarnings) console.log(`  ${w}`);
}
```

- [ ] **Step 12.6: 擴充 dry-run 報告**

Edit `printDryRunReport` 加入 assets count 與 warnings summary：

```ts
function printDryRunReport(posts: MigratedPost[]): void {
  console.log(`[dry-run] 共載入 ${posts.length} 篇 post`);
  console.log(`[dry-run] SKIP_DOWNLOAD=${SKIP_DOWNLOAD}`);
  console.log('');

  const totalAssets = posts.reduce((sum, p) => sum + p.assets.size, 0);
  const totalWarnings = posts.reduce((sum, p) => sum + p.warnings.length, 0);
  console.log(`[dry-run] 總共 ${totalAssets} 個 asset 會被複製、${totalWarnings} 條 warning`);
  console.log('');

  for (const p of posts) {
    const extras: string[] = [];
    if (p.assets.size > 0) extras.push(`${p.assets.size} assets`);
    if (p.warnings.length > 0) extras.push(`${p.warnings.length} warnings`);
    const suffix = extras.length > 0 ? ` [${extras.join(', ')}]` : '';
    console.log(`- ${p.slug}${suffix}`);
  }

  if (totalWarnings > 0) {
    console.log('\n[warnings]');
    for (const p of posts) {
      for (const w of p.warnings) console.log(`  ${w}`);
    }
  }
}
```

- [ ] **Step 12.7: 跑 dry-run 全 60 篇**

```bash
npm run migrate:posts -- --dry-run --skip-download
```

期望：
- 60 篇列出
- `refactor-with-ai-agents` 顯示 5 assets
- `hexo-blog-setup-notes` 顯示 1 asset（logo）
- `ai-frontend-development-flow` 顯示 1 warning（extract-description）
- Warnings 總數 ≥ 1
- **不應該有任何 error**

若有未預期的 shape（e.g. 某篇 post 有 warning 但預期不該有），記錄下來進 Step 14 review 時問 Bolas。

- [ ] **Step 12.8: Commit**

```bash
git add scripts/migrate-posts/assemble-output.ts scripts/migrate-posts.mts
git commit -m "feat(migration): 加入 output assembly 與 collectSiblingAssets transform"
```

---

## Task 13: `src/pages/about.astro` — 從 `source/about/index.md` 手動 inline

**目標：** 把 Hexo 的 about 頁面（`source/about/index.md`）內容搬成 Astro page。這是一次性手工，不走 migrate script。

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 13.1: 讀 source about 內容**

```bash
cat source/about/index.md
```

記下 frontmatter（title / layout 等）與 body。

- [ ] **Step 13.2: 寫 `src/pages/about.astro`**

用 P1 Task 6 的 placeholder `index.astro` 當起點。**不要加複雜 layout 或 import**（P3 才做）：

```astro
---
// P2 手動 inline from source/about/index.md
// P3 會統一 layout
---
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>About · Bolas 的開發與學習筆記</title>
  </head>
  <body>
    <main>
      <h1>About</h1>
      {/* 把 source/about/index.md 的 markdown 內容手動轉成 HTML/JSX 寫在這裡 */}
      <p>...</p>
    </main>
  </body>
</html>
```

實際內容依 source/about/index.md 實際內容手動對應。若 source about 是純文字，直接 `<p>` 就好；若有連結或格式，手動對映成 HTML。

- [ ] **Step 13.3: 驗證 build**

```bash
npm run build
ls dist/about/ 2>&1
cat dist/about/index.html 2>&1 | head -20
```

期望：`dist/about/index.html` 存在且內容對齊。

- [ ] **Step 13.4: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat(astro): 加入 about page（從 source/about/index.md 手動 inline）"
```

---

## Task 14: Full dry-run + Bolas review gate

**目標：** 跑完整 dry-run，印出 60 篇 summary + 所有 warnings，**由 Controller 暫停交給 Bolas 看**。Bolas 確認過才進 Task 15 寫檔。

**這是人類介入 gate，不能 auto-approve。**

- [ ] **Step 14.1: 跑完整 dry-run（開啟 imgur download）**

```bash
npm run migrate:posts -- --dry-run
```

**注意：不加 `--skip-download`**。這次要真的跑 fetch，把 20 張 imgur 圖下載到 tmp 驗證 404 狀態。

期望輸出：
- 60 篇列出
- **7 篇有 assets**：
  - `refactor-with-ai-agents`（1 post，5 張 sibling PNG）
  - `hexo-blog-setup-notes`（1 post，1 張 `logo.svg` — 注意是 .svg）
  - 5 篇 imgur posts（`build-a-line-bot`、`js-dev-tools`、`js-type-coercion`、`js-variables`、`git-cross-os-config-setting`）
- Warnings 可能包含：
  - 1 條 `extract-description` warning（`ai-frontend-development-flow`）
  - 若干條 `convert-codeblock` title-dropped warnings
  - 0 或更多 `download-imgur` 404 / timeout warnings
- **不應該**有任何 error 或 crash

- [ ] **Step 14.2: Controller 把 dry-run output 貼給 Bolas**

包含：
- 60 篇列表 + 每篇的 assets/warnings counts
- 所有 warnings 的完整訊息
- 5 個特別注意的 shape 說明：
  - 哪些 post 被改 slug（7 篇 rename）
  - `ai-frontend-development-flow` 被自動抽 description
  - `ai-frontend-development-flow` 有個既有 tag `前端開發` — 確認是否要手動改成 `前端技術` 以對齊其他文章？
  - 哪幾篇 imgur 下載失敗（若有）
  - 任何 unknown category warning
- 特別驗證 `hexo-blog-setup-notes` 的 logo 變成 `./logo.svg` 而不是 `./logo.png`
- 問 Bolas：**「確認這些 shape OK 嗎？不 OK 的地方告訴我調整哪個 transform。」**

- [ ] **Step 14.3: 等 Bolas 回覆**

**在 Bolas 回覆前，不執行 Task 15。** 這個 gate 存在的意義就是人類 sanity check，不可 skip。

若 Bolas 提出修改：
- 回到對應的 Task 3-11，改 transform + test，re-run dry-run
- 每次修改都重跑完整 Task 14

若 Bolas approve → 進 Task 15。

- [ ] **Step 14.4: Commit review 紀錄（empty commit）**

```bash
git commit --allow-empty -m "chore(migration): Bolas approve full dry-run，準備寫檔"
```

---

## Task 15: 真正寫檔 + Content Collection schema + build 驗證

**目標：** 用非 dry-run 模式跑 migrate script，把 60 篇 post 寫到 `src/content/posts/<slug>/index.md`。跑 `astro sync` + `astro build` 驗證 Zod schema 對 60 篇都通過、build 無 error。

**Files:**
- Create: `src/content/posts/<slug>/index.md` × 60
- Create: `src/content/posts/<slug>/*.png` (sibling + imgur + logo)
- Modify: `src/content/posts/.gitkeep`（不動，用來標記目錄）

- [ ] **Step 15.1: 實際執行 migrate**

```bash
npm run migrate:posts
```

期望：
- `[migrate] 寫入 60 篇 post 到 src/content/posts`
- `[warnings] 共 N 條:` 跟 Task 14 一致

檢查：
```bash
ls src/content/posts/ | wc -l     # 應為 61（60 個 slug dir + .gitkeep）
ls src/content/posts/hexo-blog-setup-notes/   # 應含 index.md + logo.png
ls src/content/posts/refactor-with-ai-agents/ # 應含 index.md + 5 PNG
```

- [ ] **Step 15.2: 跑 astro sync 確認 schema 通過**

```bash
npx astro sync
```

期望：`Synced content` + `Generated ...ms` + **無 Zod error**。

若 `astro sync` 噴 Zod error（`description required` / `date invalid` 等），STOP。
- 讀錯誤訊息找出哪篇 post 的哪個欄位錯
- 回對應的 transform task 修 bug
- 跑 `npm run migrate:posts` 重寫（migrate 是 idempotent，會清空重建）
- 再跑 `astro sync`

- [ ] **Step 15.3: 跑 astro build 確認 60 篇都 build 過**

```bash
npm run build
```

期望：
- 60 個 page 被產生（routing 還沒，但 content collection 應該被載入沒有 crash）
- `astro:assets` 優化了 co-located 圖片（看 `dist/_astro/` 下有對應 hashed webp）
- **無 error**

注意：**P2 不實作 routing**，所以 60 篇 post 不會有對應的 `/blog/<year>/<month>/<day>/<slug>/` output。P2 的 build 只驗證 Content Collection 載入 OK 與首頁 / about / spike（已刪）能 render。只要 build exit 0 就 OK。

若 `astro build` 失敗（無 route 不算失敗，`astro:assets` 路徑問題才算），STOP。

- [ ] **Step 15.4: 驗證 verify-dates 仍通過**

```bash
npm run verify:dates
```

期望仍是 `✓ 60 篇 post 的日期抽取全部在 legacy 日期集合中`。

若 fail → 是 Task 0 refactor 出問題。回去查。

- [ ] **Step 15.5: 跑所有 unit tests 確認 no regression**

```bash
npm test
```

期望：所有測試（P1 9 個 + P2 約 43 個 = ~52 個）全綠。

- [ ] **Step 15.6: `git add` 寫入的 60 篇 post**

```bash
git add src/content/posts/
git status
```

**注意：**
- `src/content/posts/.gitkeep` 不動
- 60 個 `<slug>/index.md` 新增
- 若干個 sibling PNG / logo / imgur 新增
- 應該是「大量 new file」而非「modified」— 若看到有 modified，表示 Task 0-14 某處把檔案寫到了不該寫的地方

- [ ] **Step 15.7: Commit（拆成兩個，好 review）**

先 commit index.md：
```bash
git add src/content/posts/*/index.md
git commit -m "feat(content): 遷移 60 篇 Hexo post 到 Astro Content Collection"
```

再 commit assets：
```bash
git add src/content/posts/
git commit -m "feat(content): 搬入 co-located post assets（logo、imgur、sibling PNG）"
```

- [ ] **Step 15.8: 全量 acceptance 再跑一次**

```bash
npm run build
npm test
npm run verify:dates
npx astro sync
```

全綠 → 進 Task 16。

---

## Task 16: P2 Acceptance + Summary Commit

**目標：** P2 結束 phase 標記，更新 spec 狀態到 P2 完成，準備交給 P3。

**Files:**
- Modify: `docs/superpowers/specs/2026-04-14-hexo-to-astro-migration-design.md`

- [ ] **Step 16.1: 最終 acceptance sweep**

```bash
npm run dev > /tmp/p2-dev.log 2>&1 &
DEV_PID=$!
sleep 5
grep "Local" /tmp/p2-dev.log
kill $DEV_PID 2>/dev/null; sleep 1; kill -9 $DEV_PID 2>/dev/null || true

npm run build
npm test
npm run verify:dates
npx astro sync
```

期望：5 項全綠。

- [ ] **Step 16.2: 確認 repo 結構**

```bash
find src/content/posts -maxdepth 1 -type d | wc -l    # 61（60 slug + posts 本身）
ls scripts/migrate-posts/*.ts | wc -l                 # 11（types + 9 transforms + assemble-output）
ls scripts/__tests__/migrate-posts/*.test.mts | wc -l # 9
```

- [ ] **Step 16.3: 更新 spec 狀態**

Edit `docs/superpowers/specs/2026-04-14-hexo-to-astro-migration-design.md` 頂部：

`- **狀態**：P1 完成 — 進入 P2（內容遷移）`

改成：

`- **狀態**：P2 完成 — 進入 P3（routing + layouts + fonts）`

- [ ] **Step 16.4: 最終 phase commit**

```bash
git add docs/superpowers/specs/2026-04-14-hexo-to-astro-migration-design.md
git commit -m "chore(migration): P2 完成 — 60 篇 content 遷移、transform 測試、Zod schema 驗證通過"
git log --oneline -30
```

- [ ] **Step 16.5: 回報 P2 完成**

準備給 Bolas 的 summary（Controller 會 relay）：

1. **P2 完成的產出清單**：
   - `parseFrontmatterDate` 共用 helper + 3 測試
   - `migrate-posts.mts` + 9 個 transform module + 9 個 golden test suite
   - 60 篇 post 落地到 `src/content/posts/<slug>/index.md`（co-located）
   - 1 個 about page inline
   - Zod schema 全 60 篇通過
   - `npm run build` 成功

2. **P2 執行中發現的 plan 偏差 / 修正**（若有）

3. **未處理的 warnings 清單**（Bolas 可人工 follow-up）

4. **下一步（P3）**：
   - 實作 `[year]/[month]/[day]/[slug].astro` 動態路由
   - 寫真正的首頁（按日期倒序）
   - Layouts / components / Tags page
   - `astro:fonts`、`@astrojs/partytown` (GA4)、`@astrojs/rss`
   - Link audit script 撰寫（P4 跑）

5. **需要 Bolas 確認才能進 P3 的事項**：
   - P3 Task 字體選擇（spec 決策 G 標註 LCP-critical deferred）
   - Shiki theme（`one-light` vs `atom-one-light` custom import）
   - 首頁要放哪些 widgets（Icarus 原本 sidebar 有 Profile/Tags/RecentPosts/Toc，P3 要挑）

---

## P2 Acceptance Criteria

| 項目 | 如何驗證 |
|---|---|
| `parseFrontmatterDate` helper 抽出 + 測試 | Task 0.7 + Task 16.1 `npm test` |
| `migrate-posts.mts` + 9 transform + 9 test suites | Task 1-11 各自 TDD + Task 16.1 `npm test` |
| 60 篇 post 寫入 `src/content/posts/<slug>/index.md` | Task 15.1 + `ls src/content/posts/ \| wc -l` = 61 |
| Co-located assets 複製（imgur / logo / sibling） | Task 15.1 + spot-check `ls src/content/posts/refactor-with-ai-agents/` |
| Zod schema 對 60 篇全部通過 | Task 15.2 `astro sync` 無 error |
| `astro build` 成功 | Task 15.3 exit 0 |
| `verify:dates` 維持 60/60 通過 | Task 0.6 + Task 15.4 |
| About page 存在 | Task 13.3 `dist/about/index.html` |
| `gh-pages` 遠端不動 | 整個 P2 不執行 `push gh-pages` 或 `branch gh-pages` 類操作 |
| Bolas 批准 full dry-run | Task 14.3 明確 approve |

---

## Out of Scope（P2 不做）

- 動態路由（`[year]/[month]/[day]/[slug].astro`） → P3
- 真正首頁內容（按日期倒序） → P3
- Layouts / Components / Sidebar / Toc → P3
- Tags 頁面（`/tags/` + `/tags/[tag]/`） → P3
- `astro:fonts` / `@astrojs/partytown` / `@astrojs/rss` → P3
- Link audit script / URL diff → P3/P4
- GitHub Actions workflow → P4
- GH Pages Source 切換 → P5
- 清 `legacy/hexo/` / `db.json` → P5

---

## 風險與 mitigation

| 風險 | 緩解 |
|---|---|
| gray-matter/js-yaml 對某些 frontmatter shape 處理不如預期（e.g. inline tags `tags: [a, b]` vs block `tags:\n- a\n- b`） | Task 1 loadSourcePosts 已把 `tags` 強制轉 `string[]`；任何非 array 的 tags 輸入會被忽略並記 warning |
| imgur 某些圖已失效 → 20 張測試沒辦法全下載 | Task 11 已有 404 handler，保留原 URL + warning；Bolas 在 Task 14 review 時看 warning 清單決定要不要補圖 |
| `my-ai-coding-journey.md` 的資產引用模式沒預期到 | Task 12.1 強制 audit；發現新模式就停下來擴 transform，不硬 assemble |
| Zod schema validation 某篇 post fail（e.g. description 為空、tag 有 null） | Task 15.2 會捕捉；回對應 transform 修 bug；migrate script 可直接重跑（idempotent） |
| Tags 包含 XSS vector（如 `<script>`） | Astro Content Collections 的 markdown renderer 預設會 escape；P3 tag page 若用 `set:html` 才會有風險 |
| 多個 transform 順序相依（e.g. renameSlug 必須在 fixHardcodeUrl 之前，因為後者依賴 slug） | Task 3-11 每個都註明相對位置；runPipeline 線性執行保證順序 |
| imgur download 在 CI 環境跑很慢或失敗 | Task 11 的測試 mock fetch；真實 download 只在 Task 14（Bolas 手動觸發）跑；P2 不進 CI |
| `refactor-with-ai-agents` sibling 目錄跟 slug 同名但 Task 3 改 slug 之前的匹配會錯 | `collectSiblingAssets` 用 `basename(post.sourceFile)` 而不是 `post.slug`，確保是原始名稱 |
| Test 數字累積太大導致我算錯 total expected | 每個 Task 的 Step X.4 / X.6 / X.7 都跑 `npm test` 驗證，不依賴 running total 心算 |

---

## Rollback

- 任何 Task 卡住 → `git reset --hard <前一個 task 的 commit>` 回到上一個 task 結束狀態
- P2 整段要放棄 → `git reset --hard pre-astro-migration`（P1 Task 1 打的 tag）+ 重新從 P1 Task 11 完成的 commit 開始
- `src/content/posts/` 被寫壞 → `rm -rf src/content/posts && git checkout src/content/posts` 還原到 `.gitkeep` 空狀態，再 `npm run migrate:posts` 重跑
- Migrate script bug 汙染了 source → 不可能發生：`loadSourcePosts` 只 `readFileSync`，never write。若發現 `source/_posts/` 有變更 → 立刻 `git checkout source/_posts/` + 查哪條 transform 違約

---

## 執行 Handoff

**Plan 已完成並儲存於：** `docs/superpowers/plans/2026-04-15-p2-content-migration.md`

兩個執行選項：

**1. Subagent-Driven（建議）** — Controller dispatch 每個 task 一個 fresh subagent，task 間兩段 review，快迭代

**2. Inline Execution** — 在當前 session 用 executing-plans 批次執行，有 checkpoint

選哪個？如選 1，REQUIRED SUB-SKILL 是 `superpowers:subagent-driven-development`。
