# Resume Mode Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Resume Mode with a fresh, single-page dark/gold terminal-themed redesign matching the Penpot mockup, built as new components rather than adapted from the existing ones.

**Architecture:** Every file under `src/components/resume/` is written new (old files with no role are deleted, not left as dead code). `page.tsx` gains a server-side GitHub contribution fetch (with a deterministic fallback) and passes the result as a prop into the new `ResumePortfolio`. No new routes; `/` and `/?mode=full` routing is untouched.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript strict, Jest + React Testing Library, `next/font/google` (Inter, IBM Plex Mono — additive, existing fonts stay loaded for other pages).

**Spec:** `docs/superpowers/specs/2026-09-05-resume-redesign-design.md`

## Global Constraints

- **Fresh rebuild, not a restyle.** Do not adapt or partially reuse old JSX from the current Resume components. Files with no role in the new design are deleted outright.
- **No theme toggle / light mode** on this page. One fixed dark palette.
- **Fonts:** `Inter` (UI) + `IBM Plex Mono` (terminal/mono) for all new Resume components, added to `app/layout.tsx` as new, additive `next/font/google` imports. Existing fonts (`Rubik_Dirt`, `DM_Mono`, `Syne`, `Cormorant_Garamond`) MUST stay loaded — they are used elsewhere (`DeaxButton.tsx` uses DM Mono; `globals.css` uses the `--font-dm-serif` (Rubik_Dirt) and `--font-instrument-sans` (Syne) variables extensively for Full Experience mode).
- **`GITHUB_TOKEN`** is a server-only env var. Never prefix it `NEXT_PUBLIC_*`, never pass it to a client component.
- **Array order is the priority signal.** `data.projects.slice(0, 4)` selects the featured set — no new selection field in the data model.
- **Untouched by this plan:** Full Experience mode (`FullExperienceShell`, `components/hero/Hero.tsx`, `globals.css`), NK-OS, NK-M, open-mic, `DeaxButton`, `ChatWidget`, `hero.ctaPrimary`/`ctaSecondary` (used by Full mode's Hero — do not repurpose their copy).
- Full `npm test` suite must stay green after every task.

---

### Task 1: Data model — new fields + branch setup

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/data/portfolio.json`
- Modify: `src/.env.example`
- Modify: `src/__tests__/types.test.ts`

**Interfaces:**
- Produces: `HeroData.tldr: string`, `HeroData.photoSrc: string | null`, `PortfolioData.stackPills: string[]` — consumed by Task 5 (`ResumeHero`), Task 8 (`ResumeStackPills`), and Task 13 (`ResumePortfolio`).

- [ ] **Step 1: Create the feature branch**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git checkout main
git pull --ff-only
git checkout -b v9-resume-redesign
```

- [ ] **Step 2: Write the failing test**

Add to `src/__tests__/types.test.ts` (append inside the existing `describe` block, after the last `it`):

```ts
  it('hero has tldr, photoSrc, and top-level stackPills', () => {
    const data: PortfolioData = rawData as PortfolioData
    expect(data.hero.tldr).toBeTruthy()
    expect(data.hero.photoSrc === null || typeof data.hero.photoSrc === 'string').toBe(true)
    expect(Array.isArray(data.stackPills)).toBe(true)
    expect(data.stackPills.length).toBeGreaterThan(0)
  })
```

- [ ] **Step 2b: Run test to verify it fails**

Run: `cd src && npx jest types.test.ts`
Expected: FAIL — `data.hero.tldr` is `undefined`, `data.stackPills` is `undefined`.

- [ ] **Step 3: Update `src/data/types.ts`**

Change the `HeroData` interface to:

```ts
export interface HeroData {
  name: string
  badge: string
  titleLines: [string, string, string]
  titleAccentLine: number
  subtitle: string
  tldr: string
  photoSrc: string | null
  ctaPrimary: HeroLink
  ctaSecondary: HeroLink
}
```

Change the `PortfolioData` interface to:

```ts
export interface PortfolioData {
  meta: PortfolioMeta
  theme: PortfolioTheme
  hero: HeroData
  stats: StatItem[]
  skills: SkillItem[]
  projects: ProjectItem[]
  experience: ExperienceItem[]
  contact: ContactData
  footer: FooterData
  terminal: TerminalData
  glimpse: GlimpseData
  stackPills: string[]
}
```

- [ ] **Step 4: Update `src/data/portfolio.json`**

In the `"hero"` object, add two fields (after `"subtitle"`, before `"ctaPrimary"`):

```json
    "subtitle": "Python Backend Developer with 3+ years building production AI systems — multi-tenant voice agents, LangGraph pipelines, and real-time applications deployed across AWS, Azure, and GCP.",
    "tldr": "I build until it works. Backend engineering and AI isn't just a career — it's the thing I genuinely can't stop improving.",
    "photoSrc": null,
    "ctaPrimary": { "label": "View Projects →", "href": "#projects" },
```

At the top level, add a new `"stackPills"` array (after the closing `]` of `"skills"`, before `"projects"`):

```json
  "stackPills": ["Python", "FastAPI", "LangGraph", "LiveKit", "PostgreSQL", "Redis", "AWS", "OpenAI", "Docker", "Git"],
```

- [ ] **Step 5: Update `src/.env.example`**

Append:

```
# GitHub token for real contribution-heatmap data on the redesigned Resume page
# (classic PAT, "read:user" scope). Leave empty in local dev to fall back to a
# decorative random pattern instead of your real GitHub graph. Server-only — never
# expose this as NEXT_PUBLIC_*.
GITHUB_TOKEN=
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd src && npx jest types.test.ts`
Expected: PASS

- [ ] **Step 7: Run full suite and validate JSON**

```bash
cd src
python3 -c "import json; json.load(open('data/portfolio.json')); print('VALID')"
npm test -- --silent
npx tsc --noEmit
```

Expected: JSON valid, all tests pass, no type errors.

- [ ] **Step 8: Commit**

```bash
git add src/data/types.ts src/data/portfolio.json src/.env.example src/__tests__/types.test.ts
git commit -m "feat: resume redesign — add hero.tldr, hero.photoSrc, stackPills to data model"
```

---

### Task 2: `lib/github.ts` — real GitHub heatmap with fallback

**Files:**
- Create: `src/lib/github.ts`
- Test: `src/__tests__/github.test.ts`

**Interfaces:**
- Consumes: `generateHeatmapCells(count: number): number[]` from `src/lib/heatmap.ts` (existing).
- Produces: `getHeatmapCells(githubUrl: string): Promise<number[]>` (always resolves, length 364, values 0–4) — consumed by Task 14 (`page.tsx`). Also exports `extractGithubUsername` and `levelsFromCounts` for direct unit testing.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/github.test.ts`:

```ts
import { extractGithubUsername, levelsFromCounts, getHeatmapCells } from '@/lib/github'

describe('extractGithubUsername', () => {
  it('extracts the username from a github.com URL', () => {
    expect(extractGithubUsername('https://github.com/deaxparadox')).toBe('deaxparadox')
  })

  it('throws on a non-github URL', () => {
    expect(() => extractGithubUsername('https://example.com/deaxparadox')).toThrow()
  })
})

describe('levelsFromCounts', () => {
  it('maps zero counts to level 0', () => {
    expect(levelsFromCounts([0, 0, 0])).toEqual([0, 0, 0])
  })

  it('maps the max count to level 4', () => {
    expect(levelsFromCounts([0, 10])[1]).toBe(4)
  })

  it('returns all zeros when every count is zero', () => {
    expect(levelsFromCounts([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
  })

  it('produces only values in range 0-4', () => {
    const levels = levelsFromCounts([0, 1, 2, 3, 5, 8, 13, 21])
    levels.forEach(l => {
      expect(l).toBeGreaterThanOrEqual(0)
      expect(l).toBeLessThanOrEqual(4)
    })
  })
})

describe('getHeatmapCells', () => {
  const originalToken = process.env.GITHUB_TOKEN
  const originalFetch = global.fetch

  afterEach(() => {
    process.env.GITHUB_TOKEN = originalToken
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('falls back to a generated pattern when GITHUB_TOKEN is unset', async () => {
    delete process.env.GITHUB_TOKEN
    const cells = await getHeatmapCells('https://github.com/deaxparadox')
    expect(cells).toHaveLength(364)
    cells.forEach(c => expect(c).toBeGreaterThanOrEqual(0))
  })

  it('falls back when the fetch call fails', async () => {
    process.env.GITHUB_TOKEN = 'fake-token'
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'))
    const cells = await getHeatmapCells('https://github.com/deaxparadox')
    expect(cells).toHaveLength(364)
  })

  it('returns real levels parsed from a successful GraphQL response', async () => {
    process.env.GITHUB_TOKEN = 'fake-token'
    const weeks = Array.from({ length: 52 }, () => ({
      contributionDays: Array.from({ length: 7 }, () => ({ contributionCount: 0 })),
    }))
    weeks[0].contributionDays[0].contributionCount = 10
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { user: { contributionsCollection: { contributionCalendar: { weeks } } } },
      }),
    }) as unknown as typeof fetch

    const cells = await getHeatmapCells('https://github.com/deaxparadox')
    expect(cells).toHaveLength(364)
    expect(cells[0]).toBe(4)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd src && npx jest github.test.ts`
Expected: FAIL — `Cannot find module '@/lib/github'`

- [ ] **Step 3: Write the implementation**

Create `src/lib/github.ts`:

```ts
// src/lib/github.ts
import { generateHeatmapCells } from './heatmap'

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'
const CELL_COUNT = 364 // 52 weeks x 7 days — matches the fixed 52-column heatmap grid

interface ContributionDay { contributionCount: number }
interface ContributionWeek { contributionDays: ContributionDay[] }
interface GithubGraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks: ContributionWeek[]
        }
      }
    }
  }
}

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
            }
          }
        }
      }
    }
  }
`

export function extractGithubUsername(githubUrl: string): string {
  const match = githubUrl.match(/github\.com\/([^/]+)/)
  if (!match) throw new Error(`Could not extract GitHub username from "${githubUrl}"`)
  return match[1]
}

export function levelsFromCounts(counts: number[]): number[] {
  const max = Math.max(...counts, 0)
  if (max === 0) return counts.map(() => 0)
  return counts.map(count => {
    if (count === 0) return 0
    const ratio = count / max
    if (ratio <= 0.25) return 1
    if (ratio <= 0.5) return 2
    if (ratio <= 0.75) return 3
    return 4
  })
}

async function fetchGithubContributionLevels(username: string, token: string): Promise<number[]> {
  const res = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({ query: QUERY, variables: { login: username } }),
    next: { revalidate: 21600 }, // 6 hours — contribution data doesn't need to be real-time
  })

  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`)

  const json: GithubGraphQLResponse = await res.json()
  const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks
  if (!weeks) throw new Error('Malformed GitHub contribution response')

  // ponytail: last CELL_COUNT days keeps the grid a fixed 52 columns regardless
  // of whether GitHub returns 52 or 53 weeks for the requested year window.
  const counts = weeks.flatMap(week => week.contributionDays.map(day => day.contributionCount)).slice(-CELL_COUNT)
  return levelsFromCounts(counts)
}

export async function getHeatmapCells(githubUrl: string): Promise<number[]> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return generateHeatmapCells(CELL_COUNT)

  try {
    const username = extractGithubUsername(githubUrl)
    return await fetchGithubContributionLevels(username, token)
  } catch {
    // ponytail: silent fallback to a decorative pattern — real prod deploys always
    // have GITHUB_TOKEN set, so this only fires on a genuine outage or rate limit.
    return generateHeatmapCells(CELL_COUNT)
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd src && npx jest github.test.ts`
Expected: PASS (all 8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/github.ts src/__tests__/github.test.ts
git commit -m "feat: resume redesign — GitHub contribution heatmap fetch with fallback"
```

---

### Task 3: Shared tokens + `ResumeLink` + font loading

**Files:**
- Create: `src/components/resume/tokens.ts`
- Create (fresh): `src/components/resume/ResumeLink.tsx`
- Modify: `src/app/layout.tsx`
- Delete: `src/components/resume/types.ts` (the old `ThemeTokens` interface)
- Test: `src/__tests__/ResumeLink.test.tsx`

**Interfaces:**
- Produces: `T` (palette object), `mono`, `sans` (font-family strings) from `tokens.ts` — consumed by every component task from here on (4–13). `ResumeLink` component `{ href, children, style? }` — consumed by Task 10 (`ResumeProjects`) and Task 11 (`ResumeContact`).

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeLink.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeLink from '@/components/resume/ResumeLink'

describe('ResumeLink', () => {
  it('renders children and href', () => {
    render(<ResumeLink href="https://example.com">Example</ResumeLink>)
    const link = screen.getByText('Example')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('opens external http links in a new tab', () => {
    render(<ResumeLink href="https://example.com">Example</ResumeLink>)
    expect(screen.getByText('Example')).toHaveAttribute('target', '_blank')
  })

  it('does not set target for internal anchors', () => {
    render(<ResumeLink href="#contact">Contact</ResumeLink>)
    expect(screen.getByText('Contact')).not.toHaveAttribute('target')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd src && npx jest ResumeLink.test.tsx`
Expected: FAIL — `Cannot find module '@/components/resume/ResumeLink'` (old one still exists but imports `./types` which we're about to delete — write the new one first).

- [ ] **Step 3: Create `src/components/resume/tokens.ts`**

```ts
// src/components/resume/tokens.ts
export const mono = "'IBM Plex Mono', monospace"
export const sans = "'Inter', sans-serif"

export const T = {
  bg: '#0a0a0a',
  bgCard: '#111111',
  bgNav: 'rgba(20,20,20,0.90)',
  bgTerm: 'rgba(255,197,61,0.05)',
  txt: '#f5f5f0',
  dim: 'rgba(245,245,240,0.58)',
  dimLo: 'rgba(245,245,240,0.34)',
  border: 'rgba(255,197,61,0.14)',
  borderHv: 'rgba(255,197,61,0.40)',
  gold: '#ffc53d',
  goldDk: '#b8901e',
  goldLt: '#ffd873',
  green: '#4ade80',
  heatLevels: ['#211b0a', '#5c4a17', '#715006', '#b8901e', '#ffc53d'],
} as const
```

- [ ] **Step 4: Rewrite `src/components/resume/ResumeLink.tsx`**

```tsx
// src/components/resume/ResumeLink.tsx
'use client'
import { useState } from 'react'
import { T, mono } from './tokens'

interface Props {
  href: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function ResumeLink({ href, children, style = {} }: Props) {
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

- [ ] **Step 5: Delete `src/components/resume/types.ts`**

```bash
git rm src/components/resume/types.ts
```

(It's fine that other resume files still importing `./types` are now broken — they get rewritten in later tasks. Do not run the full suite yet; run only the target test this task cares about.)

- [ ] **Step 6: Add Inter + IBM Plex Mono to `src/app/layout.tsx`**

Change the font import block to:

```tsx
import {
  Rubik_Dirt,
  DM_Mono,
  Syne,
  Cormorant_Garamond,
  Inter,
  IBM_Plex_Mono,
} from 'next/font/google'
```

Add after the existing `cormorant` declaration:

```tsx
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-resume-sans',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-resume-mono',
})
```

Update the `<body>` className to include both new variables:

```tsx
<body className={`${rubikDirt.variable} ${dmMono.variable} ${syne.variable} ${cormorant.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
```

- [ ] **Step 7: Run the target test to verify it passes**

Run: `cd src && npx jest ResumeLink.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 8: Commit**

```bash
git add src/components/resume/tokens.ts src/components/resume/ResumeLink.tsx src/app/layout.tsx
git rm src/components/resume/types.ts
git commit -m "feat: resume redesign — shared tokens, fresh ResumeLink, add Inter + IBM Plex Mono fonts"
```

---

### Task 4: `ResumeNav`

**Files:**
- Create (fresh): `src/components/resume/ResumeNav.tsx`
- Test: `src/__tests__/ResumeNav.test.tsx`

**Interfaces:**
- Consumes: `T`, `mono` from `./tokens`.
- Produces: `ResumeNav({ name: string })` — consumed by Task 13 (`ResumePortfolio`).

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeNav.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeNav from '@/components/resume/ResumeNav'

describe('ResumeNav', () => {
  it('renders initials from the name', () => {
    render(<ResumeNav name="Nitish Kushwaha" />)
    expect(screen.getByText('NK')).toBeInTheDocument()
  })

  it('renders all four nav links with anchor hrefs', () => {
    render(<ResumeNav name="Nitish Kushwaha" />)
    expect(screen.getByText('projects')).toHaveAttribute('href', '#projects')
    expect(screen.getByText('skills')).toHaveAttribute('href', '#skills')
    expect(screen.getByText('experience')).toHaveAttribute('href', '#experience')
    expect(screen.getByText('contact')).toHaveAttribute('href', '#contact')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd src && npx jest ResumeNav.test.tsx`
Expected: FAIL — old `ResumeNav` requires a `T` prop and imports the now-deleted `./types`, or the component doesn't render "NK" at all yet.

- [ ] **Step 3: Rewrite `src/components/resume/ResumeNav.tsx`**

```tsx
// src/components/resume/ResumeNav.tsx
'use client'
import { useState } from 'react'
import { T, mono } from './tokens'

const NAV_LINKS = ['projects', 'skills', 'experience', 'contact'] as const
const QR_PATTERN = [1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1]

function initialsOf(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

interface Props { name: string }

export default function ResumeNav({ name }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: T.bgNav,
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      borderBottom: `1px solid ${T.border}`,
      padding: '14px 0',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          border: `1px solid ${T.gold}`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: mono, fontSize: 12, fontWeight: 600, color: T.gold,
        }}>{initialsOf(name)}</div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {NAV_LINKS.map(id => (
            <a key={id} href={`#${id}`}
              onMouseEnter={() => setHoverId(id)}
              onMouseLeave={() => setHoverId(null)}
              style={{
                fontFamily: mono, fontSize: 12, letterSpacing: '0.06em',
                color: hoverId === id ? T.gold : T.dim, textDecoration: 'none',
                transition: 'color .18s',
              }}
            >{id}</a>
          ))}
          <div style={{
            width: 30, height: 30, border: `1px solid ${T.border}`, borderRadius: 4,
            display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 1, padding: 4,
          }} aria-hidden="true">
            {QR_PATTERN.map((on, i) => (
              <div key={i} style={{ background: on ? T.gold : 'transparent' }} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd src && npx jest ResumeNav.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/resume/ResumeNav.tsx src/__tests__/ResumeNav.test.tsx
git commit -m "feat: resume redesign — fresh ResumeNav"
```

---

### Task 5: `ResumeHero`

**Files:**
- Create (fresh): `src/components/resume/ResumeHero.tsx`
- Test: `src/__tests__/ResumeHero.test.tsx`

**Interfaces:**
- Consumes: `T`, `mono`, `sans` from `./tokens`.
- Produces: `ResumeHero({ name, role, location, badge, bio, tldr, photoSrc, email })` (all `string` except `photoSrc: string | null`) — consumed by Task 13.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeHero.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeHero from '@/components/resume/ResumeHero'

const baseProps = {
  name: 'Nitish Kushwaha',
  role: 'Backend Engineer',
  location: 'Delhi, India',
  badge: 'Available for work',
  bio: 'Builds production AI systems.',
  tldr: 'I build until it works.',
  email: 'test@test.com',
}

describe('ResumeHero', () => {
  it('renders name, role, location, bio, and tldr', () => {
    render(<ResumeHero {...baseProps} photoSrc={null} />)
    expect(screen.getByText('Nitish Kushwaha')).toBeInTheDocument()
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument()
    expect(screen.getByText('Delhi, India')).toBeInTheDocument()
    expect(screen.getByText('Builds production AI systems.')).toBeInTheDocument()
    expect(screen.getByText(/I build until it works\./)).toBeInTheDocument()
  })

  it('renders the Email Me CTA with a mailto href', () => {
    render(<ResumeHero {...baseProps} photoSrc={null} />)
    expect(screen.getByText('Email Me →')).toHaveAttribute('href', 'mailto:test@test.com')
  })

  it('renders the View Work CTA pointing at #projects', () => {
    render(<ResumeHero {...baseProps} photoSrc={null} />)
    expect(screen.getByText('View Work')).toHaveAttribute('href', '#projects')
  })

  it('shows a Photo placeholder when photoSrc is null', () => {
    render(<ResumeHero {...baseProps} photoSrc={null} />)
    expect(screen.getByText('Photo')).toBeInTheDocument()
  })

  it('renders an image when photoSrc is provided', () => {
    render(<ResumeHero {...baseProps} photoSrc="/me.jpg" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/me.jpg')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd src && npx jest ResumeHero.test.tsx`
Expected: FAIL — old `ResumeHero` has a different prop signature (`T`, `isDark`, `bio: string[]`, no `photoSrc`/`email`/`badge`).

- [ ] **Step 3: Rewrite `src/components/resume/ResumeHero.tsx`**

```tsx
// src/components/resume/ResumeHero.tsx
import { T, mono, sans } from './tokens'

interface Props {
  name: string
  role: string
  location: string
  badge: string
  bio: string
  tldr: string
  photoSrc: string | null
  email: string
}

export default function ResumeHero({ name, role, location, badge, bio, tldr, photoSrc, email }: Props) {
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <section style={{ display: 'flex', gap: 48, flexWrap: 'wrap', paddingTop: 72, paddingBottom: 48 }}>
      <div style={{ flex: '1 1 480px', minWidth: 320 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: mono, fontSize: 11, color: T.gold,
          letterSpacing: '0.10em', textTransform: 'uppercase',
          marginBottom: 20, background: T.bgTerm,
          border: `1px solid ${T.border}`, padding: '6px 12px', borderRadius: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, boxShadow: `0 0 8px ${T.green}`, animation: 'rp-pulse 2s ease-in-out infinite', display: 'inline-block' }} />
          {badge}
        </div>

        <h1 style={{ fontFamily: sans, fontWeight: 800, fontSize: 'clamp(36px,5vw,56px)', color: T.txt, lineHeight: 1.02, letterSpacing: '-1px', marginBottom: 12 }}>
          {name}
        </h1>

        <div style={{ fontFamily: mono, fontSize: 14, color: T.dim, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ color: T.gold, fontWeight: 500 }}>{role}</span>
          <span style={{ color: T.border }}>•</span>
          <span>{location}</span>
        </div>

        <p style={{ fontFamily: sans, fontSize: 15, color: T.dim, lineHeight: 1.75, maxWidth: 520, marginBottom: 24 }}>
          {bio}
        </p>

        <p style={{
          fontFamily: mono, fontSize: 13, color: T.dimLo, lineHeight: 1.7, maxWidth: 480,
          marginBottom: 32, paddingLeft: 16, borderLeft: `2px solid ${T.border}`,
        }}>
          <span style={{ color: T.gold }}>tldr;</span> {tldr}
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <a href={`mailto:${email}`} style={{
            fontFamily: sans, fontSize: 14, fontWeight: 600, color: '#0a0a0a',
            background: T.gold, borderRadius: 8, padding: '12px 22px', textDecoration: 'none',
          }}>Email Me →</a>
          <a href="#projects" style={{
            fontFamily: sans, fontSize: 14, fontWeight: 600, color: T.txt,
            background: 'transparent', border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '12px 22px', textDecoration: 'none',
          }}>View Work</a>
        </div>
      </div>

      <div style={{ flex: '0 1 320px', minWidth: 240, position: 'relative' }}>
        <div style={{
          width: '100%', aspectRatio: '0.85', borderRadius: 16,
          background: T.bgCard, border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {photoSrc
            ? <img src={photoSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontFamily: mono, fontSize: 13, color: T.dimLo }}>Photo</span>}
        </div>
        <div style={{
          position: 'absolute', bottom: -18, right: -18,
          width: 56, height: 56, borderRadius: '50%',
          background: T.bg, border: `2px solid ${T.gold}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: mono, fontWeight: 600, fontSize: 15, color: T.gold,
          boxShadow: '0 0 16px rgba(255,197,61,0.35)',
        }}>{initials}</div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd src && npx jest ResumeHero.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/resume/ResumeHero.tsx src/__tests__/ResumeHero.test.tsx
git commit -m "feat: resume redesign — fresh ResumeHero"
```

---

### Task 6: `ResumeHeatmap`

**Files:**
- Create: `src/components/resume/ResumeHeatmap.tsx`
- Test: `src/__tests__/ResumeHeatmap.test.tsx`

**Interfaces:**
- Consumes: `T`, `mono` from `./tokens`.
- Produces: `ResumeHeatmap({ cells: number[] })` — consumed by Task 13. `cells` comes from `getHeatmapCells()` (Task 2) via `page.tsx` (Task 14).

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeHeatmap.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeHeatmap from '@/components/resume/ResumeHeatmap'

describe('ResumeHeatmap', () => {
  const cells = Array.from({ length: 364 }, () => 0)

  it('renders the heading', () => {
    render(<ResumeHeatmap cells={cells} />)
    expect(screen.getByText('YEAR IN COMMITS')).toBeInTheDocument()
  })

  it('renders 364 grid cells', () => {
    const { container } = render(<ResumeHeatmap cells={cells} />)
    const grid = container.querySelector('[style*="grid-template-columns"]')
    expect(grid?.children.length).toBe(364)
  })

  it('renders the Less/More legend', () => {
    render(<ResumeHeatmap cells={cells} />)
    expect(screen.getByText('Less')).toBeInTheDocument()
    expect(screen.getByText('More')).toBeInTheDocument()
  })

  it('renders all 12 month labels', () => {
    render(<ResumeHeatmap cells={cells} />)
    ;['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].forEach(m => {
      expect(screen.getByText(m)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd src && npx jest ResumeHeatmap.test.tsx`
Expected: FAIL — `Cannot find module '@/components/resume/ResumeHeatmap'`

- [ ] **Step 3: Write the implementation**

Create `src/components/resume/ResumeHeatmap.tsx`:

```tsx
// src/components/resume/ResumeHeatmap.tsx
import { T, mono } from './tokens'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props { cells: number[] }

export default function ResumeHeatmap({ cells }: Props) {
  return (
    <section id="commits" style={{
      background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: '24px 28px', marginBottom: 32,
    }}>
      <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: T.txt, letterSpacing: '0.08em', marginBottom: 20 }}>
        YEAR IN COMMITS
      </div>

      {/* ponytail: month labels are evenly spaced, not aligned to real calendar weeks */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        {MONTHS.map(m => (
          <span key={m} style={{ fontFamily: mono, fontSize: 9, color: T.dimLo, letterSpacing: '0.04em' }}>{m}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52,1fr)', gridTemplateRows: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((level, i) => (
          <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 2, background: T.heatLevels[level] }} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: T.dimLo }}>Less</span>
        {T.heatLevels.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
        <span style={{ fontFamily: mono, fontSize: 9, color: T.dimLo }}>More</span>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd src && npx jest ResumeHeatmap.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/resume/ResumeHeatmap.tsx src/__tests__/ResumeHeatmap.test.tsx
git commit -m "feat: resume redesign — ResumeHeatmap (real GitHub data via props)"
```

---

### Task 7: `ResumeExperience`

**Files:**
- Create (fresh): `src/components/resume/ResumeExperience.tsx`
- Test: `src/__tests__/ResumeExperience.test.tsx`

**Interfaces:**
- Consumes: `T`, `mono`, `sans` from `./tokens`; `ExperienceItem` from `@/data/types`.
- Produces: `ResumeExperience({ experience: ExperienceItem[] })` — consumed by Task 13.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeExperience.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeExperience from '@/components/resume/ResumeExperience'
import type { ExperienceItem } from '@/data/types'

const experience: ExperienceItem[] = [
  { period: 'Jan 2025\n—\nPresent', role: 'Python Developer', company: 'Excellence Technologies', location: 'Gurugram, IN', description: 'Built things' },
]

describe('ResumeExperience', () => {
  it('renders the heading', () => {
    render(<ResumeExperience experience={experience} />)
    expect(screen.getByText('Work Experience')).toBeInTheDocument()
  })

  it('renders company, role, and period/location', () => {
    render(<ResumeExperience experience={experience} />)
    expect(screen.getByText('Excellence Technologies')).toBeInTheDocument()
    expect(screen.getByText('Python Developer')).toBeInTheDocument()
    expect(screen.getByText(/Jan 2025 — Present • Gurugram, IN/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd src && npx jest ResumeExperience.test.tsx`
Expected: FAIL — old component requires a `T` prop and imports the deleted `./types`.

- [ ] **Step 3: Rewrite `src/components/resume/ResumeExperience.tsx`**

```tsx
// src/components/resume/ResumeExperience.tsx
import { T, mono, sans } from './tokens'
import type { ExperienceItem } from '@/data/types'

interface Props { experience: ExperienceItem[] }

export default function ResumeExperience({ experience }: Props) {
  return (
    <div id="experience" style={{
      background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: '20px 24px', flex: '1 1 320px', minWidth: 280,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontFamily: sans, fontWeight: 700, fontSize: 15, color: T.txt }}>
        <span style={{ width: 16, height: 16, border: `1px solid ${T.gold}`, borderRadius: 3, display: 'inline-block' }} />
        Work Experience
      </div>
      {experience.map((ex, i) => (
        <div key={ex.company} style={{ display: 'flex', gap: 14, marginBottom: i < experience.length - 1 ? 18 : 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background: T.bgTerm, border: `1px solid ${T.border}`, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 14, color: T.txt }}>{ex.company}</div>
            <div style={{ fontFamily: mono, fontSize: 12, color: T.dim, marginTop: 2 }}>{ex.role}</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: T.dimLo, marginTop: 6 }}>
              {ex.period.replace(/\n/g, ' ')} • {ex.location}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd src && npx jest ResumeExperience.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/resume/ResumeExperience.tsx src/__tests__/ResumeExperience.test.tsx
git commit -m "feat: resume redesign — fresh ResumeExperience card"
```

---

### Task 8: `ResumeStackPills`

**Files:**
- Create: `src/components/resume/ResumeStackPills.tsx`
- Test: `src/__tests__/ResumeStackPills.test.tsx`

**Interfaces:**
- Consumes: `T`, `mono`, `sans` from `./tokens`.
- Produces: `ResumeStackPills({ pills: string[] })` — consumed by Task 13, fed from `data.stackPills` (Task 1).

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeStackPills.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeStackPills from '@/components/resume/ResumeStackPills'

describe('ResumeStackPills', () => {
  it('renders the heading and every pill', () => {
    render(<ResumeStackPills pills={['Python', 'FastAPI', 'LangGraph']} />)
    expect(screen.getByText('Stack I use')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('FastAPI')).toBeInTheDocument()
    expect(screen.getByText('LangGraph')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd src && npx jest ResumeStackPills.test.tsx`
Expected: FAIL — `Cannot find module '@/components/resume/ResumeStackPills'`

- [ ] **Step 3: Write the implementation**

Create `src/components/resume/ResumeStackPills.tsx`:

```tsx
// src/components/resume/ResumeStackPills.tsx
import { T, mono, sans } from './tokens'

interface Props { pills: string[] }

export default function ResumeStackPills({ pills }: Props) {
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: '20px 24px', flex: '1 1 320px', minWidth: 280,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontFamily: sans, fontWeight: 700, fontSize: 15, color: T.txt }}>
        <span style={{ fontFamily: mono, color: T.gold, fontSize: 13 }}>{'</>'}</span>
        Stack I use
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {pills.map(p => (
          <span key={p} style={{
            fontFamily: mono, fontSize: 12, color: T.dim,
            border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px',
          }}>{p}</span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd src && npx jest ResumeStackPills.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/resume/ResumeStackPills.tsx src/__tests__/ResumeStackPills.test.tsx
git commit -m "feat: resume redesign — ResumeStackPills"
```

---

### Task 9: `ResumeSkills` (terminal window)

**Files:**
- Create (fresh): `src/components/resume/ResumeSkills.tsx`
- Test: `src/__tests__/ResumeSkills.test.tsx`

**Interfaces:**
- Consumes: `T`, `mono` from `./tokens`; `SkillItem` from `@/data/types`.
- Produces: `ResumeSkills({ skills: SkillItem[] })` — consumed by Task 13.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeSkills.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeSkills from '@/components/resume/ResumeSkills'
import type { SkillItem } from '@/data/types'

const skills: SkillItem[] = [
  { icon: '⚡', name: 'AI & GenAI', kind: 'Agents', pct: 93, description: 'AI stuff', tags: ['LangGraph', 'OpenAI'] },
]

describe('ResumeSkills', () => {
  it('renders the terminal path header', () => {
    render(<ResumeSkills skills={skills} />)
    expect(screen.getByText('nitish@portfolio:~/skills')).toBeInTheDocument()
  })

  it('renders each skill category slug and its tags', () => {
    render(<ResumeSkills skills={skills} />)
    expect(screen.getByText(/ai-genai/)).toBeInTheDocument()
    expect(screen.getByText(/LangGraph, OpenAI/)).toBeInTheDocument()
  })

  it('renders the production-minded status line', () => {
    render(<ResumeSkills skills={skills} />)
    expect(screen.getByText(/status: production-minded/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd src && npx jest ResumeSkills.test.tsx`
Expected: FAIL — old component requires a `T` prop, renders tags as separate spans (not `"LangGraph, OpenAI"` joined text), and has no terminal path header.

- [ ] **Step 3: Rewrite `src/components/resume/ResumeSkills.tsx`**

```tsx
// src/components/resume/ResumeSkills.tsx
import { T, mono } from './tokens'
import type { SkillItem } from '@/data/types'

interface Props { skills: SkillItem[] }

const DOTS = ['#ff5f56', '#ffbd2e', '#27c93f']

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export default function ResumeSkills({ skills }: Props) {
  return (
    <section id="skills" style={{
      background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
      overflow: 'hidden', marginBottom: 32,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderBottom: `1px solid ${T.border}` }}>
        {DOTS.map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <span style={{ fontFamily: mono, fontSize: 12, color: T.dim, marginLeft: 10 }}>
          nitish@portfolio:~/skills
        </span>
      </div>
      <div style={{ padding: '20px 24px', fontFamily: mono, fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ color: T.dimLo, marginBottom: 8 }}>&gt; /home/nitish/skills</div>
        {skills.map(skill => (
          <div key={skill.name} style={{ marginBottom: 4, color: T.dim }}>
            <span style={{ color: T.gold }}>&gt;</span> <span style={{ color: T.txt }}>{slug(skill.name)}</span>: {skill.tags.join(', ')}
          </div>
        ))}
        <div style={{ color: T.dimLo, marginTop: 8 }}>&gt; build --ship --iterate</div>
        <div style={{ color: T.green, marginTop: 4 }}>&nbsp;&nbsp;status: production-minded</div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd src && npx jest ResumeSkills.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/resume/ResumeSkills.tsx src/__tests__/ResumeSkills.test.tsx
git commit -m "feat: resume redesign — ResumeSkills terminal-window chrome"
```

---

### Task 10: `ResumeProjects`

**Files:**
- Create (fresh): `src/components/resume/ResumeProjects.tsx`
- Test: `src/__tests__/ResumeProjects.test.tsx`

**Interfaces:**
- Consumes: `T`, `mono`, `sans` from `./tokens`; `ProjectItem` from `@/data/types`; `ResumeLink` from `./ResumeLink` (Task 3).
- Produces: `ResumeProjects({ projects: ProjectItem[] })` — renders exactly the array it's given (slicing happens in the caller, Task 13). Consumed by Task 13.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeProjects.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeProjects from '@/components/resume/ResumeProjects'
import type { ProjectItem } from '@/data/types'

function project(name: string): ProjectItem {
  return {
    year: '2025', name, description: `${name} description`,
    tags: ['FastAPI'], links: [{ label: 'Private →', href: '#' }],
    visual: { glyph: '📞', stats: [{ value: '1', label: 'x', fill: 50 }, { value: '2', label: 'y', fill: 50 }] },
  }
}

describe('ResumeProjects', () => {
  it('renders the heading', () => {
    render(<ResumeProjects projects={[project('Staffmind')]} />)
    expect(screen.getByText("Things I've built")).toBeInTheDocument()
  })

  it('renders every project passed in, with numbered badges', () => {
    const projects = [project('Staffmind'), project('StructureIQ')]
    render(<ResumeProjects projects={projects} />)
    expect(screen.getByText('Staffmind')).toBeInTheDocument()
    expect(screen.getByText('StructureIQ')).toBeInTheDocument()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
  })

  it('renders the project description and link label', () => {
    render(<ResumeProjects projects={[project('Staffmind')]} />)
    expect(screen.getByText('Staffmind description')).toBeInTheDocument()
    expect(screen.getByText('Private →')).toBeInTheDocument()
  })

  it('does not render a project that was not passed in (slicing is the caller\'s job)', () => {
    render(<ResumeProjects projects={[project('Staffmind')]} />)
    expect(screen.queryByText('HireIQ')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd src && npx jest ResumeProjects.test.tsx`
Expected: FAIL — old component requires a `T` prop and renders numbers as `01` inline text with different markup, plus imports the deleted `./types`.

- [ ] **Step 3: Rewrite `src/components/resume/ResumeProjects.tsx`**

```tsx
// src/components/resume/ResumeProjects.tsx
import { T, mono, sans } from './tokens'
import type { ProjectItem } from '@/data/types'
import ResumeLink from './ResumeLink'

interface Props { projects: ProjectItem[] }

export default function ResumeProjects({ projects }: Props) {
  return (
    <section id="projects" style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, fontFamily: sans, fontWeight: 700, fontSize: 18, color: T.txt }}>
        <span>🚀</span> Things I&apos;ve built
      </div>
      {projects.map((p, i) => (
        <div key={p.name} style={{
          display: 'flex', gap: 16, alignItems: 'flex-start',
          background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: '18px 20px', marginBottom: i < projects.length - 1 ? 14 : 0,
        }}>
          <div style={{
            fontFamily: mono, fontSize: 12, color: T.gold,
            border: `1px solid ${T.border}`, borderRadius: 6,
            width: 32, height: 32, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{String(i + 1).padStart(2, '0')}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ fontFamily: sans, fontWeight: 700, fontSize: 16, color: T.txt, margin: 0 }}>{p.name}</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                {p.links.map(link => (
                  <ResumeLink key={link.label} href={link.href} style={{ fontSize: 12 }}>{link.label}</ResumeLink>
                ))}
              </div>
            </div>
            <p style={{ fontFamily: sans, fontSize: 13, color: T.dim, lineHeight: 1.7, marginTop: 8, marginBottom: 0 }}>
              {p.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd src && npx jest ResumeProjects.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/resume/ResumeProjects.tsx src/__tests__/ResumeProjects.test.tsx
git commit -m "feat: resume redesign — fresh ResumeProjects cards"
```

---

### Task 11: `ResumeContact` (merges old Contact + Social)

**Files:**
- Create (fresh): `src/components/resume/ResumeContact.tsx`
- Delete: `src/components/resume/ResumeSocial.tsx`
- Test: `src/__tests__/ResumeContact.test.tsx`
- Delete: any existing `src/__tests__/ResumeSocial.test.tsx` if present (check first)

**Interfaces:**
- Consumes: `T`, `mono`, `sans` from `./tokens`; `ContactData` from `@/data/types`; `ResumeLink` from `./ResumeLink` (Task 3).
- Produces: `ResumeContact({ contact: ContactData })` — consumed by Task 13.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeContact.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeContact from '@/components/resume/ResumeContact'
import type { ContactData } from '@/data/types'

const contact: ContactData = {
  heading: 'Get in touch',
  email: 'test@test.com',
  socials: [
    { label: 'GitHub', icon: '⌥', href: 'https://github.com/test' },
    { label: 'LinkedIn', icon: '⊞', href: 'https://linkedin.com/in/test' },
  ],
}

describe('ResumeContact', () => {
  it('renders the "Find me online" heading', () => {
    render(<ResumeContact contact={contact} />)
    expect(screen.getByText('Find me online')).toBeInTheDocument()
  })

  it('renders social links and a derived Email link', () => {
    render(<ResumeContact contact={contact} />)
    expect(screen.getByText('GitHub')).toHaveAttribute('href', 'https://github.com/test')
    expect(screen.getByText('LinkedIn')).toHaveAttribute('href', 'https://linkedin.com/in/test')
    expect(screen.getByText('Email')).toHaveAttribute('href', 'mailto:test@test.com')
  })

  it('renders the production-minded status block', () => {
    render(<ResumeContact contact={contact} />)
    expect(screen.getByText('production-minded')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Check for and remove any existing `ResumeSocial` test**

```bash
ls src/__tests__/ | grep -i ResumeSocial || echo "none found"
```

If one exists, delete it (its coverage is folded into the new `ResumeContact.test.tsx` above):

```bash
git rm src/__tests__/ResumeSocial.test.tsx 2>/dev/null || true
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd src && npx jest ResumeContact.test.tsx`
Expected: FAIL — old `ResumeContact` doesn't render socials at all (that was `ResumeSocial`'s job) and has a different structure.

- [ ] **Step 4: Rewrite `src/components/resume/ResumeContact.tsx`**

```tsx
// src/components/resume/ResumeContact.tsx
import { T, mono, sans } from './tokens'
import type { ContactData } from '@/data/types'
import ResumeLink from './ResumeLink'

interface Props { contact: ContactData }

export default function ResumeContact({ contact }: Props) {
  const allLinks = [
    ...contact.socials,
    { label: 'Email', icon: '✉', href: `mailto:${contact.email}` },
  ]
  return (
    <section id="contact" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
      <div style={{
        flex: '1 1 320px', minWidth: 280, background: T.bgCard,
        border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px 24px',
      }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 15, color: T.txt, marginBottom: 16 }}>
          Find me online
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {allLinks.map(link => (
            <ResumeLink key={link.label} href={link.href} style={{ fontSize: 13 }}>{link.label}</ResumeLink>
          ))}
        </div>
      </div>

      <div style={{
        flex: '1 1 260px', minWidth: 240, background: T.bgCard,
        border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px 24px',
        fontFamily: mono, fontSize: 13,
      }}>
        <div style={{ color: T.dim }}>
          status: <span style={{ color: T.green }}>production-minded</span>{' '}
          <span style={{ color: T.green }}>●</span>
        </div>
        <div style={{ color: T.dimLo, margin: '10px 0' }}>------</div>
        <div style={{ color: T.gold, display: 'flex', alignItems: 'center', gap: 2 }}>
          &gt;_
          <span style={{
            display: 'inline-block', width: 7, height: 14, background: T.gold,
            marginLeft: 4, animation: 'rp-blink 1s step-end infinite',
          }} />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Delete `ResumeSocial.tsx`**

```bash
git rm src/components/resume/ResumeSocial.tsx
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd src && npx jest ResumeContact.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add src/components/resume/ResumeContact.tsx src/__tests__/ResumeContact.test.tsx
git rm src/components/resume/ResumeSocial.tsx
git commit -m "feat: resume redesign — ResumeContact merges social links + status block, drop ResumeSocial"
```

---

### Task 12: `ResumeFooter`

**Files:**
- Create (fresh): `src/components/resume/ResumeFooter.tsx`
- Test: `src/__tests__/ResumeFooter.test.tsx`

**Interfaces:**
- Consumes: `T`, `mono` from `./tokens`; `FooterData` from `@/data/types`.
- Produces: `ResumeFooter({ footer: FooterData, name: string })` — consumed by Task 13.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ResumeFooter.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import ResumeFooter from '@/components/resume/ResumeFooter'
import type { FooterData } from '@/data/types'

const footer: FooterData = { copy: '© 2026 Test', signature: 'crafted' }

describe('ResumeFooter', () => {
  it('renders the initials, nav links, and footer copy', () => {
    render(<ResumeFooter footer={footer} name="Nitish Kushwaha" />)
    expect(screen.getByText('NK')).toBeInTheDocument()
    expect(screen.getByText('projects')).toHaveAttribute('href', '#projects')
    expect(screen.getByText('© 2026 Test')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd src && npx jest ResumeFooter.test.tsx`
Expected: FAIL — old component requires a `T` prop, has no `name` prop, and doesn't render "NK" or nav links.

- [ ] **Step 3: Rewrite `src/components/resume/ResumeFooter.tsx`**

```tsx
// src/components/resume/ResumeFooter.tsx
import { T, mono } from './tokens'
import type { FooterData } from '@/data/types'

const NAV_LINKS = ['projects', 'skills', 'experience', 'contact'] as const

interface Props { footer: FooterData; name: string }

function initialsOf(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function ResumeFooter({ footer, name }: Props) {
  return (
    <footer style={{ paddingTop: 32, paddingBottom: 32, borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', border: `1px solid ${T.gold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: mono, fontSize: 12, fontWeight: 600, color: T.gold,
        margin: '0 auto 16px',
      }}>{initialsOf(name)}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
        {NAV_LINKS.map(id => (
          <a key={id} href={`#${id}`} style={{ fontFamily: mono, fontSize: 12, color: T.dim, textDecoration: 'none' }}>{id}</a>
        ))}
      </div>
      <div style={{ fontFamily: mono, fontSize: 11, color: T.dimLo }}>{footer.copy}</div>
    </footer>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd src && npx jest ResumeFooter.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/resume/ResumeFooter.tsx src/__tests__/ResumeFooter.test.tsx
git commit -m "feat: resume redesign — fresh ResumeFooter"
```

---

### Task 13: `ResumePortfolio` root assembly — remove ThemeContext, `ResumeSectionTitle`

**Files:**
- Create (fresh): `src/components/resume/ResumePortfolio.tsx`
- Delete: `src/components/resume/ThemeContext.tsx`
- Delete: `src/__tests__/ThemeContext.test.tsx`
- Delete: `src/components/resume/ResumeSectionTitle.tsx`
- Test: rewrite `src/__tests__/ResumePortfolio.test.tsx`

**Interfaces:**
- Consumes: `T` from `./tokens`; all Task 4–12 components; `PortfolioData` from `@/data/types`.
- Produces: `ResumePortfolio({ data: PortfolioData, heatmapCells: number[] })` — consumed by Task 14 (`page.tsx`).

- [ ] **Step 1: Confirm nothing else imports the files about to be deleted**

```bash
cd src
grep -rln "ThemeContext\|useTheme\|ResumeSectionTitle" --include="*.tsx" --include="*.ts" . | grep -v __tests__
```

Expected: only `components/resume/ThemeContext.tsx` and `components/resume/ResumeSectionTitle.tsx` themselves (their own definitions) — nothing else references them, since Tasks 4–12 already rewrote every consumer.

- [ ] **Step 2: Write the failing test**

Rewrite `src/__tests__/ResumePortfolio.test.tsx` completely:

```tsx
import { render, screen } from '@testing-library/react'
import ResumePortfolio from '@/components/resume/ResumePortfolio'
import type { PortfolioData } from '@/data/types'

function project(name: string) {
  return {
    year: '2025', name, description: `${name} description`,
    tags: ['FastAPI'], links: [{ label: 'Private →', href: '#' }],
    visual: { glyph: '📞', stats: [{ value: '1', label: 'x', fill: 50 }, { value: '2', label: 'y', fill: 50 }] },
  }
}

const mockData = {
  meta: { title: 'Test', description: 'Test desc', name: 'Nitish Kushwaha', role: 'Backend Engineer', location: 'Delhi, India' },
  theme: { accentColor: '#f5c518' },
  hero: {
    name: 'Nitish Kushwaha', badge: 'Available for work',
    titleLines: ['Backend', '& AI', 'Engineer'], titleAccentLine: 1,
    subtitle: 'Builds production AI systems.', tldr: 'I build until it works.',
    photoSrc: null,
    ctaPrimary: { label: 'View Projects →', href: '#projects' },
    ctaSecondary: { label: "Let's Talk", href: '#contact' },
  },
  stats: [],
  skills: [
    { icon: '⚡', name: 'AI & GenAI', kind: 'Agents', pct: 92, description: 'AI stuff', tags: ['LangGraph'] },
  ],
  stackPills: ['Python', 'FastAPI'],
  projects: [project('Staffmind'), project('Founder\'s Lab'), project('VoxCraft'), project('StructureIQ'), project('LexCall')],
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

const heatmapCells = Array.from({ length: 364 }, () => 0)

describe('ResumePortfolio', () => {
  it('renders name in hero', () => {
    render(<ResumePortfolio data={mockData} heatmapCells={heatmapCells} />)
    expect(screen.getByText('Nitish Kushwaha')).toBeInTheDocument()
  })

  it('renders company name in experience', () => {
    render(<ResumePortfolio data={mockData} heatmapCells={heatmapCells} />)
    expect(screen.getByText('Excellence Technologies')).toBeInTheDocument()
  })

  it('renders only the first 4 projects, not the 5th', () => {
    render(<ResumePortfolio data={mockData} heatmapCells={heatmapCells} />)
    expect(screen.getByText('Staffmind')).toBeInTheDocument()
    expect(screen.getByText('StructureIQ')).toBeInTheDocument()
    expect(screen.queryByText('LexCall')).not.toBeInTheDocument()
  })

  it('renders contact links (email is inside a mailto href, not visible text)', () => {
    render(<ResumePortfolio data={mockData} heatmapCells={heatmapCells} />)
    expect(screen.queryByText('test@test.com')).not.toBeInTheDocument()
    expect(screen.getByText('GitHub')).toHaveAttribute('href', 'https://github.com/test')
  })

  it('renders the stack pills', () => {
    render(<ResumePortfolio data={mockData} heatmapCells={heatmapCells} />)
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('does not render a theme toggle', () => {
    render(<ResumePortfolio data={mockData} heatmapCells={heatmapCells} />)
    expect(screen.queryByText('Light')).not.toBeInTheDocument()
    expect(screen.queryByText('Dark')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd src && npx jest ResumePortfolio.test.tsx`
Expected: FAIL — old `ResumePortfolio` wraps in `ThemeProvider`, hardcodes bio/tldr, doesn't accept `heatmapCells`, and renders all 5 projects.

- [ ] **Step 4: Rewrite `src/components/resume/ResumePortfolio.tsx`**

```tsx
// src/components/resume/ResumePortfolio.tsx
import type { PortfolioData } from '@/data/types'
import CustomCursor from '@/components/ui/CustomCursor'
import { T } from './tokens'
import ResumeNav from './ResumeNav'
import ResumeHero from './ResumeHero'
import ResumeHeatmap from './ResumeHeatmap'
import ResumeExperience from './ResumeExperience'
import ResumeStackPills from './ResumeStackPills'
import ResumeSkills from './ResumeSkills'
import ResumeProjects from './ResumeProjects'
import ResumeContact from './ResumeContact'
import ResumeFooter from './ResumeFooter'

const col: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '0 32px' }

interface Props { data: PortfolioData; heatmapCells: number[] }

export default function ResumePortfolio({ data, heatmapCells }: Props) {
  return (
    <>
      <CustomCursor />
      <style>{`
        @keyframes rp-pulse { 0%,100%{opacity:1;box-shadow:0 0 8px #4ade80}50%{opacity:.35;box-shadow:0 0 3px #4ade80} }
        @keyframes rp-blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes rp-fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }
        ::selection{background:rgba(255,197,61,0.25);color:${T.txt}}
      `}</style>
      <div style={{
        paddingTop: 90, paddingBottom: 60, background: T.bg,
        minHeight: '100vh', animation: 'rp-fadeIn .4s ease both',
      }}>
        <ResumeNav name={data.meta.name} />
        <div style={col}>
          <ResumeHero
            name={data.meta.name}
            role={data.meta.role}
            location={data.meta.location}
            badge={data.hero.badge}
            bio={data.hero.subtitle}
            tldr={data.hero.tldr}
            photoSrc={data.hero.photoSrc}
            email={data.contact.email}
          />
          <ResumeHeatmap cells={heatmapCells} />
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
            <ResumeExperience experience={data.experience} />
            <ResumeStackPills pills={data.stackPills} />
          </div>
          <ResumeSkills skills={data.skills} />
          <ResumeProjects projects={data.projects.slice(0, 4)} />
          <ResumeContact contact={data.contact} />
          <ResumeFooter footer={data.footer} name={data.meta.name} />
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 5: Delete `ThemeContext.tsx`, its test, and `ResumeSectionTitle.tsx`**

```bash
git rm src/components/resume/ThemeContext.tsx
git rm src/__tests__/ThemeContext.test.tsx
git rm src/components/resume/ResumeSectionTitle.tsx
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd src && npx jest ResumePortfolio.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 7: Commit**

```bash
git add src/components/resume/ResumePortfolio.tsx src/__tests__/ResumePortfolio.test.tsx
git rm src/components/resume/ThemeContext.tsx src/__tests__/ThemeContext.test.tsx src/components/resume/ResumeSectionTitle.tsx
git commit -m "feat: resume redesign — fresh ResumePortfolio root, drop ThemeContext + ResumeSectionTitle"
```

---

### Task 14: Wire `page.tsx` + full verification

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getHeatmapCells(githubUrl: string): Promise<number[]>` from `@/lib/github` (Task 2); `ResumePortfolio({ data, heatmapCells })` from Task 13.

- [ ] **Step 1: Update `src/app/page.tsx`**

```tsx
// src/app/page.tsx
import ResumePortfolio     from '@/components/resume/ResumePortfolio'
import FullExperienceShell from '@/components/full/FullExperienceShell'
import portfolioData       from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'
import { getHeatmapCells } from '@/lib/github'

const data = portfolioData as PortfolioData

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  if (mode === 'full') return <FullExperienceShell data={data} />

  const githubUrl = data.contact.socials.find(s => s.label === 'GitHub')?.href ?? ''
  const heatmapCells = await getHeatmapCells(githubUrl)
  return <ResumePortfolio data={data} heatmapCells={heatmapCells} />
}
```

- [ ] **Step 2: Run the full test suite**

```bash
cd src
npm test -- --silent
```

Expected: all suites pass (no `ThemeContext.test.tsx`, no old `ResumeSocial` test — both deleted in earlier tasks; every Resume component has a fresh passing test).

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Confirm no dangling references to deleted files**

```bash
grep -rln "ThemeContext\|useTheme\|ResumeSectionTitle\|ResumeSocial" --include="*.tsx" --include="*.ts" . 2>/dev/null
```

Expected: no output.

- [ ] **Step 5: Manual smoke test in dev server**

```bash
npm run dev
```

Open `http://localhost:3000/` (or the configured port) in a browser. Confirm:
- Dark page loads with no light/dark toggle.
- Hero shows name, badge, bio, tldr, photo placeholder box, Email Me + View Work buttons.
- "YEAR IN COMMITS" heatmap renders 52×7 gold-shaded cells (random pattern if `GITHUB_TOKEN` is unset locally — expected per spec).
- Work Experience + Stack I use cards render side by side.
- Terminal-styled skills window shows mac dots and skill lines.
- Exactly 4 project cards render (Staffmind, Founder's Lab, VoxCraft / ReactCraft, StructureIQ) — LexCall and HireIQ do NOT appear on this page.
- Find me online + status block render.
- DeaxButton and its menu still appear and work (unchanged).
- `/?mode=full` still loads the existing Full Experience page, unaffected.

Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: resume redesign — wire page.tsx to fetch GitHub heatmap and pass to ResumePortfolio"
```

---

## Post-Plan Notes

- `GITHUB_TOKEN` still needs to be set in Vercel (or wherever this deploys) for the heatmap to show real data in production — local dev and any environment without it falls back to the decorative pattern by design.
- A real photo can be dropped in later by setting `hero.photoSrc` in `portfolio.json` to a path under `public/`.
- Mobile/responsive polish for this page is explicitly out of scope for this plan (see spec) — the flex-wrap behavior already in `ResumeHero` and the two-column sections will stack reasonably on narrow viewports, but no dedicated mobile layout work was done.
