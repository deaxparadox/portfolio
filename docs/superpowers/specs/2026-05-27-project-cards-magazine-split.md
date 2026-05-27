# Project Cards — Magazine Split Design Spec
**Date:** 2026-05-27
**Branch:** v3
**Status:** Approved, ready for implementation

---

## Overview

Replace the current `ProjectCard` interior with the Magazine Split design (Option C from `docs/templates/project-card-options.html`). The sticky-stack scroll behaviour is unchanged — only the card visual is replaced.

---

## Scope

| Action | File |
|---|---|
| **Rewrite** | `src/components/projects/ProjectCard.tsx` |
| **Update** | `src/app/globals.css` — replace `.project-card` + `.project-visual` CSS |
| **No change** | `src/components/projects/ProjectsSection.tsx` |
| **No change** | Sticky-stack CSS (`.stack-cards`, `.stack-item`) |
| **No change** | `src/data/portfolio.json` |
| **No change** | `ProjectItem` type |

---

## Card Anatomy

```
┌─────────────────────────────────────┬──────────────────┐
│  [eyebrow: 01 · 2024]    [ghost: 01]│                  │
│                                      │  gradient panel  │
│  Project Title  ← Rubik Dirt 44px   │                  │
│                                      │   glyph 100px    │
│  Description text, dimmed, 14px,    │                  │
│  max 2-3 lines, Syne                │  [badge1]        │
│                                      │  [badge2]        │
│  [tag][tag][tag][tag]   GitHub ↗    │  [badge3]        │
│                                      │                  │
│                                      │  [val  label]    │
└─────────────────────────────────────┴──────────────────┘
```

---

## Left Panel

**Grid:** `1fr 380px` (same total width, right panel is fixed 380px)

**Eyebrow:** `{String(index+1).padStart(2,'0')} · {project.year}` — DM Mono, 10px, gold 70% opacity, uppercase, `letter-spacing: 0.14em`

**Ghost number:** `{String(index+1).padStart(2,'0')}` — Rubik Dirt, 80px, gold at 12% opacity, positioned top-right of left panel, `line-height: 0.85`, `user-select: none`

**Title:** `project.name` — Rubik Dirt, 44px, `#fff8e7`, `line-height: 0.95`, `letter-spacing: -1px`

**Description:** `project.description` — Syne, 14px, `rgba(240,234,216,0.55)`, `line-height: 1.78`, `max-width: 440px`

**Tags:** all `project.tags` — DM Mono pills:
- `font-size: 10px`, `letter-spacing: 0.05em`
- `padding: 4px 12px`, `border-radius: 4px`
- `background: rgba(245,197,24,0.08)`, `border: 1px solid rgba(245,197,24,0.2)`
- `color: #ffd84d`

**GitHub link:** `project.links[0]` — DM Mono, 11px, gold, `opacity: 0` default → `opacity: 1` on card hover. Small bordered pill: `padding: 6px 14px`, `border: 1px solid rgba(245,197,24,0.3)`, `border-radius: 3px`

---

## Right Panel (380px)

**Border-left:** `1px solid rgba(245,197,24,0.12)`

**Background gradient — unique per card index:**

```css
/* index 0 */ linear-gradient(135deg, rgba(245,197,24,0.13) 0%, rgba(232,144,10,0.07) 50%, rgba(6,5,0,0.3) 100%)
/* index 1 */ linear-gradient(135deg, rgba(196,154,0,0.11) 0%, rgba(245,197,24,0.08) 50%, rgba(6,5,0,0.3) 100%)
/* index 2 */ linear-gradient(135deg, rgba(232,144,10,0.13) 0%, rgba(255,216,77,0.07) 50%, rgba(6,5,0,0.3) 100%)
/* index 3+ */ repeat index 0 gradient
```

**Glyph:** `project.visual.glyph` — 100px, `opacity: 0.18`, `filter: drop-shadow(0 0 30px rgba(245,197,24,0.5))`. On card hover: `opacity: 0.30`, `transform: scale(1.08)`. Transition: `opacity 0.3s, transform 0.3s`.

**Floating badges:** first 3 items from `project.tags` — same pill style as left-panel tags but with `border-radius: 20px`. Absolute-positioned with staggered `animation-delay`:

```
badge 0: top: 22%, left: 10%,  delay: 0s
badge 1: top: 48%, left: 7%,   delay: 0.6s
badge 2: top: 70%, left: 18%,  delay: 1.2s
```

Animation `float-badge`: `translateY(0)` → `translateY(-6px)`, `4s ease-in-out infinite alternate`

**Impact metric:** `project.visual.stats[0]` — bottom-right corner, `position: absolute; bottom: 16px; right: 16px`:
- Value: `stat.value` — Rubik Dirt, 26px, gold
- Label: `stat.label` — DM Mono, 9px, dimmed, `line-height: 1.4`
- Container: `background: rgba(245,197,24,0.12)`, `border: 1px solid rgba(245,197,24,0.3)`, `border-radius: 8px`, `padding: 8px 14px`

---

## Card Container (globals.css)

**Keep from current:**
- `border-radius: 16px` → bump to `20px`
- `position: relative`, `overflow: hidden`
- `transform-origin: 50% 0%`, `will-change: transform` (sticky-stack needs these)
- `box-shadow` glow
- `::after` pseudo-element top gold line

**Change:**
- `display: grid; grid-template-columns: 1fr 380px` (was `1fr 240px`)
- `min-height: 240px` (was `400px` — magazine split is naturally taller via content)
- `padding: 0` — left padding moves to `.card-c-left` (`44px 48px`)
- `background` updates to match glass aesthetic
- Remove `.project-visual` CSS — replaced by right panel styles

**Card hover:**
- `transform: translateY(-5px)`
- `border-color: rgba(245,197,24,0.45)`
- `box-shadow: 0 0 80px rgba(245,197,24,0.3)`

---

## Responsive

**Tablet (481–900px):** right panel shrinks to `280px`, glyph to `80px`, ghost number to `60px`

**Mobile (≤480px):** card becomes single column — right panel stacks below left panel, height `180px`, glyph `80px`. Ghost number hidden. Floating badges hidden (too small).

---

## Deferred

Roaming badges (tags drifting freely around the right panel with JS-driven random positions) — deferred until cards are working. Tracked in `docs/DEFERRED.md`.

---

## Acceptance Criteria

1. All 3 project cards render with magazine split layout
2. Right panel shows correct gradient per card index
3. Glyph scales on card hover
4. GitHub link appears on card hover (opacity 0 → 1)
5. Floating badges animate with staggered delays
6. Impact metric shows `visual.stats[0].value` + label
7. Sticky-stack scroll behaviour unchanged
8. Existing tests still pass
9. Build clean
