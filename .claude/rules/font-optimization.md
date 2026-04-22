---
description: Font loading optimization rules for this Astro 6 project
---

# Font Loading Rules

## 使用 Astro 原生 Fonts API

字體設定走 `astro.config.mjs` 的 `fonts` 陣列，不要用 CSS `@import` 或直接 import `@fontsource/*.css`。

```js
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Noto Sans TC',
      cssVariable: '--font-sans',
      weights: [400, 500, 600, 700, 800],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400, 500, 700],
      styles: ['normal', 'italic'],
    },
  ],
});
```

## 在 BaseLayout.astro 載入

```astro
import { Font } from 'astro:assets';
---
<head>
  <Font cssVariable="--font-sans" preload />
  <Font cssVariable="--font-mono" />
  ...
</head>
```

- `preload` 只加在 body text 字體（Noto Sans TC）
- 程式碼字體（JetBrains Mono）不加 preload

## 禁止做法

- `@import url('https://fonts.googleapis.com/...')` — render-blocking
- `import '@fontsource/noto-sans-tc/300.css'` — 繞過 Fonts API
- 載入未使用的 weight（300 在這個 project 無任何 CSS 引用）

## 新增字體時

先查 `fontProviders` 是否支援該來源（fontsource / google / bunny / adobe / fontshare / local），加進 `fonts` 陣列即可，CSS variable 自動對應。
