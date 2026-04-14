# P1 — Astro 6 Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可跑 `npm run dev` 的空殼 Astro 6 專案，同時驗證時區處理與 co-located image 不出問題，作為後續 P2 內容遷移的穩固基地。

**Architecture:** 就地改造現有 `blog/` repo：把 Hexo 相關檔案搬到 `legacy/hexo/`，在 root 建立 Astro 6 專案結構。Hexo 的 `source/_posts/` 保留原位（P2 內容遷移的 read-only source）。`origin/gh-pages` 分支完全不動（rollback target）。

**Tech Stack:**
- Astro 6（含 Content Layer API）
- TypeScript strict mode
- Vitest（unit tests）
- gray-matter（frontmatter parsing for verify-dates script）
- tsx（跑 .mts/.ts 腳本）

**Spec 來源:** `docs/superpowers/specs/2026-04-14-hexo-to-astro-migration-design.md`（P1 段落 + Tests 段落 + URL/Link Audit 段落）

**Pre-flight 確認（已在寫 plan 時驗證）：**
- `public/` 已列入 `.gitignore`（刪除不影響 git 狀態）
- `node_modules/` 已 gitignored
- `origin/gh-pages` 存在遠端
- Node `v22.17.1`（符合 Astro 6 要求的 ≥ 20.3）
- npm `10.9.2`

**Gate:** Task 8 的 co-located image spike 是硬 gate。通過才進 Task 9 acceptance；沒通過 STOP 回報 Bolas 重新決定 `src/assets/` fallback。

---

## Task 1: Backup、Git Tag、與 legacy-dates.txt 產生

**目標：** 建立 rollback 基準、snapshot 舊 `public/`、產生 `scripts/legacy-public-dates.txt` 讓 `verify-dates.mjs` 日後可重現比對。

**Files:**
- 建立外部：`~/snapshot-pre-astro-migration-YYYYMMDD.tar.gz`
- 建立：`scripts/legacy-public-dates.txt`
- Git 操作：`tag pre-astro-migration`

- [ ] **Step 1.1: 確認 working tree 乾淨**

```bash
git status --porcelain
```

期望：只有 `.serena/`、`.tmp/`、`source/_posts/meeting-game.md` 幾個未追蹤檔案，或者全空。若有未預期的 dirty 狀態停下來問 Bolas。

- [ ] **Step 1.2: 建立 `pre-astro-migration` tag**

```bash
git tag pre-astro-migration
git tag -l pre-astro-migration
```

期望輸出：`pre-astro-migration`

- [ ] **Step 1.3: 驗證 `origin/gh-pages` 存在且無本地 override**

```bash
git fetch origin gh-pages
git log -1 origin/gh-pages --oneline
git branch --list gh-pages
```

期望：`origin/gh-pages` 有 commit hash，本地無 `gh-pages` branch（`git branch --list gh-pages` 空輸出）。本地若已存在先不要管，不動它。

- [ ] **Step 1.4: 用 Hexo 最後一次 build 產生完整 `public/`**

```bash
npm install
npx hexo clean
npx hexo generate
ls public/ | head
```

期望：`public/` 內有 `index.html`、`2020/`、`2021/`、`2022/` 等年份目錄。

- [ ] **Step 1.5: 產生 legacy date list（日後 `verify-dates.mjs` 輸入）**

```bash
mkdir -p scripts
find public -type d -regex '.*public/[0-9][0-9][0-9][0-9]/[0-9][0-9]/[0-9][0-9]$' \
  | sed 's|^public/||' \
  | sort -u \
  > scripts/legacy-public-dates.txt
wc -l scripts/legacy-public-dates.txt
```

期望：行數介於 30 到 63 之間（多個 post 可能共享同一日期目錄）。

- [ ] **Step 1.6: Snapshot 整個 `public/` 到家目錄 tar**

```bash
DATE=$(date +%Y%m%d)
tar -czf ~/snapshot-pre-astro-migration-$DATE.tar.gz public/
ls -lh ~/snapshot-pre-astro-migration-*.tar.gz
```

期望：tar 檔案存在，大小至少數 MB。

- [ ] **Step 1.7: Commit `legacy-public-dates.txt`**

```bash
git add scripts/legacy-public-dates.txt
git commit -m "chore(migration): 凍結 Hexo public/ 的日期目錄清單作為 verify-dates 輸入"
```

---

## Task 2: 搬移 Hexo 檔案到 `legacy/hexo/`

**目標：** 清出 repo root 給 Astro，同時保留所有 Hexo 檔案作為日後參考。Source posts 保留原位給 P2 遷移腳本讀。

**Files:**
- 搬移（`git mv`）：
  - `package.json` → `legacy/hexo/package.json`
  - `package-lock.json` → `legacy/hexo/package-lock.json`（若存在）
  - `_config.yml` → `legacy/hexo/_config.yml`
  - `_config.icarus.yml` → `legacy/hexo/_config.icarus.yml`
  - `themes/` → `legacy/hexo/themes/`
  - `scaffolds/` → `legacy/hexo/scaffolds/`（若存在）
- 保留原位：`source/`（P2 read-only source）、`docs/`、`.github/`、`.gitignore`
- 刪除：`public/`、`node_modules/`（兩者都 gitignored）

- [ ] **Step 2.1: 建立 `legacy/hexo/` 目錄**

```bash
mkdir -p legacy/hexo
```

- [ ] **Step 2.2: `git mv` 所有 Hexo 根層檔案**

```bash
git mv package.json legacy/hexo/package.json
[ -f package-lock.json ] && git mv package-lock.json legacy/hexo/package-lock.json
git mv _config.yml legacy/hexo/_config.yml
git mv _config.icarus.yml legacy/hexo/_config.icarus.yml
git mv themes legacy/hexo/themes
[ -d scaffolds ] && git mv scaffolds legacy/hexo/scaffolds
git status
```

期望：`git status` 顯示上述檔案/目錄都是 `renamed:` 類型，沒有 deletion。

- [ ] **Step 2.3: 刪除 build 產物與 node_modules**

```bash
rm -rf public node_modules
ls -la | grep -E '^d' | awk '{print $NF}'
```

期望輸出不含 `public` 或 `node_modules`，應該看到 `docs`、`legacy`、`source`、`scripts` 等。

- [ ] **Step 2.4: Commit 搬移**

```bash
git add -A
git commit -m "chore(migration): 搬移 Hexo 根層檔案到 legacy/hexo/"
```

期望：commit 成功，`git log -1 --stat` 顯示 rename 記錄而非 add+delete。

---

## Task 3: 撰寫 Astro 6 的 `package.json` 並安裝依賴

**目標：** 寫一份最小可行的 Astro 6 `package.json`，裝必要 deps。

**Files:**
- 建立：`package.json`

- [ ] **Step 3.1: 寫 `package.json`**

```json
{
  "name": "bolas-blog",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest",
    "verify:dates": "tsx scripts/verify-dates.mts"
  },
  "dependencies": {
    "astro": "^6.0.0",
    "@astrojs/sitemap": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "gray-matter": "^4.0.3",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

注意：版本都用 `^` 讓 npm 解成現行 stable。Astro 6 的正式 major 版若 npm resolve 失敗，改 Task 3.2 之後驗證。

- [ ] **Step 3.2: Install**

```bash
npm install
```

期望：install 成功，沒有 peer dep warning 是 hard error。看到「found 0 vulnerabilities」或可容忍等級的 warning。

- [ ] **Step 3.3: 驗證 Astro 6 安裝版本**

```bash
npx astro --version
npm ls astro @astrojs/sitemap vitest typescript tsx gray-matter
```

期望：`astro` 顯示 `6.x.x`（不是 5.x）。若 resolve 成 5.x 停下來，Bolas 要手動改版本號或確認 Astro 6 是否真的 stable released。

- [ ] **Step 3.4: Commit package.json 與 lock 檔**

```bash
git add package.json package-lock.json
git commit -m "chore(astro): 建立 Astro 6 專案 package.json 與依賴"
```

---

## Task 4: `astro.config.mjs` 與 `tsconfig.json`

**目標：** 寫 Astro 6 配置（`base: '/blog'`、`trailingSlash: 'always'`、`build.format: 'directory'`、sitemap integration），以及 strict TypeScript 配置。

**Files:**
- 建立：`astro.config.mjs`
- 建立：`tsconfig.json`
- 修改：`.gitignore`（加 Astro 的 `dist/`、`.astro/`）

- [ ] **Step 4.1: 寫 `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://bolaslien.github.io',
  base: '/blog',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap(),
  ],
});
```

**不要**在 P1 就加 `@astrojs/partytown` 跟 `@astrojs/rss`，它們是 P3 範圍。P1 只驗證最小 scaffold 跑得起來。

- [ ] **Step 4.2: 寫 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "legacy", "node_modules"]
}
```

- [ ] **Step 4.3: 更新 `.gitignore`**

```bash
cat >> .gitignore <<'EOF'

# Astro
dist/
.astro/
.env
.env.*
!.env.example
EOF
```

確認：

```bash
tail -20 .gitignore
```

期望看到原有內容 + 新加的 Astro section。

- [ ] **Step 4.4: Commit config 檔**

```bash
git add astro.config.mjs tsconfig.json .gitignore
git commit -m "chore(astro): 加入 astro.config.mjs、tsconfig.json、更新 .gitignore"
```

---

## Task 5: Vitest 配置

**目標：** 獨立的 Vitest 配置（不跟 Astro 的 Vite 混），測試檔案路徑 include `src/**/*.test.ts` 與 `scripts/**/*.test.mts`。

**Files:**
- 建立：`vitest.config.ts`

- [ ] **Step 5.1: 寫 `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mts'],
    reporters: 'verbose',
  },
});
```

- [ ] **Step 5.2: 確認 Vitest 能啟動（雖然還沒測試檔）**

```bash
npm test
```

期望：Vitest 印出「No test files found」，exit 0 或預期的 warning。**不能** crash 在 config 解析。

- [ ] **Step 5.3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore(astro): 加入 vitest 配置"
```

---

## Task 6: 最小 placeholder 首頁 + `npm run dev` smoke test

**目標：** 寫一個簡單的 `src/pages/index.astro`，確認 `npm run dev` 能起服務、`/blog/` 能開得到畫面。這是 P1 的「空殼可跑」acceptance 之一。

**Files:**
- 建立：`src/pages/index.astro`

- [ ] **Step 6.1: 寫 placeholder 首頁**

```astro
---
// P1 placeholder — 真正首頁在 P3 實作
---
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Bolas 的開發與學習筆記（Astro 遷移中）</title>
  </head>
  <body>
    <main>
      <h1>Astro 遷移中</h1>
      <p>P1 scaffold 完成。真正的首頁會在 P3 實作。</p>
      <p>Base path: <code>/blog</code>, trailing slash: always.</p>
    </main>
  </body>
</html>
```

- [ ] **Step 6.2: 啟動 dev server 確認可用**

```bash
npm run dev
```

在另一個 terminal（或手動）打開 `http://localhost:4321/blog/`，確認看得到 `Astro 遷移中` 的標題。

期望：
- Astro 啟動訊息印出 `Local http://localhost:4321/blog/`（注意 base path）
- 打開該 URL 畫面正確
- Console 無 error

**驗證完後 Ctrl+C 停 dev server。**

- [ ] **Step 6.3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(astro): 加入 P1 placeholder 首頁，驗證 dev server + base path"
```

---

## Task 7: Content Collection Schema（`src/content.config.ts`）

**目標：** 定義 `posts` Collection 的 Zod schema，對應 spec 的 Frontmatter Schema 章節。注意檔案位置是 `src/content.config.ts`（Astro 5+ 新位置），**不是** `src/content/config.ts`。

**Files:**
- 建立：`src/content.config.ts`

- [ ] **Step 7.1: 寫 `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    description: z.string(),
  }),
});

export const collections = { posts };
```

- [ ] **Step 7.2: 建立 posts 目錄（空的）**

```bash
mkdir -p src/content/posts
touch src/content/posts/.gitkeep
```

- [ ] **Step 7.3: 確認 Astro 能識別 schema（type sync）**

```bash
npx astro sync
```

期望：`Types generated` 或類似訊息，`.astro/types.d.ts` 被產生，無 error。

- [ ] **Step 7.4: Commit**

```bash
git add src/content.config.ts src/content/posts/.gitkeep
git commit -m "feat(astro): 定義 posts Content Collection schema"
```

---

## Task 8: TDD `formatDateParams` helper

**目標：** 以 TDD 實作 `src/utils/dates.ts` 的 `formatDateParams(date: Date)`，核心需求是時區正確處理。spec 的時區段落已經分析過三種處理策略，這裡採「策略 c：migrate script 序列化 +08:00 + formatDateParams 用 Intl 抽 Taipei 日期」。

**核心設計決定**：`formatDateParams` 用 `Intl.DateTimeFormat` 的 `timeZone: 'Asia/Taipei'` 模式，無論執行環境是什麼 TZ 都能正確抽出 Taipei 時區的年月日。

**Files:**
- 建立：`src/utils/dates.ts`
- 建立：`src/utils/dates.test.ts`

- [ ] **Step 8.1: 先寫失敗的 unit test**

`src/utils/dates.test.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { formatDateParams } from './dates';

describe('formatDateParams', () => {
  it('台北時間 00:00 不會倒退到前一天', () => {
    const date = new Date('2020-08-28T00:00:00+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });

  it('台北時間 23:59 不會跳到隔天', () => {
    const date = new Date('2020-08-28T23:59:59+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });

  it('跨年邊界（台北時間）', () => {
    const date = new Date('2021-01-01T00:00:00+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2021', month: '01', day: '01',
    });
  });

  it('跨月邊界', () => {
    const date = new Date('2020-08-31T23:59:00+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '08', day: '31',
    });
  });

  it('單位數月日補 0', () => {
    const date = new Date('2020-03-05T12:00:00+08:00');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '03', day: '05',
    });
  });

  it('UTC 環境下建構的 Date（模擬 CI runner）也能抽對 Taipei 日期', () => {
    // 同一個絕對時間點：UTC 15:00 = Taipei 23:00，日期還是同一天
    const date = new Date('2020-08-28T15:00:00Z');
    expect(formatDateParams(date)).toEqual({
      year: '2020', month: '08', day: '28',
    });
  });
});
```

- [ ] **Step 8.2: 執行測試，確認全部 FAIL**

```bash
npm test -- src/utils/dates.test.ts
```

期望：6 個 failures，訊息含 `Cannot find module './dates'` 或類似。

- [ ] **Step 8.3: 寫實作**

`src/utils/dates.ts`：

```ts
export interface DateParams {
  year: string;
  month: string;
  day: string;
}

/**
 * 抽出 Date 在台北時區下的 year/month/day（均為字串、月日補 0）。
 * 用 Intl.DateTimeFormat 避開 process TZ 變動造成的漂移。
 */
export function formatDateParams(date: Date): DateParams {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((p) => p.type === type);
    if (!part) throw new Error(`formatDateParams: 找不到 part ${type}`);
    return part.value;
  };

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
  };
}
```

- [ ] **Step 8.4: 再跑一次測試，確認全部 PASS**

```bash
npm test -- src/utils/dates.test.ts
```

期望：6 個 tests passed。任一失敗就停下來 debug，不要 commit。

- [ ] **Step 8.5: Commit**

```bash
git add src/utils/dates.ts src/utils/dates.test.ts
git commit -m "feat(astro): 加入 formatDateParams helper 與時區邊界測試"
```

---

## Task 9: `verify-dates.mts` 驗證腳本跑 63 篇

**目標：** 寫一個 script，讀 63 篇 `source/_posts/*.md` 的 frontmatter date，套用 `formatDateParams`，比對 `scripts/legacy-public-dates.txt`。若有任何 post 的日期抽取結果不在舊 public 日期目錄集合內，exit 非 0 並印出 diff。這個 script 是 spec Tests 章節的「驗證腳本」。

**Files:**
- 建立：`scripts/verify-dates.mts`

- [ ] **Step 9.1: 寫 script**

`scripts/verify-dates.mts`：

```ts
#!/usr/bin/env tsx
/**
 * 驗證每篇 Hexo post 的 frontmatter date 套用 formatDateParams 後
 * 對應的 year/month/day 都能在 legacy/hexo-public 日期目錄清單中找到。
 *
 * 這是時區正確性的最後一道驗證，對應 spec Tests 章節的「驗證腳本」。
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { formatDateParams } from '../src/utils/dates.ts';

const POSTS_DIR = 'source/_posts';
const LEGACY_DATES_FILE = 'scripts/legacy-public-dates.txt';

if (!existsSync(LEGACY_DATES_FILE)) {
  console.error(`ERROR: 找不到 ${LEGACY_DATES_FILE}（應該在 Task 1 Step 1.5 產生）`);
  process.exit(2);
}

const legacyDates = new Set(
  readFileSync(LEGACY_DATES_FILE, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
);

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
const mismatches: string[] = [];

for (const file of files) {
  const raw = readFileSync(join(POSTS_DIR, file), 'utf-8');
  const { data } = matter(raw);

  if (!data.date) {
    mismatches.push(`[NO DATE] ${file}`);
    continue;
  }

  // frontmatter 的 date 可能是 "2020-08-28 13:55:28"（無 TZ）或已經有 offset
  // 視為台北時間處理：若無 offset 就補 +08:00
  const rawStr = typeof data.date === 'string' ? data.date : data.date.toISOString();
  const isoish = rawStr.replace(' ', 'T');
  const hasTz = /[+-]\d{2}:?\d{2}$|Z$/.test(isoish);
  const normalized = hasTz ? isoish : `${isoish}+08:00`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    mismatches.push(`[INVALID DATE] ${file}: ${rawStr}`);
    continue;
  }

  const { year, month, day } = formatDateParams(date);
  const key = `${year}/${month}/${day}`;

  if (!legacyDates.has(key)) {
    mismatches.push(`[DRIFT] ${file} → ${key} 不在 legacy/hexo-public 日期集合中`);
  }
}

if (mismatches.length > 0) {
  console.error(`\n❌ ${mismatches.length} 個 post 出現問題：\n`);
  for (const m of mismatches) console.error(`  ${m}`);
  process.exit(1);
}

console.log(`✓ ${files.length} 篇 post 的日期抽取全部在 legacy 日期集合中`);
```

- [ ] **Step 9.2: 執行 script**

```bash
npm run verify:dates
```

期望：印出 `✓ 63 篇 post 的日期抽取全部在 legacy 日期集合中`。

**若失敗的狀況**：
- `[NO DATE]` → 代表某篇 frontmatter 沒 date 欄位。回報 Bolas 手動補
- `[INVALID DATE]` → date 格式異常。回報 Bolas
- `[DRIFT]` → 時區處理有 bug。這是 hard stop：先 debug `formatDateParams`，或確認 `normalized` 的 +08:00 補法是否正確。**不要直接忽略**。

- [ ] **Step 9.3: Commit**

```bash
git add scripts/verify-dates.mts
git commit -m "feat(migration): 加入 verify-dates 腳本驗證 63 篇時區抽取"
```

---

## Task 10: Co-Located Image Spike（**GATE**）

**目標：** 驗證 Astro 6 的 `src/content/posts/<slug>/index.md` + 同目錄 `./image.png` 模式能正確被 `astro:assets` 優化，不會重現 Astro 5 的 issue #12772。

**這是 P1 的硬 gate：通過才進 Task 11；沒通過 STOP，整個 P1 卡住，需要回去跟 Bolas 重談 `src/assets/` fallback 策略。**

**Files:**
- 建立（暫時，spike 完會刪）：
  - `src/content/posts/_spike-test/index.md`
  - `src/content/posts/_spike-test/test-pixel.png`
  - `src/pages/spike.astro`（固定路由，避免 Content Layer id format 造成路徑不確定）

- [ ] **Step 10.1: 建立 spike 測試內容**

```bash
mkdir -p src/content/posts/_spike-test
cat > src/content/posts/_spike-test/index.md <<'EOF'
---
title: Spike Test
date: 2026-04-14T12:00:00+08:00
tags: [spike]
description: Co-located image spike for issue 12772 verification
---

這是 spike 測試文。底下應該有一張優化後的 1x1 圖。

![1x1 test pixel](./test-pixel.png)
EOF
```

- [ ] **Step 10.2: 產生 1x1 test PNG**

```bash
echo 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' \
  | base64 --decode \
  > src/content/posts/_spike-test/test-pixel.png
file src/content/posts/_spike-test/test-pixel.png
```

期望：`PNG image data, 1 x 1`。

- [ ] **Step 10.3: 寫 spike 路由 `src/pages/spike.astro`（固定路由）**

```astro
---
import { getCollection, render } from 'astro:content';

const posts = await getCollection('posts');
const spike = posts.find((p) => p.id.includes('_spike-test'));
if (!spike) {
  throw new Error('Spike test post not found — Task 10.1 產生的文章可能沒被 Content Collection 抓到');
}
const { Content } = await render(spike);
---
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>Spike: {spike.data.title}</title>
  </head>
  <body>
    <h1>{spike.data.title}</h1>
    <Content />
  </body>
</html>
```

- [ ] **Step 10.4: Build**

```bash
npm run build
```

期望：build 成功，無 error。注意觀察是否有 `test-pixel.png` 相關的 404 或 warning。

- [ ] **Step 10.5: 驗證 spike 路由產出**

```bash
ls dist/spike/ 2>/dev/null
find dist -name 'test-pixel*' -type f
```

期望：
- `dist/spike/index.html` 存在（固定路由 + `trailingSlash: always` + `format: directory`）
- 至少一個 `test-pixel*.png`（或 `.webp`）檔案存在於 `dist/_astro/` 底下（Astro 會加 hash 後綴）

- [ ] **Step 10.6: 驗證 HTML 引用的是優化路徑**

```bash
grep -o 'src="[^"]*test-pixel[^"]*"' dist/spike/index.html
```

期望：看到類似 `src="/blog/_astro/test-pixel.HASH.png"`（或 `.webp`）的 hashed 路徑。若看到 `src="./test-pixel.png"` 或空，代表 `astro:assets` **沒**處理這張圖 → spike FAIL。

- [ ] **Step 10.7: Gate 判定**

**條件全部滿足才算 PASS**：
1. Task 10.4 build 無 error
2. Task 10.5 dist 內存在 hashed png 檔
3. Task 10.6 HTML 引用 hashed 路徑

任一項失敗 → **STOP**，不要進 Task 11，不要 commit spike 刪除。直接跟 Bolas 回報：
```
Spike FAIL: Astro 6 尚未修復 #12772 / 或 co-located image 處理異常。
Phase 1 需要先決定 fallback：
- 選項 A：改成 src/assets/posts/<slug>/ 模式（非 Content Collection 內嵌）
- 選項 B：用 public/posts/<slug>/ （沒有 astro:assets 優化）
- 選項 C：回報 Astro 官方 issue 等修復
建議 Bolas 選 A，重新定案 Tasks 7、9、10。
```

- [ ] **Step 10.8: 若 PASS：清掉 spike 檔案**

```bash
rm -rf src/content/posts/_spike-test
rm -f src/pages/spike.astro
```

- [ ] **Step 10.9: 再跑一次 build 確認清乾淨後還能 build**

```bash
npm run build
```

期望：build 成功。

- [ ] **Step 10.10: Commit spike 結論（註記 gate 通過）**

```bash
git add -A
git commit -m "chore(migration): 驗證 Astro 6 co-located image (issue #12772) 已修復 — spike gate 通過"
```

---

## Task 11: P1 Acceptance + Summary Commit

**目標：** 跑過所有 P1 acceptance 檢查，列出 P1 完成的具體產出，commit 一個 phase 標記 commit。

- [ ] **Step 11.1: 確認所有 acceptance 檢查通過**

```bash
# 1. Dev server 能起（只跑幾秒確認不 crash）
timeout 10s npm run dev || true

# 2. Build 能成功
npm run build

# 3. Unit tests 全通
npm test

# 4. verify-dates 通過
npm run verify:dates

# 5. astro sync 無錯
npx astro sync
```

期望：5 項都成功（dev server timeout 不算錯，只要不是 start-up crash）。

- [ ] **Step 11.2: 確認 repo 結構符合 spec**

```bash
tree -L 2 -I 'node_modules|dist|.astro|legacy|source' --noreport 2>/dev/null || find . -maxdepth 2 -not -path '*/node_modules*' -not -path '*/dist*' -not -path '*/.astro*' -not -path '*/legacy*' -not -path '*/source*' -not -path '*/.git*' | sort
```

期望看到：
- `./astro.config.mjs`
- `./package.json`
- `./tsconfig.json`
- `./vitest.config.ts`
- `./src/content.config.ts`
- `./src/content/posts/`
- `./src/pages/index.astro`
- `./src/utils/dates.ts`
- `./src/utils/dates.test.ts`
- `./scripts/verify-dates.mts`
- `./scripts/legacy-public-dates.txt`
- `./docs/superpowers/specs/2026-04-14-hexo-to-astro-migration-design.md`
- `./docs/superpowers/plans/2026-04-14-p1-astro-scaffold.md`

- [ ] **Step 11.3: 更新 spec 狀態 → P1 完成**

編輯 `docs/superpowers/specs/2026-04-14-hexo-to-astro-migration-design.md` 頂部的狀態行：

`- **狀態**：P0 — 設計定案中`

改成：

`- **狀態**：P1 完成 — 進入 P2（內容遷移）`

```bash
git add docs/superpowers/specs/2026-04-14-hexo-to-astro-migration-design.md
```

- [ ] **Step 11.4: 最終 phase commit**

```bash
git commit -m "chore(migration): P1 完成 — Astro 6 scaffold、schema、時區驗證、co-located image gate 通過"
git log --oneline -15
```

期望：`git log` 顯示本 phase 的所有 commits（Task 1–11），gh-pages branch 完全沒被觸及。

- [ ] **Step 11.5: 回報 P1 完成到 Bolas**

輸出一段總結：
- P1 完成的產出清單（scaffold、schema、helper、script、spike gate）
- 下一步（P2：寫 migrate-posts.mjs 腳本 + 每條 transform rule 的 golden unit tests）
- 需要 Bolas 確認才能進 P2 的事項：目前無（P1 已包含所有 gate）

---

## P1 Acceptance Criteria（對應 spec Phasing 表）

| 項目 | 如何驗證 |
|---|---|
| `npm run dev` 可跑的空殼 | Task 6.2 瀏覽器確認 + Task 11.1 dev server smoke test |
| `formatDateParams` test 通過 | Task 8.4 + Task 11.1 `npm test` |
| `verify-dates.mjs` 跑 63 篇 exit 0 | Task 9.2 + Task 11.1 `npm run verify:dates` |
| Co-located image Astro 6 已修（gate） | Task 10.4–10.7 三項全部滿足 |
| `base: '/blog'` 正確 | Task 6.2 瀏覽器看 URL + Task 11.1 build 產出 |
| `trailingSlash: 'always'` 正確 | Task 11.1 build 後 `dist/` 每個 page 都在 `<slug>/index.html` |
| `gh-pages` 遠端不動 | Task 1.3 確認後整個 P1 不執行任何 `push gh-pages` 或 `branch gh-pages` 類的操作 |

---

## Out of Scope（P1 不做）

- 實際文章的遷移（P2）
- Layouts / components / 首頁真實內容（P3）
- `@astrojs/partytown`、`@astrojs/rss` 安裝與整合（P3）
- Font 策略決定（P3，flagged as LCP-critical deferred）
- Link audit script（P3 撰寫，P4 跑）
- URL diff script（P4）
- GitHub Actions workflow（P4 撰寫）
- GH Pages Source 切換（P5）
- 清除 `legacy/hexo/`（P5）
