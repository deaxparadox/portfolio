# Roaming Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static bob animation on project card badges with JS-driven free roaming — badges drift to random positions every 3s with smooth CSS transitions.

**Architecture:** New `RoamingBadges.tsx` client component owns the position state and interval. `ProjectCard.tsx` delegates badge rendering to it. CSS removes `pc-float` keyframe and adds transition instead.

**Tech Stack:** Next.js 16, React 18, TypeScript strict, CSS transitions

---

## File Map

| Action | File |
|---|---|
| **Create** | `src/components/projects/RoamingBadges.tsx` |
| **Modify** | `src/components/projects/ProjectCard.tsx` |
| **Modify** | `src/app/globals.css` |

---

## Task 1: Create RoamingBadges + update ProjectCard + CSS

**Files:**
- Create: `src/components/projects/RoamingBadges.tsx`
- Modify: `src/components/projects/ProjectCard.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create `src/components/projects/RoamingBadges.tsx`**

```tsx
// src/components/projects/RoamingBadges.tsx
'use client'
import { useState, useEffect } from 'react'

interface Position { top: string; left: string }

function randomPos(): Position {
  const top  = (10 + Math.random() * 65).toFixed(1) + '%'
  const left = (5  + Math.random() * 60).toFixed(1) + '%'
  return { top, left }
}

const INITIAL: Position[] = [
  { top: '20%', left: '10%' },
  { top: '48%', left: '8%'  },
  { top: '72%', left: '20%' },
]

export default function RoamingBadges({ badges }: { badges: string[] }) {
  const [positions, setPositions] = useState<Position[]>(INITIAL)

  useEffect(() => {
    const id = setInterval(() => {
      setPositions(badges.map(() => randomPos()))
    }, 3000)
    return () => clearInterval(id)
  }, [badges])

  return (
    <div className="pc-badge-container">
      {badges.map((badge, i) => (
        <span
          key={badge}
          className="pc-badge"
          style={{ top: positions[i]?.top, left: positions[i]?.left }}
        >
          {badge}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Update `ProjectCard.tsx` — remove BADGE_POSITIONS, use RoamingBadges**

Replace the entire file with:

```tsx
// src/components/projects/ProjectCard.tsx
import type { ProjectItem } from '@/data/types'
import RoamingBadges from './RoamingBadges'

const GRADIENTS = [
  'linear-gradient(135deg, rgba(245,197,24,0.13) 0%, rgba(232,144,10,0.07) 50%, rgba(6,5,0,0.3) 100%)',
  'linear-gradient(135deg, rgba(196,154,0,0.11) 0%, rgba(245,197,24,0.08) 50%, rgba(6,5,0,0.3) 100%)',
  'linear-gradient(135deg, rgba(232,144,10,0.13) 0%, rgba(255,216,77,0.07) 50%, rgba(6,5,0,0.3) 100%)',
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
            <a
              href={project.links[0].href}
              className="pc-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.links[0].label}
            </a>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="pc-right">
        <div className="pc-visual" style={{ background: gradient }}>
          <div className="pc-glyph">{project.visual.glyph}</div>
          <RoamingBadges badges={floatingBadges} />
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

- [ ] **Step 3: Update globals.css — swap `pc-float` animation for CSS transition**

In `src/app/globals.css`, find `.pc-badge { ... }` and:
1. Remove the line `animation: pc-float 4s ease-in-out infinite alternate;`
2. Add `transition: top 2s ease-in-out, left 2s ease-in-out;`

Then find `@keyframes pc-float { ... }` and delete the entire block.

The final `.pc-badge` rule should be:

```css
.pc-badge {
  position: absolute;
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(245,197,24,0.12);
  border: 1px solid rgba(245,197,24,0.25);
  color: #ffd84d;
  transition: top 2s ease-in-out, left 2s ease-in-out;
}
```

- [ ] **Step 4: Run tests**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --silent 2>&1 | tail -5
```

Expected: `Tests: 65 passed, 65 total`

- [ ] **Step 5: Run build**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm run build 2>&1 | tail -8
```

Expected: clean build.

- [ ] **Step 6: Commit**

```bash
git -C /home/lap-68/Documents/gt-dp/portfolio add \
  src/components/projects/RoamingBadges.tsx \
  src/components/projects/ProjectCard.tsx \
  src/app/globals.css
git -C /home/lap-68/Documents/gt-dp/portfolio commit -m "feat: roaming badges — JS-driven random positions every 3s"
```
