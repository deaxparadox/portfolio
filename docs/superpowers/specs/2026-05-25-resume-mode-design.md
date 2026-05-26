# Resume Mode — Design Spec
**Date:** 2026-05-25
**Branch:** v3 (branch from dev before implementing)
**Status:** Approved, ready for implementation

---

## Overview

Add a **Resume Mode** as the default view of the portfolio, accessible at `/?mode=resume`. The existing full experience moves to `/?mode=full`. Resume mode is a fast, minimal, single-column layout optimised for recruiter quick-scanning — no aurora, no particles, no terminal, no animations. It includes a dark/light theme toggle scoped to resume mode only.

A persistent **DeaxButton** (floating bottom-right) lives in root `layout.tsx` and allows switching between modes and eventually launching the Deax AI assistant.

---

## Framing

| | Resume Mode | Full Experience |
|---|---|---|
| **URL** | `/?mode=resume` (default) | `/?mode=full` |
| **Audience** | Recruiters, quick scanners | Anyone exploring the full portfolio |
| **Load** | Lightweight — no heavy effects | Full v2 — aurora, particles, terminal |
| **Theme** | Dark + Light toggle | Dark only |
| **Layout** | Single column, 680px max-width | Multi-section, full-width |

---

## Routing & Architecture

### proxy.ts (Next.js 16 — was middleware.ts)

```ts
// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl
  if (pathname === '/' && !searchParams.has('mode')) {
    return NextResponse.redirect(new URL('/?mode=resume', request.url))
  }
}

export const config = {
  matcher: '/',
}
```

### page.tsx (Server Component, async)

```tsx
// src/app/page.tsx
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  if (mode === 'full') return <FullExperienceShell />
  return <ResumePortfolio />
}
```

### layout.tsx (root — stripped to minimum)

Root layout keeps only: fonts, metadata, DeaxButton. All heavy effects (AuroraBackground, Particles, TerminalProvider, TerminalFloating, TerminalMaximized, FramerProvider, CustomCursor, RevealInit) move to `FullExperienceShell`.

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={fontClasses}>
        {children}
        <DeaxButton />
      </body>
    </html>
  )
}
```

No Framer Motion in root layout — loading LazyMotion here would add Framer bundle weight to resume mode unnecessarily. Each mode handles its own enter animation:
- Resume mode: CSS `@keyframes fadeIn` on mount
- Full experience: Framer Motion (already present inside FullExperienceShell)

`DeaxButton` never remounts across mode transitions.

---

## File Structure

```
src/
  proxy.ts                               ← NEW: redirect / → /?mode=resume

  app/
    layout.tsx                           ← MODIFY: strip to fonts + metadata + DeaxButton + AnimatePresence
    page.tsx                             ← MODIFY: async, awaits searchParams, conditional render
    globals.css                          ← MODIFY: resume mode CSS vars + theme tokens

  components/
    deax/
      DeaxButton.tsx                     ← NEW: persistent floating button + menu

    resume/
      ResumePortfolio.tsx                ← NEW: root resume component ('use client'), owns ThemeContext
      ResumeNav.tsx                      ← NEW: NK wordmark + nav links + theme toggle
      ResumeHero.tsx                     ← NEW: badge + name + role + bio + tldr + heatmap
      ResumeSkills.tsx                   ← NEW: terminal-style $ ls block
      ResumeProjects.tsx                 ← NEW: numbered project list
      ResumeExperience.tsx               ← NEW: company/role/period/location row
      ResumeSocial.tsx                   ← NEW: GitHub · LinkedIn · Email · Resume links
      ResumeContact.tsx                  ← NEW: copy-email + contact text
      ResumeFooter.tsx                   ← NEW: copyright + version line
      ThemeContext.tsx                   ← NEW: dark/light theme context + localStorage persistence

    full/
      FullExperienceShell.tsx            ← NEW: wraps FramerProvider + TerminalProvider + all heavy effects + existing sections
```

**What moves out of layout.tsx into FullExperienceShell:**
- `FramerProvider`
- `TerminalProvider`
- `CustomCursor`
- `RevealInit`
- `AuroraBackground`
- `Particles`
- Ambient radial gradient divs
- Fractal noise texture div
- Grid lines div
- `TerminalFloating`
- `TerminalMaximized`
- All current page.tsx section composition

---

## Resume Mode — Sections

**Layout:** single column, `max-width: 680px`, centered, `padding: 0 28px`.

### Order

1. ResumeNav
2. ResumeHero
3. Divider
4. ResumeSocial
5. Divider
6. ResumeExperience
7. Divider
8. ResumeSkills
9. Divider
10. ResumeProjects
11. Divider
12. ResumeContact
13. Divider
14. ResumeFooter

### ResumeNav

- Fixed top, blurred bg, 1px border-bottom
- Left: `NK` wordmark in Rubik Dirt + gold
- Center/Right: `projects · skills · experience · contact` anchor links in DM Mono + theme toggle button
- Hover: CSS-only (no `useState` inside `.map()` — use `:hover` in CSS)

### ResumeHero

- "Available for work" pill badge — green pulse dot + text
- Name: Rubik Dirt, `clamp(38px, 6vw, 64px)`
- Role line: `Backend Engineer · AI Systems Developer · Delhi, India`
- Bio: 2 paragraphs, Syne 14px
- `tldr;` quote: left gold border, DM Mono, italic feel
- GitHub heatmap: 52×7 grid (reuses heatmap logic from BentoHeatmap — extract to shared util)

### ResumeSocial

- Section title: `~ Presence on the internet ~`
- Links: GitHub · LinkedIn · Email · Resume — separated by `·`
- Data from `portfolio.json` contact/social fields

### ResumeExperience

- Section title: `~ Work Experience ~`
- Each entry: company (linked) + role left, period + location right
- Data from `portfolio.json` experience array

### ResumeSkills

- Section title: `~ Stack I use ~`
- Terminal-style block: `~/nitish/skills` path header
- Rows: `$ ls languages/` → items listed below indented
- Categories: languages · frameworks · ai · databases · devops · tools
- Blinking cursor at bottom
- Data from `portfolio.json` skills array — map to terminal categories

### ResumeProjects

- Section title: `~ Things I've built ~`
- Numbered list: `01 · 02 · 03`
- Each: number + Rubik Dirt title + GitHub/Live links (right) + description paragraph
- Data from `portfolio.json` projects array

### ResumeContact

- Section title: `~ Get in touch ~`
- Short text paragraph
- Click-to-copy email button — shows email, click copies + shows "✓ copied!" for 2.2s
- Data from `portfolio.json` contact

### ResumeFooter

- Left: `© 2026 Nitish Kushwaha. All rights reserved.`
- Right: `$ ./nk --version 2.0`

---

## Theme System

Scoped entirely to resume mode via `ThemeContext`. Full experience never sees it.

### Tokens

| Token | Dark | Light (placeholder) |
|---|---|---|
| `bg` | `#070600` | `#c8980a` ← **swap tomorrow** |
| `txt` | `#f5eddb` | `#0a0800` |
| `dim` | `rgba(245,237,219,0.54)` | `rgba(10,8,0,0.68)` |
| `dimLo` | `rgba(245,237,219,0.30)` | `rgba(10,8,0,0.42)` |
| `gold` | `#f5c518` | `#0f0c00` |
| `goldDk` | `#c49a00` | `rgba(10,8,0,0.55)` |
| `goldLt` | `#ffd84d` | `#1a1600` |
| `border` | `rgba(245,197,24,0.16)` | `rgba(0,0,0,0.18)` |
| `borderHv` | `rgba(245,197,24,0.44)` | `rgba(0,0,0,0.42)` |
| `bgTerm` | `rgba(245,197,24,0.04)` | `rgba(0,0,0,0.10)` |
| `nav` | `rgba(7,6,0,0.92)` | `rgba(186,138,0,0.95)` |
| `dotPattern` | none | `radial-gradient` black dots |
| `scrollThumb` | `#c49a00` | `rgba(0,0,0,0.40)` |

**Text visibility:** near-black (`#0a0800`) on any warm-light bg = strong contrast regardless of exact yellow shade. Tomorrow's bg swap won't affect readability.

### ThemeContext.tsx

```tsx
'use client'
// provides: theme ('dark'|'light'), toggleTheme()
// persists to localStorage key 'portfolio-resume-theme'
// reads localStorage on mount for returning visitors
```

### Toggle button

Top-right in ResumeNav. ☀️ Light / 🌙 Dark label in DM Mono.

---

## DeaxButton

**File:** `src/components/deax/DeaxButton.tsx` (`'use client'`)

**Position:** fixed bottom-right, `bottom: 28px`, `right: 28px`, `z-index: 200`

**Visual:**
- Pill: gold border, semi-transparent dark bg, DM Mono `Deax` label
- Small bouncing dot next to label (`@keyframes bounce`, CSS only)
- Present from page load — no scroll trigger

**Menu (opens above on click):**
```
┌──────────────────────────────┐
│  Explore full portfolio  →   │   router.push('/?mode=full')
│  Talk to Deax     [soon]     │   disabled — placeholder for chatbot
└──────────────────────────────┘
        [ Deax • ]
```

- Menu is a small floating card (`position: absolute, bottom: 100%, right: 0`)
- In full experience mode, first option becomes "Resume mode →" pointing to `/?mode=resume`
- "Talk to Deax" present but visually disabled with a `soon` pill badge
- Click outside → closes menu (`useEffect` + `document` click listener)
- `useState(isOpen)` local — no context needed

**Knows current mode via:** reads `window.location.search` or accepts a `mode` prop passed from page.tsx through layout context.

---

## Data Sources

All data from `portfolio.json` — no hardcoded content in resume components.

Fields used:
- `meta.title`, `meta.description`
- `contact` → email, social links
- `experience[]` → company, role, period, location, url
- `skills[]` → name, tags (mapped to terminal categories)
- `projects[]` → num/title, description, github, live
- `footer` → version string

**Heatmap:** extract `CELL_LEVELS` generation logic from BentoHeatmap into `src/lib/heatmap.ts` — shared by both resume and full bento.

---

## What Resume Mode Does NOT Include

- AuroraBackground, Particles
- Smart Terminal (any state)
- Ribbon marquee
- SkillsFinder (Finder window)
- GlimpseSection / bento grid
- StatsStrip
- SectionDivider component
- RevealInit / scroll reveal animations
- CustomCursor
- Framer Motion (resume mode has no Framer dependency)

---

## DeaxButton Mode Detection

DeaxButton is in root `layout.tsx` which cannot read `searchParams` directly. Pass mode as a data attribute on `<body>` from page.tsx via a Server Component trick, OR simpler: DeaxButton reads `window.location.search` on the client to determine current mode.

```tsx
// DeaxButton.tsx
const mode = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('mode') ?? 'resume'
  : 'resume'
```

---

## Acceptance Criteria

1. `/` redirects to `/?mode=resume` via `proxy.ts`
2. `/?mode=resume` renders resume mode — no aurora/particles/terminal in DOM
3. `/?mode=full` renders full experience — all current v2 features intact, no regressions
4. DeaxButton visible from page load in both modes
5. DeaxButton "Explore full portfolio" navigates to `/?mode=full`
6. DeaxButton "Resume mode" (in full view) navigates to `/?mode=resume`
7. "Talk to Deax" is present but disabled with `soon` badge
8. Theme toggle switches dark/light in resume mode only
9. Theme preference persists to localStorage
10. Light theme: near-black text readable on warm bg regardless of exact bg color
11. All data sourced from `portfolio.json` — no hardcoded strings in resume components
12. All 43 existing tests still pass
13. Build clean (`npm run build` no errors)
14. v3 branch — dev branch untouched

---

## Branch Setup

```bash
git checkout dev
git checkout -b v3
```

All implementation happens on `v3`. Merge to `dev` when complete and verified.
