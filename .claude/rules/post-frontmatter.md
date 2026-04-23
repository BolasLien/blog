---
description: Frontmatter format rules for blog posts in src/content/posts
---

# Post Frontmatter 格式規則

## 正確格式

```yaml
---
title: 文章標題不加引號
date: '2026-04-23T00:00:00+08:00'
description: 文章描述不加引號
tags:
  - tag-one
  - tag-two
---
```

## 規則

- `title` / `description`：不加引號
- `tags`：用 YAML 換行陣列（`- item`），不用 inline `[...]`
- `date`：ISO 8601 格式，加引號，時區 `+08:00`
- tags 全 lowercase（`CSS → css`、`AI → ai`）
