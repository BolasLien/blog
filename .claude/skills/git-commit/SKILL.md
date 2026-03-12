---
name: git-commit
description: 分析 git 變更、拆分成多個語意明確的 commit 並執行。當使用者輸入 `/git-commit` 或說「幫我 commit」、「幫我整理 commit」、「幫我寫 commit message」、「commit 一下」時必須使用此 skill。即使使用者只說「可以 commit 了」或「整理一下這些改動」也應使用此 skill。
---

# Git Commit

分析當前 git 變更，依邏輯拆分為多個符合 Conventional Commits 規範的 commit，commit 訊息以繁體中文撰寫。

## 執行步驟

### 1. 收集變更資訊

```bash
# 查看所有異動（staged + unstaged）
git status

# 查看詳細 diff（unstaged）
git diff

# 查看已 staged 的 diff
git diff --staged
```

### 2. 分析並規劃 commit 計畫

讀完 diff 後，依照以下原則分組：

**分組原則：**
- 每個 commit 只做一件事（單一職責）
- 不相關的修改分開 commit
- 常見分組依據：功能模組、檔案類型（設定檔 vs 程式碼）、修復 vs 新增

**Conventional Commits 類型：**
| 類型 | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修復 bug |
| `docs` | 文件變更 |
| `style` | 格式調整（不影響邏輯） |
| `refactor` | 重構（沒有新功能也沒有修 bug） |
| `test` | 新增或修改測試 |
| `chore` | 建置工具、設定、依賴更新 |
| `perf` | 效能優化 |
| `ci` | CI/CD 設定 |
| `build` | 建置系統或外部依賴變更 |

**Scope（可選）：** 影響範圍，如 `feat(auth)`, `fix(api)`, `chore(deps)`

### 3. 向使用者確認計畫

列出規劃好的 commit 清單，格式如下：

```
📋 Commit 計畫

1. feat(auth): 新增使用者登入功能
   → src/auth/login.ts, src/auth/token.ts

2. chore(deps): 更新 axios 至 1.7.0
   → package.json, package-lock.json

3. docs: 補充 README 安裝說明
   → README.md
```

確認後再執行，若使用者有調整意見，先修改計畫再進行。

### 4. 執行 commit

依序執行每個 commit：

```bash
# 只 stage 該 commit 的相關檔案
git add <相關檔案>

# 執行 commit
git commit -m "<type>(<scope>): <繁體中文描述>"
```

**注意：**
- 每次只 stage 該 commit 的檔案，不要一次 `git add .`
- 若某個 commit 只需要部分檔案的變更，使用 `git add -p` 互動式選擇

---

## Commit 訊息規範

### 格式
```
<type>(<scope>): <描述>
```

### 訊息原則
- **描述用繁體中文**，動詞開頭（新增、修正、更新、移除、調整）
- scope 用英文小寫
- 描述簡潔，說明「做了什麼」，不是「為什麼」（why 留給 PR 描述）
- 長度控制在 72 個字以內

### 範例

```
feat(user): 新增個人資料編輯功能
fix(api): 修正分頁查詢參數錯誤
refactor(auth): 將 token 驗證邏輯抽離為獨立模組
chore(deps): 升級 next.js 至 15.0
docs: 新增 API 使用說明
style: 統一縮排為 2 spaces
test(cart): 補充購物車金額計算的邊界測試
```

---

## 注意事項

- 若變更很少（1–2 個檔案、邏輯單一），直接一個 commit 即可，不強制拆分
- 若有 `package.json` + `package-lock.json` / `yarn.lock` 同時異動，通常合成一個 `chore(deps)` commit
- 設定檔（`.env.example`, `tsconfig.json` 等）通常獨立為 `chore` 或 `build`
- 執行前若有疑慮，先詢問使用者是否要 stage 某些未追蹤的新檔案
