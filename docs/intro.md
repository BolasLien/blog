# 專案介紹：Bolas 的開發與學習筆記

本專案是一個個人技術部落格，旨在紀錄並分享前端開發、JavaScript、軟體架構及職涯心得。

## 技術架構
- **框架**：[Hexo](https://hexo.io/) (版本 6.3.0)
- **模板**：[Icarus](https://github.com/ppoffice/hexo-theme-icarus)
- **渲染引擎**：Inferno (icarus 特色)
- **部署方式**：透過 `hexo-deployer-git` 部署至 GitHub Pages

## 主要內容
部落格文章主要收錄於 `source/_posts/` 目錄下，涵蓋以下主題：
- **前端開發**：Vue、React、CSS Flexbox/Specificity 等。
- **JavaScript**：閉包 (Closure)、提升 (Hoisting)、Array 方法、JWT 實作等基礎與進階概念。
- **開發流程與工具**：Git 分支策略、Agile 敏捷開發、VSCode 配置等。
- **職涯與心得**：Retrospective (年度回顧)、轉職心得等。

## 目錄結構
- `source/_posts/`：存放所有的文章原始檔（Markdown）。
- `themes/icarus/`：部落格的前端主題配置與樣式。
- `_config.yml`：Hexo 全域設定。
- `_config.icarus.yml`：Icarus 主題詳細設定。
- `public/`：產出的靜態網頁檔案（通常不進入 Git）。
- `docs/`：存放專案相關的說明文件與評估報告。

## 運行方式
- `npm run server`：在本機啟動預覽。
- `npm run build`：產生靜態檔案。
- `npm run clean`：清除緩存。
