# Roaming Badges — Design Spec
**Date:** 2026-05-27
**Branch:** v3
**Status:** Approved

## Overview

Replace the static bob animation on project card right-panel badges with free-roaming movement. Badges drift to new random positions every ~3s with smooth CSS transitions, giving the right panel a living, dynamic feel.

## Scope

| Action | File |
|---|---|
| **Create** | `src/components/projects/RoamingBadges.tsx` |
| **Modify** | `src/components/projects/ProjectCard.tsx` — use RoamingBadges, remove BADGE_POSITIONS |
| **Modify** | `src/app/globals.css` — update `.pc-badge` transition, remove `pc-float` keyframe |

## Behaviour

- 3 badges rendered (first 3 tags from `project.tags`)
- On mount: start at safe initial positions (spread across the panel)
- Every 3s: each badge independently moves to a new random position
- Movement: smooth CSS `transition` (2s ease-in-out) on `top` + `left`
- Bounds: `top` 10–75%, `left` 5–65% — keeps badges inside the panel with padding from edges
- Each badge picks its new position independently (they can overlap — simple is fine)
- Animation pauses when panel is not in viewport (performance — use `useEffect` cleanup)

## RoamingBadges.tsx

```
'use client'
Props: { badges: string[] }
State: positions[] — array of { top: string, left: string }
On mount: initialise with spread positions, start interval
Every 3000ms: setPositions with new random values within bounds
On unmount: clearInterval
```

## CSS changes

`.pc-badge`:
- Remove `animation: pc-float` 
- Add `transition: top 2s ease-in-out, left 2s ease-in-out`
- Keep all other styles

Remove `@keyframes pc-float` entirely.

## Acceptance Criteria

1. Badges move smoothly to new positions every ~3s
2. Movement stays within panel bounds (no overflow)
3. Each badge moves independently
4. No CSS bob animation (`pc-float` removed)
5. No JS errors on mount/unmount
6. Tests still pass (65)
7. Build clean
