# Blog Post Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立一個 Claude Code skill，讓使用者貼入筆記（或提供檔案路徑）後，AI 透過一問一答追問補充素材，最終生成符合作者風格的 Hexo 部落格文章並直接存到 `source/_posts/`。

**Architecture:** 兩個檔案：`SKILL.md` 負責流程邏輯，`author-profile.md` 負責儲存從 56 篇文章分析出的寫作風格。Skill 偵測輸入模式 → 分析筆記 → 一問一答 → 生成文章 → 存檔。

**Tech Stack:** Claude Code skill（Markdown）、Hexo frontmatter

---

## Task 1: 建立 author-profile.md

**Files:**
- Create: `.claude/skills/blog-post/author-profile.md`

**Step 1: 建立目錄**

```bash
mkdir -p .claude/skills/blog-post
```

**Step 2: 建立 author-profile.md**

內容如下：

```markdown
# Author Profile

這份 profile 基於作者的 56 篇文章分析，用於幫助 AI 生成符合作者風格的文章。

---

## 文章類型

### 心得文（反思、觀察、職涯、流程）

**結構：** 場景/時間定位 → 觀察事實 → 說明原因/轉變 → 帶出觀點（不下結論，讓讀者自己得出）

**Opening：** 1–3 句，場景或時間定位。直接切入，不鋪陳。
- e.g. 「從 2023 年第一次用 ChatGPT，到現在幾乎不手寫程式碼...」
- e.g. 「去年針對購物車做了重構，主要是每次開發都覺得很挫折」

**Closing：** 感悟或展望，語氣平靜。不用「總結來說」。
- e.g. 「我從『觀望 Claude Code』變成『沒有 Claude Code 就不太想寫程式』了。」

---

### 技術筆記

**結構：** 先講結論/定義 → 代碼示例 → 參考資料

**Opening：** 直接定義或問題陳述。
- e.g. 「Scope 是變數的有效範圍。」
- e.g. 「最近在逐步把開發環境移到本機上，原本在 Linux 運行好好的程式，到 Windows 上都出錯了」

**Closing：** 參考連結，偶爾加小測驗。不寫「希望這篇對你有幫助」。

---

## 句子與段落

- 短句為主（10–20 字），長短混搭製造節奏
- 一句獨立成段用於強調重點
- 段落 2–4 句，不堆長段

---

## 語氣

- 直接陳述事實，不戲劇化
- 情緒一句帶過，不渲染
  - ✓ 「很興奮地跳下去實驗了」
  - ✗ 「這讓我感到無比的興奮與期待，彷彿看到了前所未有的可能性」
- Technical terms 留英文
- 偶爾括號補充 `(e.g., It does works.)` 或自嘲 `~~小聲地說~~`，但克制

---

## 常見句型

| 句型 | 用途 |
|------|------|
| `我認為/我發現` | 帶出個人觀點 |
| `但/只是/所以` | 主要連接詞 |
| `如果...就.../的話` | 條件邏輯 |
| `因為...所以.../原因是...` | 因果解釋 |
| `=>` | 試錯過程（技術文） |
| `...的話`、`...的時候` | 條件/時間連接 |

重點用粗體或 code 格式標記，不用底線。

---

## 黑名單句型（絕對不用）

- 「這不是...是...」
- 「換句話說...」
- 「總結來說...」
- 「這讓我想到...」
- 「不禁讓人思考...」
- 「值得注意的是...」

---

## 詞彙原則

- **用作者的原話**，不自創或升級詞彙
  - ✓ 作者說「先定義標準」就寫「先定義標準」
  - ✗ 不要升級成「設立入場條件」
- 素材不足時先追問，不腦補填空

---

## 參考文章

- 心得文：`my-ai-coding-journey.md`、`claude-code-first-use.md`、`change-careers.md`
- 技術文：`js-short-circuit-evaluation.md`、`webpack-esbuild-loader.md`
- 流程/觀點文：`refactor-with-ai-agents.md`、`value-of-engineer-with-ai.md`
```

**Step 3: 驗證檔案存在**

```bash
ls .claude/skills/blog-post/
```

Expected: `author-profile.md`

**Step 4: Commit**

```bash
git add .claude/skills/blog-post/author-profile.md
git commit -m "feat: 新增 blog post skill author profile"
```

---

## Task 2: 建立 SKILL.md

**Files:**
- Create: `.claude/skills/blog-post/SKILL.md`

**Step 1: 建立 SKILL.md**

內容如下：

```markdown
# Blog Post Skill

## 觸發條件

用戶說「寫文章」「寫部落格」「整理成文章」「幫我寫一篇」時觸發。

---

## 執行流程

### Step 1 — 偵測輸入模式

判斷用戶提供的是：
- **對話模式**：筆記內容直接貼在對話中
- **檔案模式**：提供了檔案路徑（用 Read 工具讀取）

如果不確定，問：「你要直接貼筆記，還是提供檔案路徑？」

---

### Step 2 — 分析筆記

讀取筆記後，在心中整理以下結構（**不需要輸出給用戶**）：

- **主題**：這篇文章要講什麼
- **Observation**：作者觀察到的現象或事實
- **Insight**：作者的觀點或洞察
- **Example**：具體例子、場景、數據
- **Conclusion**：結論或帶出的想法

標記哪些項目「缺少」或「不夠清楚」，準備追問。

**同時判斷文章類型：**
- **心得文**：有個人觀點、反思、職涯、流程心得
- **技術筆記**：教學、操作步驟、技術概念說明

---

### Step 3 — 一問一答追問

針對標記的缺口，**一次只問一個問題**。

**原則：**
- 根據上一個回答決定下一個問題
- 只問真的缺的，不要過度追問
- 用作者的原話表述問題，不升級詞彙

**判斷素材足夠的標準（達到就停止追問）：**
- 有清楚的主題
- 有至少一個具體例子或場景
- 有作者的觀點（不是只有事實陳述）
- 心得文：有 opening 場景或時間定位
- 技術文：有明確的結論或定義

---

### Step 4 — 生成文章

先讀取 `.claude/skills/blog-post/author-profile.md`，再根據 profile 生成文章。

**AI 負責：** 整理、擴寫、重排
**AI 不負責：** 產生新觀點、腦補作者沒說的內容

#### 心得文格式

```
---
title: 文章標題
date: YYYY-MM-DD HH:MM:SS
tags:
  - tag1
  - tag2
categories: 心得分享
---

[Opening：場景/時間定位，1–3 句，直接切入]

<!-- more -->

## [Section 1 標題]

[內容]

## [Section 2 標題]

[內容]
```

#### 技術筆記格式

```
---
title: 文章標題
date: YYYY-MM-DD HH:MM:SS
tags:
  - tag1
categories: 筆記
---

[Opening：結論或定義，1–2 句]

<!-- more -->

## [概念說明]

[說明文字]

\`\`\`js
// 代碼示例
\`\`\`

## 參考資料

- [MDN 或相關連結]
```

**Categories 只能選一個：**
`心得分享`、`筆記`、`軟體開發`、`claude code`

**`<!-- more -->` 位置：** Opening 後、第一個 `##` 前

---

### Step 5 — 存檔

用 Write 工具存到：`source/_posts/<slug>.md`

- slug 用英文或拼音，kebab-case
- 描述文章主題，不要太長

存完後告知用戶：「已存到 `source/_posts/<slug>.md`」
```

**Step 2: 驗證兩個檔案都存在**

```bash
ls .claude/skills/blog-post/
```

Expected: `SKILL.md  author-profile.md`

**Step 3: Commit**

```bash
git add .claude/skills/blog-post/SKILL.md
git commit -m "feat: 新增 blog post skill"
```

---

## Task 3: 驗證 Skill 運作

**Step 1: 用一段簡短筆記測試 skill**

在 Claude Code 對話中輸入：
```
幫我寫一篇，筆記如下：

最近在試著讓 AI 幫我寫部落格，但產出都不像我寫的。
問題是 AI 只看到我的筆記，看不到我怎麼想事情。
後來改成讓 AI 追問我，再根據回答生成文章，感覺好多了。
```

**Step 2: 確認 skill 行為符合預期**

- [ ] Skill 有偵測到對話模式
- [ ] 有追問（一次一個問題）
- [ ] 生成的文章語氣直接、不戲劇化
- [ ] 有 frontmatter（title/date/tags/categories）
- [ ] 有 `<!-- more -->` 在正確位置
- [ ] 已存到 `source/_posts/`

**Step 3: 如果有問題，調整 SKILL.md 或 author-profile.md 後重測**

---

## 完成標準

- `author-profile.md` 完整描述寫作風格
- `SKILL.md` 流程清楚，五個步驟都有
- 測試生成的文章通過「看起來像作者寫的」主觀判斷
