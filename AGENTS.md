# Repository Guidelines

## 專案結構與模組說明
本專案是 Bolas Lien 的技術部落格，使用 Hexo SSG 與 Icarus 主題套件。
- `source/_posts/`：文章內容（Markdown）。
- `source/`：站內頁面（`about/`、`tags/`、`categories/`）與靜態資源（`source/img/`）。
- `themes/icarus/`：Icarus 主題原始碼（JS/JSX、Stylus、layout、多語系）。
- `scaffolds/`：Hexo 新增文章/頁面時使用的模板。
- `public/`：Hexo 建置輸出目錄，視為產物檔。
- `_config.yml`、`_config.icarus.yml`：站點與主題設定檔。

## 建置、測試與開發指令
- `npm install`：安裝根目錄相依套件。
- `npm run clean`：清除產物與快取（如 `public/`）。
- `npm run server`：啟動本機開發伺服器。
- `npm run build`：產生靜態網站到 `public/`。
- `npm run deploy`：依 `hexo-deployer-git` 設定部署網站。
- `cd themes/icarus && npm run lint`：修改主題程式碼後執行 Lint。

## 程式風格與命名慣例
- Markdown 文章需使用 YAML front matter，章節標題清楚明確。
- 英文檔名建議使用小寫 kebab-case，例如 `js-array-prototype-find.md`。
- 保持可讀行長，避免行尾空白。
- 調整主題時，遵循 `themes/icarus/` 既有 JS/JSX 與 Stylus 寫法。
- 設定檔變更請聚焦且明確，集中於 `_config.yml` 或 `_config.icarus.yml`。

## 測試與驗證指南
根目錄目前沒有獨立自動化測試框架。
- 內容或設定變更的基本驗證：`npm run clean && npm run build`。
- 視覺與內容檢查：執行 `npm run server` 後在瀏覽器確認頁面。
- 主題程式碼變更：執行 `cd themes/icarus && npm run lint`。

## Commit 與 Pull Request 規範
目前提交紀錄以 Conventional Commits（如 `feat:`、`chore:`）為主，少量使用方括號標記。
- 建議使用 Conventional Commits：`feat:`、`fix:`、`chore:`、`docs:`。
- 每個 commit 聚焦單一類型變更（內容、設定或主題程式碼）。
- PR 需包含：精簡摘要、變更路徑、已執行驗證步驟；若有 UI/主題調整請附截圖。
- 有對應議題時請一併連結。

## 安全與設定建議
- 不要在設定檔提交密鑰、Token 或私有部署憑證。
- 避免手動編輯 `public/` 與 `.deploy_git/`，請以重新建置或重新部署取代。
