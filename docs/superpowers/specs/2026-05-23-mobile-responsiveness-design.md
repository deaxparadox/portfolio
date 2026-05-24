# Mobile Responsiveness — Design Spec

**Date:** 2026-05-23
**Status:** Approved
**Scope:** Make the portfolio fully usable on mobile phones (360–480px) and tablets (481–900px)

---

## 1. Overview

The portfolio currently has a single 900px breakpoint with basic layout shifts. This spec adds a proper mobile breakpoint (480px), a new bottom navigation component, a mobile terminal pill, and tablet-level improvements (2-column skills grid). All existing desktop behaviour is untouched.

---

## 2. Breakpoints

| Name | Range | Status |
|---|---|---|
| Desktop | > 900px | Unchanged |
| Tablet | 481px – 900px | Refined (skills 2-col) |
| Mobile | ≤ 480px | New |

---

## 3. Navigation

### Mobile + Tablet (≤ 900px)

The top nav hides its link list (`nav-links: display:none`) — already done. Replace with a **fixed bottom navigation bar**.

**Bottom nav bar:**
- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 150`
- Height: 56px
- Background: `rgba(8, 7, 0, 0.97)`, `backdrop-filter: blur(16px)`
- Border-top: `1px solid rgba(232, 200, 74, 0.15)`
- 4 items: **Skills · Projects · Experience · Contact** → `#skills`, `#projects`, `#experience`, `#contact`
- Each item: icon (emoji/symbol) + label below
- Active state: accent gold (`var(--accent)`), inactive: `var(--text-muted)`
- Active detection: IntersectionObserver (reuse Nav.tsx scroll logic)
- Logo and "Hire Me" button remain in the top nav bar unchanged

**Bottom padding compensation:**
- `<main>` gets `padding-bottom: 70px` on mobile/tablet so last section content isn't hidden behind the bar
- Applied via media query in globals.css

### Component change
- `src/components/nav/Nav.tsx` — add bottom nav bar JSX below the existing `<nav>` element, conditionally rendered at ≤ 900px via CSS (`display: none` on desktop, `display: flex` on mobile/tablet)

---

## 4. Hero + Terminal (Mobile ≤ 480px)

### Terminal pill
The terminal card is replaced on mobile with a **collapsed pill** — a single tappable row that opens the terminal in maximized (full screen) mode.

**Pill design:**
- Full width, same position as the terminal card in the hero column
- Background: `rgba(255, 240, 120, 0.05)`, border: `1px solid rgba(232, 200, 74, 0.2)`, border-radius: `10px`
- Height: ~52px, padding: `14px 18px`
- Left: `⌨` icon + `~/nitish-kushwaha` in JetBrains Mono
- Right: `tap to open →` hint in muted text
- Tap → `transitionTo('MAXIMIZED')` (already built)

**WiFi placeholder:**
- Hidden on mobile (pill serves as the reattach target instead)
- `WifiPlaceholder` gets `display: none` at ≤ 480px via CSS

**Terminal state behaviour on mobile:**
- `EMBEDDED` → pill shown in hero
- `MAXIMIZED` → full screen overlay (existing, unchanged)
- `FLOATING` state skipped on mobile — `mv <section>` goes straight from embedded/maximized to a "dismissed" state (pill visible, no floating window). The floating window is too small to be useful on mobile.

**Implementation:**
- `Hero.tsx` — add `MobileTerminalPill` component, show it when `state === 'EMBEDDED'` on mobile (CSS `display: none` on desktop to keep it from appearing there)
- OR: add responsive logic inside the existing `AnimatePresence` block using a window-width check
- `globals.css` — `.terminal-floating-wrapper { display: none }` at ≤ 480px to suppress the floating window

---

## 5. Sections — Tablet (481–900px)

**Skills grid:**
- Currently: 1 column at ≤ 900px
- Change to: **2 columns** at 481–900px
- CSS: `@media (min-width: 481px) and (max-width: 900px) { .skills-grid { grid-template-columns: repeat(2, 1fr); } }`

Everything else at tablet stays as the existing 900px rules.

---

## 6. Sections — Mobile (≤ 480px)

These are already handled by the 900px breakpoint and just need verification:

| Section | Behaviour | Status |
|---|---|---|
| Hero | Single column, pill terminal | New |
| Stats strip | 2×2 grid (`min-width: 45%`) | Existing ✅ |
| Skills | 1 column | Existing ✅ |
| Projects | 1 column, no visual panel | Existing ✅ |
| Experience | 1 column | Existing ✅ |
| Contact | Stacked, centred | Existing ✅ |
| Footer | Column layout | Existing ✅ |

**Mobile-specific additions (globals.css):**
- Body padding: 24px (already done)
- `main { padding-bottom: 70px }` — space for bottom nav
- `h1` hero font: already uses `clamp(3rem, 5vw, 5.5rem)` — works on mobile
- Cursor: custom cursor hidden on touch (`@media (hover: none) { body { cursor: auto } .cursor, .cursor-ring { display: none } }`)

---

## 7. Files Changed

| File | Change |
|---|---|
| `src/components/nav/Nav.tsx` | Add bottom nav bar (Client component, CSS-hidden on desktop) |
| `src/components/hero/Hero.tsx` | Add MobileTerminalPill, adjust AnimatePresence for mobile |
| `src/components/hero/MobileTerminalPill.tsx` | New — tappable pill component |
| `src/app/globals.css` | 480px breakpoint, bottom nav styles, pill styles, tablet 2-col skills, cursor hide on touch, main padding-bottom |

---

## 8. Out of Scope (deferred)

- **Half-screen terminal mode** — bottom sheet covering 50% of viewport, portfolio visible behind. Build after v1 mobile ships.
- **Hamburger menu** — bottom nav chosen instead
- **Mobile floating terminal** — `FLOATING` state on mobile needs separate design pass

---

## 9. Testing Checklist

- [ ] Chrome DevTools: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 820px (iPad Air)
- [ ] Bottom nav: active section highlights on scroll
- [ ] Terminal pill: tap opens maximized overlay, Escape closes it
- [ ] `mv <section>` on mobile: scrolls + closes terminal (no float)
- [ ] Skills grid: 2 columns at tablet, 1 column at mobile
- [ ] No horizontal overflow at any width
- [ ] Custom cursor hidden on touch devices
- [ ] Bottom nav doesn't cover last section content
