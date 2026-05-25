# SkillsFinder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing flat SkillsSection + SkillCard with a macOS Finder-styled interactive component featuring List/Grid views and full responsive layout.

**Architecture:** Single `SkillsFinder.tsx` Client Component with `useState` for active skill index and view mode; CSS-only responsiveness in `globals.css`; animation via inline style + `setTimeout` + `requestAnimationFrame`. Data extended in `portfolio.json` and `types.ts` with `kind` and `pct` fields.

**Tech Stack:** Next.js 16 (App Router), React 18, TypeScript strict, CSS in `globals.css`

**Spec:** `docs/superpowers/specs/2026-05-25-skills-finder-design.md`

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Delete | `src/components/skills/SkillCard.tsx` | Replaced entirely by SkillsFinder |
| Replace | `src/components/skills/SkillsSection.tsx` → `SkillsFinder.tsx` | Full Finder window component |
| Update | `src/data/portfolio.json` | Add `kind` + `pct` to each skill |
| Update | `src/data/types.ts` | Extend `SkillItem` with `kind: string`, `pct: number` |
| Update | `src/app/globals.css` | Add `/* ── SkillsFinder ── */` section |
| Update | `src/app/page.tsx` | Import `SkillsFinder` instead of `SkillsSection` |
| Create | `src/__tests__/SkillsFinder.test.tsx` | RTL tests |

---

## Task 1: Extend data model

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/data/portfolio.json`

- [ ] **Step 1: Add `kind` and `pct` to `SkillItem` in `types.ts`**

Find the `SkillItem` interface (currently at the top of the file) and replace it with:

```ts
export interface SkillItem {
  icon: string
  name: string
  kind: string
  pct: number
  description: string
  tags: string[]
}
```

- [ ] **Step 2: Add `kind` and `pct` values to all 6 skill entries in `portfolio.json`**

Find the `"skills"` array and update each entry. Full replacement for all 6:

```json
"skills": [
  {
    "icon": "⚡",
    "name": "AI & GenAI",
    "kind": "Agents · RAG · LLMs",
    "pct": 92,
    "description": "LLM-driven workflows, document pipelines, and intelligent agents. Prompt engineering from few-shot to iterative refinement.",
    "tags": ["LangGraph", "LangChain", "OpenAI", "RAG", "Prompt Engineering"]
  },
  {
    "icon": "🐍",
    "name": "Backend APIs",
    "kind": "Framework / REST / Python",
    "pct": 90,
    "description": "RESTful APIs built for scale with authentication, caching, and clean architecture using Python frameworks.",
    "tags": ["FastAPI", "Django", "DRF", "Flask", "REST"]
  },
  {
    "icon": "🎙️",
    "name": "Voice & Realtime",
    "kind": "Realtime / Voice / WebSocket",
    "pct": 85,
    "description": "Real-time voice agents with session isolation, SIP telephony integration, and WebSocket-based low-latency communication.",
    "tags": ["LiveKit", "Twilio SIP", "WebSockets", "Django Channels"]
  },
  {
    "icon": "🗄️",
    "name": "Databases",
    "kind": "Data / Storage / Caching",
    "pct": 87,
    "description": "Schema design, query optimisation, and picking the right store — from relational to vector to in-memory.",
    "tags": ["PostgreSQL", "Redis", "Snowflake", "Supabase", "SQLite"]
  },
  {
    "icon": "☁️",
    "name": "DevOps & Cloud",
    "kind": "Cloud / Infra / Containers",
    "pct": 82,
    "description": "Containerised deployments across AWS, Azure, and GCP. Nginx reverse proxy, SSL, and Linux server management.",
    "tags": ["Docker", "Nginx", "AWS", "Azure", "GCP", "Linux"]
  },
  {
    "icon": "🔷",
    "name": "Frontend & Tools",
    "kind": "Frontend / Automation / Testing",
    "pct": 75,
    "description": "Full-stack capable — building interfaces and integrating tooling when the backend story requires it.",
    "tags": ["Next.js", "TypeScript", "TailwindCSS", "Git", "Selenium"]
  }
]
```

- [ ] **Step 3: Verify existing tests still pass**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPattern="types"
```

Expected: `types.test.ts` passes (it validates portfolio.json shape — if it tests SkillItem fields it may need updating; fix any type assertion failures).

- [ ] **Step 4: Commit**

```bash
git add src/data/portfolio.json src/data/types.ts
git commit -m "feat: extend SkillItem with kind and pct fields"
```

---

## Task 2: Write failing tests for SkillsFinder

**Files:**
- Create: `src/__tests__/SkillsFinder.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react'
import SkillsFinder from '@/components/skills/SkillsFinder'
import type { SkillItem } from '@/data/types'

const mockSkills: SkillItem[] = [
  {
    icon: '⚡', name: 'AI & GenAI', kind: 'Agents · RAG · LLMs', pct: 92,
    description: 'LLM-driven workflows and intelligent agents.',
    tags: ['LangGraph', 'RAG'],
  },
  {
    icon: '🐍', name: 'Backend APIs', kind: 'Framework / REST / Python', pct: 90,
    description: 'RESTful APIs built for scale.',
    tags: ['FastAPI', 'Django'],
  },
  {
    icon: '🎙️', name: 'Voice & Realtime', kind: 'Realtime / Voice / WebSocket', pct: 85,
    description: 'Real-time voice agents.',
    tags: ['LiveKit'],
  },
]

describe('SkillsFinder', () => {
  it('renders dynamic item count in titlebar', () => {
    render(<SkillsFinder skills={mockSkills} />)
    expect(screen.getByText(/3 items/i)).toBeInTheDocument()
  })

  it('renders first skill as default selection in status bar', () => {
    render(<SkillsFinder skills={mockSkills} />)
    expect(screen.getByText(/1 of 3 selected — AI & GenAI/i)).toBeInTheDocument()
  })

  it('renders all skill names in the sidebar', () => {
    render(<SkillsFinder skills={mockSkills} />)
    expect(screen.getAllByText('AI & GenAI').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Backend APIs').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Voice & Realtime').length).toBeGreaterThan(0)
  })

  it('updates status bar after clicking a sidebar item', () => {
    jest.useFakeTimers()
    render(<SkillsFinder skills={mockSkills} />)
    const backendItems = screen.getAllByText('Backend APIs')
    fireEvent.click(backendItems[0])
    act(() => { jest.runAllTimers() })
    expect(screen.getByText(/2 of 3 selected — Backend APIs/i)).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('renders Grid pill button', () => {
    render(<SkillsFinder skills={mockSkills} />)
    expect(screen.getByText('Grid')).toBeInTheDocument()
  })

  it('renders all skill tags in grid view after toggling', () => {
    jest.useFakeTimers()
    render(<SkillsFinder skills={mockSkills} />)
    fireEvent.click(screen.getByText('Grid'))
    act(() => { jest.runAllTimers() })
    expect(screen.getAllByText('LangGraph').length).toBeGreaterThan(0)
    expect(screen.getAllByText('FastAPI').length).toBeGreaterThan(0)
    jest.useRealTimers()
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPattern="SkillsFinder"
```

Expected: 6 failures — `Cannot find module '@/components/skills/SkillsFinder'`

- [ ] **Step 3: Commit failing tests**

```bash
git add src/__tests__/SkillsFinder.test.tsx
git commit -m "test: add failing SkillsFinder tests"
```

---

## Task 3: Scaffold SkillsFinder + wire into page

**Files:**
- Create: `src/components/skills/SkillsFinder.tsx`
- Modify: `src/app/page.tsx`
- Delete: `src/components/skills/SkillCard.tsx`

- [ ] **Step 1: Create minimal `SkillsFinder.tsx` — enough to make tests pass**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import type { SkillItem } from '@/data/types'

const TAB_LABELS: Record<string, string> = {
  'AI & GenAI': 'AI',
  'Backend APIs': 'Backend',
  'Voice & Realtime': 'Voice',
  'Databases': 'Data',
  'DevOps & Cloud': 'Cloud',
  'Frontend & Tools': 'Frontend',
}

export default function SkillsFinder({ skills }: { skills: SkillItem[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [animating, setAnimating] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const active = skills[activeIdx]

  const handleSelect = (idx: number) => {
    if (idx === activeIdx) return
    setAnimating(true)
    setTimeout(() => {
      setActiveIdx(idx)
      setAnimating(false)
    }, 150)
  }

  const handleViewToggle = (v: 'list' | 'grid') => {
    if (v === view) return
    setAnimating(true)
    setTimeout(() => {
      setView(v)
      setAnimating(false)
    }, 150)
  }

  useEffect(() => {
    if (!barRef.current) return
    barRef.current.style.width = '0'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (barRef.current) barRef.current.style.width = `${active.pct}%`
      })
    })
  }, [activeIdx, view, active.pct])

  const bodyStyle = {
    opacity: animating ? 0 : 1,
    transform: animating ? 'translateY(6px)' : 'none',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
  }

  return (
    <div className="skills-finder">
      {/* Titlebar */}
      <div className="sf-titlebar">
        <div className="sf-dots">
          <span className="sf-dot sf-dot-red" />
          <span className="sf-dot sf-dot-yellow" />
          <span className="sf-dot sf-dot-green" />
        </div>
        <div className="sf-title-mid">
          <span className="sf-title-text">📂 Skills &amp; Capabilities</span>
          <em className="sf-title-count">— {skills.length} items</em>
        </div>
        <div className="sf-view-pills">
          <button
            className={`sf-pill${view === 'list' ? ' sf-pill-active' : ''}`}
            onClick={() => handleViewToggle('list')}
          >List</button>
          <button
            className={`sf-pill${view === 'grid' ? ' sf-pill-active' : ''}`}
            onClick={() => handleViewToggle('grid')}
          >Grid</button>
        </div>
      </div>

      {/* Body */}
      <div className="sf-body" style={bodyStyle}>
        {view === 'list' ? (
          <>
            {/* Sidebar — hidden on mobile via CSS */}
            <div className="sf-sidebar">
              <div className="sf-sb-label">All Skills</div>
              {skills.map((skill, idx) => (
                <div key={skill.name}>
                  {idx === 3 && <div className="sf-sb-divider" />}
                  <div
                    className={`sf-sb-item${activeIdx === idx ? ' sf-sb-item-active' : ''}`}
                    onClick={() => handleSelect(idx)}
                  >
                    <div className="sf-sb-icon">{skill.icon}</div>
                    <div className="sf-sb-text">
                      <div className="sf-sb-name">{skill.name}</div>
                      <div className="sf-sb-kind">{skill.kind}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tab row — shown on mobile only via CSS */}
            <div className="sf-tab-row">
              {skills.map((skill, idx) => (
                <div
                  key={skill.name}
                  className={`sf-tab${activeIdx === idx ? ' sf-tab-active' : ''}`}
                  onClick={() => handleSelect(idx)}
                >
                  <span className="sf-tab-icon">{skill.icon}</span>
                  <span className="sf-tab-label">{TAB_LABELS[skill.name] ?? skill.name}</span>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div className="sf-detail">
              <div className="sf-detail-header">
                <div className="sf-detail-icon">{active.icon}</div>
                <div>
                  <div className="sf-detail-name">{active.name}</div>
                  <div className="sf-detail-kind">{active.kind}</div>
                </div>
              </div>
              <p className="sf-detail-desc">{active.description}</p>
              <div className="sf-prof-row">
                <span className="sf-prof-label">Proficiency</span>
                <div className="sf-prof-track">
                  <div className="sf-prof-fill" ref={barRef} />
                </div>
                <span className="sf-prof-pct">{active.pct}%</span>
              </div>
              <div className="sf-tags">
                {active.tags.map(tag => (
                  <span key={tag} className="sf-tag">{tag}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Grid view */
          <div className="sf-grid">
            {skills.map(skill => (
              <div key={skill.name} className="sf-card">
                <span className="sf-card-icon">{skill.icon}</span>
                <div className="sf-card-name">{skill.name}</div>
                <div className="sf-card-kind">{skill.kind}</div>
                <div className="sf-card-bar-row">
                  <div className="sf-card-bar-track">
                    <div className="sf-card-bar-fill" style={{ width: `${skill.pct}%` }} />
                  </div>
                  <span className="sf-card-pct">{skill.pct}%</span>
                </div>
                <div className="sf-tags">
                  {skill.tags.map(tag => (
                    <span key={tag} className="sf-tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="sf-statusbar">
        <span className="sf-st-left">
          {activeIdx + 1} of {skills.length} selected — {active.name}
        </span>
        <div className="sf-st-right">
          <span className="sf-st-dot" />
          <span className="sf-st-text">Open to work</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `page.tsx` — swap import and JSX**

Find line 6 and line 26 in `src/app/page.tsx`:

```tsx
// Line 6 — change:
import SkillsSection     from '@/components/skills/SkillsSection'
// to:
import SkillsFinder      from '@/components/skills/SkillsFinder'

// Line 26 — change:
<SkillsSection    skills={data.skills} />
// to:
<SkillsFinder     skills={data.skills} />
```

- [ ] **Step 3: Delete `SkillCard.tsx`**

```bash
rm /home/lap-68/Documents/gt-dp/portfolio/src/components/skills/SkillCard.tsx
```

- [ ] **Step 4: Run the SkillsFinder tests — confirm they pass**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPattern="SkillsFinder"
```

Expected: 6 passing

- [ ] **Step 5: Run the full test suite — confirm no regressions**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```

Expected: 37 existing + 6 new = 43 passing, 0 failing

- [ ] **Step 6: Commit**

```bash
git add src/components/skills/SkillsFinder.tsx src/app/page.tsx
git rm src/components/skills/SkillCard.tsx
git commit -m "feat: scaffold SkillsFinder component — tests passing"
```

---

## Task 4: Add all CSS to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Find the existing skills CSS block and replace it entirely**

Find the block starting at `.skills-grid {` (around line 552) through the end of the `.skill-name` rules. Replace the entire old `.skills-grid` / `.skill-card` / `.skill-icon` / `.skill-name` block with the full SkillsFinder CSS below.

Also find all responsive overrides referencing `.skills-grid` in the media query sections (around lines 1063, 1136, 1189–1194) and delete those too — they are replaced by the new rules below.

**Full CSS to add** (insert in place of the old block):

```css
/* ── SkillsFinder ── */

.skills-finder {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(11, 9, 0, 0.85);
  backdrop-filter: blur(30px) saturate(1.5);
  border: 1px solid rgba(245, 197, 24, 0.15);
  box-shadow: 0 0 50px rgba(245, 197, 24, 0.14),
              0 48px 120px rgba(0, 0, 0, 0.75),
              inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* Titlebar */
.sf-titlebar {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  background: rgba(18, 14, 0, 0.95);
  border-bottom: 1px solid rgba(245, 197, 24, 0.15);
  gap: 14px;
}
.sf-dots { display: flex; gap: 8px; }
.sf-dot { width: 13px; height: 13px; border-radius: 50%; cursor: default; }
.sf-dot-red    { background: #ff5f57; box-shadow: 0 0 8px rgba(255, 95, 87, 0.45); }
.sf-dot-yellow { background: #f5c518; box-shadow: 0 0 8px rgba(245, 197, 24, 0.45); }
.sf-dot-green  { background: #28c840; box-shadow: 0 0 8px rgba(40, 200, 64, 0.35); }
.sf-title-mid {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.sf-title-text {
  font-family: var(--font-instrument-sans), sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
.sf-title-count {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 12px;
  color: rgba(240, 234, 216, 0.48);
  font-style: normal;
}
.sf-view-pills { display: flex; gap: 6px; margin-left: auto; }
.sf-pill {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 4px;
  background: rgba(245, 197, 24, 0.06);
  border: 1px solid rgba(245, 197, 24, 0.15);
  color: rgba(240, 234, 216, 0.5);
  cursor: pointer;
  transition: all 0.18s;
}
.sf-pill:hover {
  background: rgba(245, 197, 24, 0.12);
  color: var(--accent-light);
  border-color: rgba(245, 197, 24, 0.38);
}
.sf-pill-active {
  background: rgba(245, 197, 24, 0.14) !important;
  color: var(--accent) !important;
  border-color: rgba(245, 197, 24, 0.4) !important;
}

/* Body */
.sf-body {
  display: flex;
  height: 480px;
}

/* Sidebar */
.sf-sidebar {
  width: 210px;
  min-width: 210px;
  background: rgba(16, 12, 0, 0.9);
  border-right: 1px solid rgba(245, 197, 24, 0.15);
  padding: 12px 0;
  overflow-y: auto;
}
.sf-sidebar::-webkit-scrollbar { width: 3px; }
.sf-sidebar::-webkit-scrollbar-thumb {
  background: rgba(245, 197, 24, 0.15);
  border-radius: 3px;
}
.sf-sb-label {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(245, 197, 24, 0.3);
  padding: 10px 18px 4px;
}
.sf-sb-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 18px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}
.sf-sb-item:hover { background: rgba(245, 197, 24, 0.06); }
.sf-sb-item-active { background: rgba(245, 197, 24, 0.11); }
.sf-sb-item-active::before {
  content: '';
  position: absolute;
  left: 0; top: 4px; bottom: 4px;
  width: 2.5px;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
}
.sf-sb-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  background: rgba(245, 197, 24, 0.07);
  border: 1px solid rgba(245, 197, 24, 0.14);
  flex-shrink: 0;
  transition: all 0.2s;
}
.sf-sb-item:hover .sf-sb-icon,
.sf-sb-item-active .sf-sb-icon {
  background: rgba(245, 197, 24, 0.14);
  border-color: rgba(245, 197, 24, 0.35);
}
.sf-sb-name {
  font-family: var(--font-instrument-sans), sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(240, 234, 216, 0.48);
  line-height: 1.2;
  transition: color 0.15s;
}
.sf-sb-item:hover .sf-sb-name { color: var(--text-primary); }
.sf-sb-item-active .sf-sb-name { color: var(--accent-light); }
.sf-sb-kind {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px;
  color: rgba(245, 197, 24, 0.3);
  letter-spacing: 0.04em;
  margin-top: 1px;
}
.sf-sb-divider {
  height: 1px;
  background: rgba(245, 197, 24, 0.15);
  margin: 8px 18px;
}

/* Detail panel */
.sf-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 52px;
  position: relative;
  overflow: hidden;
}
.sf-detail::before {
  content: '';
  position: absolute;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 197, 24, 0.1), transparent 70%);
  top: -80px; right: -60px;
  filter: blur(60px);
  pointer-events: none;
}
.sf-detail-header {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 28px;
}
.sf-detail-icon {
  width: 68px;
  height: 68px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: rgba(245, 197, 24, 0.09);
  border: 1px solid rgba(245, 197, 24, 0.25);
  box-shadow: 0 0 30px rgba(245, 197, 24, 0.18);
  flex-shrink: 0;
}
.sf-detail-name {
  font-family: var(--font-dm-serif), serif;
  font-size: 32px;
  color: #fff8e7;
  line-height: 1;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}
.sf-detail-kind {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 11px;
  color: var(--accent);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.sf-detail-desc {
  font-family: var(--font-instrument-sans), sans-serif;
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.75;
  max-width: 480px;
  margin-bottom: 32px;
}

/* Proficiency bar */
.sf-prof-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}
.sf-prof-label {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
  white-space: nowrap;
}
.sf-prof-track {
  flex: 1;
  max-width: 260px;
  height: 6px;
  background: rgba(245, 197, 24, 0.1);
  border-radius: 6px;
  overflow: hidden;
}
.sf-prof-fill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--accent-deep), var(--accent-light));
  box-shadow: 0 0 10px rgba(245, 197, 24, 0.4);
  width: 0;
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.sf-prof-pct {
  font-family: var(--font-dm-serif), serif;
  font-size: 20px;
  color: var(--accent);
  line-height: 1;
}

/* Tags — T3 gold pill (shared by list + grid) */
.sf-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.sf-tag {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--accent);
  color: #0a0700;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
}
.sf-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(245, 197, 24, 0.3);
}

/* Grid view */
.sf-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding: 24px;
  overflow-y: auto;
  align-content: start;
}
.sf-card {
  background: linear-gradient(135deg, rgba(245, 197, 24, 0.11) 0%, rgba(11, 9, 0, 0.92) 55%);
  border: 1px solid rgba(245, 197, 24, 0.22);
  border-radius: 12px;
  padding: 22px 20px 18px;
  cursor: default;
  transition: all 0.2s;
}
.sf-card:hover {
  background: linear-gradient(135deg, rgba(245, 197, 24, 0.17) 0%, rgba(11, 9, 0, 0.92) 55%);
  border-color: rgba(245, 197, 24, 0.42);
  box-shadow: 0 0 36px rgba(245, 197, 24, 0.14);
}
.sf-card-icon { font-size: 24px; display: block; margin-bottom: 12px; }
.sf-card-name {
  font-family: var(--font-dm-serif), serif;
  font-size: 16px;
  color: #fff8e7;
  letter-spacing: -0.3px;
  margin-bottom: 3px;
}
.sf-card-kind {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 9px;
  color: rgba(245, 197, 24, 0.45);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.sf-card-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sf-card-bar-track {
  flex: 1; height: 4px;
  background: rgba(245, 197, 24, 0.1);
  border-radius: 4px; overflow: hidden;
}
.sf-card-bar-fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, var(--accent-deep), var(--accent-light));
}
.sf-card-pct {
  font-family: var(--font-dm-serif), serif;
  font-size: 13px;
  color: var(--accent);
  min-width: 30px;
  text-align: right;
}
.sf-card .sf-tags { gap: 6px; }
.sf-card .sf-tag { font-size: 10px; padding: 4px 11px; }

/* Tab row — mobile only, hidden on desktop */
.sf-tab-row { display: none; }

/* Status bar */
.sf-statusbar {
  padding: 8px 20px;
  background: rgba(16, 12, 0, 0.9);
  border-top: 1px solid rgba(245, 197, 24, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sf-st-left {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px;
  color: var(--text-secondary);
  letter-spacing: 0.06em;
}
.sf-st-right { display: flex; align-items: center; gap: 6px; }
.sf-st-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  animation: sf-blink 2s ease-in-out infinite;
}
.sf-st-text {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px;
  color: var(--text-secondary);
  letter-spacing: 0.06em;
}

@keyframes sf-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}

/* ── SkillsFinder Responsive ── */

@media (max-width: 900px) {
  .sf-sidebar { width: 160px !important; min-width: 160px !important; }
  .sf-detail { padding: 28px 32px !important; }
  .sf-detail-icon { width: 52px !important; height: 52px !important; font-size: 24px !important; border-radius: 12px !important; }
  .sf-detail-name { font-size: 24px !important; }
  .sf-grid { grid-template-columns: repeat(2, 1fr) !important; }
}

@media (max-width: 480px) {
  .sf-body { flex-direction: column !important; height: auto !important; }
  .sf-sidebar { display: none !important; }
  .sf-tab-row {
    display: flex !important;
    background: rgba(14, 11, 0, 0.95);
    border-bottom: 1px solid rgba(245, 197, 24, 0.12);
    overflow-x: auto;
    padding: 0 2px;
  }
  .sf-tab-row::-webkit-scrollbar { display: none; }
  .sf-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .sf-tab:hover { background: rgba(245, 197, 24, 0.05); }
  .sf-tab-active { background: rgba(245, 197, 24, 0.08); }
  .sf-tab-active::after {
    content: '';
    position: absolute;
    bottom: 0; left: 8px; right: 8px;
    height: 2px;
    background: var(--accent);
    border-radius: 2px 2px 0 0;
  }
  .sf-tab-icon { font-size: 18px; line-height: 1; }
  .sf-tab-label {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 8px;
    letter-spacing: 0.06em;
    color: rgba(240, 234, 216, 0.4);
    white-space: nowrap;
  }
  .sf-tab-active .sf-tab-label { color: var(--accent); }
  .sf-detail { padding: 18px 16px !important; justify-content: flex-start !important; }
  .sf-detail-icon { width: 44px !important; height: 44px !important; font-size: 20px !important; }
  .sf-detail-name { font-size: 18px !important; }
  .sf-detail-desc { font-size: 13px; margin-bottom: 20px; }
  .sf-prof-label { display: none; }
  .sf-prof-row { margin-bottom: 20px; }
  .sf-grid { grid-template-columns: 1fr !important; }
}
```

- [ ] **Step 2: Run tests — all must still pass**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```

Expected: 43 passing, 0 failing

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add SkillsFinder CSS — desktop, tablet, mobile"
```

---

## Task 5: Verify locally and run full build

- [ ] **Step 1: Start dev server and visually verify all three breakpoints**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run dev
```

Open `http://localhost:3000` and check:
- Desktop (≥901px): sidebar + detail panel visible, List/Grid toggle works, skill click animates, proficiency bar animates
- Tablet (~768px browser resize): sidebar narrows to 160px, detail padding reduces
- Mobile (~375px browser resize): sidebar gone, tab row appears at top, detail panel below, grid is 1-column

- [ ] **Step 2: Run the full test suite one final time**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```

Expected: 43 passing, 0 failing

- [ ] **Step 3: Run production build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build
```

Expected: Build completes with no errors or type errors

- [ ] **Step 4: Final commit**

```bash
git add -p   # stage any remaining unstaged changes
git commit -m "feat: SkillsFinder complete — Finder window, grid view, responsive"
```
