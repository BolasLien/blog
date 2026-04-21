# P3: Routing + Layouts

**Branch:** feat/astro-p3-routing  
**Worktree:** .worktrees/feat-astro-p3-routing  
**Goal:** `astro build` exit 0，完整首頁 + 文章頁 + layout

## Context

- Astro 6.1.7, Node v22, TypeScript strict mode
- base: `/blog`, trailingSlash: `always`, format: `directory`
- 60 篇 content posts 在 `src/content/posts/<slug>/index.md`
- content.config.ts schema: title, date(coerce), tags[], description
- src/utils/dates.ts 有 formatDateParams(date): { year, month, day }
- 文章 URL: /blog/YYYY/MM/DD/slug/
- astro 6 中 z 要從 `astro/zod` import（非 astro:content）

## Tasks

### Task 1: BaseLayout.astro

建立 `src/layouts/BaseLayout.astro`，接著更新 `src/pages/about.astro` 改用 layout。

**src/layouts/BaseLayout.astro:**
```
Props: title: string, description?: string
head:
  - charset UTF-8
  - viewport width=device-width,initial-scale=1
  - <title>{title} · Bolas 的開發與學習筆記</title>（若 title 已含「Bolas 的開發與學習筆記」則直接用）
  - <meta name="description"> if description 存在
  - OG: og:title, og:description, og:type=website
lang="zh-TW"

nav（放在 <body> 頂部）:
  - <a href="/blog/">首頁</a>
  - <a href="/blog/about/">About</a>

<slot /> for main content
```

**src/pages/about.astro:** 改用 BaseLayout，title="About"

**沒有任何測試需新增**（layout 是 UI，unit test 不適用）

commit message: `feat(p3): BaseLayout.astro + about 改用 layout`

---

### Task 2: 動態路由 [year]/[month]/[day]/[slug].astro

建立 `src/pages/[year]/[month]/[day]/[slug].astro`

```typescript
// getStaticPaths
import { getCollection } from 'astro:content';
import { formatDateParams } from '../../../utils/dates';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => {
    const { year, month, day } = formatDateParams(post.data.date);
    return {
      params: { year, month, day, slug: post.id },
      props: { post },
    };
  });
}

// render
const { post } = Astro.props;
const { Content } = await post.render();
```

- 使用 BaseLayout，title={post.data.title}，description={post.data.description}
- 在 Content 前顯示文章 header：title（h1）、date（時間格式 YYYY-MM-DD）、tags（comma list）

**注意：** astro 6 的 post.id 是 slug（`<slug>/index.md` loader 解析出的 id 為 slug，不含 `/index.md`）。要確認 id 的實際值——若 id 包含路徑前綴需調整。

**沒有任何測試需新增**

commit message: `feat(p3): 動態路由 [year]/[month]/[day]/[slug].astro`

---

### Task 3: 首頁 src/pages/index.astro

改寫 `src/pages/index.astro`（現在是 P1 placeholder）

```typescript
import { getCollection } from 'astro:content';
import { formatDateParams } from '../utils/dates';

const posts = await getCollection('posts');
const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
```

每篇文章顯示：
- title（連結到 /blog/YYYY/MM/DD/slug/）
- date（YYYY-MM-DD 格式）
- description
- tags（comma separated）

使用 BaseLayout，title="首頁"

**沒有任何測試需新增**

commit message: `feat(p3): 首頁列出 60 篇文章（倒序）`

---

### Task 4: astro:fonts — Noto Sans TC

在 astro.config.mjs 加入 @astrojs/fonts 或透過 @fontsource/noto-sans-tc。

判斷方式：
1. 先看 package.json 有無 @astrojs/fonts；若無，用 @fontsource/noto-sans-tc（npm install 後在 BaseLayout import）
2. 若 @astrojs/fonts 可用，優先用 astro:fonts integration

在 BaseLayout 套用字型（body 或 html 的 font-family: 'Noto Sans TC', sans-serif）

commit message: `feat(p3): Noto Sans TC 字型`

---

### Task 5: @astrojs/rss — RSS feed

安裝 @astrojs/rss（若尚未安裝）。

建立 `src/pages/rss.xml.ts`：
- endpoint 輸出 60 篇 post 的 RSS
- 每篇包含 title, pubDate, description, link
- link 格式: `${site}/blog/YYYY/MM/DD/slug/`

commit message: `feat(p3): RSS feed /blog/rss.xml`

---

### Task 6: @astrojs/partytown + GA4

安裝 @astrojs/partytown（若尚未安裝）。

在 astro.config.mjs 加入 partytown integration（config: { forward: ['dataLayer.push'] }）

在 BaseLayout 加入 GA4 gtag script（使用 partytown）：
- GA4 measurement ID: G-XXXXXXXXXX（placeholder，之後使用者自行替換）
- 用 `<script type="text/partytown">` 或按 @astrojs/partytown 文件方式

commit message: `feat(p3): @astrojs/partytown + GA4 placeholder`

---

## Done Criteria

- `astro build` 在 worktree 中 exit 0（無 TypeScript/build error）
- /blog/ 首頁列出 60 篇文章（倒序）
- /blog/YYYY/MM/DD/slug/ 任意一篇可 render
- /blog/about/ 使用 BaseLayout
- 無 console error / warning（build 輸出）
