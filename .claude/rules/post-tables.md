---
description: 文章內 markdown table 兩種樣式（C 預設 / D zebra）的適用情境
---

# Post Table 樣式規則

文章 markdown 表格有兩種樣式，由 `src/styles/global.css` 的 `.prose table` 區塊定義。
`.table-wrap`（橫向 scroll + 邊框）由 `plugins/rehype-table-wrap.mjs` 在 build 時自動加上，寫作端不用手動包。

兩種樣式不是用「資料量多寡」分，是用**語意**分：

- C = 視覺停頓、讓讀者「停下來看」
- D = 數據橫掃、讓眼睛「沿著一列比對」

## C · Denim-soft header band（預設）

純 markdown table，不用加任何 wrapper。

```markdown
| 指標 | 說明 | 分數 |
| --- | --- | --- |
| 程式碼可讀性 | 命名、結構、註解一致性 | 82 |
| 測試覆蓋 | 單元、整合、E2E 加權 | 74 |
```

特徵：

- 表頭吃進一塊 denim-soft 色塊
- 整張表用 `radius-md` 圓角框起來
- hover 整列換 `--bg-2` 高亮
- 視覺重量比 zebra 重，比較「成形」

**適合：** 文章中段需要明顯「這裡有資訊」的整理區塊。例如定義性對照、概念說明、評分整理。讓讀者在閱讀流中視覺停頓、知道這是一塊獨立的資訊。

## D · Warm zebra（opt-in）

外面包 `<div class="table-zebra">`，HTML 寫在 markdown 內。

```markdown
<div class="table-zebra">

| 專案 | stars | issues | 最後更新 |
| --- | --- | --- | --- |
| astro-paper | 3.4k | 12 | 2 天前 |
| hexo-theme-icarus | 2.1k | 38 | 3 週前 |

</div>
```

注意：`<div>` 上下要留空行，否則 markdown parser 不會解析裡面的 table。

特徵：

- 表頭 mono 字體 + uppercase（像 console / data table）
- 沒有左右框，只有上下 hairline
- **沒有列分隔線，靠 bg-1 / bg-2 底色交錯斷行**
- hover 用 denim-soft 高亮

**適合：** 數據型對照，讓眼睛沿著一列橫掃。例如多版本規格比較、benchmark 數值、多套件選項對照。

**注意：** bg-2 在 reading-first 的版面裡聲量最大，使用要節制 — 不要一篇文章塞兩三張 zebra，會搶走內文焦點。

## 決策原則

- 預設用 C，除非要做數據型橫掃對照
- 不要為了「換口味」用 D，要對應到「眼睛要怎麼讀這張表」的語意
- 同一篇文章不要連續出現多張 D（聲量問題）
