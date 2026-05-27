# Project Cards — Magazine Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ProjectCard interior with the Magazine Split design — left text panel + right gradient panel with glyph, floating badges, and impact metric.

**Architecture:** Two files only. `ProjectCard.tsx` is rewritten with className-based markup. `globals.css` gets old project-card CSS replaced with magazine split CSS. Sticky-stack scroll behaviour (`ProjectsSection.tsx`, `.stack-cards`, `.stack-item`) is untouched.

**Tech Stack:** Next.js 16, React 18, TypeScript strict, CSS classes in globals.css

**Spec:** `docs/superpowers/specs/2026-05-27-project-cards-magazine-split.md`

---

## File Map

| Action | File |
|---|---|
| **Rewrite** | `src/components/projects/ProjectCard.tsx` |
| **Update** | `src/app/globals.css` — replace old project-card CSS, add magazine split CSS |
| **Create** | `src/__tests__/ProjectCard.test.tsx` |
| **No change** | `src/components/projects/ProjectsSection.tsx` |
| **No change** | Sticky-stack CSS (`.stack-cards`, `.stack-item`) |

---

## Task 1: Write failing tests

**Files:**
- Create: `src/__tests__/ProjectCard.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
// src/__tests__/ProjectCard.test.tsx
import { render, screen } from '@testing-library/react'
import ProjectCard from '@/components/projects/ProjectCard'
import type { ProjectItem } from '@/data/types'

const mockProject: ProjectItem = {
  year: '2024',
  name: 'Vgents',
  description: 'Real-time voice agent platform with WebSocket interaction.',
  tags: ['FastAPI', 'LiveKit', 'Docker', 'PostgreSQL'],
  links: [{ label: 'GitHub →', href: 'https://github.com/test' }],
  visual: {
    glyph: '🎙️',
    stats: [
      { value: 'Real-time', label: 'Voice Streaming', fill: 90 },
      { value: 'Isolated', label: 'Session Security', fill: 95 },
    ],
  },
}

describe('ProjectCard', () => {
  it('renders project name', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText('Vgents')).toBeInTheDocument()
  })

  it('renders eyebrow with correct index and year', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText(/01 · 2024/i)).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText(/Real-time voice agent platform/i)).toBeInTheDocument()
  })

  it('renders all tags', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getAllByText('FastAPI').length).toBeGreaterThan(0)
    expect(screen.getAllByText('LiveKit').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Docker').length).toBeGreaterThan(0)
  })

  it('renders impact value from visual.stats[0]', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText('Real-time')).toBeInTheDocument()
    expect(screen.getByText('Voice Streaming')).toBeInTheDocument()
  })

  it('renders glyph', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText('🎙️')).toBeInTheDocument()
  })

  it('renders correct eyebrow for index 1', () => {
    render(<ProjectCard project={mockProject} index={1} />)
    expect(screen.getByText(/02 · 2024/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPatterns="ProjectCard" --silent 2>&1 | tail -5
```

Expected: tests fail (existing ProjectCard doesn't render the new markup)

- [ ] **Step 3: Commit failing tests**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add src/__tests__/ProjectCard.test.tsx
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "test: add failing ProjectCard magazine split tests"
```

---

## Task 2: Rewrite ProjectCard.tsx

**Files:**
- Rewrite: `src/components/projects/ProjectCard.tsx`

The right-panel gradient and badge positions use inline styles for dynamic values (per-card gradient, absolute badge positions). Everything else uses CSS classes.

- [ ] **Step 1: Replace `ProjectCard.tsx` entirely**

```tsx
// src/components/projects/ProjectCard.tsx
import type { ProjectItem } from '@/data/types'

const GRADIENTS = [
  'linear-gradient(135deg, rgba(245,197,24,0.13) 0%, rgba(232,144,10,0.07) 50%, rgba(6,5,0,0.3) 100%)',
  'linear-gradient(135deg, rgba(196,154,0,0.11) 0%, rgba(245,197,24,0.08) 50%, rgba(6,5,0,0.3) 100%)',
  'linear-gradient(135deg, rgba(232,144,10,0.13) 0%, rgba(255,216,77,0.07) 50%, rgba(6,5,0,0.3) 100%)',
]

const BADGE_POSITIONS = [
  { top: '22%', left: '10%', delay: '0s' },
  { top: '48%', left: '7%',  delay: '0.6s' },
  { top: '70%', left: '18%', delay: '1.2s' },
]

export default function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const num = String(index + 1).padStart(2, '0')
  const gradient = GRADIENTS[index % GRADIENTS.length]
  const floatingBadges = project.tags.slice(0, 3)
  const impact = project.visual.stats[0]

  return (
    <div className="project-card">
      {/* Left panel */}
      <div className="pc-left">
        <div>
          <div className="pc-top-row">
            <div className="pc-meta">
              <div className="pc-eyebrow">{num} · {project.year}</div>
              <div className="pc-title">{project.name}</div>
            </div>
            <div className="pc-ghost" aria-hidden="true">{num}</div>
          </div>
          <p className="pc-desc">{project.description}</p>
        </div>
        <div className="pc-bottom-row">
          <div className="pc-tags">
            {project.tags.map(tag => (
              <span key={tag} className="pc-tag">{tag}</span>
            ))}
          </div>
          {project.links[0] && (
            <a href={project.links[0].href} className="pc-link">
              {project.links[0].label}
            </a>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="pc-right">
        <div className="pc-visual" style={{ background: gradient }}>
          <div className="pc-glyph">{project.visual.glyph}</div>
          <div className="pc-badge-container">
            {floatingBadges.map((badge, i) => (
              <span
                key={badge}
                className="pc-badge"
                style={{
                  top: BADGE_POSITIONS[i].top,
                  left: BADGE_POSITIONS[i].left,
                  animationDelay: BADGE_POSITIONS[i].delay,
                }}
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="pc-impact">
            <span className="pc-impact-value">{impact.value}</span>
            <span className="pc-impact-label">{impact.label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run ProjectCard tests — confirm they pass**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPatterns="ProjectCard" --silent 2>&1 | tail -5
```

Expected: `Tests: 7 passed, 7 total`

- [ ] **Step 3: Run full test suite — confirm no regressions**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --silent 2>&1 | tail -5
```

Expected: `Tests: 65 passed, 65 total` (58 existing + 7 new)

- [ ] **Step 4: Commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add src/components/projects/ProjectCard.tsx
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: rewrite ProjectCard — magazine split layout"
```

---

## Task 3: Update globals.css — magazine split CSS

**Files:**
- Modify: `src/app/globals.css`

Replace the old project-card CSS block (`.project-card` through `.project-visual-stat`) with the new magazine split CSS. The sticky-stack rules (`.stack-cards`, `.stack-item`) are NOT touched.

- [ ] **Step 1: Find the old project-card CSS block**

In `src/app/globals.css`, find the section starting at `.project-card {` (around line 1035) through the end of `.project-visual-stat` rules (around line 1180). Delete this entire block.

Also find and delete any responsive overrides for `.project-card` and `.project-visual` in the media query sections at the bottom of the file.

- [ ] **Step 2: Add the magazine split CSS in its place**

Insert the following CSS where the old block was:

```css
/* ── Project Cards — Magazine Split ── */

.project-card {
  background: rgba(245,197,24,0.055);
  border: 1px solid rgba(245,197,24,0.16);
  border-radius: 20px;
  display: grid;
  grid-template-columns: 1fr 380px;
  min-height: 240px;
  position: relative;
  overflow: hidden;
  transform-origin: 50% 0%;
  will-change: transform;
  cursor: default;
  box-shadow: 0 0 40px rgba(245,197,24,0.15), inset 0 1px 0 rgba(255,255,255,0.04);
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.35s;
}

.project-card:hover {
  transform: translateY(-5px);
  border-color: rgba(245,197,24,0.45);
  box-shadow: 0 0 80px rgba(245,197,24,0.3);
}

.project-card::after {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(245,197,24,0.35), transparent);
}

/* Left panel */
.pc-left {
  padding: 44px 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.pc-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
}

.pc-meta { flex: 1; }

.pc-eyebrow {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px;
  color: rgba(245,197,24,0.70);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.pc-title {
  font-family: var(--font-dm-serif), serif;
  font-size: 44px;
  color: #fff8e7;
  line-height: 0.95;
  letter-spacing: -1px;
}

.pc-ghost {
  font-family: var(--font-dm-serif), serif;
  font-size: 80px;
  color: rgba(245,197,24,0.12);
  line-height: 0.85;
  letter-spacing: -2px;
  user-select: none;
  flex-shrink: 0;
}

.pc-desc {
  font-family: var(--font-instrument-sans), sans-serif;
  font-size: 14px;
  color: rgba(240,234,216,0.55);
  line-height: 1.78;
  max-width: 440px;
  margin: 0 0 26px;
}

.pc-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.pc-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.pc-tag {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.05em;
  padding: 4px 12px;
  border-radius: 4px;
  background: rgba(245,197,24,0.08);
  border: 1px solid rgba(245,197,24,0.20);
  color: #ffd84d;
}

.pc-link {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 11px;
  color: var(--accent);
  text-decoration: none;
  letter-spacing: 0.08em;
  padding: 6px 14px;
  border: 1px solid rgba(245,197,24,0.30);
  border-radius: 3px;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
}

.project-card:hover .pc-link { opacity: 1; }
.pc-link:hover { background: rgba(245,197,24,0.08); }

/* Right panel */
.pc-right {
  border-left: 1px solid rgba(245,197,24,0.12);
  position: relative;
  overflow: hidden;
}

.pc-visual {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-glyph {
  font-size: 100px;
  opacity: 0.18;
  filter: drop-shadow(0 0 30px rgba(245,197,24,0.5));
  transition: opacity 0.3s, transform 0.3s;
  user-select: none;
}

.project-card:hover .pc-glyph {
  opacity: 0.30;
  transform: scale(1.08);
}

.pc-badge-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.pc-badge {
  position: absolute;
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 9px;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(245,197,24,0.12);
  border: 1px solid rgba(245,197,24,0.25);
  color: #ffd84d;
  animation: pc-float 4s ease-in-out infinite alternate;
}

@keyframes pc-float {
  from { transform: translateY(0); }
  to   { transform: translateY(-6px); }
}

.pc-impact {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(245,197,24,0.12);
  border: 1px solid rgba(245,197,24,0.30);
  border-radius: 8px;
  padding: 8px 14px;
}

.pc-impact-value {
  font-family: var(--font-dm-serif), serif;
  font-size: 26px;
  color: var(--accent);
  line-height: 1;
}

.pc-impact-label {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 9px;
  color: rgba(240,234,216,0.50);
  letter-spacing: 0.07em;
  line-height: 1.4;
  display: block;
}

/* ── Responsive ── */

@media (max-width: 900px) {
  .project-card { grid-template-columns: 1fr 280px !important; }
  .pc-glyph { font-size: 80px !important; }
  .pc-ghost { font-size: 60px !important; }
  .pc-title { font-size: 34px !important; }
  .pc-left { padding: 32px 36px !important; }
}

@media (max-width: 480px) {
  .project-card { grid-template-columns: 1fr !important; min-height: auto !important; }
  .pc-right { height: 180px; border-left: none !important; border-top: 1px solid rgba(245,197,24,0.12); }
  .pc-ghost { display: none !important; }
  .pc-badge { display: none !important; }
  .pc-glyph { font-size: 80px !important; }
  .pc-left { padding: 28px 24px !important; }
}
```

- [ ] **Step 3: Run full test suite**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --silent 2>&1 | tail -5
```

Expected: `Tests: 65 passed, 65 total`

- [ ] **Step 4: Run build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build 2>&1 | tail -8
```

Expected: Build completes cleanly.

- [ ] **Step 5: Commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add src/app/globals.css
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: magazine split CSS — project-card layout, responsive"
```

---

## Task 4: Visual verification

- [ ] **Step 1: Start dev server**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run dev
```

- [ ] **Step 2: Open `http://localhost:3000/?mode=full` and verify**

- All 3 cards render with magazine split layout
- Right panel shows gradient background + glyph + floating badges + impact metric
- Hovering a card: lifts 5px, glyph brightens and scales, GitHub link appears
- Sticky-stack scroll: cards stack correctly as you scroll down
- Tablet (~768px): right panel narrows, ghost number shrinks
- Mobile (~375px): single column, right panel stacks below, badges hidden

- [ ] **Step 3: Final commit if any CSS tweaks were needed**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add -p
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "fix: project card visual tweaks after browser check"
```

Only commit if changes were needed. Skip if nothing changed.
