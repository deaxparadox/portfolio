# Resume Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a resume mode as the default portfolio view (`/?mode=resume`), move the full experience to `/?mode=full`, and add a persistent DeaxButton for switching modes.

**Architecture:** `proxy.ts` redirects `/` → `/?mode=resume`. `page.tsx` reads `await searchParams` and conditionally renders `<ResumePortfolio />` (new, lightweight) or `<FullExperienceShell />` (existing sections wrapped). Root `layout.tsx` strips to fonts + DeaxButton only. Theme toggle (dark/light) is scoped to resume mode via `ThemeContext`.

**Tech Stack:** Next.js 16 (App Router, proxy.ts), React 18, TypeScript strict, CSS inline styles (resume mode), existing globals.css

**Spec:** `docs/superpowers/specs/2026-05-25-resume-mode-design.md`

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| **Create** | `src/proxy.ts` | Redirect `/` → `/?mode=resume` |
| **Modify** | `src/app/layout.tsx` | Strip to fonts + metadata + DeaxButton only |
| **Modify** | `src/app/page.tsx` | async, await searchParams, conditional render |
| **Modify** | `src/app/globals.css` | Add resume keyframes + scrollbar |
| **Create** | `src/lib/heatmap.ts` | Shared heatmap cell generation |
| **Modify** | `src/components/glimpse/BentoHeatmap.tsx` | Use shared heatmap util |
| **Create** | `src/components/resume/ThemeContext.tsx` | dark/light theme, localStorage |
| **Create** | `src/components/resume/ResumePortfolio.tsx` | Root resume component, owns ThemeContext |
| **Create** | `src/components/resume/ResumeNav.tsx` | Nav bar with theme toggle |
| **Create** | `src/components/resume/ResumeHero.tsx` | Hero: badge, name, bio, heatmap |
| **Create** | `src/components/resume/ResumeSocial.tsx` | Social links section |
| **Create** | `src/components/resume/ResumeExperience.tsx` | Work experience rows |
| **Create** | `src/components/resume/ResumeSkills.tsx` | Terminal-style skill block |
| **Create** | `src/components/resume/ResumeProjects.tsx` | Numbered project list |
| **Create** | `src/components/resume/ResumeContact.tsx` | Copy-email contact |
| **Create** | `src/components/resume/ResumeFooter.tsx` | Footer bar |
| **Create** | `src/components/full/FullExperienceShell.tsx` | Wraps all heavy effects + existing sections |
| **Create** | `src/components/deax/DeaxButton.tsx` | Persistent floating mode-switch button |
| **Create** | `src/__tests__/ThemeContext.test.tsx` | Theme context tests |
| **Create** | `src/__tests__/ResumePortfolio.test.tsx` | Resume root component tests |
| **Create** | `src/__tests__/DeaxButton.test.tsx` | DeaxButton tests |

---

## Task 1: Create v3 branch + extract heatmap util

**Files:**
- Create: `src/lib/heatmap.ts`
- Modify: `src/components/glimpse/BentoHeatmap.tsx`

- [ ] **Step 1: Create v3 branch from dev**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git checkout dev
git checkout -b v3
```

Expected: `Switched to a new branch 'v3'`

- [ ] **Step 2: Create `src/lib/heatmap.ts`**

```ts
// src/lib/heatmap.ts
const WEIGHTS = [0.35, 0.25, 0.2, 0.12, 0.08]

export function generateHeatmapCells(count: number): number[] {
  return Array.from({ length: count }, () => {
    let acc = 0
    const r = Math.random()
    for (let j = 0; j < WEIGHTS.length; j++) {
      acc += WEIGHTS[j]
      if (r < acc) return j
    }
    return 0
  })
}
```

- [ ] **Step 3: Update `BentoHeatmap.tsx` to use shared util**

```tsx
// src/components/glimpse/BentoHeatmap.tsx
'use client'
import { useMemo } from 'react'
import { generateHeatmapCells } from '@/lib/heatmap'

const MONTHS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May']

export default function BentoHeatmap() {
  const cells = useMemo(() => generateHeatmapCells(52 * 7), [])

  return (
    <div className="bc bc-github">
      <div className="bc-label">GitHub Contributions</div>
      <div className="bc-title">Coding throughout the year</div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Open source journey &amp; contributions
      </div>
      <div className="heatmap" style={{ overflow: 'hidden' }}>
        {cells.map((lv, i) => (
          <div key={i} className={`hm-cell${lv ? ` l${lv}` : ''}`} />
        ))}
      </div>
      <div className="hm-months" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '.04em' }}>
        {MONTHS.map(m => <span key={m}>{m}</span>)}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify no regressions**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --silent 2>&1 | tail -5
```

Expected: `Tests: 43 passed, 43 total`

- [ ] **Step 5: Commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add src/lib/heatmap.ts src/components/glimpse/BentoHeatmap.tsx
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: extract heatmap cell generation to shared lib/heatmap.ts"
```

---

## Task 2: ThemeContext (TDD)

**Files:**
- Create: `src/components/resume/ThemeContext.tsx`
- Create: `src/__tests__/ThemeContext.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/__tests__/ThemeContext.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/resume/ThemeContext'

function TestConsumer() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to dark theme', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('toggles to light on click', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('toggles back to dark on second click', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('toggle'))
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('reads saved theme from localStorage', () => {
    localStorage.setItem('portfolio-resume-theme', 'light')
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('saves theme to localStorage on toggle', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('toggle'))
    expect(localStorage.getItem('portfolio-resume-theme')).toBe('light')
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPatterns="ThemeContext" --silent 2>&1 | tail -5
```

Expected: test suite fails — `Cannot find module '@/components/resume/ThemeContext'`

- [ ] **Step 3: Create `ThemeContext.tsx`**

```tsx
// src/components/resume/ThemeContext.tsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-resume-theme') as Theme | null
    if (saved === 'dark' || saved === 'light') setTheme(saved)
  }, [])

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('portfolio-resume-theme', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

- [ ] **Step 4: Run ThemeContext tests — confirm they pass**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPatterns="ThemeContext" --silent 2>&1 | tail -5
```

Expected: `Tests: 5 passed, 5 total`

- [ ] **Step 5: Commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add src/__tests__/ThemeContext.test.tsx src/components/resume/ThemeContext.tsx
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: ThemeContext — dark/light toggle with localStorage persistence"
```

---

## Task 3: Resume sub-components

**Files:** All new — `src/components/resume/` (7 components)

These are purely presentational. No tests — they receive typed props and render markup. Data flows from `ResumePortfolio` (Task 4).

**Shared theme token types** (define at top of each file that needs it):
```ts
export interface ThemeTokens {
  bg: string; bgTerm: string; nav: string
  txt: string; dim: string; dimLo: string
  gold: string; goldDk: string; goldLt: string
  border: string; borderHv: string
  dotPattern: string; dotSize?: string
  scrollThumb: string
}
```

- [ ] **Step 1: Create `ResumeNav.tsx`**

```tsx
// src/components/resume/ResumeNav.tsx
'use client'
import { useTheme } from './ThemeContext'
import type { ThemeTokens } from './types'

const mono = "'DM Mono', monospace"
const dirt = "'Rubik Dirt', sans-serif"

const NAV_LINKS = ['projects', 'skills', 'experience', 'contact'] as const

interface Props { T: ThemeTokens }

export default function ResumeNav({ T }: Props) {
  const { theme, toggleTheme } = useTheme()
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: T.nav,
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      borderBottom: `1px solid ${T.border}`,
      padding: '13px 0',
      transition: 'background .35s, border-color .35s',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: dirt, fontSize: 17, color: T.gold, letterSpacing: '-0.5px', lineHeight: 1 }}>NK</span>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {NAV_LINKS.map(id => (
            <a key={id} href={`#${id}`} style={{
              fontFamily: mono, fontSize: 11, letterSpacing: '0.08em',
              color: T.dim, textDecoration: 'none', transition: 'color .18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = T.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = T.dim)}
            >{id}</a>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: mono, fontSize: 10, letterSpacing: '0.10em',
              color: T.gold, background: 'transparent',
              border: `1px solid ${T.border}`,
              borderRadius: 4, padding: '5px 12px',
              cursor: 'pointer', transition: 'all .22s', lineHeight: 1,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = T.bgTerm }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <span style={{ fontSize: 13 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create `src/components/resume/types.ts`**

```ts
// src/components/resume/types.ts
export interface ThemeTokens {
  bg: string
  bgTerm: string
  nav: string
  txt: string
  dim: string
  dimLo: string
  gold: string
  goldDk: string
  goldLt: string
  border: string
  borderHv: string
  dotPattern: string
  dotSize?: string
  scrollThumb: string
}
```

- [ ] **Step 3: Create `ResumeHero.tsx`**

```tsx
// src/components/resume/ResumeHero.tsx
'use client'
import { useMemo } from 'react'
import { generateHeatmapCells } from '@/lib/heatmap'
import type { ThemeTokens } from './types'

const mono = "'DM Mono', monospace"
const sans = "'Syne', sans-serif"
const dirt = "'Rubik Dirt', sans-serif"
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface Props {
  T: ThemeTokens
  name: string
  role: string
  location: string
  bio: string[]
  tldr: string
}

export default function ResumeHero({ T, name, role, location, bio, tldr }: Props) {
  const cells = useMemo(() => generateHeatmapCells(52 * 7), [])
  const heatLevels = [
    T.bgTerm === 'rgba(245,197,24,0.04)' ? 'rgba(245,197,24,0.07)' : 'rgba(0,0,0,0.07)',
    T.bgTerm === 'rgba(245,197,24,0.04)' ? 'rgba(245,197,24,0.24)' : 'rgba(0,0,0,0.22)',
    T.bgTerm === 'rgba(245,197,24,0.04)' ? 'rgba(245,197,24,0.46)' : 'rgba(0,0,0,0.42)',
    T.bgTerm === 'rgba(245,197,24,0.04)' ? 'rgba(245,197,24,0.70)' : 'rgba(0,0,0,0.66)',
    T.bgTerm === 'rgba(245,197,24,0.04)' ? T.gold : 'rgba(0,0,0,0.90)',
  ]

  return (
    <section style={{ paddingTop: 60 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontFamily: mono, fontSize: 10, color: T.dim,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        marginBottom: 24, background: T.bgTerm,
        border: `1px solid ${T.border}`, padding: '5px 12px', borderRadius: 4,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'rp-pulse 2s ease-in-out infinite', display: 'inline-block' }} />
        Available for work
      </div>

      <h1 style={{
        fontFamily: dirt, fontSize: 'clamp(38px,6vw,64px)',
        color: T.txt, lineHeight: 0.95, letterSpacing: '-1px',
        marginBottom: 10, transition: 'color .35s',
      }}>{name}</h1>

      <div style={{
        fontFamily: mono, fontSize: 13, color: T.dim,
        letterSpacing: '0.05em', marginBottom: 30,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        transition: 'color .35s',
      }}>
        <span style={{ color: T.gold, fontWeight: 500 }}>{role}</span>
        <span style={{ color: T.border }}>•</span>
        <span>{location}</span>
      </div>

      {bio.map((p, i) => (
        <p key={i} style={{ fontSize: 14, color: T.dim, lineHeight: 1.85, maxWidth: 560, marginBottom: 16, fontFamily: sans, transition: 'color .35s' }}>{p}</p>
      ))}

      <p style={{
        fontFamily: mono, fontSize: 12, color: T.dimLo,
        lineHeight: 1.75, maxWidth: 520, marginBottom: 40,
        paddingLeft: 14, borderLeft: `2px solid ${T.border}`,
        transition: 'color .35s, border-color .35s',
      }}>
        <span style={{ color: T.gold }}>tldr;</span>{' '}{tldr}
      </p>

      {/* Heatmap */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {MONTHS.map(m => (
            <span key={m} style={{ fontFamily: mono, fontSize: 9, color: T.dimLo, letterSpacing: '0.04em' }}>{m}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52,1fr)', gridTemplateRows: 'repeat(7,1fr)', gap: 3 }}>
          {cells.map((lv, i) => (
            <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 2, background: heatLevels[lv] }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: mono, fontSize: 9, color: T.dimLo }}>Less</span>
          {heatLevels.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
          <span style={{ fontFamily: mono, fontSize: 9, color: T.dimLo }}>More</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `ResumeLink.tsx`** (shared link component — must exist before ResumeSocial imports it)

```tsx
// src/components/resume/ResumeLink.tsx
'use client'
import { useState } from 'react'
import type { ThemeTokens } from './types'

const mono = "'DM Mono', monospace"

interface Props {
  href: string
  children: React.ReactNode
  style?: React.CSSProperties
  T: ThemeTokens
}

export default function ResumeLink({ href, children, style = {}, T }: Props) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: mono, fontSize: 'inherit',
        color: hov ? T.goldLt : T.gold,
        textDecoration: 'none',
        borderBottom: `1px solid ${hov ? T.gold : T.border}`,
        paddingBottom: 1,
        transition: 'color .18s, border-color .18s',
        ...style,
      }}
    >{children}</a>
  )
}
```

- [ ] **Step 5: Create `ResumeSocial.tsx`**

```tsx
// src/components/resume/ResumeSocial.tsx
import type { ThemeTokens } from './types'
import type { SocialLink } from '@/data/types'
import ResumeLink from './ResumeLink'

const mono = "'DM Mono', monospace"

interface Props { T: ThemeTokens; socials: SocialLink[]; email: string }

export default function ResumeSocial({ T, socials, email }: Props) {
  const allLinks = [
    ...socials,
    { label: 'Email', icon: '', href: `mailto:${email}` },
  ]
  return (
    <section>
      <SectionTitle T={T}>Presence on the internet</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 0' }}>
        {allLinks.map((s, i) => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
            <ResumeLink href={s.href} style={{ fontSize: 13 }} T={T}>{s.label}</ResumeLink>
            {i < allLinks.length - 1 && (
              <span style={{ fontFamily: mono, color: T.border, margin: '0 14px', fontSize: 11 }}>·</span>
            )}
          </span>
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ children, T }: { children: string; T: ThemeTokens }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.55 }}>~</span>
      <span>{children}</span>
      <span style={{ opacity: 0.55 }}>~</span>
    </div>
  )
}
```

- [ ] **Step 6: Create `ResumeExperience.tsx`**

```tsx
// src/components/resume/ResumeExperience.tsx
import type { ThemeTokens } from './types'
import type { ExperienceItem } from '@/data/types'

const mono = "'DM Mono', monospace"
const sans = "'Syne', sans-serif"

interface Props { T: ThemeTokens; experience: ExperienceItem[] }

export default function ResumeExperience({ T, experience }: Props) {
  return (
    <section id="experience">
      <SectionTitle T={T}>Work Experience</SectionTitle>
      {experience.map(ex => (
        <div key={ex.company} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ marginBottom: 5, fontFamily: sans, fontSize: 14, fontWeight: 600, color: T.txt, transition: 'color .35s' }}>
              {ex.company}
            </div>
            <div style={{ fontFamily: mono, fontSize: 12, color: T.dim, letterSpacing: '0.04em', transition: 'color .35s' }}>
              {ex.role}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: T.gold, letterSpacing: '0.06em', marginBottom: 2, transition: 'color .35s' }}>
              {ex.period.replace('\n', ' ')}
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: T.dimLo, letterSpacing: '0.06em', transition: 'color .35s' }}>
              {ex.location}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

function SectionTitle({ children, T }: { children: string; T: ThemeTokens }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.55 }}>~</span><span>{children}</span><span style={{ opacity: 0.55 }}>~</span>
    </div>
  )
}
```

- [ ] **Step 7: Create `ResumeSkills.tsx`**

```tsx
// src/components/resume/ResumeSkills.tsx
import type { ThemeTokens } from './types'
import type { SkillItem } from '@/data/types'

const mono = "'DM Mono', monospace"

interface Props { T: ThemeTokens; skills: SkillItem[] }

export default function ResumeSkills({ T, skills }: Props) {
  const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <section id="skills">
      <SectionTitle T={T}>Stack I use</SectionTitle>
      <div style={{
        fontFamily: mono,
        background: T.bgTerm,
        border: `1px solid ${T.border}`,
        borderRadius: 8, padding: '22px 26px',
        transition: 'background .35s, border-color .35s',
      }}>
        <div style={{ fontSize: 12, color: T.gold, marginBottom: 18, letterSpacing: '0.06em', opacity: 0.75 }}>
          ~/nitish/skills
        </div>
        {skills.map(skill => (
          <div key={skill.name} style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap' }}>
            <span style={{ color: T.gold, fontSize: 12, opacity: 0.65 }}>$ </span>
            <span style={{ color: T.gold, fontSize: 12 }}>ls </span>
            <span style={{ color: T.dim, fontSize: 12 }}>{slug(skill.name)}/</span>
            <div style={{ width: '100%', height: 6 }} />
            <div style={{ paddingLeft: 20, display: 'flex', flexWrap: 'wrap', gap: '5px 18px' }}>
              {skill.tags.map(tag => (
                <span key={tag} style={{ fontSize: 13, fontWeight: 500, color: T.txt, letterSpacing: '0.01em', transition: 'color .35s' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ color: T.gold, fontSize: 12, opacity: 0.65 }}>$</span>
          <span style={{
            display: 'inline-block', width: 7, height: 14,
            background: T.gold, marginLeft: 4,
            animation: 'rp-blink 1s step-end infinite',
            verticalAlign: 'middle',
          }} />
        </div>
      </div>
    </section>
  )
}

function SectionTitle({ children, T }: { children: string; T: ThemeTokens }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.55 }}>~</span><span>{children}</span><span style={{ opacity: 0.55 }}>~</span>
    </div>
  )
}
```

- [ ] **Step 8: Create `ResumeProjects.tsx`**

```tsx
// src/components/resume/ResumeProjects.tsx
import type { ThemeTokens } from './types'
import type { ProjectItem } from '@/data/types'
import ResumeLink from './ResumeLink'

const mono = "'DM Mono', monospace"
const dirt = "'Rubik Dirt', sans-serif"
const sans = "'Syne', sans-serif"

interface Props { T: ThemeTokens; projects: ProjectItem[] }

export default function ResumeProjects({ T, projects }: Props) {
  return (
    <section id="projects">
      <SectionTitle T={T}>Things I&apos;ve built</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {projects.map((p, i) => (
          <div key={p.name} style={{
            paddingTop: i === 0 ? 0 : 28,
            paddingBottom: 28,
            borderBottom: i < projects.length - 1 ? `1px solid ${T.border}` : 'none',
            transition: 'border-color .35s',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: T.dimLo, letterSpacing: '0.10em', minWidth: 22 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 style={{ fontFamily: dirt, fontSize: 20, color: T.txt, letterSpacing: '-0.3px', lineHeight: 1, transition: 'color .35s' }}>
                {p.name}
              </h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
                {p.links.map(link => (
                  <ResumeLink key={link.label} href={link.href} style={{ fontSize: 11, letterSpacing: '0.06em' }} T={T}>
                    {link.label}
                  </ResumeLink>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, color: T.dim, lineHeight: 1.80, paddingLeft: 36, maxWidth: 560, fontFamily: sans, transition: 'color .35s' }}>
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ children, T }: { children: string; T: ThemeTokens }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.55 }}>~</span><span>{children}</span><span style={{ opacity: 0.55 }}>~</span>
    </div>
  )
}
```

- [ ] **Step 9: Create `ResumeContact.tsx`**

```tsx
// src/components/resume/ResumeContact.tsx
'use client'
import { useState } from 'react'
import type { ThemeTokens } from './types'
import type { ContactData } from '@/data/types'

const mono = "'DM Mono', monospace"
const sans = "'Syne', sans-serif"

interface Props { T: ThemeTokens; contact: ContactData }

export default function ResumeContact({ T, contact }: Props) {
  const [copied, setCopied] = useState(false)
  const [hov, setHov] = useState(false)

  const copyEmail = () => {
    navigator.clipboard?.writeText(contact.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <section id="contact">
      <SectionTitle T={T}>Get in touch</SectionTitle>
      <p style={{ fontSize: 14, color: T.dim, lineHeight: 1.82, marginBottom: 24, maxWidth: 500, fontFamily: sans, transition: 'color .35s' }}>
        Open to backend engineering and AI projects.
        Whether it&apos;s a full-time role, a contract, or just a conversation — reach out.
      </p>
      <div
        onClick={copyEmail}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          fontFamily: mono, fontSize: 13,
          background: hov ? T.bgTerm : 'transparent',
          border: `1px solid ${hov ? T.borderHv : T.border}`,
          borderRadius: 6, padding: '10px 16px',
          cursor: 'pointer', transition: 'all .2s',
          marginBottom: 24,
        }}
      >
        <span style={{ color: T.gold }}>
          {copied ? '✓ copied!' : contact.email}
        </span>
        {!copied && (
          <span style={{ color: T.dimLo, fontSize: 10, letterSpacing: '0.06em' }}>click to copy</span>
        )}
      </div>
    </section>
  )
}

function SectionTitle({ children, T }: { children: string; T: ThemeTokens }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.55 }}>~</span><span>{children}</span><span style={{ opacity: 0.55 }}>~</span>
    </div>
  )
}
```

- [ ] **Step 10: Create `ResumeFooter.tsx`**

```tsx
// src/components/resume/ResumeFooter.tsx
import type { ThemeTokens } from './types'
import type { FooterData } from '@/data/types'

const mono = "'DM Mono', monospace"

interface Props { T: ThemeTokens; footer: FooterData }

export default function ResumeFooter({ T, footer }: Props) {
  return (
    <footer style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: T.dimLo, letterSpacing: '0.06em' }}>
          {footer.copy}
        </span>
        <span style={{ fontFamily: mono, fontSize: 11, color: T.dimLo, letterSpacing: '0.06em' }}>
          <span style={{ color: T.gold }}>$</span> ./nk --version 2.0
        </span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 11: Commit all resume sub-components**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add \
  src/components/resume/types.ts \
  src/components/resume/ResumeLink.tsx \
  src/components/resume/ResumeNav.tsx \
  src/components/resume/ResumeHero.tsx \
  src/components/resume/ResumeSocial.tsx \
  src/components/resume/ResumeExperience.tsx \
  src/components/resume/ResumeSkills.tsx \
  src/components/resume/ResumeProjects.tsx \
  src/components/resume/ResumeContact.tsx \
  src/components/resume/ResumeFooter.tsx
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: resume sub-components — nav, hero, social, experience, skills, projects, contact, footer"
```

---

## Task 4: ResumePortfolio root component (TDD)

**Files:**
- Create: `src/components/resume/ResumePortfolio.tsx`
- Create: `src/__tests__/ResumePortfolio.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/__tests__/ResumePortfolio.test.tsx
import { render, screen } from '@testing-library/react'
import ResumePortfolio from '@/components/resume/ResumePortfolio'
import type { PortfolioData } from '@/data/types'

const mockData: PortfolioData = {
  meta: { title: 'Test', description: 'Test desc' },
  theme: { accentColor: '#f5c518' },
  stats: [],
  skills: [
    { icon: '⚡', name: 'AI & GenAI', kind: 'Agents', pct: 92, description: 'AI stuff', tags: ['LangGraph'] },
  ],
  projects: [
    { year: '2024', name: 'Vgents', description: 'Voice agents', tags: ['FastAPI'], links: [{ label: 'GitHub →', href: '#' }], visual: { glyph: '🎙️', stats: [] } },
  ],
  experience: [
    { period: 'Jan 2025 — Present', role: 'Python Developer', company: 'Excellence Technologies', location: 'Gurugram, IN', description: 'Built things' },
  ],
  contact: {
    heading: 'Get in touch',
    email: 'test@test.com',
    socials: [{ label: 'GitHub', icon: '⌥', href: 'https://github.com/test' }],
  },
  footer: { copy: '© 2026', signature: 'crafted' },
  terminal: { intro: [], commands: { about: [], skills: [], projects: [], experience: [], contact: [] } },
  glimpse: {
    reads: { title: 'Atomic Habits', author: 'James Clear', quote: 'Tiny changes' },
    hobbies: [],
    location: { city: 'Noida', country: 'India', pin: 'NOIDA', availability: 'Remote' },
    quote: { text: 'Make it work', author: 'Kent Beck' },
  },
} as unknown as PortfolioData

describe('ResumePortfolio', () => {
  it('renders name in hero', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('Nitish Kushwaha')).toBeInTheDocument()
  })

  it('renders company name in experience', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('Excellence Technologies')).toBeInTheDocument()
  })

  it('renders project name', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('Vgents')).toBeInTheDocument()
  })

  it('renders List/Grid toggle', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('Light')).toBeInTheDocument()
  })

  it('renders contact email', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('test@test.com')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPatterns="ResumePortfolio" --silent 2>&1 | tail -5
```

Expected: FAIL — `Cannot find module '@/components/resume/ResumePortfolio'`

- [ ] **Step 3: Create `ResumePortfolio.tsx`**

```tsx
// src/components/resume/ResumePortfolio.tsx
'use client'
import { useTheme, ThemeProvider } from './ThemeContext'
import type { ThemeTokens } from './types'
import type { PortfolioData } from '@/data/types'
import ResumeNav from './ResumeNav'
import ResumeHero from './ResumeHero'
import ResumeSocial from './ResumeSocial'
import ResumeExperience from './ResumeExperience'
import ResumeSkills from './ResumeSkills'
import ResumeProjects from './ResumeProjects'
import ResumeContact from './ResumeContact'
import ResumeFooter from './ResumeFooter'

const DARK: ThemeTokens = {
  bg: '#070600', bgTerm: 'rgba(245,197,24,0.04)', nav: 'rgba(7,6,0,0.92)',
  txt: '#f5eddb', dim: 'rgba(245,237,219,0.54)', dimLo: 'rgba(245,237,219,0.30)',
  gold: '#f5c518', goldDk: '#c49a00', goldLt: '#ffd84d',
  border: 'rgba(245,197,24,0.16)', borderHv: 'rgba(245,197,24,0.44)',
  dotPattern: 'none', scrollThumb: '#c49a00',
}

const LIGHT: ThemeTokens = {
  bg: '#c8980a', bgTerm: 'rgba(0,0,0,0.10)', nav: 'rgba(186,138,0,0.95)',
  txt: '#0a0800', dim: 'rgba(10,8,0,0.68)', dimLo: 'rgba(10,8,0,0.42)',
  gold: '#0f0c00', goldDk: 'rgba(10,8,0,0.55)', goldLt: '#1a1600',
  border: 'rgba(0,0,0,0.18)', borderHv: 'rgba(0,0,0,0.42)',
  dotPattern: `radial-gradient(circle, rgba(0,0,0,0.22) 1.5px, transparent 1.5px)`,
  dotSize: '18px 18px', scrollThumb: 'rgba(0,0,0,0.40)',
}

function Divider({ T }: { T: ThemeTokens }) {
  return <div style={{ height: 1, background: T.border, margin: '48px 0', transition: 'background .35s' }} />
}

const col: React.CSSProperties = { maxWidth: 680, margin: '0 auto', padding: '0 28px' }

function ResumeInner({ data }: { data: PortfolioData }) {
  const { theme } = useTheme()
  const T = theme === 'dark' ? DARK : LIGHT

  return (
    <>
      <style>{`
        @keyframes rp-pulse { 0%,100%{opacity:1;box-shadow:0 0 8px #4ade80}50%{opacity:.35;box-shadow:0 0 3px #4ade80} }
        @keyframes rp-blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes rp-fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }
        .resume-root ::-webkit-scrollbar{width:4px}
        .resume-root ::-webkit-scrollbar-track{background:${T.bg}}
        .resume-root ::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:4px}
        ::selection{background:${theme==='dark'?'rgba(245,197,24,0.25)':'rgba(0,0,0,0.28)'};color:${T.txt}}
      `}</style>

      <div
        className="resume-root"
        style={{
          paddingTop: 90, paddingBottom: 100,
          background: T.bg,
          backgroundImage: T.dotPattern,
          backgroundSize: T.dotSize ?? 'auto',
          minHeight: '100vh',
          transition: 'background .35s, color .35s',
          animation: 'rp-fadeIn .4s ease both',
        }}
      >
        <ResumeNav T={T} />
        <div style={col}>
          <ResumeHero
            T={T}
            name="Nitish Kushwaha"
            role="Backend Engineer"
            location="Delhi, India"
            bio={[
              "Python developer with 3+ years building scalable APIs, AI agents, and real-time voice systems. Currently at Excellence Technologies — shipping LangGraph pipelines, LiveKit voice agents, and multi-cloud deployments.",
              "Proficient in Django, FastAPI, LangGraph, LangChain. Hands-on with AI workflows: RAG, multi-agent systems, document extraction pipelines. Voice infra via LiveKit and Twilio SIP.",
            ]}
            tldr="I build until it works. Backend engineering and AI isn't just a career — it's the thing I genuinely can't stop improving."
          />
          <Divider T={T} />
          <ResumeSocial T={T} socials={data.contact.socials} email={data.contact.email} />
          <Divider T={T} />
          <ResumeExperience T={T} experience={data.experience} />
          <Divider T={T} />
          <ResumeSkills T={T} skills={data.skills} />
          <Divider T={T} />
          <ResumeProjects T={T} projects={data.projects} />
          <Divider T={T} />
          <ResumeContact T={T} contact={data.contact} />
          <Divider T={T} />
          <ResumeFooter T={T} footer={data.footer} />
        </div>
      </div>
    </>
  )
}

export default function ResumePortfolio({ data }: { data: PortfolioData }) {
  return (
    <ThemeProvider>
      <ResumeInner data={data} />
    </ThemeProvider>
  )
}
```

- [ ] **Step 4: Run ResumePortfolio tests — confirm they pass**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPatterns="ResumePortfolio" --silent 2>&1 | tail -5
```

Expected: `Tests: 5 passed, 5 total`

- [ ] **Step 5: Run full test suite**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --silent 2>&1 | tail -5
```

Expected: `Tests: 53 passed, 53 total` (43 existing + 5 ThemeContext + 5 ResumePortfolio)

- [ ] **Step 6: Commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add \
  src/__tests__/ResumePortfolio.test.tsx \
  src/components/resume/ResumePortfolio.tsx
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: ResumePortfolio — root resume component with dark/light theme"
```

---

## Task 5: FullExperienceShell

**Files:**
- Create: `src/components/full/FullExperienceShell.tsx`

Move all heavy effects from `layout.tsx` and all section composition from `page.tsx` into this one Client Component wrapper.

- [ ] **Step 1: Create `src/components/full/FullExperienceShell.tsx`**

```tsx
// src/components/full/FullExperienceShell.tsx
import Nav               from '@/components/nav/Nav'
import Hero              from '@/components/hero/Hero'
import Ribbon            from '@/components/ribbon/Ribbon'
import SectionDivider    from '@/components/ui/SectionDivider'
import StatsStrip        from '@/components/stats/StatsStrip'
import SkillsFinder      from '@/components/skills/SkillsFinder'
import ProjectsSection   from '@/components/projects/ProjectsSection'
import GlimpseSection    from '@/components/glimpse/GlimpseSection'
import ExperienceSection from '@/components/experience/ExperienceSection'
import ContactSection    from '@/components/contact/ContactSection'
import Footer            from '@/components/footer/Footer'
import CustomCursor      from '@/components/ui/CustomCursor'
import RevealInit        from '@/components/ui/RevealInit'
import AuroraBackground  from '@/components/ui/AuroraBackground'
import Particles         from '@/components/ui/Particles'
import FramerProvider    from '@/components/ui/FramerProvider'
import { TerminalProvider } from '@/context/TerminalContext'
import TerminalFloating  from '@/components/terminal/TerminalFloating'
import TerminalMaximized from '@/components/terminal/TerminalMaximized'
import type { PortfolioData } from '@/data/types'

interface Props { data: PortfolioData }

export default function FullExperienceShell({ data }: Props) {
  return (
    <FramerProvider>
      <TerminalProvider>
        <CustomCursor />
        <RevealInit />
        <AuroraBackground />
        <Particles />

        {/* Ambient radial gradient */}
        <div
          className="fixed inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 15% 20%, rgba(212,160,23,0.09) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 85% 70%, rgba(232,200,74,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 80% 60% at 50% 50%, rgba(10,9,0,0.95) 0%, transparent 100%)
            `,
          }}
        />
        {/* Fractal noise texture */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Grid lines */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(232,200,74,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(232,200,74,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-[2]">
          <Nav data={data} />
          <main>
            <Hero             data={data} />
            <Ribbon />
            <SectionDivider />
            <StatsStrip       stats={data.stats} />
            <SkillsFinder     skills={data.skills} />
            <SectionDivider />
            <ProjectsSection  projects={data.projects} />
            <SectionDivider />
            <GlimpseSection   glimpse={data.glimpse} />
            <SectionDivider />
            <ExperienceSection experience={data.experience} />
            <SectionDivider />
            <ContactSection   contact={data.contact} />
            <Footer           footer={data.footer} />
          </main>
        </div>

        <TerminalFloating />
        <TerminalMaximized />
      </TerminalProvider>
    </FramerProvider>
  )
}
```

- [ ] **Step 2: Run full test suite to verify no regressions**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --silent 2>&1 | tail -5
```

Expected: `Tests: 53 passed, 53 total`

- [ ] **Step 3: Commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add src/components/full/FullExperienceShell.tsx
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: FullExperienceShell — wraps all heavy effects + full experience sections"
```

---

## Task 6: DeaxButton (TDD)

**Files:**
- Create: `src/components/deax/DeaxButton.tsx`
- Create: `src/__tests__/DeaxButton.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/__tests__/DeaxButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import DeaxButton from '@/components/deax/DeaxButton'

describe('DeaxButton', () => {
  it('renders the Deax label', () => {
    render(<DeaxButton />)
    expect(screen.getByText(/deax/i)).toBeInTheDocument()
  })

  it('menu is hidden initially', () => {
    render(<DeaxButton />)
    expect(screen.queryByText(/Explore full portfolio/i)).not.toBeInTheDocument()
  })

  it('shows menu on click', () => {
    render(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Explore full portfolio/i)).toBeInTheDocument()
  })

  it('shows soon badge on Talk to Deax option', () => {
    render(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Talk to Deax/i)).toBeInTheDocument()
    expect(screen.getByText(/soon/i)).toBeInTheDocument()
  })

  it('closes menu on second click', () => {
    render(<DeaxButton />)
    const btn = screen.getByRole('button', { name: /deax/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText(/Explore full portfolio/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPatterns="DeaxButton" --silent 2>&1 | tail -5
```

Expected: FAIL — `Cannot find module '@/components/deax/DeaxButton'`

- [ ] **Step 3: Create `DeaxButton.tsx`**

```tsx
// src/components/deax/DeaxButton.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const mono = "'DM Mono', monospace"

export default function DeaxButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const mode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('mode') ?? 'resume'
    : 'resume'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}
    >
      {/* Menu */}
      {open && (
        <div style={{
          background: 'rgba(7,6,0,0.96)',
          border: '1px solid rgba(245,197,24,0.22)',
          borderRadius: 10,
          padding: '6px 0',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          minWidth: 220,
        }}>
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(mode === 'resume' ? '/?mode=full' : '/?mode=resume') }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '10px 16px',
              fontFamily: mono, fontSize: 12, color: '#f5eddb',
              background: 'none', border: 'none', cursor: 'pointer',
              letterSpacing: '0.04em', transition: 'background .15s',
            }}
            onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(245,197,24,0.07)' }}
            onMouseLeave={e => { (e.currentTarget).style.background = 'none' }}
          >
            {mode === 'resume' ? 'Explore full portfolio' : 'Resume mode'}
            <span style={{ color: '#f5c518', fontSize: 14 }}>→</span>
          </button>

          <div style={{ height: 1, background: 'rgba(245,197,24,0.10)', margin: '4px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', opacity: 0.45 }}>
            <span style={{ fontFamily: mono, fontSize: 12, color: '#f5eddb', letterSpacing: '0.04em' }}>
              Talk to Deax
            </span>
            <span style={{
              fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#f5c518', background: 'rgba(245,197,24,0.12)',
              border: '1px solid rgba(245,197,24,0.25)',
              borderRadius: 3, padding: '2px 6px',
            }}>soon</span>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        aria-label="Deax menu"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: mono, fontSize: 12, letterSpacing: '0.08em',
          color: '#f5c518',
          background: 'rgba(7,6,0,0.90)',
          border: '1px solid rgba(245,197,24,0.30)',
          borderRadius: 20, padding: '9px 18px',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 24px rgba(245,197,24,0.12)',
          transition: 'border-color .2s, box-shadow .2s',
        }}
        onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(245,197,24,0.55)'; b.style.boxShadow = '0 0 32px rgba(245,197,24,0.22)' }}
        onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(245,197,24,0.30)'; b.style.boxShadow = '0 0 24px rgba(245,197,24,0.12)' }}
      >
        Deax
        <span style={{ animation: 'deax-bounce 1.4s ease-in-out infinite', display: 'inline-block' }}>•</span>
      </button>

      <style>{`
        @keyframes deax-bounce {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-4px)}
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 4: Run DeaxButton tests — confirm they pass**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPatterns="DeaxButton" --silent 2>&1 | tail -5
```

Expected: `Tests: 5 passed, 5 total`

- [ ] **Step 5: Commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add \
  src/__tests__/DeaxButton.test.tsx \
  src/components/deax/DeaxButton.tsx
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: DeaxButton — persistent mode-switch + Deax AI placeholder"
```

---

## Task 7: Routing — proxy.ts + layout.tsx + page.tsx

**Files:**
- Create: `src/proxy.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create `src/proxy.ts`**

Note: In Next.js 16 this file replaces `middleware.ts`. The function export is named `proxy`.

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

- [ ] **Step 2: Modify `src/app/layout.tsx` — strip to minimum**

Read the current file first to confirm exact content, then replace with:

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import {
  Rubik_Dirt,
  DM_Mono,
  Syne,
  Cormorant_Garamond,
} from 'next/font/google'
import './globals.css'
import DeaxButton from '@/components/deax/DeaxButton'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

const rubikDirt = Rubik_Dirt({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jetbrains-mono',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`:root { --accent: ${data.theme.accentColor}; }`}</style>
      </head>
      <body className={`${rubikDirt.variable} ${dmMono.variable} ${syne.variable} ${cormorant.variable}`}>
        {children}
        <DeaxButton />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Modify `src/app/page.tsx`**

```tsx
// src/app/page.tsx
import ResumePortfolio    from '@/components/resume/ResumePortfolio'
import FullExperienceShell from '@/components/full/FullExperienceShell'
import portfolioData      from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  if (mode === 'full') return <FullExperienceShell data={data} />
  return <ResumePortfolio data={data} />
}
```

- [ ] **Step 4: Run full test suite**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --silent 2>&1 | tail -5
```

Expected: `Tests: 58 passed, 58 total`

- [ ] **Step 5: Run build to check for type errors**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build 2>&1 | tail -15
```

Expected: Build completes with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add \
  src/proxy.ts \
  src/app/layout.tsx \
  src/app/page.tsx
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: routing — proxy.ts redirect, layout.tsx stripped, page.tsx conditional render"
```

---

## Task 8: Resume CSS in globals.css

**Files:**
- Modify: `src/app/globals.css`

The resume mode uses inline styles for theme tokens, so globals.css only needs:
1. Ensure `@import` for DM Mono and Syne is available (they're loaded via next/font, so no import needed)
2. No additional rules needed — the `<style>` tag inside `ResumePortfolio.tsx` handles keyframes and scrollbars scoped to `.resume-root`

This task verifies nothing was broken in globals.css and the full experience still works.

- [ ] **Step 1: Verify full experience styles still intact**

Start dev server and navigate to `/?mode=full`:

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run dev
```

Open `http://localhost:3000/?mode=full` — verify:
- Aurora orbs visible
- Gold particles floating
- Terminal in hero
- SkillsFinder renders (List/Grid toggle works)
- All sections render correctly

- [ ] **Step 2: Verify resume mode**

Open `http://localhost:3000/` — should redirect to `http://localhost:3000/?mode=resume`.

Verify:
- Dark theme: near-black bg, gold accents
- Name "Nitish Kushwaha" in Rubik Dirt
- Theme toggle switches to light (amber bg, dark text)
- All 7 sections render: Social, Experience, Skills, Projects, Contact
- DeaxButton visible bottom-right, menu opens on click
- "Explore full portfolio" navigates to `/?mode=full`

- [ ] **Step 3: Run final test suite**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --silent 2>&1 | tail -5
```

Expected: `Tests: 58 passed, 58 total`

- [ ] **Step 4: Run production build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build 2>&1 | tail -10
```

Expected: Build completes cleanly.

- [ ] **Step 5: Final commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add -p
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: resume mode complete — /?mode=resume default, /?mode=full full experience, DeaxButton"
```
