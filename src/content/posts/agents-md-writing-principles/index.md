---
title: AGENTS.md / CLAUDE.md 寫作原則
date: "2026-05-04T00:00:00+08:00"
description: 花了一點時間研究了 AGENTS.md 的寫法，整理了 9 項個人認為不錯的原則。
tags:
  - claude-code
  - ai-開發工具
  - ai-coding
  - 開發心得
---

我最早是去年底先讀到這篇文章 [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)，我也嘗試把公司專案的 `AGENTS.md` / `CLAUDE.md` 做大整理，後續開發的體感也都變得比較順暢。

再隨著專案的規模逐漸變大、模型越來越聰明以及 Agent 的工具更新，我發現 `AGENTS.md` / `CLAUDE.md` 不是寫完就放著了，而是應該跟著 Codebase 一起迭代，於是我也開始會注意每次開發完也要更新 `AGENTS.md` / `CLAUDE.md`，這樣 AI 保持跟開發者一致的知識或是開發習慣。

最近剛好又讀到一篇 [aihao.tw 的 AGENTS.md 研究與實踐](https://blog.aihao.tw/2026/05/03/agents-md-research-and-practices/)，裡面有些是我之前就知道的原則，想說乾脆來整理一下我覺得不錯的原則當作紀錄。

## `AGENTS.md` 簡介

一般來說，開發者在第一次接觸一個 Repo 的時候，通常都會去讀根目錄的 `README.md`，透過這份文件可以了解這個專案是個什麼專案，有哪些指令可以用，或是特殊的知識點。

而 `AGENTS.md` / `CLAUDE.md` (以下都統稱 `AGENTS.md`)就類似給 AI 讀的 README，但這份文件是要告訴 AI 這個 Repo 的開發習慣、能做不能做的事情是什麼等等的。

用 AI Coding 不外乎有幾個工具 Claude Code / Codex / Gemini CLI，每次啟動新的對話 AI 會去讀 `AGENTS.md` 作為初始載入的 Context。根據工具不同讀的檔案會不一樣，例如我常用的 Claude Code 讀的是 `CLAUDE.md`。

## 建立 `AGENTS.md`

在講原則之前，要先知道 `AGENTS.md` 的建立方式以及具體檔案位置。

基本上 `AGENTS.md` 是手動建立的，或者是在啟動 AI 的那個目錄下 `/init` 這個指令來建立。

以 Claude Code 來說會放在這幾個地方：

- 使用者層級：`~/.claude/CLAUDE.md`
- 專案層級：`./CLAUDE.md`（在 repo 的根目錄）

像是 Codex / Gemini CLI 的話也是有分「使用者層級」跟「專案層級」，檔案位置也是差不多的邏輯，再依自己需求去找就好了。

做到這裡其實我們就已經把 `AGENTS.md` 建立好了，但是 AI 可能還是像個不受控的實習生一樣很難配合，接下來要講的是，讓我們的 AI 可以很好進入狀況的 `AGENTS.md` 寫作原則。

## 兩種層級：使用者 vs 專案

前面提到 `AGENTS.md` 分使用者層級跟專案層級兩種，這兩層想解決的問題不一樣，寫法應該分開。

**使用者層級**：跨專案通用，定義跟 AI 的協作習慣（溝通語言、工作模式、shell 工具偏好等）。設定一次、所有專案都會套用。

**專案層級**：綁定特定 repo，描述這個專案的脈絡（技術棧版本、歷史包袱、文件位置、流程規範）。每個 repo 都要重新寫。

下面的原則按層級分組——有些只屬於使用者層級，有些只屬於專案層級，有些兩層都適用。

以下幾條部分有資料佐證，部分是我體感上有效，實際應用要看你的專案情境調整，也歡迎大家一起討論。

## 通用原則

### 少於 200 行，最好是 100~150 行

Anthropic 官方就有[建議 `CLAUDE.md` 要低於 200 行](https://code.claude.com/docs/en/memory#write-effective-instructions)，否則過長的文件會佔用更多 Context，還會降低指令遵從度。

依照我自己實際的經驗也是，超過 200 行的時候滿容易失控的，反而越少行越能遵守指令，並且也有研究指出太長的話很容易被 AI 忽略部分的指令。

但 200 行只是一個建議值，不代表控制在 200 行就不會失控，我們還是要考慮到開啟對話的當下 AI 載入了多少 Context，我體感上比較好的做法是縮短到 100~150 行。

### 不要直接用 `/init` 產生的檔案

前面有提到可以用 `/init` 來建立，但大多時候自動生成內容會有專案架構、查得到的資訊、重複描述可能已經有的資訊，這些佔用 context 的廢話可能會讓 AI 浪費更多 Token。

我們可以把 `/init` 生成的檔案當作草稿，但具體內容再自己修正過。

### 不要把排版或風格檢查的規則寫進 `AGENTS.md`

叫 AI 用文字規則去檢查反而又慢又浪費 Token，有時候還會做錯，我們可以用 ESLint / Prettier 這類 linter 跟 formatter 去做。

使用 Claude Code 還可以搭配 hooks 讓 AI 改完程式碼之後自動觸發。

### 用英文撰寫可以節省 Token

之前有實驗過整份文件用中文寫跟用英文寫，在載入對話的時候消耗的 Token 最多可以差 30%~40%，像 `AGENTS.md`、`Skill.md` 這種給 AI 看的東西寫成英文不只是省 Token，我體感上也覺得他理解力也比中文好一些些。背後的原因應該是這些 LLM 的訓練資料大多都是英文，自然對英文的理解力會比較好。

前一陣子也有看到一篇文章[AI大模型的「中文稅」：中文比英文更費Token 為什麼？](https://news.cnyes.com/news/id/6441061)，證實了用中文確實比較燒 Token。

## 使用者層級原則

### 描述協作偏好

我試過不管哪套工具，預設都是很雞婆、很急著把事情做完的感覺，我的習慣是在「系統層級」的 `AGENTS.md` 定義跟我溝通的方式。

像我不喜歡 AI 直接寫程式，我希望 AI 先跟我討論確認沒問題再開工、回我中文，所以我寫了以下幾點：

```markdown
- Always use zh-tw
- 除非明確要求實作，否則預設為諮詢和規劃模式
- 在執行任何程式碼修改前，必須明確確認使用者意圖
- 優先提供分析、建議和計劃，而非直接實作
```

### 慣用工具推薦（選用）

如果有習慣的命令列工具，可以在「使用者層級」直接推薦給 AI，避免 AI 自己挑或從預設工具開始試。`rg` / `fd` 這類工具比 `grep` / `find` 速度快、輸出精簡，AI 一次命中需要的資訊、不用反覆嘗試，整體 token 消耗會降低。

像我自己會把 shell 工具跟 Python 套件管理寫進去：

````markdown
## Shell Tools

Prefer these tools over traditional Unix equivalents. They are faster, respect `.gitignore` by default, and produce more parseable output.

| Task | Use | Instead of |
|------|-----|------------|
| Find files | `fd` | `find`, `ls -R` |
| Search text | `rg` | `grep`, `ag` |
| Search code structure | `ast-grep` | `grep`, `sed` |
| Interactive selection | `fzf` | manual filtering |
| Parse JSON | `jq` | ad-hoc Python |
| Parse YAML/XML | `yq` | manual parsing |

Rules:

- Use `jq` / `yq` for structured data. Do not parse JSON, YAML, or XML with regex.
- In scripts, CI, and agent workflows, avoid interactive tools like `fzf`; use non-interactive equivalents.
- If a preferred tool is missing, attempt installation when you have permission to modify the environment.
- If installation fails or is not possible, fall back to the traditional command and note it.

## Python Usage

Use `uv` for Python execution and package management.

Do **not** use `pip`, `venv`, `poetry`, or global `python` directly unless explicitly required by the environment.

| Task | Command |
|------|---------|
| Run a Python script | `uv run <script.py>` |
| Run inline Python | `uv run python -c '<code>'` |
| Run a Python module | `uv run python -m <module>` |
| Run a tool (pytest, ruff…) | `uv run <tool>` |
| Add a package | `uv add <package>` |
| Add a dev dependency | `uv add --dev <package>` |
| Remove a package | `uv remove <package>` |
| Sync environment | `uv sync` |

Rules:

- Do not install packages globally.
- Do not create virtual environments manually.
- Do not modify project dependency files (`pyproject.toml`, `uv.lock`) unless the task requires it.
- If `uv` is unavailable, install it when you have permission to modify the environment.
- If installation fails or is not possible, stop and report rather than falling back to global Python tools.
````

## 專案層級原則

### 不要一次告訴 Claude 所有資訊，而是告訴他「如何找到重要資訊」

如果 codebase 已經有 `docs/`、`README.md` 之類的檔案，就不要把差不多的內容寫到 `AGENTS.md`，而是要告訴他去哪裡找。

有些情境需要讀指定的檔案，我會用提示路徑的方式，例如：

```markdown
在撰寫任何程式碼之前，必須先讀取以下文件：

- docs/coding-style.md - TypeScript 型別宣告、Function 宣告、Component 結構
- docs/naming-conventions.md - 檔名與程式命名規範
```

### 只寫最常用的指令

不要在 `AGENTS.md` 寫可能會用到的指令。

你以為你是在告訴 AI 這些指令「可以用」，但是 AI 會以為是「一定要用」，所以有時候會略過你直接執行那些指令。

像我比較常做前端開發，我就只會寫 `pnpm dev` 或是 `pnpm build` 這兩個指令。

### 描述 WHY 或是交接重要資訊

交接重要資訊可以幫助 AI 在讀程式碼的時候了解「為什麼這裡這樣寫」，這樣 AI 動手之前就先有一些脈絡而不會自己腦補。

要描述在開發的時候需要知道的事情，例如：

- 技術棧細節版本：「本專案使用 React 18 + Tailwind CSS 4 + Vite 5.x」
- 歷史脈絡：「本專案使用 React 18，但 X 模組仍是 class component 尚未遷移，改動之前先問使用者」

不要只寫「本專案使用 React」，一來是 `package.json` 查得到，二來是這樣對 AI 來說不是有意義的內容。

### 子目錄的 `AGENTS.md`

隨著專案越來越大，光是根目錄的 `AGENTS.md` 沒辦法涵蓋不同功能之間開發的需求，後來我發現子目錄其實是可以放 `AGENTS.md`，可以只描述該功能需要的 Context。

以實際經驗來說，寫 API 介面的時候我希望 AI 知道的事情有：

- 使用 Tanstack query + Zod
- 檔案要怎麼放
- 命名、Hooks 拆分、query keys 等等的規範
- 建立新的 api 介面的流程

我把這份 `AGENTS.md` 放在 `apis/`，在開發 API 的時候 AI 就能讀到這份文件。

> 我自己實際的經驗：子目錄放 `README.md` 或 `AGENTS.md` 都會有很好的效果，可能這些 AI Coding 工具的預設行為就是會去讀這些文件。

## 最後再提供一個小技巧

如果覺得這篇文章不錯的話，可以把整篇文章讓 AI 讀過，再讓 AI 按照這些原則來修改你的 `AGENTS.md`。

祝大家都有很好的開發體驗。
