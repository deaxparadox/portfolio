# Smart Terminal — Design Spec

**Date:** 2026-05-23
**Status:** Approved
**Roadmap:** Subsystem 1.5 — sits between visual improvements and voice agent

---

## 1. Overview

The terminal in the hero section evolves from a decorative demo widget into a **persistent, navigable interface** that follows the visitor across the whole page. It has three states (embedded, floating, maximised), functional mac-style window buttons, a `mv` navigation command, a command parser that distinguishes known commands from unknown input (placeholder for future AI chat), and a playful animated WiFi placeholder that fills the hero when the terminal detaches.

Smooth, spring-physics transitions via **Framer Motion** are a first-class requirement — without them the feature loses most of its impact.

---

## 2. Terminal State Machine

### States

| State | Description |
|---|---|
| `EMBEDDED` | Default. Terminal card lives inside the hero section's 2-column grid. |
| `FLOATING` | Fixed `top-right` overlay. Small window that persists as the visitor scrolls. |
| `MAXIMIZED` | Full-screen overlay covering the entire viewport. |

### Transition Triggers

| From → To | Trigger |
|---|---|
| EMBEDDED → FLOATING | `mv <section>` command (any section except `hero`) |
| EMBEDDED → FLOATING | Auto-detach: IntersectionObserver detects hero leaves viewport |
| EMBEDDED → MAXIMIZED | 🟢 Green button |
| FLOATING → EMBEDDED | 🔴 Red button **or** 🟡 Yellow button (no scroll — page stays, terminal snaps back) |
| FLOATING → EMBEDDED | `mv hero` command |
| FLOATING → MAXIMIZED | 🟢 Green button |
| MAXIMIZED → FLOATING | 🟢 Green button (toggle) **or** 🟡 Yellow button |
| MAXIMIZED → FLOATING | Pressing `Escape` |

> There is no direct MAXIMIZED → EMBEDDED path. To re-embed from maximised: green/yellow → float, then red/yellow → embedded.

### Auto-detach / Auto-attach Rules

- **Auto-detach**: When terminal is `EMBEDDED` and the hero section scrolls out of the viewport (IntersectionObserver threshold 0%), terminal transitions to `FLOATING`.
- **Auto-attach**: Only triggered by `mv hero` command or clicking the WiFi placeholder. Never happens automatically on scroll — the user must explicitly call the terminal back.

---

## 3. Mac Dot Button Actions

| | 🔴 Red | 🟡 Yellow | 🟢 Green |
|---|---|---|---|
| **EMBEDDED** | Disabled (greyed) | Disabled (greyed) | → MAXIMIZED |
| **FLOATING** | → EMBEDDED (no scroll) | → EMBEDDED (no scroll) | → MAXIMIZED |
| **MAXIMIZED** | Disabled (greyed) | → FLOATING | → FLOATING (toggle) |

**Red semantics:** "close this free-floating window" — only meaningful when the terminal is a detached window. Disabled in states where there is nothing to close.

**Yellow semantics:** "minimise / restore to resting position" — in floating state, resting position is embedded hero. In maximised, resting position is floating.

**Green semantics:** size toggle — bigger (maximize) or smaller (back to float). Always toggles between FLOATING ↔ MAXIMIZED.

---

## 4. Hero Placeholder (WiFi)

When the terminal is in `FLOATING` or `MAXIMIZED` state, the right column of the hero grid shows a playful placeholder instead of the terminal card.

### Visual Design

- **WiFi arcs**: Three CSS arc rings (small → medium → large) that animate in staggered sequence, pulsing like a broadcasting signal
- **Ripple rings**: Two translucent rings that expand outward from the dot, fading as they grow
- **Dot**: Gold dot at the base, glowing
- **Title**: `"Wirelessly Connected"` — DM Serif Display, italic gold accent
- **Subtitle**: `terminal.exe has left the building` — JetBrains Mono, muted
- **CTA pill**: `⌨ click to reattach` — clicking anywhere on the placeholder triggers FLOATING → EMBEDDED transition (same as red button in floating state)

### Behaviour

- **Fade in** with `AnimatePresence` when terminal detaches (0 → 1 opacity, slight upward translate)
- **Fade out** when terminal re-attaches (1 → 0 opacity)
- **Hover**: border brightens, CTA pill highlights
- The placeholder is not shown when terminal is `EMBEDDED`

---

## 5. Command Parser

All terminal input passes through a command parser before any other action is taken. This runs entirely on the frontend.

```
user input
    ↓
CommandParser.parse(input: string): ParsedCommand
    ├── known command  → { type: 'command', name, args }
    └── unknown input  → { type: 'unknown', raw }
```

### Known Commands

| Command | Action |
|---|---|
| `help` | Show command list |
| `about` | Show about info |
| `skills` | Show skills |
| `projects` | Show projects |
| `experience` | Show experience |
| `contact` | Show contact info |
| `clear` | Clear terminal output |
| `ls` | List navigable sections |
| `mv <section>` | Navigate to section (see §6) |
| `mv hero` | Re-attach terminal to hero |

The parser is **case-insensitive** and **trims whitespace** before matching.

### Unknown Input Handler (Phase 1 — now)

When input does not match any known command:

```
  unknown command: "<input>"
  AI chat is not available yet. type help for commands.
```

Output styled in muted red for "unknown command", white for the input echo, dim for the hint. Input is HTML-escaped before rendering (XSS safety — already in place from v1).

### Unknown Input Handler (Phase 2 — flagship backend)

The `type: 'unknown'` branch will be updated to send input to the flagship backend chat API. The parser itself does not change — only the handler for unknown type changes. This is a single file change.

---

## 6. Navigation Command: `mv`

### Syntax

```
mv <section>
mv hero
```

Valid section names: `hero`, `skills`, `projects`, `experience`, `contact`

### Behaviour

| Command | Terminal state | What happens |
|---|---|---|
| `mv skills` | EMBEDDED | Smooth scroll to `#skills` → terminal auto-detaches to FLOATING |
| `mv skills` | FLOATING | Smooth scroll to `#skills` → terminal stays FLOATING |
| `mv skills` | MAXIMIZED | Close maximised → scroll to `#skills` → terminal goes FLOATING |
| `mv hero` | FLOATING | Terminal re-attaches to EMBEDDED (no scroll, page stays) |
| `mv hero` | MAXIMIZED | Close maximised → re-attach to EMBEDDED (no scroll) |
| `mv hero` | EMBEDDED | Output: `already here.` (no-op) |

### Output in terminal

```
$ mv experience
→ navigating to #experience
```

For `mv hero`:
```
$ mv hero
→ reattaching to hero
```

Invalid section:
```
$ mv nowhere
mv: unknown section 'nowhere'
valid: hero, skills, projects, experience, contact
```

---

## 7. Framer Motion Integration

Framer Motion is a **first-class dependency** of this feature. Transitions are not polish — they are the feature.

### Why Framer Motion

The EMBEDDED ↔ FLOATING transition requires animating a DOM element between two completely different layout contexts (inside a CSS grid → fixed position in viewport). Plain CSS transitions cannot do this without complex coordinate math and DOM cloning. Framer Motion's `layoutId` handles it natively via FLIP animation with spring physics.

### How It Works

```tsx
// Same layoutId in all three render paths
<motion.div layoutId="terminal" layout>
  {/* terminal card content */}
</motion.div>
```

When the component re-renders in a different position (embedded grid vs fixed top-right), Framer Motion:
1. Records start position
2. Records end position
3. Animates between them with spring physics

### Animation Specs

| Transition | Framer Motion config |
|---|---|
| EMBEDDED ↔ FLOATING | `layoutId` spring: `{ type: "spring", stiffness: 300, damping: 30 }` |
| FLOATING ↔ MAXIMIZED | `layoutId` spring: `{ type: "spring", stiffness: 260, damping: 28 }` |
| WiFi placeholder mount | `initial: { opacity: 0, y: 12 }` → `animate: { opacity: 1, y: 0 }` — `duration: 0.35` |
| WiFi placeholder unmount | `exit: { opacity: 0, y: -8 }` — `duration: 0.25` |
| Mac dot press | `whileTap: { scale: 0.85 }` on each dot |
| Terminal body content | Fade-in lines unchanged from v1 (setTimeout-based) |

### Component Changes

**New:**
- `components/ui/FramerProvider.tsx` — wraps app in Framer's `LazyMotion` with `domAnimation` features (keeps bundle lean)

**Modified:**
- `components/hero/Terminal.tsx` — add state machine, `layoutId`, button handlers
- `components/hero/Hero.tsx` — add `AnimatePresence` + WiFi placeholder rendering
- `app/layout.tsx` or `app/page.tsx` — wrap with `FramerProvider`

**No new files needed for:**
- Command parser — lives inside `Terminal.tsx` as a pure function `parseCommand(input)`
- `mv` navigation — uses Next.js `router` (already available) + `window.scrollTo`
- State — React `useState` in `Terminal.tsx`, lifted to `Hero.tsx` for placeholder visibility

---

## 8. Component Architecture

Three **mutually exclusive** render paths — only one Terminal instance is in the DOM at any time. Framer Motion's `layoutId` animates the visual transition between them:

```
state === EMBEDDED:
  Hero.tsx
    ├── motion.div (hero left col)
    └── AnimatePresence
          └── Terminal.tsx   layoutId="terminal"   ← in grid

state === FLOATING:
  Hero.tsx
    ├── motion.div (hero left col)
    └── AnimatePresence
          └── WifiPlaceholder.tsx
  TerminalFloating.tsx (fixed, top-right)
    └── Terminal.tsx         layoutId="terminal"   ← fixed overlay

state === MAXIMIZED:
  Hero.tsx
    ├── motion.div (hero left col)
    └── AnimatePresence
          └── WifiPlaceholder.tsx
  TerminalMaximized.tsx (fixed, fullscreen)
    └── Terminal.tsx         layoutId="terminal"   ← fullscreen overlay
```

`TerminalFloating` and `TerminalMaximized` render at the `app/layout.tsx` level (via a portal or sibling to `<main>`) so they are outside the hero grid and can be truly fixed-position.

> `Hero.tsx` must become a Client Component because it needs to render conditionally based on terminal state and use `AnimatePresence`. This is the only Server → Client promotion in the feature.

### State location

Terminal state lives in a new `useTerminalState` hook exported from `hooks/useTerminalState.ts`. `Hero.tsx` consumes it to decide which variant to render. `Terminal.tsx` receives the state and setter as props.

---

## 9. Data / Config Changes

No changes to `portfolio.json`. The list of valid `mv` section names is derived from a constant in the codebase:

```ts
// lib/sections.ts
export const SECTIONS = ['hero', 'skills', 'projects', 'experience', 'contact'] as const
export type Section = typeof SECTIONS[number]
```

---

## 10. Out of Scope (v1 of this feature)

- Mobile behaviour — floating terminal on mobile needs its own design pass (logged in TODO)
- Keyboard shortcut to open/close terminal (e.g. `` Ctrl+` ``) — can be added later
- Terminal history (up arrow) — not in scope
- AI chat (Phase 2) — unknown input shows placeholder message only
- Voice agent integration — separate subsystem

---

## 11. Dependencies

- `framer-motion` — add to `src/package.json`
- No other new dependencies
