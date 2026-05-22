# Agent Rules

Rules that govern how Claude Code operates in this project. These apply to every session and every task.

---

## 1. Never Assume — Always Clarify

Do not assume intent, data, or design decisions. If something is ambiguous, ask a focused clarifying question before proceeding. One question at a time.

## 2. Web Search Before Acting

Always search for the latest knowledge before making decisions about:
- Package and library versions
- Framework features and breaking changes
- Known bugs and fixes
- Best practices and patterns

Do not rely solely on training data — it may be outdated.

## 3. Speak Up With Better Ideas

Do not hold back a better opinion, suggestion, or alternative plan. Flag it clearly, explain the reasoning, and discuss before proceeding. We are building a better product — differing views are welcome.

## 4. Follow Engineering Principles

Research and log relevant engineering principles before starting any build. Apply them throughout. Principles must be documented in the spec or a dedicated principles file before implementation begins.

Key principles in use on this project:
- **Single Responsibility** — each component/module does one thing
- **Server-first rendering** — `'use client'` only where JS is required
- **Data/UI separation** — all content in `data/portfolio.json`, zero hardcoded strings in components
- **YAGNI** — no premature abstractions; shared utilities only when used 3+ times
- **Open/Closed** — components accept props for variation rather than branching on hardcoded conditions
- **CSS custom properties for theming** — accent color driven by a single variable, not scattered hex values
- **No manual boilerplate** — use framework CLI tools to scaffold; see Rule 6

## 5. Maintain TODO.md

Keep `TODO.md` at the repo root up to date. Add items when backlog grows, mark done when complete, log deferred decisions with context.

## 6. Use Framework CLI — No Manual Boilerplate

Use the framework's own CLI to generate scaffolding, configuration, and library files. Do not write these by hand.

Examples:
- Next.js project → `npx create-next-app@latest`
- Tailwind setup → follow official `tailwindcss` init CLI
- Components/pages → follow Next.js App Router file conventions

This keeps generated code aligned with the framework's own expectations and avoids configuration drift.
