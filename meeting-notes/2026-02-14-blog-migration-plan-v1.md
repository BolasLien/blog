# 遷移計畫 v1：Hexo -> Astro（SEO 保護版）

- 日期：2026-02-14
- 專案：Bolas 技術部落格重構
- 範圍：第一階段只做「品牌首頁 + 舊文章完整遷移」

## 已確認決策

1. URL 全保留：`post`、`tags`、`categories`、`archives`、`pagination` 全部維持既有路徑。
2. 遷移目標：先完成部落格內容完整遷移，其他內容型別（talk/project/course）延後。
3. Content Model：列為遷移後工作，不納入本階段。
4. 上線門檻：新舊 `sitemap.xml` URL 一致率必須達到 100%。
5. 301 策略：第一階段不依賴 301。若驗收發現少數無法保留 URL，再另行補救。
6. MVP 整合：只做站內搜尋與 GA。
7. 上線方式：一次全切（big-bang cutover）。

## 既有 URL 契約（不可破壞）

- Base path：`/blog`
- 文章 permalink：`/:year/:month/:day/:title/`
- 既有目錄路徑：`/tags/`、`/categories/`、`/archives/`
- 分頁路徑：`/page/:num/`

## 執行里程碑

1. 建立 Astro 骨架與基礎版型（品牌首頁 + 文章列表 + 文章頁）。
2. 匯入舊文章與圖片資產，完成 Markdown/front matter 映射。
3. 重建 `tags`、`categories`、`archives`、`pagination` 頁面。
4. 接入站內搜尋與 GA，確認事件有進到報表。
5. 產生新站 `sitemap.xml` 並做 URL diff 驗收。
6. 驗收通過後一次切換正式流量。

## 驗收清單（Go/No-Go）

- [ ] 新舊 sitemap URL 一致率 100%。
- [ ] 抽樣文章頁（至少 30 篇）內容、圖片、程式碼區塊顯示正確。
- [ ] `tags/categories/archives/pagination` 路徑全數可訪問。
- [ ] canonical、title、description、OG 資訊存在且正確。
- [ ] 站內搜尋可找到文章。
- [ ] GA page_view 正常進帳。
- [ ] 無重大 404（切換前後抽樣檢查）。

## 風險與對策

1. Markdown 渲染差異（表格/程式碼區塊）
- 對策：建立「高風險文章清單」逐篇人工比對。

2. 路徑尾斜線或 index 產物行為不同
- 對策：以 URL 契約先寫測試清單，build 後自動比對。

3. 一次全切的 SEO 波動
- 對策：切換後 4 週觀察 Search Console（索引、404、排名關鍵字）。

## 切換後觀察指標（4 週）

- 每日：404、索引錯誤、GA 自然流量趨勢。
- 每週：主要 landing pages 曝光/點擊是否異常下滑。
- 若異常：先定位 URL 或 metadata 問題，再評估是否補 301（例外處理）。
