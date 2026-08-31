Here is the updated `FORWRITERS.md` matching your exact Zod content collections schema and directory loader patterns.

---

# FORWRITERS.md

This document serves as the official curriculum authoring and contribution guide for `dijkstra_`.

---

## Directory & File Structure

Content is organized using Astro's `glob` loader across three distinct collections: `lessons`, `challenges`, and `projects`.

Every markdown entry must follow this directory pattern:

```text
src/content/[locale]/[track]/[collection]/[slug].md

```

### Pattern & Examples

| Collection     | Example File Path                                        |
| -------------- | -------------------------------------------------------- |
| **Lessons**    | `src/content/en/python/lessons/01-intro-to-python.md`    |
| **Challenges** | `src/content/en/cpp/challenges/01-pointer-arithmetic.md` |
| **Projects**   | `src/content/ar/javascript/projects/01-todo-app.md`      |

---

## Frontmatter Schemas

Every file must provide a YAML frontmatter block adhering to its specific collection schema.

### 1. Lessons (`lessons`)

Lessons require the `baseSchema` fields and support an optional `estimatedMinutes` integer.

```yaml
---
title: "Understanding Pointers & Memory Allocation"
description: "A deep dive into stack vs. heap allocation and pointer dereferencing in C++."
order: 1
authors:
    - "Omar Afifi"
contributors: []
translatedBy: []
tags:
    - "cpp"
    - "memory"
    - "pointers"
updatedAt: 2026-08-31
canonicalUrl: "https://example.com/original-article"
estimatedMinutes: 15
---
```

---

### 2. Challenges (`challenges`)

Challenges require a strict `difficulty` rating from `"1"` (Beginner) to `"10"` (Expert) represented as a string.

```yaml
---
title: "Implement a Dynamic Array"
description: "Build a resizable array container from scratch using low-level pointers and manual heap reallocation."
order: 2
authors:
    - "Omar Afifi"
contributors: []
translatedBy: []
tags:
    - "cpp"
    - "data-structures"
updatedAt: 2026-08-31
difficulty: "4"
---
```

---

### 3. Projects (`projects`)

Projects represent end-to-end applications and also require a strict `difficulty` rating from `"1"` to `"10"`.

```yaml
---
title: "Build an In-Memory Key-Value Store"
description: "Design and implement a thread-safe in-memory key-value database supporting TTL and LRU eviction."
order: 1
authors:
    - "Omar Afifi"
contributors: []
translatedBy: []
tags:
    - "cpp"
    - "databases"
    - "concurrency"
updatedAt: 2026-08-31
difficulty: "7"
---
```

---

## Schema Reference

### Base Schema (`baseSchema`)

All collections inherit the following base fields:

| Field          | Type       | Validation / Constraints           | Required | Default        |
| -------------- | ---------- | ---------------------------------- | -------- | -------------- |
| `title`        | `string`   | Min: 1 char, Max: 80 chars         | **Yes**  | —              |
| `description`  | `string`   | Min: 1 char, Max: 160 chars        | **Yes**  | —              |
| `order`        | `number`   | Positive integer (`1, 2, 3...`)    | **Yes**  | —              |
| `authors`      | `string[]` | Array of author handles/names      | No       | `[]`           |
| `contributors` | `string[]` | Array of contributor handles/names | No       | `[]`           |
| `translatedBy` | `string[]` | Array of translator handles/names  | No       | `[]`           |
| `tags`         | `string[]` | Array of topic tags                | No       | `[]`           |
| `updatedAt`    | `date`     | Valid date string (`YYYY-MM-DD`)   | No       | `Current Date` |
| `canonicalUrl` | `string`   | Valid URL format                   | No       | `undefined`    |

### Collection-Specific Extensions

| Collection       | Field              | Type            | Allowed Values / Validation                                           | Required |
| ---------------- | ------------------ | --------------- | --------------------------------------------------------------------- | -------- |
| **`lessons`**    | `estimatedMinutes` | `number`        | Positive number (`> 0`)                                               | No       |
| **`challenges`** | `difficulty`       | `string` (enum) | `"1"`, `"2"`, `"3"`, `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"` | **Yes**  |
| **`projects`**   | `difficulty`       | `string` (enum) | `"1"`, `"2"`, `"3"`, `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"` | **Yes**  |

---

## Adding Content to Track Roadmaps

When contributing an item intended for a sequential learning path, register its identifier in `src/data/roadmaps.ts`:

```typescript
export const roadmaps: Record<Track, string[]> = {
    python: [
        "lessons/01-intro-to-python",
        "challenges/01-variable-swap",
        "lessons/02-memory-model",
        "projects/01-cli-task-manager",
    ],
    javascript: [
        // ...
    ],
    cpp: [
        // ...
    ],
};
```

---

## Content Contribution Checklist

Before submitting a Pull Request:

- [ ] File location follows `src/content/[locale]/[track]/[collection]/[slug].md`.
- [ ] Title is between 1 and 80 characters.
- [ ] Description is between 1 and 160 characters.
- [ ] `order` is a positive integer (`>= 1`).
- [ ] `difficulty` is provided for challenges/projects as a string from `"1"` to `"10"`.
- [ ] Language parity: English (`en/`) and Arabic (`ar/`) files are created with identical slugs.
- [ ] The build validates successfully via `npm run build` (checks all Zod schemas).
