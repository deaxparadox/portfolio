# SkillsFinder — Design Spec
**Date:** 2026-05-25  
**Branch:** v2  
**Status:** Approved, ready for implementation

---

## Overview

Replace the existing flat `SkillsSection` + `SkillCard` components with a macOS Finder-inspired interactive window called `SkillsFinder`. The component has two views (List and Grid), a responsive layout across desktop/tablet/mobile, and retains the full v2 design system (gold palette, Rubik Dirt, DM Mono, Syne, glass aesthetic).

---

## Data Changes

### `src/data/portfolio.json` — extend each skill entry

Add two fields to every item in the `skills` array:

| Field | Type | Example |
|---|---|---|
| `kind` | `string` | `"Agents · RAG · LLMs"` |
| `pct` | `number` | `92` |

Existing fields (`icon`, `name`, `description`, `tags`) are unchanged.

**All 6 entries with new values:**

| Skill | kind | pct |
|---|---|---|
| AI & GenAI | `"Agents · RAG · LLMs"` | `92` |
| Backend APIs | `"Framework / REST / Python"` | `90` |
| Voice & Realtime | `"Realtime / Voice / WebSocket"` | `85` |
| Databases | `"Data / Storage / Caching"` | `87` |
| DevOps & Cloud | `"Cloud / Infra / Containers"` | `82` |
| Frontend & Tools | `"Frontend / Automation / Testing"` | `75` |

### `src/data/types.ts` — extend `SkillItem`

```ts
export interface SkillItem {
  icon: string
  name: string
  kind: string      // new
  pct: number       // new
  description: string
  tags: string[]
}
```

---

## Component Architecture

### Files changed

| Action | Path |
|---|---|
| **Delete** | `src/components/skills/SkillCard.tsx` |
| **Replace** | `src/components/skills/SkillsSection.tsx` → `SkillsFinder.tsx` |
| **Update** | `src/data/portfolio.json` |
| **Update** | `src/data/types.ts` |
| **Update** | `src/app/globals.css` |
| **Update** | `src/app/page.tsx` — import `SkillsFinder` instead of `SkillsSection` |

### `SkillsFinder.tsx`

- `'use client'` — requires `useState` for selected index + active view
- Props: `{ skills: SkillItem[] }`
- Internal state:
  - `activeIdx: number` — currently selected skill (default `0`)
  - `view: 'list' | 'grid'` — active view mode (default `'list'`)
  - `animating: boolean` — controls fade transition on panel/grid swap

---

## Layout Specification

### Finder Window Structure

```
┌─────────────────────────────────────────────────────┐
│  TITLEBAR: dots · title · "{n} items" · List|Grid   │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│   SIDEBAR     │         DETAIL PANEL                │
│   (List view) │         (List view)                 │
│               │                                     │
│   or          │   or                                │
│               │                                     │
│   GRID (spans full width, replaces sidebar+detail)  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  STATUS BAR: "{n} of 6 selected — {name}" · dot     │
└─────────────────────────────────────────────────────┘
```

---

## List View

### Titlebar
- Mac dots: red (`#ff5f57`) · yellow (`#f5c518`) · green (`#28c840`)
- Center: `📂 Skills & Capabilities` + `— {skills.length} items` (dynamic, DM Mono, dimmed)
- Right: **List** pill (active = gold bg) · **Grid** pill — clicking swaps `view` state

### Sidebar (desktop: 210px, tablet: 160px)
- Background: `rgba(16,12,0, 0.9)`
- Each row: icon (34×34px rounded square, gold tint bg) + name (Syne 600) + kind (DM Mono 10px, dimmed)
- Active state: `rgba(245,197,24, 0.11)` bg + 2.5px gold left border
- Hover state: `rgba(245,197,24, 0.06)` bg
- Divider line between item 3 and 4 (separates core skills from supporting)
- Click → sets `activeIdx`, triggers fade transition on detail panel

### Detail Panel
- Background: `rgba(11,9,0, 0.85)` with subtle radial gold glow top-right
- Padding: desktop `48px 52px`, tablet `28px 32px`
- On skill change: panel fades out (150ms opacity 0 + translateY 8px) → content swaps → fades in

**Content layout:**
```
[68px icon box]  [Rubik Dirt 32px name]
                 [DM Mono 11px KIND label in gold]

[description — Syne 15px, 1.75 line-height, max-width 480px]

[Proficiency  ████████░░  92%]

[tag] [tag] [tag] [tag] [tag]
```

**Proficiency bar:**
- Track: `rgba(245,197,24, 0.1)`, height 6px, border-radius 6px
- Fill: `linear-gradient(90deg, #c49a00, #ffd84d)`, gold glow shadow
- Animates from 0 → pct on each skill switch (0.7s cubic-bezier(0.4, 0, 0.2, 1))
- Uses double rAF trick to reset then animate (same as prototype)

**Tags (T3 — gold pill):**
- Background: `#f5c518` solid
- Text: `#0a0700` (near-black), DM Mono, 11px, font-weight 600
- Border-radius: `20px` (pill)
- Padding: `6px 14px`
- Hover: subtle lift (`translateY(-2px)`) + box-shadow

### Status Bar
- Left: `{activeIdx + 1} of 6 selected — {name}` (DM Mono, dimmed)
- Right: blinking green dot (animation: 2s ease-in-out infinite) + `"Open to work"` text

---

## Grid View

Activated by clicking **Grid** pill in titlebar. Replaces sidebar + detail panel content (titlebar and status bar remain).

### Grid Layout
- Desktop: `grid-template-columns: repeat(3, 1fr)`, gap `14px`, padding `24px`
- Tablet: `repeat(2, 1fr)`
- Mobile: `repeat(1, 1fr)`

### Grid Card (C2 + T3)
**Background:** `linear-gradient(135deg, rgba(245,197,24, 0.11) 0%, rgba(11,9,0, 0.92) 55%)`  
**Border:** `1px solid rgba(245,197,24, 0.22)`, border-radius `12px`  
**Hover:** gradient brightens to `rgba(245,197,24, 0.17)` at 0%, border-color `rgba(245,197,24, 0.42)`, glow `0 0 36px rgba(245,197,24, 0.14)`  
**Transition:** `all 0.2s`

**Card content (top to bottom):**
1. Icon — 24px emoji, `margin-bottom: 12px`
2. Name — Rubik Dirt 16px, `#fff8e7`
3. Kind — DM Mono 9px, gold 40% opacity, uppercase, `margin-bottom: 12px`
4. Proficiency bar — height 4px (thinner than list view), same gradient, no animation on grid render
5. Tags — T3 gold pills, same spec as list view but font-size 10px, padding `4px 11px`

### List↔Grid Transition
- Cross-fade: body content fades to opacity 0 (150ms), view state swaps, fades back in (150ms)

---

## Responsive Breakpoints

### Tablet (481–900px)
- Finder window: same split layout
- Sidebar: `width: 160px` (from 210px)
- Detail panel padding: `28px 32px` (from `48px 52px`)
- Detail icon: 52px (from 68px)
- Detail name font-size: 24px (from 32px)
- Grid: 2-column

### Mobile (≤480px)
- Sidebar replaced by **horizontal scrollable tab row**
- Finder body becomes single-column (tab row on top, detail panel below)
- Tab row height: `~56px` — each tab has icon (18px) + short label (DM Mono 8px)
- Active tab: `rgba(245,197,24, 0.08)` bg + 2px gold bottom border
- Detail panel padding: `18px 16px`
- Detail icon: 44px
- Detail name font-size: 18px
- Proficiency label hidden on mobile (bar + pct remain)
- Grid: 1-column stack

**Tab short labels** (to avoid overflow):

| Skill | Tab label |
|---|---|
| AI & GenAI | AI |
| Backend APIs | Backend |
| Voice & Realtime | Voice |
| Databases | Data |
| DevOps & Cloud | Cloud |
| Frontend & Tools | Frontend |

---

## CSS Architecture

All styles go in `src/app/globals.css` under a `/* ── SkillsFinder ── */` section. No CSS modules or Tailwind utility soup — consistent with the rest of the codebase.

Key class names: `.skills-finder`, `.sf-titlebar`, `.sf-sidebar`, `.sf-detail`, `.sf-grid`, `.sf-card`, `.sf-tag`, `.sf-tab-row`, `.sf-tab`, `.sf-statusbar`

---

## What Is NOT Changing

- Section heading (`Capabilities` label + `What I Build` title) — stays above the Finder window, same markup as current
- Section padding and max-width container
- `reveal` animation class on the heading
- All other sections — no changes outside `skills/`
- Test suite — existing 37 tests unaffected; no new tests required (component is purely presentational, no complex logic)

---

## Acceptance Criteria

1. List view renders with sidebar + detail panel, switching skills animates correctly
2. Grid view shows all 6 cards with C2 gradient + T3 pill tags
3. List↔Grid toggle cross-fades smoothly
4. Proficiency bar animates on each skill switch (list view)
5. `"{skills.length} items"` in titlebar is dynamic
6. Tablet: sidebar shrinks, padding reduces — no layout breakage
7. Mobile: tab row replaces sidebar, detail panel full-width
8. Mobile grid: single column
9. All 37 existing tests still pass
10. Build clean (`npm run build` no errors)
