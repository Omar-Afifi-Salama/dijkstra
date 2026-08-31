# dijkstra\_

An open-source, local-first developer learning platform engineered to teach computer science and software architecture from first principles with dual-language parity (English / Arabic).

---

## Overview

`dijkstra_` provides structured learning roadmaps, in-depth technical deep dives, algorithmic challenges, and production-grade projects. Designed with a minimalist developer-centric UI, the platform prioritizes performance, zero distraction, and local privacy.

### Core Features

- **Bilingual Parity:** Native English (LTR) and Arabic (RTL) content mirroring across all curriculums.
- **Local-First Progress:** Real-time state persistence stored directly in the browser with zero mandatory account barriers.
- **Structured Roadmaps:** Directed dependency pathways spanning beginner fundamentals to high-performance systems engineering.
- **Modular Content Collections:** Content organized by type (`lessons`, `challenges`, `projects`) across language tracks (`python`, `javascript`, `cpp`).

---

## Tech Stack

- **Framework:** [Astro](https://www.google.com/search?q=https://astro.build/)
- **Content Layer:** Astro Content Collections (Markdown / MDX)
- **State Management:** Custom local-first reactive user store (`nanostores` / `localStorage`)
- **Internationalization:** Custom JSON-driven path-based i18n routing (`/[locale]/...`)
- **Styling:** Semantic CSS tokens with logical properties for seamless bidirectional (LTR/RTL) rendering

---

## Project Structure

```text
├── src/
│   ├── components/       # NavIsland, CompletionToggle, TrackProgress, etc.
│   ├── content/          # Markdown/MDX content collections
│   │   ├── lessons/
│   │   ├── challenges/
│   │   └── projects/
│   ├── data/             # Roadmaps sequence configurations
│   ├── i18n/             # Locale dictionaries (en.json, ar.json)
│   ├── layouts/          # GlobalLayout.astro and base wrappers
│   ├── pages/            # File-based localized routing
│   ├── stores/           # Local-first user progress stores
│   └── styles/           # Global design tokens and prose stylesheets
└── FORWRITERS.md         # Content contribution guide

```

---

## Getting Started

### Prerequisites

- Node.js `>= 18.14.0`
- `npm` (recommended), `pnpm`, or `yarn`

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/your-username/dijkstra.git
cd dijkstra

# Install dependencies
npm install

# Start development server
npm run dev

```

Visit `http://localhost:4321` to inspect the application.

---

## Contributing Content

Interested in authoring lessons, writing challenges, or translating curriculum into Arabic or English? Check out [FORWRITERS.md](./FORWRITERS.md) for contribution workflows, schemas, and guidelines.
