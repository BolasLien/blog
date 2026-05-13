---
name: proofread
description: 校稿 Markdown 文章。三層處理：機械層直接修（中英文空格、錯別字、半形/全形標點、明顯大小寫 typo）、不一致層回報等 Bolas 決定（大小寫混用、列表項目缺失、術語不一致）、voice 層完全不動（句子順序、字眼、段落結構）。當使用者說「幫我校稿」、「校稿一下」、「校稿這篇」、「proofread」時必須使用此 skill。
---

# 校稿

校稿動作只處理客觀可判定的錯誤，**不替 Bolas 改 voice**。寫作協作的 voice 邊界對應 `~/.claude/projects/-Users-bolaslien-Documents-bolaslien-blog/memory/feedback_writing_collaboration.md`。

## 三層處理

### 1. 機械層（直接修，不問）

只要是客觀錯誤、有唯一正確答案的，直接 Edit：

- **中英文空格**：中文跟英文之間要有空格（`React 19` ✓、`React19` ✗）
- **錯別字**：「的得地」誤用、重複字（「同一個的概念」extra 的）
- **半形/全形標點**：中文句子內用全形（`,` → `，`、`...` → 視情況）
- **明顯大小寫 typo**：技術名詞統一寫法（`api` → `API`、`react` → `React`、`Javascript` → `JavaScript`）
- **markup 對不齊**：list bullet 缺少縮排、code fence 沒對齊

### 2. 不一致層（回報，等 Bolas 決定）

同一個概念在文章內出現多種寫法，**但無法判斷哪個正確**——回報觀察，給選項，等答覆：

- **大小寫混用**：例如同一篇出現 `Skill` / `SKILL` / `skill` 三種
- **術語縮寫一致性**：例如 `/goal` vs `goal` 混用
- **列表項目缺失**：例如 vault 有 8 項、文章只列 6 項，不知道是精簡還是漏掉
- **中英術語混用**：例如 `React` vs `react`、`Codex` vs `codex`

**回報格式範例**：

> **「Skill / SKILL / skill」三種大小寫混用：**
> - line 224: 「我做了一個 ... **Skill**」
> - line 226: 「觸發這個 **SKILL**」
> - line 228: 「使用這個 **skill**」
>
> 建議統一成 `Skill`（首字大寫、跟某 convention 一致）。要哪個？

**禁止**自動「修齊」大小寫混用——可能改錯。

### 3. Voice 層（完全不動）

不要動：
- 句子順序
- 字眼替換（即使覺得更好讀）
- 段落結構
- 標題 / 段標題 / 開頭句 / 結尾句 / 關鍵轉折句

如果發現 voice 層有問題（例如句子拗口、結構可優化），**回報觀察 + 給方向**，不擬具體文案。對應 `feedback_writing_collaboration.md` 例外條款：除非 Bolas 主動要求「給我幾個候選」「直接擬一版我來改」，否則只給方向。

## 校稿產出格式

### 第一部分：已修（機械層）

```markdown
**已修（機械錯誤）N 處：**

| 行 | 改前 | 改後 | 理由 |
|---|---|---|---|
| 13 | 「同一個**的**概念」 | 「同一個概念」 | 多一個「的」 |
| 54 | `B,不要改` | `B，不要改` | 半形逗號 → 全形 |
```

### 第二部分：回報待決定（不一致層）

```markdown
**不一致回報（你決定）：**

1. ...
2. ...

回我我再改。
```

### 第三部分（可選）：voice 層觀察

只有發現明顯問題才給。給方向、不給具體字眼。標明這是 voice 層、由 Bolas 自己決定要不要動。

## 執行步驟

1. **Read 文章全文**確認 latest state
2. **逐行掃描**標記機械層 / 不一致層 / voice 層各自的 issues
3. **執行機械層修法**（Edit 直接改）
4. **生成 report**（兩或三部分）回給 Bolas
5. **等 Bolas 答覆不一致層後**，再執行對應 Edits

## 失敗模式

- ❌ 自動把大小寫混用「修齊」（可能改錯——把該大寫的改小寫了）
- ❌ 改 voice 字眼（沒被授權，違反 feedback_writing_collaboration 規則）
- ❌ 不點明出處（沒給行號 / 改前 / 改後 → Bolas 無法快速驗證）
- ❌ 把 voice 觀察混進「已修」部分（會誤導 Bolas 以為已經改了）

## 參考

- **代筆原則**：`~/.claude/CLAUDE.md`「禁止偷懶」+「代筆時保留原有口語慣用語」+「代筆時不要延伸 Bolas 沒有表達過的意見」
- **寫作協作邊界**：`~/.claude/projects/-Users-bolaslien-Documents-bolaslien-blog/memory/feedback_writing_collaboration.md`
- **blog frontmatter 規則**：`.claude/rules/post-frontmatter.md`（校稿不要動 frontmatter 格式，那是另一條規則）
