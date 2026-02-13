# 會議記錄：個人品牌網站重構方向

- 日期：2026-02-13
- 專案：自架 Blog（現況：Hexo + Icarus）
- 會議型態：策略討論（架構重構前期）

## 會議目標

釐清是否要從現有 `Hexo + Icarus` 架構升級為「個人品牌導向」網站，並建立後續重構決策框架。

## 背景與需求

- 目前網站為傳統部落格架構。
- 目標風格參考：`https://kaochenlong.com/`
- 期望網站不只放文章，還能承載個人品牌呈現與服務導流。

## 討論重點

### 1) 主流靜態網站框架選項（2026-02）

- `Astro`：內容型網站相容性高、效能佳，適合品牌官網 + Blog。
- `Hugo`：建置速度快、穩定，偏純內容發布。
- `Nuxt 3 + Nuxt Content`：Vue 生態整合好、擴充互動功能方便。
- `Next.js`：React 生態最完整，但對純內容站可能較重。
- `Eleventy`、`SvelteKit`：適合特定偏好與客製流程。

### 2) 是否需要整體重規劃

共識：**建議重規劃，但不一定一次重寫**。  
原因：目標網站型態已從「單純 Blog」轉為「品牌首頁 + 內容入口 + 能力/服務展示」。

### 3) 三個規劃層次

#### A. 資訊架構（IA）

定義網站頁面與使用者動線，例如：

- 首頁（品牌定位、代表作、CTA）
- 文章
- 演講/課程
- 作品/案例
- 關於
- 聯絡

重點：先定義訪客路徑與轉換目標，再決定頁面細節。

#### B. 內容模型（Content Model）

定義內容型別與欄位，而非只有 `post`，例如：

- `post`：title, slug, date, tags, category, summary, cover
- `talk`：event, date, topic, slides, video, organizer
- `project`：role, problem, solution, result, link
- `course`：status, audience, syllabus, enroll_url
- `site_settings`：首頁文案、精選內容、社群連結

重點：先有穩定資料模型，前端模板才不會反覆重做。

#### C. 技術架構（Tech Stack）

在 IA 與 Content Model 確認後再選型，優先考慮：

1. Astro
2. Hugo
3. Nuxt Content

## 當前結論

- 方向上採「分階段重構」，不做一次性大爆改。
- 先做 IA 與內容模型，再進入實作層（技術棧、元件、樣式、部署）。
- 若以內容型個人品牌站為主，`Astro` 為優先候選。

## 建議執行順序（下階段）

1. 定義網站目標受眾與首頁轉換目標（訂閱 / 合作 / 課程導流）。
2. 產出 IA v1（頁面樹 + 導覽 + 首頁區塊）。
3. 產出 Content Model v1（內容型別與欄位）。
4. 以 Astro 建立新站骨架（不影響現有 Hexo 站）。
5. 逐步搬遷舊文章與內容資產。
6. 驗收後再切換正式網域。

## 下次會議建議議程

1. 確認品牌定位句（Hero Message）與 CTA。
2. 確認 IA v1 頁面清單與導覽結構。
3. 確認內容型別與欄位（post/talk/project/course）。
4. 確認技術決策（Astro 是否定案、是否搭配 CMS）。
5. 訂定第一個可上線里程碑（MVP 範圍與時程）。

## 開放待決事項

- 是否需要後台 CMS（例如 Decap / Sanity / Notion-based）？
- 舊站 URL 與分類結構如何保留（SEO 301 策略）？
- 是否要導入站內搜尋、電子報、留言系統？
- 是否需要中英雙語內容規劃？
