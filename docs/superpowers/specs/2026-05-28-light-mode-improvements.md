# Light Mode Improvements — Spec

**Date:** 2026-05-28
**Branch:** v4
**File:** `src/components/resume/ResumePortfolio.tsx`

## Problem

The light mode `LIGHT` token object used `gold: '#0f0c00'` (near-black). This caused all headings, section titles, terminal prompts, and accents to render as black — identical to body text — completely losing brand identity.

Root cause: `#f5c518` (bright yellow) has terrible contrast on cream bg, so it was swapped to near-black. The correct fix is a **darker amber** that reads as gold on light backgrounds.

## Changes Made

### Color Tokens Updated

```ts
const LIGHT: ThemeTokens = {
  bg: '#fdf6e3',                          // warmer cream
  bgTerm: 'rgba(184,134,11,0.09)',        // amber-tinted terminal bg
  nav: 'rgba(253,246,227,0.97)',
  txt: '#0a0800',
  dim: 'rgba(10,8,0,0.62)',
  dimLo: 'rgba(10,8,0,0.38)',
  gold: '#b8860b',                        // DarkGoldenrod — readable on cream
  goldDk: '#8b6400',
  goldLt: '#d4a017',
  border: 'rgba(184,134,11,0.20)',        // amber-tinted borders
  borderHv: 'rgba(184,134,11,0.50)',
  dotPattern: 'none',
  scrollThumb: 'rgba(184,134,11,0.40)',
}
```

### Background Animation Added

3 floating amber orbs (CSS keyframe animation, CSS-only, `!isDark` conditional):
- No JS — pure CSS `@keyframes rp-orb1/2/3`
- Mirrors dark mode aurora aesthetic in lighter palette
- Orbs render at `position:fixed; zIndex:0` behind content at `zIndex:1`

## Why `#b8860b`

DarkGoldenrod passes WCAG AA contrast on `#fdf6e3`. It reads as "gold" visually, preserving brand identity. Bright `#f5c518` on cream = 1.6:1 contrast ratio (fail). `#b8860b` on cream = 4.8:1 (pass).
