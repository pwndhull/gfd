# Git for Developers — source

A complete, interactive book that teaches Git from a first commit to professional team
workflows. Built as a React + TypeScript single-page app, compiled to one self-contained
HTML file with no backend — all progress is stored in the reader's browser
(`localStorage`).

## What's here

- `content/` — every chapter and reference document, written in a small Markdown
  dialect (see `src/lib/markdown.ts` for the syntax: `:::callout` blocks, and
  ` ```quiz `, ` ```exercise `, ` ```cmd `, ` ```diagram `, ` ```viz `, ` ```graph `/` ```snap `
  fenced blocks for the book's interactive pieces).
  - `chapters/01-....md` … `80-....md` — the 80 chapters across 17 parts
  - `glossary.md`, `commands.md`, `cheatsheet.md`, `labs.md` — reference material
  - `project.md`, `assessment.md`, `quizbank.md` — the final project, scored
    assessment, and extra practice questions
- `src/` — the app itself
  - `lib/` — content parsing (`markdown.ts`, `content.ts`), the Git simulator
    (`gitsim.ts`), search, routing, progress persistence
  - `components/` — UI components, including the interactive `GitVisualizer`
    sandbox and the hand-drawn SVG `Diagrams`
  - `pages/` — top-level pages (Home, chapter view, reference pages, labs, quizzes,
    the final project and assessment)
- `build.mjs` — bundles everything into `dist/index.html`
- `lint.mjs` / `src/lint.ts` — validates every chapter and reference file (front
  matter, quiz answers, broken links, glossary coverage, fence syntax, etc.)
- `smoke.py` / `shot.py` — Playwright-based smoke tests and screenshots (need
  `pip install playwright && playwright install chromium`)

## Building

```bash
npm install
node lint.mjs     # validate content
node build.mjs    # writes dist/index.html
```

Open `dist/index.html` directly in a browser — it's fully self-contained (React is
loaded from a CDN; everything else is inlined).

## Editing content

Add or edit a Markdown file under `content/chapters/`, following an existing
chapter's front matter and `:::recap` structure, then re-run `node lint.mjs` — it
checks structural completeness (required recap sections, valid quizzes, no broken
`#ch-*` links, every `concepts:` entry present in the glossary, and more) before you
rebuild.

## The Git sandbox

`src/lib/gitsim.ts` is a from-scratch, simplified Git engine used only for the
in-book "Git sandbox" — it does not run real Git and has no files. It's intentionally
labeled as a simulator throughout the book so readers never confuse its output with
real Git's.
