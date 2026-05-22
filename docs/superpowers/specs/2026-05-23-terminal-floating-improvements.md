# Terminal Floating — Improvements Spec

**Date:** 2026-05-23  
**Status:** Approved  
**Scope:** Two targeted changes to `TerminalFloating.tsx` only

---

## Improvement 1 — Solid Background in Floating Mode

### Problem

The floating terminal uses `.terminal-card` which inherits `--glass-bg: rgba(255, 240, 120, 0.07)` — nearly transparent. In floating mode the terminal sits over other page sections (Skills, Projects, etc.) and the content bleeds through, making it hard to read.

### Solution

Override the `--glass-bg` CSS custom property locally on the `layoutId` wrapper div inside `TerminalFloating`. CSS custom properties are inherited, so the `.terminal-card` child picks up the override automatically — no changes to `Terminal.tsx` or `globals.css` needed.

```tsx
<m.div
  layoutId="terminal"
  layout
  transition={...}
  style={{
    '--glass-bg': 'rgba(8, 7, 0, 0.93)',
    '--glass-border': 'rgba(232, 200, 74, 0.35)',
  } as React.CSSProperties}
>
  <Terminal data={data.terminal} />
</m.div>
```

Values:
- `--glass-bg`: `rgba(8, 7, 0, 0.93)` — nearly opaque dark background, slight transparency to keep depth
- `--glass-border`: `rgba(232, 200, 74, 0.35)` — slightly stronger gold border than the default `0.25` to help the floating window feel grounded

---

## Improvement 2 — Draggable Floating Terminal

### Solution

Add Framer Motion's `drag` to the **outer** `m.div` (not the `layoutId` div — keeping them on separate elements avoids FLIP animation conflicts with drag state).

```tsx
<m.div
  key="terminal-floating"
  drag
  dragMomentum={false}
  dragElastic={0.08}
  whileDrag={{ cursor: 'grabbing' }}
  // ... existing initial/animate/exit/transition/style
  style={{
    position: 'fixed', top: '80px', right: '24px',
    width: '360px', zIndex: 200,
    cursor: 'grab',
  }}
>
```

Config:
- `drag` — enables x + y drag
- `dragMomentum={false}` — terminal stops exactly where you drop it (no "throw" sliding)
- `dragElastic={0.08}` — slight resistance at viewport edges, prevents dragging fully off-screen
- `cursor: 'grab'` on the wrapper — hints the whole card is draggable
- `whileDrag={{ cursor: 'grabbing' }}` — cursor changes to grabbing while actively dragging

### UX detail

The terminal body has its own `cursor: text` via `.terminal-body` in globals.css, which overrides the parent's `grab` cursor inside the body area. This means:
- Hovering the **title bar** → `grab` cursor (drag hint)
- Hovering the **body** → `text` cursor (typing hint)
- Dragging from anywhere → `grabbing` cursor (while moving)

Typing, clicking, and all terminal interaction continue to work normally — Framer Motion only intercepts `pointermove` events after a threshold, not plain clicks.

### Drag position persistence

Framer Motion tracks drag position relative to the element's original render position. After dragging, the terminal stays where dropped. On state change (FLOATING → MAXIMIZED → FLOATING), the position resets to the default (top: 80px, right: 24px) because the component unmounts and remounts via `AnimatePresence`. This is acceptable for v1.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/terminal/TerminalFloating.tsx` | Add `drag` props to outer div + `--glass-bg`/`--glass-border` override on layoutId div |

No other files changed.

---

## Out of Scope

- Constraining drag to viewport bounds (`dragConstraints`) — adds complexity, low priority
- Persisting drag position across state transitions — v2 item
- Drag handle restricted to title bar only — whole card drag is sufficient for v1
