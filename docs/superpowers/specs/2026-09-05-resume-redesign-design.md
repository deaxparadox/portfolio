# Resume Mode Redesign — Design Spec

**Date:** 2026-09-05
**Branch:** `v9-resume-redesign` (from `main`)
**Route:** `/` (default) and `/?mode=resume` — no new route, replaces existing Resume Mode in place
**Reference:** Penpot export `chatgpt-version-redesign-by-claude.penpot` — single desktop frame "Dark Portfolio Redesign" (1920×2123)

---

## What This Is

A full visual and structural rebuild of Resume Mode: a single-page, dark, terminal/GitHub-themed developer resume. Replaces the current cream/gold light-or-dark Resume Mode entirely. Full Experience mode (`/?mode=full`), NK-OS, NK-M, and open-mic are untouched and still reachable via the DeaxButton menu, which stays layered on top exactly as it works today (menu + floating ChatWidget both preserved, unchanged).

This is a **fresh rebuild, not a restyle**: every file under `components/resume/` is written new against this spec. Nothing is adapted from the current implementation — old files that no longer have a role are deleted outright, not left as dead code.

---

## Content & Layout (top to bottom)

1. **Nav** — logo circle (initials), links (projects/skills/experience/contact, scroll-to-anchor), decorative QR-style icon button top-right (static pattern, not a real scannable code — no new dependency for pure flavor)
2. **Hero** — "AVAILABLE FOR WORK" pill (from `hero.badge`), name, role • location, one bio paragraph (`hero.subtitle`), tldr blockquote (`hero.tldr`), photo box (`hero.photoSrc`, placeholder for now), small initials badge overlapping the photo, two CTAs: "Email Me →" (`mailto:${contact.email}`, existing data) and "View Work" (static `#projects` anchor). **Note:** these are fixed UI copy in the new `ResumeHero`, not sourced from `hero.ctaPrimary`/`ctaSecondary` — those fields are already used by Full Experience's `Hero.tsx` ("View Projects →" / "Let's Talk") and must not be repurposed, or Full mode's hero breaks.
3. **Year in Commits** — GitHub contribution heatmap, gold ramp, real data (see Data below)
4. **Work Experience + Stack I use** (2-column) — experience card (from `experience[]`) beside a curated stack-pill row (from new `stackPills[]`)
5. **Terminal window** — mac traffic-light dots, `nitish@portfolio:~/skills` prompt, categorized skill lines (from `skills[]`, same data ResumeSkills already renders today — just new chrome)
6. **Things I've built** — numbered project cards, **first 4 of `projects[]`** (array order is the priority signal — no new selection field)
7. **Find me online + status** (2-column) — social/email links beside a `status: production-minded ●` terminal-style block
8. **Footer** — logo + nav links repeated

---

## Component Tree (fresh, same directory)

```
src/components/resume/
  ResumePortfolio.tsx   ← root, fetches nothing itself — receives data + heatmap cells as props
  ResumeNav.tsx
  ResumeHero.tsx         ← no heatmap inside (moved out)
  ResumeHeatmap.tsx      ← NEW — renders pre-fetched cell levels, Less/More legend
  ResumeExperience.tsx   ← card style
  ResumeStackPills.tsx   ← NEW — renders `stackPills[]`
  ResumeSkills.tsx       ← terminal-window chrome (dots + path header)
  ResumeProjects.tsx     ← card style, receives pre-sliced 4 projects
  ResumeContact.tsx      ← merges old Contact + Social into "find me online" + status layout
  ResumeFooter.tsx
```

**Deleted:** `ThemeContext.tsx` (+ `__tests__/ThemeContext.test.tsx`), `ResumeSocial.tsx` (folded into new Contact). `ResumeLink.tsx` / `ResumeSectionTitle.tsx` are rewritten fresh if still useful, not carried over as-is.

`page.tsx` is unchanged — it already does `<ResumePortfolio data={data} />` for the default/resume-mode branch. It gains one addition: fetching heatmap cells server-side (see below) and passing them as a new prop.

---

## Data Model Changes (`src/data/portfolio.json`)

Minimal, additive, no namespace restructuring:

- `hero.tldr: string` — NEW. The blockquote copy (currently hardcoded in `ResumePortfolio.tsx`, never read from data — fixed as part of this rebuild).
- `hero.photoSrc: string | null` — NEW. `null` for now; set to a real path once a photo is provided.
- `stackPills: string[]` — NEW, top-level. Curated tag references for the pill row: `["Python","FastAPI","LangGraph","LiveKit","PostgreSQL","Redis","AWS","OpenAI","Docker","Git"]`. These are pointers to techs that already exist in `skills[].tags` — not a redefinition of them.
- `hero.subtitle` — reused as the single bio paragraph (existing field, previously unused by Resume Mode). The current second hardcoded bio paragraph is dropped (redundant with the skills terminal section).
- No changes to `projects[]`, `skills[]`, `experience[]`, `contact[]` shapes — the redesign consumes them as-is (`projects.slice(0, 4)` happens in the parent component, not in data).

`src/data/types.ts` gains `tldr` and `photoSrc` on `HeroData`, and a top-level `stackPills: string[]` on `PortfolioData`.

---

## GitHub Heatmap — Real Data

**New file:** `src/lib/github.ts`

- Calls GitHub's GraphQL API v4: `user(login: "<derived from contact.socials>") { contributionsCollection { contributionCalendar { weeks { contributionDays { contributionCount date } } } } }`
- Auth: server-only `GITHUB_TOKEN` env var (classic PAT, `read:user` scope). **Never** `NEXT_PUBLIC_*` — never reaches the client. Added to `src/.env.example` (empty value, documented).
- GitHub username is derived from `contact.socials.find(s => s.label === 'GitHub').href` — not duplicated as a separate config field.
- Called from `page.tsx` (already an async server component) with `fetch(..., { next: { revalidate: 21600 } })` — 6-hour ISR cache. No new API route.
- On fetch failure (missing token in local dev, GitHub down, rate limit) — falls back to the existing `generateHeatmapCells()` in `lib/heatmap.ts` (already in the codebase, currently used unconditionally). `ponytail:` this fallback is a random decorative pattern, acceptable for local dev, never hit in production once `GITHUB_TOKEN` is set.
- Both paths return the same shape: `number[]` of contribution levels (0–4), 52×7 cells — `ResumeHeatmap` doesn't know or care which source it came from.

---

## Visual Tokens

No theme toggle — one fixed dark palette (Full Experience keeps its own separate theme, untouched):

```
bg:        #0a0a0a (page) / #111111 (cards) / #141414 (nav)
gold ramp: #211b0a → #5c4a17 → #715006 → #b8901e → #ffc53d   (heatmap levels 0–4, also used for accents/CTAs)
green:     #4ade80   (status dot — matches current "Available for work" pulse dot)
text:      near-white primary, gray-400-ish dim/secondary
radius:    2px (sharp/terminal elements) · 8–12px (cards, pills, buttons)
fonts:     Inter (UI text) · IBM Plex Mono (terminal/code/mono elements)
```

This replaces the current DM Mono / Syne / Rubik Dirt font trio and the `ThemeTokens` dark/light pair.

---

## Testing

Existing jest/RTL setup, no framework changes. Old component tests for files being deleted/rewritten are removed, not patched:

- Delete `ThemeContext.test.tsx` (module removed).
- Fresh tests for each new/rewritten component (`ResumeHero`, `ResumeHeatmap`, `ResumeStackPills`, `ResumeProjects` slicing, `ResumeContact`), written against the new props/behavior — not adapted from old test files.
- New: `lib/github.ts` — unit tests for GraphQL response → cell-level parsing, and for the fallback-on-error path (mock fetch failure → falls back to `generateHeatmapCells`).
- Full suite must stay green; run `npm test` before considering any task in the implementation plan done.

---

## Out of Scope (explicitly deferred)

- Real photo — placeholder box until provided.
- Mobile/responsive layout for this redesign — Penpot file is desktop-only (1920px); a responsive pass is a follow-up, not part of this spec.
- Renaming `Trajectry` → `HireIQ` etc. — already done in a prior session, unaffected by this spec.
- Any change to Full Experience mode, NK-OS, NK-M, open-mic, DeaxButton behavior, or ChatWidget — all untouched.
