# Mobile Responsiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio fully usable on mobile phones (≤480px) and tablets (481–900px) with a bottom navigation bar, mobile terminal pill, and proper layout adjustments.

**Architecture:** CSS-first approach — show/hide mobile vs desktop elements via CSS classes rather than JS window checks. Only two JS modifications needed: IntersectionObserver in Hero.tsx guards against floating on mobile, and `executeMv` in Terminal.tsx skips the floating state on mobile. A new `MobileTerminalPill` component provides the tap-to-open terminal entry point on mobile.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, Framer Motion, plain CSS media queries

---

## File Map

```
src/
  app/
    globals.css                       MODIFY — 480px breakpoint, bottom-nav CSS, pill CSS, tablet styles, cursor hide, main padding
  components/
    hero/
      MobileTerminalPill.tsx          NEW — tappable pill that opens terminal maximized
      Hero.tsx                        MODIFY — mobile/desktop column wrappers, guard auto-detach on mobile
      Terminal.tsx                    MODIFY — skip FLOATING state when on mobile viewport
    nav/
      Nav.tsx                         MODIFY — add fixed bottom nav bar (shown mobile/tablet, hidden desktop)
  __tests__/
    MobileTerminalPill.test.tsx       NEW — render test
```

---

## Task 1: CSS foundation — 480px breakpoint + all mobile styles

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Read the current bottom of globals.css**

```bash
tail -70 /home/lap-68/Documents/gt-dp/portfolio/src/app/globals.css
```

Confirm the existing `@media (max-width: 900px)` block ends around line 1069.

- [ ] **Step 2: Append all new CSS to globals.css**

Append the following after the existing `@media (max-width: 900px)` block:

```css
/* ── Mobile terminal pill ── */
.hero-terminal-col { display: block; }
.hero-terminal-pill-col { display: none; }

/* ── Bottom navigation bar ── */
.bottom-nav {
  display: none; /* hidden on desktop */
}

/* ── Tablet (481px – 900px) ── */
@media (min-width: 481px) and (max-width: 900px) {
  .skills-grid { grid-template-columns: repeat(2, 1fr) !important; }
}

/* ── Mobile (≤ 480px) ── */
@media (max-width: 480px) {
  /* Terminal columns */
  .hero-terminal-col     { display: none; }
  .hero-terminal-pill-col { display: block; }

  /* Bottom nav — show on mobile */
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 150;
    height: 56px;
    align-items: center;
    justify-content: space-around;
    background: rgba(8, 7, 0, 0.97);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(232, 200, 74, 0.15);
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-decoration: none;
    padding: 6px 16px;
    transition: opacity 0.2s;
  }

  .bottom-nav-icon {
    font-size: 1rem;
    color: var(--text-muted);
    transition: color 0.2s;
  }

  .bottom-nav-label {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 0.48rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  .bottom-nav-item.active .bottom-nav-icon,
  .bottom-nav-item.active .bottom-nav-label {
    color: var(--accent);
  }

  /* Space for bottom nav so last section isn't hidden */
  main { padding-bottom: 70px; }

  /* Mobile terminal pill */
  .mobile-terminal-pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: rgba(255, 240, 120, 0.05);
    border: 1px solid rgba(232, 200, 74, 0.2);
    border-radius: 10px;
    padding: 14px 18px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    animation: fadeUp 0.8s ease 0.6s both;
  }

  .mobile-terminal-pill:hover,
  .mobile-terminal-pill:active {
    border-color: rgba(232, 200, 74, 0.4);
    background: rgba(255, 240, 120, 0.08);
  }

  .mobile-terminal-pill-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mobile-terminal-pill-icon {
    font-size: 1rem;
    color: var(--accent);
  }

  .mobile-terminal-pill-label {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 0.7rem;
    color: var(--text-secondary);
    letter-spacing: 0.04em;
  }

  .mobile-terminal-pill-hint {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 0.6rem;
    color: var(--text-muted);
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  /* Hide custom cursor on touch devices */
  body { cursor: auto; }
  .cursor, .cursor-ring { display: none; }

  /* Nav padding on mobile */
  nav { padding: 16px 20px !important; }
}

/* Hide bottom nav on tablet too (show only on ≤ 480px) */
@media (min-width: 481px) and (max-width: 900px) {
  .bottom-nav { display: none; }
}
```

Wait — the spec says bottom nav shows on both mobile AND tablet (≤ 900px). Revise: remove the tablet hide rule and instead show bottom nav at ≤ 900px:

Replace the bottom-nav rules above with:

```css
/* ── Bottom nav: show on mobile + tablet (≤ 900px) ── */
@media (max-width: 900px) {
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 150;
    height: 56px;
    align-items: center;
    justify-content: space-around;
    background: rgba(8, 7, 0, 0.97);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(232, 200, 74, 0.15);
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    text-decoration: none;
    padding: 6px 20px;
    transition: opacity 0.2s;
  }

  .bottom-nav-icon {
    font-size: 1.1rem;
    color: var(--text-muted);
    transition: color 0.2s;
  }

  .bottom-nav-label {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 0.5rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  .bottom-nav-item.active .bottom-nav-icon,
  .bottom-nav-item.active .bottom-nav-label {
    color: var(--accent);
  }

  main { padding-bottom: 70px; }
}
```

The full block to append to `globals.css` (replacing Step 2 above with the corrected version):

```css
/* ── Mobile/Tablet responsive additions ── */

/* Desktop defaults for mobile-only elements */
.hero-terminal-col      { display: block; }
.hero-terminal-pill-col { display: none; }
.bottom-nav             { display: none; }

/* ── Bottom nav: mobile + tablet (≤ 900px) ── */
@media (max-width: 900px) {
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 150;
    height: 56px;
    align-items: center;
    justify-content: space-around;
    background: rgba(8, 7, 0, 0.97);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(232, 200, 74, 0.15);
  }
  .bottom-nav-item {
    display: flex; flex-direction: column;
    align-items: center; gap: 3px;
    text-decoration: none; padding: 6px 20px;
    transition: opacity 0.2s;
  }
  .bottom-nav-icon {
    font-size: 1.1rem; color: var(--text-muted); transition: color 0.2s;
  }
  .bottom-nav-label {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 0.5rem; color: var(--text-muted);
    letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s;
  }
  .bottom-nav-item.active .bottom-nav-icon,
  .bottom-nav-item.active .bottom-nav-label { color: var(--accent); }
  main { padding-bottom: 70px; }
}

/* ── Tablet only (481px – 900px) ── */
@media (min-width: 481px) and (max-width: 900px) {
  .skills-grid { grid-template-columns: repeat(2, 1fr) !important; }
}

/* ── Mobile only (≤ 480px) ── */
@media (max-width: 480px) {
  /* Show pill, hide full terminal card */
  .hero-terminal-col      { display: none; }
  .hero-terminal-pill-col { display: block; }

  /* Mobile terminal pill */
  .mobile-terminal-pill {
    display: flex; align-items: center;
    justify-content: space-between; gap: 12px;
    background: rgba(255, 240, 120, 0.05);
    border: 1px solid rgba(232, 200, 74, 0.2);
    border-radius: 10px; padding: 14px 18px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    animation: fadeUp 0.8s ease 0.6s both;
  }
  .mobile-terminal-pill:active {
    border-color: rgba(232, 200, 74, 0.4);
    background: rgba(255, 240, 120, 0.08);
  }
  .mobile-terminal-pill-left {
    display: flex; align-items: center; gap: 10px;
  }
  .mobile-terminal-pill-icon {
    font-size: 1rem; color: var(--accent);
  }
  .mobile-terminal-pill-label {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 0.7rem; color: var(--text-secondary); letter-spacing: 0.04em;
  }
  .mobile-terminal-pill-hint {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 0.6rem; color: var(--text-muted);
    letter-spacing: 0.06em; white-space: nowrap;
  }

  /* Hide custom cursor on touch */
  body { cursor: auto; }
  .cursor, .cursor-ring { display: none; }

  /* Tighten top nav on mobile */
  nav { padding: 14px 20px !important; }
}
```

- [ ] **Step 3: Verify build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build
```

Expected: build succeeds — no CSS parse errors.

- [ ] **Step 4: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/app/globals.css
git commit -m "feat: add mobile CSS — 480px breakpoint, bottom-nav, terminal pill styles

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: MobileTerminalPill component + test (TDD)

**Files:**
- Create: `src/components/hero/MobileTerminalPill.tsx`
- Create: `src/__tests__/MobileTerminalPill.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/MobileTerminalPill.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import MobileTerminalPill from '@/components/hero/MobileTerminalPill'
import { TerminalProvider } from '@/context/TerminalContext'
import React from 'react'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(TerminalProvider, null, children)

describe('MobileTerminalPill', () => {
  it('renders the terminal label', () => {
    render(<MobileTerminalPill />, { wrapper })
    expect(screen.getByText('~/nitish-kushwaha')).toBeInTheDocument()
  })

  it('renders the tap hint', () => {
    render(<MobileTerminalPill />, { wrapper })
    expect(screen.getByText('tap to open →')).toBeInTheDocument()
  })

  it('has the mobile-terminal-pill class', () => {
    const { container } = render(<MobileTerminalPill />, { wrapper })
    expect(container.firstChild).toHaveClass('mobile-terminal-pill')
  })
})
```

Run:
```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test __tests__/MobileTerminalPill.test.tsx
```

Expected: **FAIL** — `Cannot find module '@/components/hero/MobileTerminalPill'`

- [ ] **Step 2: Create MobileTerminalPill.tsx**

Create `src/components/hero/MobileTerminalPill.tsx`:

```tsx
'use client'
import { useTerminal } from '@/context/TerminalContext'

export default function MobileTerminalPill() {
  const { transitionTo, isTransitioning } = useTerminal()

  return (
    <div
      className="mobile-terminal-pill"
      role="button"
      tabIndex={0}
      onClick={() => !isTransitioning && transitionTo('MAXIMIZED')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (!isTransitioning) transitionTo('MAXIMIZED')
        }
      }}
    >
      <div className="mobile-terminal-pill-left">
        <span className="mobile-terminal-pill-icon">⌨</span>
        <span className="mobile-terminal-pill-label">~/nitish-kushwaha</span>
      </div>
      <span className="mobile-terminal-pill-hint">tap to open →</span>
    </div>
  )
}
```

- [ ] **Step 3: Run test — expect PASS**

```bash
npm test __tests__/MobileTerminalPill.test.tsx
```

Expected: **PASS** — 3 tests pass.

- [ ] **Step 4: Run full test suite**

```bash
npm test
```

Expected: all tests pass (29 existing + 3 new = 32 total).

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src
git commit -m "feat: add MobileTerminalPill component (TDD)

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Nav.tsx — bottom navigation bar

**Files:**
- Modify: `src/components/nav/Nav.tsx`

The bottom nav uses the existing `active` state already tracked by the scroll listener. No new logic needed — just additional JSX.

- [ ] **Step 1: Read current Nav.tsx**

```bash
cat /home/lap-68/Documents/gt-dp/portfolio/src/components/nav/Nav.tsx
```

- [ ] **Step 2: Add bottom nav JSX**

The nav icons map:
- `skills` → `⚡`
- `projects` → `◈`
- `experience` → `◉`
- `contact` → `⌥`

Replace the entire `Nav.tsx` with:

```tsx
'use client'
import { useEffect, useState } from 'react'
import type { PortfolioData } from '@/data/types'

const NAV_IDS = ['skills', 'projects', 'experience', 'contact'] as const

const NAV_ICONS: Record<typeof NAV_IDS[number], string> = {
  skills:     '⚡',
  projects:   '◈',
  experience: '◉',
  contact:    '⌥',
}

export default function Nav({ data }: { data: Pick<PortfolioData, 'hero'> }) {
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      let current = ''
      document.querySelectorAll<HTMLElement>('section[id]').forEach(s => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id
      })
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [first, last] = data.hero.name.split(' ')

  return (
    <>
      {/* Top nav bar */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '24px 60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(10,9,0,0.6)',
          borderBottom: '1px solid rgba(232,200,74,0.08)',
          animation: 'navIn 1s ease forwards',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: '1.3rem', color: 'var(--accent)', letterSpacing: '0.02em',
        }}>
          {first}.{last}
        </div>

        <ul className="nav-links" style={{ display: 'flex', gap: '40px', listStyle: 'none' }}>
          {NAV_IDS.map(id => (
            <li key={id}>
              <a
                href={`#${id}`}
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: '0.72rem', fontWeight: 400,
                  color: active === id ? 'var(--accent)' : 'var(--text-secondary)',
                  textDecoration: 'none', letterSpacing: '0.1em',
                  textTransform: 'uppercase', transition: 'color 0.3s ease',
                }}
              >
                {id}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '0.72rem', fontWeight: 500,
            color: 'var(--bg-dark)', background: 'var(--accent)',
            padding: '10px 24px', borderRadius: '3px',
            textDecoration: 'none', letterSpacing: '0.08em',
            textTransform: 'uppercase', transition: 'background 0.3s ease',
          }}
        >
          Hire Me
        </a>
      </nav>

      {/* Bottom nav bar — shown on mobile/tablet via CSS (.bottom-nav) */}
      <nav className="bottom-nav" aria-label="Section navigation">
        {NAV_IDS.map(id => (
          <a
            key={id}
            href={`#${id}`}
            className={`bottom-nav-item${active === id ? ' active' : ''}`}
          >
            <span className="bottom-nav-icon" aria-hidden="true">
              {NAV_ICONS[id]}
            </span>
            <span className="bottom-nav-label">{id}</span>
          </a>
        ))}
      </nav>
    </>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/nav/Nav.tsx
git commit -m "feat: add bottom nav bar for mobile/tablet

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Hero.tsx — mobile/desktop column wrappers + guard auto-detach

**Files:**
- Modify: `src/components/hero/Hero.tsx`

Two changes:
1. Wrap the right column in CSS class divs so CSS can swap between full terminal and pill
2. Guard the IntersectionObserver auto-detach — on mobile (≤480px), don't float the terminal (FLOATING state is unused on mobile)

- [ ] **Step 1: Read current Hero.tsx**

```bash
cat /home/lap-68/Documents/gt-dp/portfolio/src/components/hero/Hero.tsx
```

- [ ] **Step 2: Update Hero.tsx**

Replace the entire file:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useTerminal } from '@/context/TerminalContext'
import WifiPlaceholder from './WifiPlaceholder'
import MobileTerminalPill from './MobileTerminalPill'
import Terminal from './Terminal'
import type { PortfolioData } from '@/data/types'

export default function Hero({ data }: { data: PortfolioData }) {
  const { hero, terminal } = data
  const { state, transitionTo } = useTerminal()
  const heroRef = useRef<HTMLElement>(null)

  // Auto-detach: when hero scrolls fully out of view, float the terminal.
  // On mobile (≤480px) the FLOATING state is unused — skip auto-detach.
  useEffect(() => {
    const el = heroRef.current
    if (!el || typeof window === 'undefined') return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && window.innerWidth > 480) {
          transitionTo('FLOATING')
        }
      },
      { threshold: 0 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [transitionTo])

  return (
    <section
      ref={heroRef}
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '120px 60px 80px', position: 'relative',
      }}
    >
      <div className="hero-inner" style={{
        maxWidth: '1200px', margin: '0 auto', width: '100%',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '80px', alignItems: 'center',
      }}>
        {/* Left: hero text (unchanged) */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: '100px', padding: '8px 18px',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '0.7rem', color: 'var(--accent)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: '32px', animation: 'fadeUp 0.8s ease 0.3s both',
          }}>
            <span style={{
              width: '7px', height: '7px', background: '#4adb6e',
              borderRadius: '50%', animation: 'pulse 2s ease infinite',
            }} />
            {hero.badge}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-dm-serif), serif',
            fontSize: 'clamp(3rem, 5vw, 5.5rem)',
            lineHeight: 1.05, letterSpacing: '-0.02em',
            animation: 'fadeUp 0.8s ease 0.5s both',
          }}>
            {hero.titleLines.map((line, i) => (
              <span key={i}>
                {i === hero.titleAccentLine
                  ? <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{line}</span>
                  : line}
                {i < hero.titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p style={{
            marginTop: '28px', fontSize: '1.05rem', lineHeight: 1.75,
            color: 'var(--text-secondary)', maxWidth: '460px',
            animation: 'fadeUp 0.8s ease 0.7s both',
          }}>
            {hero.subtitle}
          </p>

          <div style={{
            display: 'flex', gap: '20px', marginTop: '44px',
            animation: 'fadeUp 0.8s ease 0.9s both',
          }}>
            <a href={hero.ctaPrimary.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'var(--accent)', color: 'var(--bg-dark)',
              padding: '14px 32px', borderRadius: '3px',
              fontFamily: 'var(--font-instrument-sans), sans-serif',
              fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}>
              {hero.ctaPrimary.label}
            </a>
            <a href={hero.ctaSecondary.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)', padding: '14px 32px', borderRadius: '3px',
              fontFamily: 'var(--font-instrument-sans), sans-serif',
              fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none',
              backdropFilter: 'blur(10px)', transition: 'all 0.3s ease',
            }}>
              {hero.ctaSecondary.label}
            </a>
          </div>
        </div>

        {/* Right: terminal area */}
        <div style={{ animation: 'fadeUp 0.8s ease 0.6s both' }}>

          {/* Desktop: full terminal card or WiFi placeholder (hidden on mobile via CSS) */}
          <div className="hero-terminal-col">
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

          {/* Mobile: collapsed pill (hidden on desktop via CSS) */}
          <div className="hero-terminal-pill-col">
            <MobileTerminalPill />
          </div>

        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Run full test suite**

```bash
npm test
```

Expected: all 32 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/hero/Hero.tsx
git commit -m "feat: hero mobile layout — terminal pill wrapper, guard auto-detach on mobile

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Terminal.tsx — skip FLOATING state on mobile

**Files:**
- Modify: `src/components/hero/Terminal.tsx`

On mobile (≤480px), `mv <section>` should scroll to the section and close the terminal (back to EMBEDDED / pill), not float it top-right. Add a viewport check to `executeMv`.

- [ ] **Step 1: Read the executeMv function in Terminal.tsx**

```bash
grep -n "executeMv\|transitionTo\|FLOATING" /home/lap-68/Documents/gt-dp/portfolio/src/components/hero/Terminal.tsx
```

- [ ] **Step 2: Add isMobileViewport helper and update executeMv**

Find the `executeMv` function (around line 95). Add a helper above it and update the last branch:

Add this helper function right before the `executeMv = useCallback` line:

```tsx
// Safe to call in event handlers — not during render
const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 480
```

Then in `executeMv`, change the final section (the `mv <section>` branch — not hero) from:

```tsx
addLine(`  ${dim(`→ navigating to #${section}`)}`)
addLine('')
setIsTyping(false)
document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
if (state !== 'FLOATING') transitionTo('FLOATING')
```

to:

```tsx
addLine(`  ${dim(`→ navigating to #${section}`)}`)
addLine('')
setIsTyping(false)
document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
// On mobile: no floating window — just scroll and return to embedded/dismiss
if (!isMobileViewport() && state !== 'FLOATING') transitionTo('FLOATING')
if (isMobileViewport() && state === 'MAXIMIZED') transitionTo('EMBEDDED')
```

- [ ] **Step 3: Run full test suite**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```

Expected: all 32 tests pass (no tests test the mobile viewport branch directly — it's guarded by window.innerWidth which jsdom sets to 0 by default, meaning tests already exercise the mobile path without knowing it).

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/hero/Terminal.tsx
git commit -m "feat: terminal skip FLOATING on mobile — mv navigates + dismisses on small screens

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Verification — Chrome DevTools + final commit

**Files:** None (verification only) + TODO.md update

- [ ] **Step 1: Start dev server**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 2: Test at 375px (iPhone SE / small mobile)**

Open Chrome DevTools → Device toolbar → set width to 375px.

Verify:
- [ ] Bottom nav bar visible at bottom with 4 icons (⚡ Skills · ◈ Projects · ◉ Experience · ⌥ Contact)
- [ ] Active icon highlights gold as you scroll through sections
- [ ] Top nav shows logo + "Hire Me" only (no horizontal links)
- [ ] Hero shows single column (text + pill below)
- [ ] Terminal pill shows "⌨ ~/nitish-kushwaha ... tap to open →"
- [ ] Tap pill → terminal opens fullscreen (maximized overlay)
- [ ] Type `mv skills` → scrolls to skills, terminal dismisses to pill
- [ ] Type `mv hero` → scrolls to top, terminal returns to pill
- [ ] No horizontal scrollbar at any section
- [ ] Custom cursor not visible
- [ ] Last section (contact/footer) not hidden behind bottom nav

- [ ] **Step 3: Test at 768px (iPad / tablet)**

Set width to 768px.

Verify:
- [ ] Bottom nav visible
- [ ] Skills section shows 2 columns (not 1)
- [ ] Full terminal card visible (not pill) — hero-terminal-col shows at 768px

- [ ] **Step 4: Test at 1280px (desktop)**

Set width to 1280px.

Verify:
- [ ] Bottom nav hidden
- [ ] Top nav shows all links
- [ ] Skills grid 3 columns
- [ ] Terminal card in hero (no pill)
- [ ] All desktop features work normally

- [ ] **Step 5: Update TODO.md**

In `/home/lap-68/Documents/gt-dp/portfolio/TODO.md`, mark done:

```markdown
- [x] **Mobile responsiveness** — bottom nav, terminal pill, 480px breakpoint, tablet 2-col
```

- [ ] **Step 6: Final commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add TODO.md
git commit -m "feat: mobile responsiveness v1 complete

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- [x] Mobile target (≤480px) — Task 1 (breakpoint) + Tasks 2–5
- [x] Tablet target (481–900px) — Task 1 (2-col skills) + Task 3 (bottom nav)
- [x] Bottom nav bar (≤900px), CSS-hidden on desktop — Tasks 1 + 3
- [x] Active section highlighting — Task 3 (reuses existing `active` state)
- [x] Mobile terminal pill — Tasks 1 (CSS) + 2 (component) + 4 (Hero)
- [x] Tap pill → MAXIMIZED — Task 2 (transitionTo('MAXIMIZED'))
- [x] No FLOATING on mobile — Tasks 4 (guard observer) + 5 (executeMv)
- [x] `mv <section>` on mobile: scroll + dismiss — Task 5
- [x] `main padding-bottom: 70px` for bottom nav — Task 1
- [x] Custom cursor hidden on touch — Task 1
- [x] WiFi placeholder hidden on mobile (CSS hides hero-terminal-col which contains it) — Task 1 + 4
- [x] Tablet 2-col skills — Task 1
- [x] Tests: MobileTerminalPill (Task 2), full suite passes all tasks
- [x] Verification checklist — Task 6

**No placeholders found.**

**Type consistency:**
- `MobileTerminalPill` — created Task 2, imported Task 4
- `isMobileViewport()` — defined and used both in Task 5
- CSS classes `.hero-terminal-col` / `.hero-terminal-pill-col` — defined Task 1, used Task 4
- `.bottom-nav` / `.bottom-nav-item` / `.bottom-nav-icon` / `.bottom-nav-label` — defined Task 1, used Task 3
- `.mobile-terminal-pill` and sub-classes — defined Task 1, used Task 2
