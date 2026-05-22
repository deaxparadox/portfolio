# Smart Terminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the portfolio terminal from a decorative widget into a persistent, state-driven interface with three states (embedded/floating/maximized), functional mac dot buttons, `mv` navigation commands, a command parser, and a playful WiFi placeholder — all tied together with smooth Framer Motion spring transitions.

**Architecture:** A `TerminalContext` (React Context) holds the state machine (`EMBEDDED | FLOATING | MAXIMIZED`) and a transition lock that prevents race conditions while Framer Motion animates. `layoutId="terminal"` on the terminal card — rendered in exactly one location at a time — lets Framer FLIP-animate the card between the hero grid, a fixed top-right window, and a fullscreen overlay. Hero.tsx becomes a Client Component and uses an IntersectionObserver for auto-detach.

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion (`LazyMotion + domAnimation`), Jest + React Testing Library

**Security note:** Terminal.tsx uses `dangerouslySetInnerHTML` only for output lines. All user input is HTML-escaped via `esc()` before being concatenated into any HTML string (established in v1, unchanged here). The active input buffer renders as plain React text nodes — never through innerHTML.

---

## File Map

```
src/
  lib/
    sections.ts                 NEW — SECTIONS constant + Section type
    terminalParser.ts           NEW — pure parseCommand() function
  context/
    TerminalContext.tsx         NEW — state machine, transitionTo(), transition lock
  components/
    ui/
      FramerProvider.tsx        NEW — LazyMotion + domAnimation wrapper
    hero/
      Hero.tsx                  MODIFY — 'use client', IntersectionObserver, AnimatePresence
      Terminal.tsx              MODIFY — layoutId, mac dots, mv command, parseCommand
      WifiPlaceholder.tsx       NEW — animated WiFi icon + reattach CTA
    terminal/
      TerminalFloating.tsx      NEW — fixed top-right motion.div wrapper
      TerminalMaximized.tsx     NEW — fullscreen overlay motion.div wrapper
  app/
    layout.tsx                  MODIFY — FramerProvider + TerminalProvider + overlay renders
  __tests__/
    terminalParser.test.ts      NEW — TDD unit tests for parseCommand()
    terminalState.test.ts       NEW — TDD unit tests for state machine
```

---

## Task 1: Install Framer Motion + FramerProvider

**Files:**
- Modify: `src/package.json`
- Create: `src/components/ui/FramerProvider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install framer-motion**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src
npm install framer-motion
```

Expected: framer-motion added to `package.json` dependencies (v11+).

- [ ] **Step 2: Create FramerProvider.tsx**

Create `src/components/ui/FramerProvider.tsx`:

```tsx
'use client'
import { LazyMotion, domAnimation } from 'framer-motion'

export default function FramerProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}
```

Use `m` (not `motion`) in all other components to benefit from the tree-shaking this enables.

- [ ] **Step 3: Wrap layout.tsx with FramerProvider**

Read `src/app/layout.tsx`, then add the import and wrap the body contents:

```tsx
import FramerProvider from '@/components/ui/FramerProvider'
// wrap existing body content inside: <FramerProvider>...</FramerProvider>
```

- [ ] **Step 4: Verify build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src
git commit -m "feat: install framer-motion and add LazyMotion provider

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: sections.ts + terminalParser.ts + tests (TDD)

**Files:**
- Create: `src/lib/sections.ts`
- Create: `src/lib/terminalParser.ts`
- Create: `src/__tests__/terminalParser.test.ts`

- [ ] **Step 1: Write failing parser tests first**

Create `src/__tests__/terminalParser.test.ts`:

```typescript
import { parseCommand } from '@/lib/terminalParser'

describe('parseCommand — known commands', () => {
  it('parses lowercase command', () => {
    expect(parseCommand('about')).toEqual({ type: 'command', name: 'about', args: [] })
  })
  it('parses uppercase (case-insensitive)', () => {
    expect(parseCommand('SKILLS')).toEqual({ type: 'command', name: 'skills', args: [] })
  })
  it('trims whitespace', () => {
    expect(parseCommand('  about  ')).toEqual({ type: 'command', name: 'about', args: [] })
  })
  it('parses all standard commands', () => {
    ['help','about','skills','projects','experience','contact','clear','ls'].forEach(cmd => {
      expect(parseCommand(cmd)).toMatchObject({ type: 'command', name: cmd })
    })
  })
})

describe('parseCommand — mv command', () => {
  it('parses mv with valid section', () => {
    expect(parseCommand('mv experience')).toEqual({ type: 'mv', section: 'experience', raw: 'mv experience' })
  })
  it('parses mv hero', () => {
    expect(parseCommand('mv hero')).toEqual({ type: 'mv', section: 'hero', raw: 'mv hero' })
  })
  it('parses mv case-insensitive', () => {
    expect(parseCommand('MV SKILLS')).toEqual({ type: 'mv', section: 'skills', raw: 'MV SKILLS' })
  })
  it('returns mv unknown for invalid section', () => {
    expect(parseCommand('mv nowhere')).toEqual({ type: 'mv', section: 'unknown', raw: 'mv nowhere' })
  })
  it('returns mv unknown when no section given', () => {
    expect(parseCommand('mv')).toEqual({ type: 'mv', section: 'unknown', raw: 'mv' })
  })
})

describe('parseCommand — unknown input', () => {
  it('returns unknown for unrecognised input', () => {
    expect(parseCommand('hello world')).toEqual({ type: 'unknown', raw: 'hello world' })
  })
  it('returns unknown for empty string', () => {
    expect(parseCommand('')).toEqual({ type: 'unknown', raw: '' })
  })
})
```

Run: `npm test __tests__/terminalParser.test.ts` — Expected: **FAIL** (module not found)

- [ ] **Step 2: Create sections.ts**

```bash
mkdir -p src/lib
```

Create `src/lib/sections.ts`:

```typescript
export const SECTIONS = ['hero', 'skills', 'projects', 'experience', 'contact'] as const
export type Section = typeof SECTIONS[number]

export function isValidSection(s: string): s is Section {
  return (SECTIONS as readonly string[]).includes(s)
}
```

- [ ] **Step 3: Create terminalParser.ts**

Create `src/lib/terminalParser.ts`:

```typescript
import { isValidSection } from './sections'

export type ParsedCommand =
  | { type: 'command'; name: string; args: string[] }
  | { type: 'mv'; section: string; raw: string }
  | { type: 'unknown'; raw: string }

const KNOWN_COMMANDS = new Set([
  'help', 'about', 'skills', 'projects', 'experience',
  'contact', 'clear', 'ls',
])

export function parseCommand(input: string): ParsedCommand {
  const raw = input
  const lower = input.trim().toLowerCase()
  const parts = lower.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return { type: 'unknown', raw }

  if (parts[0] === 'mv') {
    const section = parts[1] ?? ''
    return { type: 'mv', section: isValidSection(section) ? section : 'unknown', raw }
  }

  if (KNOWN_COMMANDS.has(parts[0])) {
    return { type: 'command', name: parts[0], args: parts.slice(1) }
  }

  return { type: 'unknown', raw }
}
```

- [ ] **Step 4: Run parser tests — expect PASS**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test __tests__/terminalParser.test.ts
```

Expected: **PASS** — 11 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src
git commit -m "feat: add sections constant and terminal command parser (TDD)

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: TerminalContext — state machine + transition lock (TDD)

**Files:**
- Create: `src/context/TerminalContext.tsx`
- Create: `src/__tests__/terminalState.test.ts`

- [ ] **Step 1: Write failing state tests**

Create `src/__tests__/terminalState.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { TerminalProvider, useTerminal } from '@/context/TerminalContext'
import React from 'react'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(TerminalProvider, null, children)

describe('useTerminal state machine', () => {
  it('starts in EMBEDDED state', () => {
    const { result } = renderHook(() => useTerminal(), { wrapper })
    expect(result.current.state).toBe('EMBEDDED')
  })

  it('transitions EMBEDDED to FLOATING', () => {
    const { result } = renderHook(() => useTerminal(), { wrapper })
    act(() => { result.current.transitionTo('FLOATING') })
    expect(result.current.state).toBe('FLOATING')
  })

  it('transitions FLOATING to MAXIMIZED', () => {
    const { result } = renderHook(() => useTerminal(), { wrapper })
    act(() => { result.current.transitionTo('FLOATING') })
    act(() => { result.current.transitionTo('MAXIMIZED') })
    expect(result.current.state).toBe('MAXIMIZED')
  })

  it('ignores transition to same state', () => {
    const { result } = renderHook(() => useTerminal(), { wrapper })
    const before = result.current.state
    act(() => { result.current.transitionTo('EMBEDDED') })
    expect(result.current.state).toBe(before)
  })

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useTerminal())).toThrow(
      'useTerminal must be used within TerminalProvider'
    )
  })
})
```

Run: `npm test __tests__/terminalState.test.ts` — Expected: **FAIL** (module not found)

- [ ] **Step 2: Create TerminalContext.tsx**

```bash
mkdir -p src/context
```

Create `src/context/TerminalContext.tsx`:

```tsx
'use client'
import {
  createContext, useContext, useState, useCallback,
  useRef, useEffect, type ReactNode,
} from 'react'

export type TerminalState = 'EMBEDDED' | 'FLOATING' | 'MAXIMIZED'

interface TerminalContextValue {
  state: TerminalState
  transitionTo: (next: TerminalState) => void
  isTransitioning: boolean
}

const TerminalContext = createContext<TerminalContextValue | null>(null)

// Must exceed Framer Motion spring settle time to prevent race conditions
const TRANSITION_LOCK_MS = 600

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TerminalState>('EMBEDDED')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const lockRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // stateRef lets callbacks read current state without stale closure
  const stateRef = useRef<TerminalState>('EMBEDDED')

  useEffect(() => { stateRef.current = state }, [state])

  const transitionTo = useCallback((next: TerminalState) => {
    if (stateRef.current === next) return
    setIsTransitioning(currentLock => {
      if (currentLock) return currentLock // blocked — ignore
      if (lockRef.current) clearTimeout(lockRef.current)
      setState(next)
      lockRef.current = setTimeout(() => setIsTransitioning(false), TRANSITION_LOCK_MS)
      return true
    })
  }, [])

  useEffect(() => () => {
    if (lockRef.current) clearTimeout(lockRef.current)
  }, [])

  return (
    <TerminalContext.Provider value={{ state, transitionTo, isTransitioning }}>
      {children}
    </TerminalContext.Provider>
  )
}

export function useTerminal(): TerminalContextValue {
  const ctx = useContext(TerminalContext)
  if (!ctx) throw new Error('useTerminal must be used within TerminalProvider')
  return ctx
}
```

- [ ] **Step 3: Run state tests — expect PASS**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test __tests__/terminalState.test.ts
```

Expected: **PASS** — 5 tests pass.

- [ ] **Step 4: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src
git commit -m "feat: add TerminalContext state machine with transition lock (TDD)

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: WifiPlaceholder component

**Files:**
- Create: `src/components/hero/WifiPlaceholder.tsx`

- [ ] **Step 1: Create WifiPlaceholder.tsx**

Create `src/components/hero/WifiPlaceholder.tsx`:

```tsx
'use client'
import { m } from 'framer-motion'
import { useTerminal } from '@/context/TerminalContext'

export default function WifiPlaceholder() {
  const { transitionTo, isTransitioning } = useTerminal()

  return (
    <m.div
      key="wifi-placeholder"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={() => !isTransitioning && transitionTo('EMBEDDED')}
      style={{
        background: 'rgba(255,240,120,0.04)',
        border: '1px dashed rgba(232,200,74,0.2)',
        borderRadius: '12px',
        minHeight: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        cursor: isTransitioning ? 'default' : 'pointer',
        padding: '32px',
      }}
    >
      {/* WiFi icon */}
      <div style={{ position: 'relative', width: '72px', height: '54px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            border: '1px solid rgba(232,200,74,0.25)',
            width: i === 0 ? '80px' : '104px',
            height: i === 0 ? '80px' : '104px',
            bottom: i === 0 ? '-14px' : '-26px',
            animation: `wifi-ripple 2.4s ease-out ${0.6 + i * 0.3}s infinite`,
          }} />
        ))}
        {[{ size: 22, d: '0.15s' }, { size: 38, d: '0.3s' }, { size: 56, d: '0.45s' }].map(({ size, d }, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            border: '2px solid #e8c84a',
            borderBottomColor: 'transparent', borderLeftColor: 'transparent',
            width: `${size}px`, height: `${size}px`, bottom: '4px',
            transform: 'rotate(-135deg)',
            animation: `wifi-arc 2.4s ease-in-out ${d} infinite`,
          }} />
        ))}
        <div style={{
          position: 'absolute', bottom: 0,
          width: '8px', height: '8px',
          background: '#e8c84a', borderRadius: '50%',
          animation: 'wifi-dot 2.4s ease-in-out infinite',
        }} />
      </div>

      <div style={{
        fontFamily: 'var(--font-dm-serif), serif',
        fontSize: '1.1rem', color: 'rgba(254,249,227,0.75)',
        textAlign: 'center', lineHeight: 1.3,
      }}>
        Wirelessly<br />
        <span style={{ color: '#e8c84a', fontStyle: 'italic' }}>Connected</span>
      </div>

      <div style={{
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '0.6rem', color: 'rgba(254,249,227,0.25)', textAlign: 'center',
      }}>
        terminal.exe has left the building
      </div>

      <div style={{
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '0.62rem', color: 'rgba(232,200,74,0.45)',
        border: '1px solid rgba(232,200,74,0.15)',
        borderRadius: '100px', padding: '5px 16px',
      }}>
        click to reattach
      </div>

      <style>{`
        @keyframes wifi-arc {
          0%   { opacity: 0; transform: rotate(-135deg) scale(0.8); }
          40%  { opacity: 0.9; transform: rotate(-135deg) scale(1); }
          100% { opacity: 0; transform: rotate(-135deg) scale(1.05); }
        }
        @keyframes wifi-ripple {
          0%   { opacity: 0.35; transform: scale(0.7); }
          100% { opacity: 0; transform: scale(1.3); }
        }
        @keyframes wifi-dot {
          0%, 100% { opacity: 0.3; }
          20%      { opacity: 1; }
        }
      `}</style>
    </m.div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src
git commit -m "feat: add WifiPlaceholder with animated signal arcs

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: TerminalFloating + TerminalMaximized wrappers

**Files:**
- Create: `src/components/terminal/TerminalFloating.tsx`
- Create: `src/components/terminal/TerminalMaximized.tsx`

Pure layout wrappers — no terminal logic, only positioning and motion.

- [ ] **Step 1: Create TerminalFloating.tsx**

```bash
mkdir -p src/components/terminal
```

Create `src/components/terminal/TerminalFloating.tsx`:

```tsx
'use client'
import { m, AnimatePresence } from 'framer-motion'
import { useTerminal } from '@/context/TerminalContext'
import Terminal from '@/components/hero/Terminal'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export default function TerminalFloating() {
  const { state } = useTerminal()
  return (
    <AnimatePresence>
      {state === 'FLOATING' && (
        <m.div
          key="terminal-floating"
          initial={{ opacity: 0, scale: 0.92, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed', top: '80px', right: '24px',
            width: '360px', zIndex: 200,
          }}
        >
          <m.div layoutId="terminal" layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <Terminal data={data.terminal} />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Create TerminalMaximized.tsx**

Create `src/components/terminal/TerminalMaximized.tsx`:

```tsx
'use client'
import { m, AnimatePresence } from 'framer-motion'
import { useTerminal } from '@/context/TerminalContext'
import Terminal from '@/components/hero/Terminal'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export default function TerminalMaximized() {
  const { state, transitionTo } = useTerminal()
  return (
    <AnimatePresence>
      {state === 'MAXIMIZED' && (
        <m.div
          key="terminal-maximized"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(6,5,0,0.97)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) transitionTo('FLOATING') }}
        >
          <m.div
            layoutId="terminal"
            layout
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            style={{ width: '100%', maxWidth: '900px', maxHeight: '80vh' }}
          >
            <Terminal data={data.terminal} maximized />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src
git commit -m "feat: add TerminalFloating and TerminalMaximized layout wrappers

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Update layout.tsx — providers + overlay renders

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Read current layout.tsx**

Read `src/app/layout.tsx` fully before editing.

- [ ] **Step 2: Update layout.tsx**

Add these imports at the top of `src/app/layout.tsx`:

```tsx
import FramerProvider from '@/components/ui/FramerProvider'
import { TerminalProvider } from '@/context/TerminalContext'
import TerminalFloating  from '@/components/terminal/TerminalFloating'
import TerminalMaximized from '@/components/terminal/TerminalMaximized'
```

Wrap the entire body content with `<FramerProvider><TerminalProvider>...</TerminalProvider></FramerProvider>` and add `<TerminalFloating />` and `<TerminalMaximized />` as the last children before the closing `</TerminalProvider>`:

```tsx
<body className={...}>
  <FramerProvider>
    <TerminalProvider>
      <CustomCursor />
      <RevealInit />
      {/* ... background divs unchanged ... */}
      <div className="relative z-[2]">{children}</div>
      {/* Overlay terminal states — outside hero grid, always available */}
      <TerminalFloating />
      <TerminalMaximized />
    </TerminalProvider>
  </FramerProvider>
</body>
```

- [ ] **Step 3: Verify build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src
git commit -m "feat: add TerminalProvider and overlay renders to root layout

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Update Hero.tsx — Client Component + IntersectionObserver + AnimatePresence

**Files:**
- Modify: `src/components/hero/Hero.tsx`

- [ ] **Step 1: Read current Hero.tsx**

Read `src/components/hero/Hero.tsx` fully before editing.

- [ ] **Step 2: Add 'use client' + imports**

Add to the top of `src/components/hero/Hero.tsx`:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useTerminal } from '@/context/TerminalContext'
import WifiPlaceholder from './WifiPlaceholder'
```

- [ ] **Step 3: Add state + IntersectionObserver inside Hero function**

Add inside the `Hero` function body, after destructuring `data`:

```tsx
const { state, transitionTo } = useTerminal()
const heroRef = useRef<HTMLElement>(null)

// Auto-detach: when hero is fully scrolled out of view, float the terminal
useEffect(() => {
  const el = heroRef.current
  if (!el || typeof window === 'undefined') return
  const obs = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) transitionTo('FLOATING')
    },
    { threshold: 0 },
  )
  obs.observe(el)
  return () => obs.disconnect()
}, [transitionTo])
```

Add `ref={heroRef}` to the `<section>` element.

- [ ] **Step 4: Wrap terminal right column with AnimatePresence**

Replace the current right column `<div style={{ animation: 'fadeUp...' }}><Terminal ... /></div>` with:

```tsx
<div style={{ animation: 'fadeUp 0.8s ease 0.6s both' }}>
  <AnimatePresence mode="wait">
    {state === 'EMBEDDED' ? (
      <m.div
        key="terminal-embedded"
        layoutId="terminal"
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Terminal data={terminal} />
      </m.div>
    ) : (
      <WifiPlaceholder key="wifi-placeholder" />
    )}
  </AnimatePresence>
</div>
```

- [ ] **Step 5: Verify build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src
git commit -m "feat: convert Hero to Client Component with auto-detach and AnimatePresence

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Update Terminal.tsx — mac dots, layoutId, mv command, parseCommand

**Files:**
- Modify: `src/components/hero/Terminal.tsx`

Read the full current file first. This task adds: `useTerminal` integration, functional mac dot buttons, `mv` navigation, `ls` command, `parseCommand`-based dispatch, and `maximized` prop for taller body.

- [ ] **Step 1: Read current Terminal.tsx**

Read `src/components/hero/Terminal.tsx` fully.

- [ ] **Step 2: Add new imports**

Add at the top of `src/components/hero/Terminal.tsx`:

```tsx
import { useTerminal } from '@/context/TerminalContext'
import { parseCommand } from '@/lib/terminalParser'
import { SECTIONS } from '@/lib/sections'
```

- [ ] **Step 3: Add maximized prop to component signature**

Change:
```tsx
export default function Terminal({ data }: { data: TerminalData }) {
```
To:
```tsx
interface TerminalProps { data: TerminalData; maximized?: boolean }
export default function Terminal({ data, maximized = false }: TerminalProps) {
```

- [ ] **Step 4: Add useTerminal inside the component**

Add after the existing `useState` declarations:

```tsx
const { state, transitionTo, isTransitioning } = useTerminal()
```

- [ ] **Step 5: Add Escape key handler for maximized state**

Add a new `useEffect` after the scroll-to-bottom effect:

```tsx
useEffect(() => {
  if (!maximized) return
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') transitionTo('FLOATING')
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [maximized, transitionTo])
```

- [ ] **Step 6: Add ls command builder**

Add after `buildHelpLines()`:

```tsx
function buildLsLines(): string[] {
  return [
    '',
    gold('  Navigable sections:'),
    '',
    ...SECTIONS.map(s => `  ${cyan(s)}`),
    '',
    dim('  usage: mv <section>'),
    '',
  ]
}
```

- [ ] **Step 7: Add executeMv function**

Add before `executeCommand`:

```tsx
const executeMv = useCallback((section: string) => {
  if (section === 'unknown' || section === '') {
    addLine(`  ${red('mv: missing or unknown section')}`)
    addLine(`  ${dim('valid: ' + SECTIONS.join(', '))}`)
    addLine('')
    setIsTyping(false)
    return
  }
  if (section === 'hero') {
    if (state === 'EMBEDDED') {
      addLine(`  ${dim('already here.')}`)
      addLine('')
      setIsTyping(false)
      return
    }
    addLine(`  ${dim('→ reattaching to hero')}`)
    addLine('')
    setIsTyping(false)
    // If maximized: first go to float, then after spring settles, go to embedded
    if (state === 'MAXIMIZED') {
      transitionTo('FLOATING')
      setTimeout(() => transitionTo('EMBEDDED'), 450)
    } else {
      transitionTo('EMBEDDED')
    }
    return
  }
  addLine(`  ${dim(`→ navigating to #${section}`)}`)
  addLine('')
  setIsTyping(false)
  document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
  if (state !== 'FLOATING') transitionTo('FLOATING')
}, [state, transitionTo, addLine])
```

- [ ] **Step 8: Replace executeCommand body to use parseCommand**

Replace the existing `executeCommand` function body with:

```tsx
const executeCommand = useCallback((input: string) => {
  const parsed = parseCommand(input)
  setIsTyping(true)

  if (parsed.type === 'mv') {
    executeMv(parsed.section)
    return
  }

  if (parsed.type === 'unknown') {
    const errLines = [
      `  ${red('unknown command: ')}${white(esc(input))}`,
      `  ${dim('AI chat is not available yet. type ')}${cyan('help')}${dim(' for commands.')}`,
      '',
    ]
    let i = 0
    const next = () => {
      if (i >= errLines.length) { setIsTyping(false); setTimeout(() => inputRef.current?.focus(), 50); return }
      addLine(errLines[i++])
      setTimeout(next, 60)
    }
    next()
    return
  }

  const key = parsed.name
  if (key === 'clear') { setLines([]); setInputBuf(''); setIsTyping(false); return }

  const outputLines: string[] =
    key === 'help' ? buildHelpLines()
    : key === 'ls'  ? buildLsLines()
    : key in data.commands
      ? (data.commands as Record<string, string[]>)[key].map(colourDataLine)
      : []

  let i = 0
  const next = () => {
    if (i >= outputLines.length) {
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 50)
      return
    }
    addLine(outputLines[i++])
    setTimeout(next, Math.max(30, Math.min(100, (outputLines[i - 1] ?? '').length * 3)))
  }
  next()
}, [data.commands, addLine, executeMv])
```

- [ ] **Step 9: Add mac dot button handlers + disable logic**

Add before the `return` statement:

```tsx
const dotDisabled = (dot: 'red' | 'yellow' | 'green') => {
  if (dot === 'red')    return state !== 'FLOATING'
  if (dot === 'yellow') return state === 'EMBEDDED'
  return false
}
const handleRed    = () => { if (!isTransitioning && state === 'FLOATING') transitionTo('EMBEDDED') }
const handleYellow = () => {
  if (isTransitioning) return
  if (state === 'FLOATING')  transitionTo('EMBEDDED')
  if (state === 'MAXIMIZED') transitionTo('FLOATING')
}
const handleGreen  = () => {
  if (isTransitioning) return
  if (state === 'EMBEDDED' || state === 'FLOATING') transitionTo('MAXIMIZED')
  if (state === 'MAXIMIZED') transitionTo('FLOATING')
}
```

- [ ] **Step 10: Update terminal-bar JSX to use functional dots**

Replace the three `<span className="t-dot ...">` elements in the terminal-bar with:

```tsx
<span
  className="t-dot r"
  onClick={(e) => { e.stopPropagation(); handleRed() }}
  style={{ opacity: dotDisabled('red') ? 0.3 : 1, cursor: dotDisabled('red') ? 'default' : 'pointer' }}
  title={state === 'FLOATING' ? 'reattach to hero' : ''}
/>
<span
  className="t-dot y"
  onClick={(e) => { e.stopPropagation(); handleYellow() }}
  style={{ opacity: dotDisabled('yellow') ? 0.3 : 1, cursor: dotDisabled('yellow') ? 'default' : 'pointer' }}
  title={state === 'MAXIMIZED' ? 'minimize to float' : state === 'FLOATING' ? 'reattach to hero' : ''}
/>
<span
  className="t-dot g"
  onClick={(e) => { e.stopPropagation(); handleGreen() }}
  style={{ cursor: 'pointer' }}
  title={state === 'MAXIMIZED' ? 'exit fullscreen' : 'maximize'}
/>
```

- [ ] **Step 11: Update terminal-body height for maximized prop**

On the `terminal-body` div, add:

```tsx
style={{ height: maximized ? '70vh' : '360px' }}
```

- [ ] **Step 12: Guard handleKeyDown against isTransitioning**

In `handleKeyDown`, change the first line from `if (isTyping) return` to:

```tsx
if (isTyping || isTransitioning) return
```

- [ ] **Step 13: Run full test suite**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```

Expected: all tests pass.

- [ ] **Step 14: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 15: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src
git commit -m "feat: upgrade Terminal with state machine, mv command, mac dots, command parser

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Integration verification

**Files:** None (verification and TODO update only)

- [ ] **Step 1: Start dev server**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 2: Verify transitions are smooth**

Test each scenario — each transition should be a fluid spring animation, not a jump:

- [ ] Green dot (embedded) → terminal flies to fullscreen with spring
- [ ] Yellow dot (maximized) → terminal shrinks from fullscreen to top-right float
- [ ] Type `mv skills` → terminal flies from hero grid to top-right, page scrolls to skills, WiFi placeholder fades in
- [ ] Red dot (floating) → terminal flies from top-right back into hero grid, WiFi fades out
- [ ] Click WiFi placeholder → same as red dot (re-attach)
- [ ] Scroll past hero (when embedded) → terminal auto-floats, WiFi placeholder appears
- [ ] Type `mv hero` while floating → terminal re-attaches without scroll
- [ ] Press Escape while maximized → back to float

- [ ] **Step 3: Verify commands**

- [ ] `ls` → lists hero, skills, projects, experience, contact
- [ ] `mv nowhere` → "mv: missing or unknown section" + valid list
- [ ] `hello` → "unknown command: hello" + AI chat placeholder message
- [ ] All v1 commands (about, skills, projects, experience, contact, clear, help) still work

- [ ] **Step 4: Verify dot states**

- [ ] Embedded: red greyed, yellow greyed, green active
- [ ] Floating: red active, yellow active, green active
- [ ] Maximized: red greyed, yellow active, green active

- [ ] **Step 5: Update TODO.md**

In `/home/lap-68/Documents/gt-dp/portfolio/TODO.md`, add to Done:

```markdown
- [x] Smart Terminal v1 — states, transitions, mv navigation, WiFi placeholder, Framer Motion
- [x] Framer Motion — pulled from backlog, used for terminal transitions
```

- [ ] **Step 6: Final commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add TODO.md
git commit -m "feat: smart terminal v1 complete

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- [x] Three states (EMBEDDED, FLOATING, MAXIMIZED) — Task 3
- [x] All transition triggers — Tasks 7 (IntersectionObserver auto-detach), 8 (executeMv, handleRed/Yellow/Green)
- [x] Mac dot button actions per state — Task 8 (dotDisabled + handlers)
- [x] WiFi placeholder with animated arcs + reattach — Task 4
- [x] AnimatePresence fade for placeholder — Task 7
- [x] Command parser TDD — Task 2
- [x] mv command behaviour table (all 6 rows) — Task 8 (executeMv)
- [x] ls command — Task 8 (buildLsLines)
- [x] Unknown input handler — Task 8 (parseCommand unknown branch)
- [x] XSS safety via esc() — Task 8 Step 8 (unchanged from v1, user input always escaped)
- [x] Framer Motion LazyMotion + layoutId — Tasks 1, 5, 7
- [x] Spring animation specs — Tasks 5, 7
- [x] Escape key exits maximized — Task 8 Step 5
- [x] Backdrop click exits maximized — Task 5 (TerminalMaximized onClick)
- [x] Transition lock — Task 3 (TRANSITION_LOCK_MS=600), used in Task 8 (isTransitioning guard)
- [x] SECTIONS single source of truth — Task 2 (lib/sections.ts)
- [x] Hero.tsx Client Component — Task 7
- [x] TerminalProvider in layout — Task 6
- [x] TerminalFloating/Maximized at layout level — Tasks 5, 6

**Type consistency:**
- `TerminalState = 'EMBEDDED' | 'FLOATING' | 'MAXIMIZED'` — Task 3, used Tasks 5, 6, 7, 8
- `ParsedCommand` union — Task 2, consumed Task 8
- `transitionTo(next: TerminalState)` — consistent throughout
- `layoutId="terminal"` — same string in Tasks 5 (Floating), 5 (Maximized), 7 (Hero embedded)
- `Terminal` accepts `maximized?: boolean` — Task 8 added, Tasks 5/6 pass it

**No placeholders found.**
