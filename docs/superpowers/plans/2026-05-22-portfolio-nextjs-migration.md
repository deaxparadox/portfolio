# Portfolio Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `template/template-yellow-theme.html` into a Next.js 16 App Router application at `portfolio-app/` with TypeScript, Tailwind CSS v4, and all content driven from `data/portfolio.json`.

**Architecture:** Server-first App Router — static sections are Server Components, interactive parts (Terminal, CustomCursor, Nav scroll, ExpCard slide-in, RevealInit) are isolated Client Components. All content comes from `data/portfolio.json` typed via `data/types.ts`. CSS custom property `--accent` drives the gold palette; defined once in `globals.css`, extended into Tailwind via `@theme`.

**Tech Stack:** Next.js 16.2.6 · TypeScript 5 (strict) · Tailwind CSS v4 · next/font/google · React 19 · Jest + React Testing Library

---

## File Map

```
portfolio-app/
  app/
    layout.tsx               Server — fonts, metadata, background layers, CustomCursor, RevealInit
    page.tsx                 Server — composes all section components
    globals.css              CSS variables (@theme), base resets, all animation/component CSS

  components/
    nav/
      Nav.tsx                Client — sticky nav, active link highlight on scroll
    hero/
      Hero.tsx               Server — two-column hero layout, static content
      Terminal.tsx           Client — interactive terminal (keydown, auto-type, command registry)
    stats/
      StatsStrip.tsx         Server — 4-column stats bar
    skills/
      SkillsSection.tsx      Server — section label + title + skills grid
      SkillCard.tsx          Server — individual glass card
    projects/
      ProjectsSection.tsx    Server — section label + title + sticky-stack list
      ProjectCard.tsx        Server — individual project card (sticky layout is pure CSS)
    experience/
      ExperienceSection.tsx  Server — section label + title + exp list
      ExpCard.tsx            Client — scroll-driven translateX slide-in animation
    contact/
      ContactSection.tsx     Server — email + social links
    footer/
      Footer.tsx             Server — copyright + signature
    ui/
      CustomCursor.tsx       Client — gold dot cursor + lagging ring, event-delegation hover
      RevealInit.tsx         Client — single IntersectionObserver for all .reveal elements
      Tag.tsx                Server — reusable pill tag

  data/
    portfolio.json           Single source of truth for all content
    types.ts                 TypeScript interfaces mirroring the JSON schema

  __tests__/
    types.test.ts            Validates portfolio.json shape matches PortfolioData type
    terminal.test.ts         Unit tests for terminal command lookup + HTML escaping
    Tag.test.tsx             Render test for Tag component
```

---

## Task 1: Scaffold the Next.js app

**Files:**
- Create: `portfolio-app/` (via CLI)
- Delete boilerplate: `portfolio-app/app/page.tsx` content, `portfolio-app/public/next.svg`, `portfolio-app/public/vercel.svg`

- [ ] **Step 1: Run create-next-app from the repo root**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
npx create-next-app@latest portfolio-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

Expected: `portfolio-app/` created with Next.js 16.x, TypeScript, Tailwind v4, ESLint.

- [ ] **Step 2: Verify the scaffold and check Tailwind version**

```bash
cd portfolio-app && cat package.json | grep -E '"tailwindcss|"next'
```

Expected output (approximately):
```
"next": "^16.x.x",
"tailwindcss": "^4.x.x",
```

- [ ] **Step 3: Clear default boilerplate content**

Replace `app/page.tsx` with a minimal placeholder:

```tsx
// app/page.tsx
export default function Home() {
  return <main />
}
```

Delete unused public assets:
```bash
rm -f public/next.svg public/vercel.svg
```

Clear `app/globals.css` — we'll rewrite it entirely in Task 4:
```bash
> app/globals.css
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000` — expect blank page, no console errors. Stop (`Ctrl+C`).

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: scaffold Next.js 16 app with TypeScript and Tailwind v4

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Test tooling setup

**Files:**
- Create: `portfolio-app/jest.config.ts`
- Create: `portfolio-app/jest.setup.ts`
- Modify: `portfolio-app/package.json` (add test script and deps)
- Create: `portfolio-app/__tests__/smoke.test.ts`

- [ ] **Step 1: Install Jest + React Testing Library**

```bash
cd portfolio-app
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest ts-node
```

- [ ] **Step 2: Create jest.config.ts**

```typescript
// portfolio-app/jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 3: Create jest.setup.ts**

```typescript
// portfolio-app/jest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script to package.json**

In `portfolio-app/package.json`, add to `"scripts"`:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Write and run smoke test**

Create `portfolio-app/__tests__/smoke.test.ts`:

```typescript
describe('test environment', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run:
```bash
npm test
```

Expected: `PASS __tests__/smoke.test.ts` — 1 test passes.

- [ ] **Step 6: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: add Jest + React Testing Library test setup

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Data layer — types.ts + portfolio.json

**Files:**
- Create: `portfolio-app/data/types.ts`
- Create: `portfolio-app/data/portfolio.json`
- Create: `portfolio-app/__tests__/types.test.ts`

- [ ] **Step 1: Write the failing types test**

Create `portfolio-app/__tests__/types.test.ts`:

```typescript
import type { PortfolioData } from '@/data/types'
import rawData from '@/data/portfolio.json'

describe('portfolio.json', () => {
  it('satisfies the PortfolioData type at compile time', () => {
    const data: PortfolioData = rawData as PortfolioData
    expect(data.meta.title).toBeTruthy()
    expect(data.hero.name).toBeTruthy()
    expect(Array.isArray(data.skills)).toBe(true)
    expect(data.skills.length).toBeGreaterThan(0)
    expect(Array.isArray(data.projects)).toBe(true)
    expect(data.projects.length).toBeGreaterThan(0)
    expect(Array.isArray(data.experience)).toBe(true)
    expect(data.contact.email).toBeTruthy()
    expect(data.terminal.commands.about).toBeTruthy()
  })

  it('each skill has required fields', () => {
    const data: PortfolioData = rawData as PortfolioData
    data.skills.forEach(skill => {
      expect(skill.icon).toBeTruthy()
      expect(skill.name).toBeTruthy()
      expect(Array.isArray(skill.tags)).toBe(true)
    })
  })

  it('each project has visual stats with fill values 0-100', () => {
    const data: PortfolioData = rawData as PortfolioData
    data.projects.forEach(project => {
      project.visual.stats.forEach(stat => {
        expect(stat.fill).toBeGreaterThanOrEqual(0)
        expect(stat.fill).toBeLessThanOrEqual(100)
      })
    })
  })
})
```

Run:
```bash
npm test __tests__/types.test.ts
```

Expected: **FAIL** — `Cannot find module '@/data/types'`.

- [ ] **Step 2: Create data/types.ts**

```bash
mkdir -p data
```

Create `portfolio-app/data/types.ts`:

```typescript
export interface PortfolioMeta {
  title: string
  description: string
}

export interface PortfolioTheme {
  accentColor: string
}

export interface HeroLink {
  label: string
  href: string
}

export interface HeroData {
  name: string
  badge: string
  titleLines: [string, string, string]
  titleAccentLine: number
  subtitle: string
  ctaPrimary: HeroLink
  ctaSecondary: HeroLink
}

export interface StatItem {
  value: string
  label: string
}

export interface SkillItem {
  icon: string
  name: string
  description: string
  tags: string[]
}

export interface ProjectVisualStat {
  value: string
  label: string
  fill: number
}

export interface ProjectVisual {
  glyph: string
  stats: [ProjectVisualStat, ProjectVisualStat]
}

export interface ProjectLink {
  label: string
  href: string
}

export interface ProjectItem {
  year: string
  name: string
  description: string
  tags: string[]
  links: ProjectLink[]
  visual: ProjectVisual
}

export interface ExperienceItem {
  period: string
  role: string
  company: string
  location: string
  description: string
}

export interface SocialLink {
  label: string
  icon: string
  href: string
}

export interface ContactData {
  heading: string
  email: string
  socials: SocialLink[]
}

export interface FooterData {
  copy: string
  signature: string
}

export interface TerminalCommands {
  about: string[]
  skills: string[]
  projects: string[]
  experience: string[]
  contact: string[]
}

export interface TerminalData {
  intro: string[]
  commands: TerminalCommands
}

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
}
```

- [ ] **Step 3: Create data/portfolio.json**

Create `portfolio-app/data/portfolio.json`:

```json
{
  "meta": {
    "title": "Nitish Kushwaha — Backend & AI Engineer",
    "description": "Python Backend Developer building scalable APIs, AI agents, and real-time voice systems with Django, FastAPI, and LangGraph."
  },
  "theme": {
    "accentColor": "#e8c84a"
  },
  "hero": {
    "name": "Nitish Kushwaha",
    "badge": "Available for work",
    "titleLines": ["Backend", "& AI", "Engineer"],
    "titleAccentLine": 1,
    "subtitle": "Python Backend Developer with 3+ years of Linux and cloud experience, building scalable APIs, AI agents, and real-time voice systems with Django, FastAPI, and LangGraph.",
    "ctaPrimary": { "label": "View Projects →", "href": "#projects" },
    "ctaSecondary": { "label": "Let's Talk", "href": "#contact" }
  },
  "stats": [
    { "value": "3+", "label": "Years Experience" },
    { "value": "1+", "label": "Year Professional" },
    { "value": "60%", "label": "Automation Boost" },
    { "value": "3", "label": "Cloud Platforms" }
  ],
  "skills": [
    {
      "icon": "⚡",
      "name": "AI & GenAI",
      "description": "LLM-driven workflows, document pipelines, and intelligent agents. Prompt engineering from few-shot to iterative refinement.",
      "tags": ["LangGraph", "LangChain", "OpenAI", "RAG", "Prompt Engineering"]
    },
    {
      "icon": "🐍",
      "name": "Backend APIs",
      "description": "RESTful APIs built for scale with authentication, caching, and clean architecture using Python frameworks.",
      "tags": ["FastAPI", "Django", "DRF", "Flask", "REST"]
    },
    {
      "icon": "🎙️",
      "name": "Voice & Realtime",
      "description": "Real-time voice agents with session isolation, SIP telephony integration, and WebSocket-based low-latency communication.",
      "tags": ["LiveKit", "Twilio SIP", "WebSockets", "Django Channels"]
    },
    {
      "icon": "🗄️",
      "name": "Databases",
      "description": "Schema design, query optimisation, and picking the right store — from relational to vector to in-memory.",
      "tags": ["PostgreSQL", "Redis", "Snowflake", "Supabase", "SQLite"]
    },
    {
      "icon": "☁️",
      "name": "DevOps & Cloud",
      "description": "Containerised deployments across AWS, Azure, and GCP. Nginx reverse proxy, SSL, and Linux server management.",
      "tags": ["Docker", "Nginx", "AWS", "Azure", "GCP", "Linux"]
    },
    {
      "icon": "🔷",
      "name": "Frontend & Tools",
      "description": "Full-stack capable — building interfaces and integrating tooling when the backend story requires it.",
      "tags": ["Next.js", "TypeScript", "TailwindCSS", "Git", "Selenium"]
    }
  ],
  "projects": [
    {
      "year": "2024",
      "name": "Vgents",
      "description": "Real-time voice agent platform supporting multiple personas and concurrent user sessions using LiveKit. Strict session isolation with secure single-use token auth and WebSocket-based low-latency interaction.",
      "tags": ["FastAPI", "LiveKit", "Docker", "PostgreSQL", "Next.js"],
      "links": [{ "label": "GitHub →", "href": "#" }],
      "visual": {
        "glyph": "🎙️",
        "stats": [
          { "value": "Real-time", "label": "Voice Streaming", "fill": 90 },
          { "value": "Isolated", "label": "Session Security", "fill": 95 }
        ]
      }
    },
    {
      "year": "2024",
      "name": "NeuroWrite",
      "description": "AI-driven document pipeline extracting structured medical insights from assessment reports. Hybrid extraction — AWS Textract for image-based PDFs, standard libraries for text. Auto-generates formatted medical reports.",
      "tags": ["Django", "LangGraph", "AWS Textract", "Python"],
      "links": [{ "label": "GitHub →", "href": "#" }],
      "visual": {
        "glyph": "🧠",
        "stats": [
          { "value": "60%", "label": "Processing Time Saved", "fill": 60 },
          { "value": "Hybrid", "label": "PDF Extraction", "fill": 85 }
        ]
      }
    },
    {
      "year": "2024",
      "name": "Aounder",
      "description": "AI-powered Co-Founder Assistant with LangGraph agents for idea brainstorming, validation, and startup mentorship. Async processing with Django Channels, real-time agent tracking via Redis.",
      "tags": ["Django", "LangGraph", "Channels", "Docker", "Redis"],
      "links": [{ "label": "GitHub →", "href": "#" }],
      "visual": {
        "glyph": "🚀",
        "stats": [
          { "value": "3", "label": "Agent Types", "fill": 75 },
          { "value": "WS", "label": "Real-time Tracking", "fill": 88 }
        ]
      }
    }
  ],
  "experience": [
    {
      "period": "Jan 2025\n—\nPresent",
      "role": "Python Developer",
      "company": "Excellence Technologies",
      "location": "Gurugram, IN",
      "description": "Built e-commerce APIs with Django REST Framework, Redis caching, and LangGraph AI agents automating document pipelines. Implemented voice workflows with LiveKit and Twilio SIP. Deployed across AWS, Azure, and GCP with Nginx and SSL."
    }
  ],
  "contact": {
    "heading": "Have a project in mind?",
    "email": "nitish000000kushwaha@gmail.com",
    "socials": [
      { "label": "GitHub", "icon": "⌥", "href": "https://github.com/deaxparadox" },
      { "label": "LinkedIn", "icon": "⊞", "href": "https://linkedin.com/in/deaxparadox" },
      { "label": "Resume.pdf", "icon": "◉", "href": "#" }
    ]
  },
  "footer": {
    "copy": "© 2026 Nitish Kushwaha — All Rights Reserved",
    "signature": "Crafted with precision"
  },
  "terminal": {
    "intro": [
      "  nitish-kushwaha portfolio v1.0.0",
      "  type a command and press enter",
      ""
    ],
    "commands": {
      "about": [
        "",
        "  Nitish Kushwaha  //  Backend & AI Engineer",
        "",
        "  Based in     Gurugram, Haryana, India",
        "  Focus        AI agents, voice systems & scalable APIs",
        "  Exp          3+ years Linux & cloud · 1+ year professional",
        "  Stack        Python, Django, FastAPI, LangGraph, LiveKit",
        "  Status       Available for new projects",
        ""
      ],
      "skills": [
        "",
        "  AI & GenAI",
        "  LangGraph  LangChain  OpenAI  RAG  Prompt Engineering  Pinecone",
        "",
        "  Backend",
        "  FastAPI  Django  DRF  Flask  REST  WebSockets",
        "",
        "  Voice & Realtime",
        "  LiveKit  Twilio SIP  Django Channels",
        "",
        "  Databases",
        "  PostgreSQL  Redis  Snowflake  Supabase  SQLite",
        "",
        "  DevOps & Cloud",
        "  Docker  Nginx  AWS  Azure  GCP  Linux  SSL/TLS",
        ""
      ],
      "projects": [
        "",
        "  01  Vgents",
        "  Real-time voice agents · LiveKit · concurrent sessions",
        "  FastAPI · Docker · PostgreSQL · Next.js",
        "",
        "  02  NeuroWrite",
        "  AI document pipeline · 60% time saved · medical reports",
        "  Django · LangGraph · AWS Textract",
        "",
        "  03  Aounder",
        "  AI Co-Founder Assistant · 3 agent types · real-time WS",
        "  Django · LangGraph · Channels · Docker · Redis",
        ""
      ],
      "experience": [
        "",
        "  Excellence Technologies  Jan 2025 - Present",
        "  Python Developer · Gurugram",
        "  e-commerce APIs · LangGraph agents · LiveKit voice",
        "  Snowflake · AWS · Azure · GCP · Nginx",
        ""
      ],
      "contact": [
        "",
        "  Let's work together",
        "",
        "  Email       nitish000000kushwaha@gmail.com",
        "  GitHub      github.com/deaxparadox",
        "  LinkedIn    linkedin.com/in/deaxparadox",
        "",
        "  Open to full-time, contract & consulting.",
        ""
      ]
    }
  }
}
```

- [ ] **Step 4: Run the types test — expect pass**

```bash
npm test __tests__/types.test.ts
```

Expected: `PASS __tests__/types.test.ts` — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: add typed data layer — portfolio.json + types.ts

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: globals.css — CSS variables, Tailwind theme, all component styles

**Files:**
- Modify: `portfolio-app/app/globals.css`

- [ ] **Step 1: Write globals.css**

Create `portfolio-app/app/globals.css`:

```css
@import "tailwindcss";

/* ── Tailwind v4 theme extension ── */
@theme {
  --color-accent: var(--accent);
  --color-accent-light: var(--accent-light);
  --color-accent-pale: var(--accent-pale);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-bg-dark: var(--bg-dark);
  --breakpoint-mobile: 900px;
}

/* ── CSS custom properties ── */
:root {
  --accent: #e8c84a;
  --accent-light: #f5e07a;
  --accent-pale: #fdf3c0;
  --accent-deep: #c9ad20;
  --glass-bg: rgba(255, 240, 120, 0.07);
  --glass-border: rgba(232, 200, 74, 0.25);
  --glass-hover: rgba(255, 240, 120, 0.14);
  --text-primary: #fef9e3;
  --text-secondary: rgba(254, 249, 227, 0.6);
  --text-muted: rgba(254, 249, 227, 0.35);
  --bg-dark: #0a0900;
  --bg-mid: #0f0e01;
  --shadow-gold: 0 0 40px rgba(232, 200, 74, 0.12);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  font-family: var(--font-instrument-sans), sans-serif;
  background: var(--bg-dark);
  color: var(--text-primary);
  overflow-x: hidden;
  cursor: none;
}

/* ── Keyframes ── */
@keyframes navIn {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(74, 219, 110, 0.5); }
  50%       { box-shadow: 0 0 0 6px rgba(74, 219, 110, 0); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* ── Custom cursor ── */
.cursor {
  position: fixed;
  width: 12px; height: 12px;
  background: var(--accent);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
  mix-blend-mode: screen;
}
.cursor-ring {
  position: fixed;
  width: 36px; height: 36px;
  border: 1px solid rgba(232, 200, 74, 0.5);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}
.cursor.hover  { width: 20px; height: 20px; }
.cursor-ring.hover { width: 54px; height: 54px; border-color: rgba(232, 200, 74, 0.8); }

/* ── Scroll reveal ── */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.reveal.visible { opacity: 1; transform: translateY(0); }

/* ── Section label ── */
.section-label {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 0.68rem;
  color: var(--accent);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-label::before {
  content: '';
  display: inline-block;
  width: 30px; height: 1px;
  background: var(--accent);
}

/* ── Tag ── */
.tag {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 0.65rem;
  background: rgba(232, 200, 74, 0.08);
  border: 1px solid rgba(232, 200, 74, 0.18);
  color: var(--accent-light);
  padding: 4px 12px;
  border-radius: 100px;
  letter-spacing: 0.06em;
  display: inline-block;
}

/* ── Terminal ── */
.terminal-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  overflow: hidden;
  box-shadow: var(--shadow-gold), inset 0 1px 0 rgba(255, 240, 120, 0.1);
  position: relative;
}
.terminal-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  background: rgba(232, 200, 74, 0.05);
  border-bottom: 1px solid var(--glass-border);
}
.t-dot { width: 10px; height: 10px; border-radius: 50%; }
.t-dot.r { background: #ff5f57; }
.t-dot.y { background: #febc2e; }
.t-dot.g { background: #28c840; }
.terminal-body {
  padding: 20px 22px 22px;
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 0.75rem;
  line-height: 1.8;
  height: 360px;
  overflow-y: auto;
  overflow-x: hidden;
  cursor: text;
  scrollbar-width: thin;
  scrollbar-color: rgba(232,200,74,0.2) transparent;
}
.terminal-body::-webkit-scrollbar { width: 4px; }
.terminal-body::-webkit-scrollbar-thumb { background: rgba(232,200,74,0.2); border-radius: 2px; }
.t-line {
  display: block;
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 1.8em;
}
.t-caret {
  display: inline-block;
  width: 7px;
  height: 0.85em;
  background: var(--accent);
  vertical-align: text-bottom;
  margin-left: 1px;
  animation: blink 1s step-end infinite;
}

/* ── Skill cards ── */
.skill-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 30px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}
.skill-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(232,200,74,0.06) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.skill-card:hover {
  border-color: rgba(232, 200, 74, 0.45);
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 30px rgba(232,200,74,0.1);
}
.skill-card:hover::before { opacity: 1; }

/* ── Project sticky stack (pure CSS) ── */
.stack-cards {
  --card-offset: 36px;
  list-style: none;
  padding: 0;
  padding-bottom: calc(var(--numcards, 3) * var(--card-offset));
  margin: 0 auto;
  max-width: 960px;
}
.stack-item {
  position: sticky;
  top: 80px;
  padding-top: calc(var(--index, 1) * var(--card-offset));
}
.stack-item:nth-child(1) { --index: 1; }
.stack-item:nth-child(2) { --index: 2; }
.stack-item:nth-child(3) { --index: 3; }

.project-card {
  background: #0e0d01;
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 50px 52px;
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 40px;
  align-items: center;
  min-height: 400px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 -2px 0 0 rgba(232,200,74,0.06),
    0 30px 80px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,240,120,0.07);
}
.project-card::after {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232,200,74,0.35), transparent);
}
.project-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(232,200,74,0.05) 0%, transparent 55%);
  pointer-events: none;
}

/* ── Experience cards ── */
.exp-stack {
  --exp-offset: 28px;
  list-style: none;
  padding: 0;
  padding-bottom: calc(var(--exp-count, 1) * var(--exp-offset));
  margin: 0;
}
.exp-sticky {
  position: sticky;
  top: 100px;
  padding-top: calc(var(--index, 1) * var(--exp-offset));
}
.exp-sticky:nth-child(1) { --index: 1; }
.exp-sticky:nth-child(2) { --index: 2; }
.exp-sticky:nth-child(3) { --index: 3; }
.exp-clip { overflow: hidden; }
.exp-card {
  background: #0e0d01;
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 200px;
  box-shadow: 0 30px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,240,120,0.06);
  transform: translateX(100%);
  will-change: transform;
  position: relative;
}
.exp-card::before {
  content: '';
  position: absolute;
  top: 0; left: 15%; right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232,200,74,0.3), transparent);
  pointer-events: none;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  nav { padding: 20px 24px !important; }
  .nav-links { display: none !important; }
  .hero-inner { grid-template-columns: 1fr !important; gap: 50px !important; }
  .skills-grid { grid-template-columns: 1fr !important; }
  .project-card { grid-template-columns: 1fr !important; }
  .project-visual { display: none !important; }
  .exp-card { grid-template-columns: 1fr !important; }
  footer { flex-direction: column !important; gap: 10px !important; text-align: center !important; }
}
```

- [ ] **Step 2: Verify build**

```bash
cd portfolio-app && npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app/app/globals.css
git commit -m "feat: port all template CSS into globals.css with Tailwind v4 theme

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: layout.tsx + background layers + CustomCursor + RevealInit

**Files:**
- Modify: `portfolio-app/app/layout.tsx`
- Create: `portfolio-app/components/ui/CustomCursor.tsx`
- Create: `portfolio-app/components/ui/RevealInit.tsx`

- [ ] **Step 1: Create CustomCursor.tsx**

```bash
mkdir -p portfolio-app/components/ui
```

Create `portfolio-app/components/ui/CustomCursor.tsx`:

```tsx
'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const ring   = ringRef.current
    if (!cursor || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      cursor.style.left = mx + 'px'
      cursor.style.top  = my + 'px'
    }

    const animRing = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      ring.style.left = rx + 'px'
      ring.style.top  = ry + 'px'
      rafId = requestAnimationFrame(animRing)
    }
    rafId = requestAnimationFrame(animRing)
    document.addEventListener('mousemove', onMouseMove)

    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button, .skill-card, .project-card')) {
        cursor.classList.add('hover'); ring.classList.add('hover')
      }
    }
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button, .skill-card, .project-card')) {
        cursor.classList.remove('hover'); ring.classList.remove('hover')
      }
    }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="cursor" />
      <div ref={ringRef}   className="cursor-ring" />
    </>
  )
}
```

- [ ] **Step 2: Create RevealInit.tsx**

Create `portfolio-app/components/ui/RevealInit.tsx`:

```tsx
'use client'
import { useEffect } from 'react'

export default function RevealInit() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80)
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return null
}
```

- [ ] **Step 3: Write layout.tsx**

Replace `portfolio-app/app/layout.tsx` entirely:

```tsx
import type { Metadata } from 'next'
import { DM_Serif_Display, JetBrains_Mono, Instrument_Sans } from 'next/font/google'
import './globals.css'
import CustomCursor from '@/components/ui/CustomCursor'
import RevealInit   from '@/components/ui/RevealInit'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jetbrains-mono',
})
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-instrument-sans',
})

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Inject accent color from portfolio.json as a CSS variable override */}
        <style>{`:root { --accent: ${data.theme.accentColor}; }`}</style>
      </head>
      <body className={`${dmSerif.variable} ${jetbrainsMono.variable} ${instrumentSans.variable}`}>
        <CustomCursor />
        <RevealInit />

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

        <div className="relative z-[2]">{children}</div>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
cd portfolio-app && npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: add layout, background layers, CustomCursor, RevealInit

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Tag + Nav

**Files:**
- Create: `portfolio-app/components/ui/Tag.tsx`
- Create: `portfolio-app/__tests__/Tag.test.tsx`
- Create: `portfolio-app/components/nav/Nav.tsx`

- [ ] **Step 1: Write failing Tag test**

Create `portfolio-app/__tests__/Tag.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import Tag from '@/components/ui/Tag'

describe('Tag', () => {
  it('renders the label text', () => {
    render(<Tag>LangGraph</Tag>)
    expect(screen.getByText('LangGraph')).toBeInTheDocument()
  })

  it('applies the tag CSS class', () => {
    const { container } = render(<Tag>FastAPI</Tag>)
    expect(container.firstChild).toHaveClass('tag')
  })
})
```

Run:
```bash
npm test __tests__/Tag.test.tsx
```

Expected: **FAIL** — `Cannot find module '@/components/ui/Tag'`.

- [ ] **Step 2: Create Tag.tsx**

Create `portfolio-app/components/ui/Tag.tsx`:

```tsx
export default function Tag({ children }: { children: string }) {
  return <span className="tag">{children}</span>
}
```

- [ ] **Step 3: Run Tag test — expect pass**

```bash
npm test __tests__/Tag.test.tsx
```

Expected: `PASS` — 2 tests pass.

- [ ] **Step 4: Create Nav.tsx**

```bash
mkdir -p portfolio-app/components/nav
```

Create `portfolio-app/components/nav/Nav.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import type { PortfolioData } from '@/data/types'

const NAV_IDS = ['skills', 'projects', 'experience', 'contact'] as const

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
    <nav
      className="nav-links"
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
  )
}
```

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: add Tag component and Nav with active scroll tracking

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Hero + Terminal

**Files:**
- Create: `portfolio-app/components/hero/Hero.tsx`
- Create: `portfolio-app/components/hero/Terminal.tsx`
- Create: `portfolio-app/__tests__/terminal.test.ts`

**Security note:** The terminal uses `dangerouslySetInnerHTML` to render coloured output lines from `portfolio.json` (static, controlled content). User-typed commands are HTML-escaped before being concatenated into any HTML string, preventing XSS.

- [ ] **Step 1: Write failing terminal command test**

Create `portfolio-app/__tests__/terminal.test.ts`:

```typescript
import type { TerminalData } from '@/data/types'
import portfolioData from '@/data/portfolio.json'

const termData = portfolioData.terminal as TerminalData

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getCommandOutput(data: TerminalData, cmd: string): string[] | null {
  const key = cmd.trim().toLowerCase() as keyof typeof data.commands
  return key in data.commands ? data.commands[key] : null
}

describe('terminal command registry', () => {
  it('returns lines for "about"', () => {
    const output = getCommandOutput(termData, 'about')
    expect(output).not.toBeNull()
    expect(output!.length).toBeGreaterThan(0)
  })

  it('returns lines for all standard commands', () => {
    ['about', 'skills', 'projects', 'experience', 'contact'].forEach(cmd => {
      expect(getCommandOutput(termData, cmd)).not.toBeNull()
    })
  })

  it('returns null for unknown commands', () => {
    expect(getCommandOutput(termData, 'unknown')).toBeNull()
  })

  it('is case-insensitive via toLowerCase', () => {
    expect(getCommandOutput(termData, 'ABOUT')).not.toBeNull()
  })
})

describe('escapeHtml', () => {
  it('escapes < and > to prevent XSS in terminal input echo', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
  })

  it('escapes & in user input', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })

  it('passes through normal text unchanged', () => {
    expect(escapeHtml('about')).toBe('about')
  })
})
```

Run:
```bash
npm test __tests__/terminal.test.ts
```

Expected: `PASS` — 7 tests pass (the logic is tested directly against portfolio.json).

- [ ] **Step 2: Create Terminal.tsx**

```bash
mkdir -p portfolio-app/components/hero
```

Create `portfolio-app/components/hero/Terminal.tsx`:

```tsx
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import type { TerminalData } from '@/data/types'

interface Line { id: number; html: string }

/* Escape user input before embedding in HTML strings */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const gold  = (s: string) => `<span style="color:#e8c84a">${s}</span>`
const cyan  = (s: string) => `<span style="color:#a8d8ea">${s}</span>`
const green = (s: string) => `<span style="color:#9de99d">${s}</span>`
const dim   = (s: string) => `<span style="color:rgba(254,249,227,0.28)">${s}</span>`
const muted = (s: string) => `<span style="color:rgba(254,249,227,0.5)">${s}</span>`
const white = (s: string) => `<span style="color:#fef9e3">${s}</span>`
const red   = (s: string) => `<span style="color:#ff6b6b">${s}</span>`

function buildHelpLines(): string[] {
  return [
    '',
    gold('  Available commands:'), '',
    `  ${cyan('about')}       ${dim('->')}  Who I am`,
    `  ${cyan('skills')}      ${dim('->')}  Tech stack &amp; expertise`,
    `  ${cyan('projects')}    ${dim('->')}  Selected work`,
    `  ${cyan('experience')}  ${dim('->')}  Work history`,
    `  ${cyan('contact')}     ${dim('->')}  Get in touch`,
    `  ${cyan('clear')}       ${dim('->')}  Clear terminal`,
    '',
  ]
}

function colourDataLine(raw: string): string {
  if (raw.includes('Available for new projects')) {
    return raw.replace('Available for new projects', green('● Available for new projects'))
  }
  if (/^  \w[\w& ]+  \/\/ /.test(raw)) {
    const [head, ...rest] = raw.split('  //')
    return gold(head) + muted('  //' + rest.join('  //'))
  }
  return raw
}

export default function Terminal({ data }: { data: TerminalData }) {
  const [lines, setLines]       = useState<Line[]>([])
  const [inputBuf, setInputBuf] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [title, setTitle]       = useState('~/nitish-kushwaha')
  const bodyRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef    = useRef(0)

  const addLine = useCallback((html: string) => {
    setLines(prev => [...prev, { id: ++idRef.current, html }])
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const executeCommand = useCallback((cmd: string) => {
    const key = cmd.trim().toLowerCase() as keyof typeof data.commands
    setIsTyping(true)

    if (key === 'clear') {
      setLines([]); setInputBuf(''); setIsTyping(false)
      return
    }

    const outputLines: string[] =
      key === 'help'
        ? buildHelpLines()
        : key in data.commands
          ? data.commands[key].map(colourDataLine)
          : [`  ${red('command not found: ')}${white(esc(cmd))}  ${dim('(type help)')}`, '']

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
  }, [data.commands, addLine])

  /* Boot sequence — auto-types "help" on mount */
  useEffect(() => {
    const t = setTimeout(() => {
      setTitle('~/nitish-kushwaha -- interactive')
      data.intro.forEach((line, i) =>
        setTimeout(() => addLine(muted(line)), 100 + i * 60)
      )
      const chars = 'help'.split('')
      let buf = ''
      chars.forEach((ch, i) =>
        setTimeout(() => { buf += ch; setInputBuf(buf) }, 600 + i * 100)
      )
      setTimeout(() => {
        setInputBuf('')
        addLine(gold('$ ') + `<span style="color:#a8d8ea">help</span>`)
        executeCommand('help')
      }, 600 + chars.length * 100 + 350)
    }, 900)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isTyping) return
    if (e.key === 'Enter') {
      const cmd = inputBuf
      addLine(gold('$ ') + `<span style="color:#a8d8ea">${esc(cmd)}</span>`)
      setInputBuf('')
      executeCommand(cmd)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      setInputBuf(p => p.slice(0, -1))
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault(); setLines([]); setInputBuf('')
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setInputBuf(p => p + e.key)
    }
  }

  return (
    <div className="terminal-card" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-bar">
        <span className="t-dot r" /><span className="t-dot y" /><span className="t-dot g" />
        <span style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '0.68rem', color: 'var(--text-muted)',
          marginLeft: '8px', letterSpacing: '0.06em',
        }}>
          {title}
        </span>
      </div>

      <div ref={bodyRef} className="terminal-body">
        {lines.map(line => (
          <div
            key={line.id}
            className="t-line"
            dangerouslySetInnerHTML={{ __html: line.html }}
          />
        ))}
        {/* Active input line — no dangerouslySetInnerHTML; input is React-controlled */}
        <div className="t-line">
          <span dangerouslySetInnerHTML={{ __html: gold('$ ') }} />
          <span style={{ color: '#a8d8ea' }}>{inputBuf}</span>
          {!isTyping && <span className="t-caret" />}
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        onKeyDown={handleKeyDown}
        onChange={() => {/* controlled via keydown */}}
        value=""
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Create Hero.tsx**

Create `portfolio-app/components/hero/Hero.tsx`:

```tsx
import Terminal from './Terminal'
import type { PortfolioData } from '@/data/types'

export default function Hero({ data }: { data: PortfolioData }) {
  const { hero, terminal } = data
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '120px 60px 80px', position: 'relative',
    }}>
      <div className="hero-inner" style={{
        maxWidth: '1200px', margin: '0 auto', width: '100%',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '80px', alignItems: 'center',
      }}>
        <div>
          {/* Badge */}
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

          {/* Title */}
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

          {/* Subtitle */}
          <p style={{
            marginTop: '28px', fontSize: '1.05rem', lineHeight: 1.75,
            color: 'var(--text-secondary)', maxWidth: '460px',
            animation: 'fadeUp 0.8s ease 0.7s both',
          }}>
            {hero.subtitle}
          </p>

          {/* CTAs */}
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

        <div style={{ animation: 'fadeUp 0.8s ease 0.6s both' }}>
          <Terminal data={terminal} />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
cd portfolio-app && npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: add Hero layout and interactive Terminal with XSS-safe input escaping

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: StatsStrip + SkillsSection

**Files:**
- Create: `portfolio-app/components/stats/StatsStrip.tsx`
- Create: `portfolio-app/components/skills/SkillCard.tsx`
- Create: `portfolio-app/components/skills/SkillsSection.tsx`

- [ ] **Step 1: Create StatsStrip.tsx**

```bash
mkdir -p portfolio-app/components/stats portfolio-app/components/skills
```

Create `portfolio-app/components/stats/StatsStrip.tsx`:

```tsx
import type { StatItem } from '@/data/types'

export default function StatsStrip({ stats }: { stats: StatItem[] }) {
  return (
    <div style={{
      borderTop: '1px solid rgba(232,200,74,0.08)',
      borderBottom: '1px solid rgba(232,200,74,0.08)',
      padding: '40px 60px', display: 'flex', justifyContent: 'center',
    }}>
      {stats.map((stat, i) => (
        <div key={i} style={{
          flex: 1, textAlign: 'center', padding: '0 40px', maxWidth: '220px',
          borderRight: i < stats.length - 1 ? '1px solid rgba(232,200,74,0.08)' : 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-dm-serif), serif',
            fontSize: '3rem', color: 'var(--accent)', lineHeight: 1, display: 'block',
          }}>
            {stat.value}
          </span>
          <span style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '0.68rem', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            marginTop: '8px', display: 'block',
          }}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create SkillCard.tsx**

Create `portfolio-app/components/skills/SkillCard.tsx`:

```tsx
import Tag from '@/components/ui/Tag'
import type { SkillItem } from '@/data/types'

export default function SkillCard({ skill }: { skill: SkillItem }) {
  return (
    <div className="skill-card reveal">
      <span style={{ fontSize: '1.8rem', marginBottom: '16px', display: 'block' }}>
        {skill.icon}
      </span>
      <div style={{
        fontFamily: 'var(--font-dm-serif), serif',
        fontSize: '1.2rem', marginBottom: '12px',
      }}>
        {skill.name}
      </div>
      <p style={{
        fontSize: '0.85rem', color: 'var(--text-secondary)',
        lineHeight: 1.6, marginBottom: '20px',
      }}>
        {skill.description}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {skill.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create SkillsSection.tsx**

Create `portfolio-app/components/skills/SkillsSection.tsx`:

```tsx
import SkillCard from './SkillCard'
import type { SkillItem } from '@/data/types'

export default function SkillsSection({ skills }: { skills: SkillItem[] }) {
  return (
    <section id="skills" style={{ padding: '100px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-label reveal">Capabilities</div>
        <h2 className="reveal" style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '60px',
        }}>
          What I Build
        </h2>
        <div className="skills-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
        }}>
          {skills.map(skill => <SkillCard key={skill.name} skill={skill} />)}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: add StatsStrip and Skills section

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Projects section

**Files:**
- Create: `portfolio-app/components/projects/ProjectCard.tsx`
- Create: `portfolio-app/components/projects/ProjectsSection.tsx`

Note: sticky stacking is pure CSS — no client JS needed; both components are Server Components.

- [ ] **Step 1: Create ProjectCard.tsx**

```bash
mkdir -p portfolio-app/components/projects
```

Create `portfolio-app/components/projects/ProjectCard.tsx`:

```tsx
import Tag from '@/components/ui/Tag'
import type { ProjectItem } from '@/data/types'

export default function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <div className="project-card">
      <div style={{
        position: 'absolute', top: '24px', right: '32px',
        fontFamily: 'var(--font-dm-serif), serif',
        fontSize: '6rem', color: 'rgba(232,200,74,0.04)',
        lineHeight: 1, userSelect: 'none',
      }}>
        {num}
      </div>

      <div>
        <div style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '0.65rem', color: 'var(--accent)',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ display: 'inline-block', width: '24px', height: '1px', background: 'var(--accent)' }} />
          {project.year}
        </div>

        <div style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: '2.4rem', lineHeight: 1.05,
          letterSpacing: '-0.02em', marginBottom: '16px',
        }}>
          {project.name}
        </div>

        <p style={{
          fontSize: '0.9rem', color: 'var(--text-secondary)',
          lineHeight: 1.75, marginBottom: '28px',
        }}>
          {project.description}
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {project.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
          {project.links.map(link => (
            <a key={link.label} href={link.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '0.68rem', color: 'var(--accent)', textDecoration: 'none',
              letterSpacing: '0.06em', border: '1px solid rgba(232,200,74,0.3)',
              padding: '7px 16px', borderRadius: '3px', transition: 'all 0.3s ease',
            }}>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Visual stats panel */}
      <div className="project-visual" style={{
        background: 'rgba(232,200,74,0.03)',
        border: '1px solid rgba(232,200,74,0.09)',
        borderRadius: '10px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '24px', gap: '20px', alignSelf: 'stretch',
      }}>
        <div style={{ fontSize: '3rem', lineHeight: 1 }}>{project.visual.glyph}</div>
        <div>
          {project.visual.stats.map((stat, i) => (
            <div key={i} style={i > 0 ? { marginTop: '16px' } : {}}>
              <span style={{
                fontFamily: 'var(--font-dm-serif), serif',
                fontSize: '2.4rem', color: 'var(--accent)', lineHeight: 1, display: 'block',
              }}>
                {stat.value}
              </span>
              <span style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                fontSize: '0.6rem', color: 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginTop: '4px',
              }}>
                {stat.label}
              </span>
              <div style={{
                height: '2px', background: 'rgba(232,200,74,0.1)',
                borderRadius: '2px', overflow: 'hidden', marginTop: '6px',
              }}>
                <div style={{
                  height: '100%', width: `${stat.fill}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                  borderRadius: '2px',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ProjectsSection.tsx**

Create `portfolio-app/components/projects/ProjectsSection.tsx`:

```tsx
import ProjectCard from './ProjectCard'
import type { ProjectItem } from '@/data/types'

export default function ProjectsSection({ projects }: { projects: ProjectItem[] }) {
  return (
    <section id="projects" style={{ padding: '100px 60px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-label reveal">Work</div>
        <h2 className="reveal" style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '60px',
        }}>
          Selected Projects
        </h2>
        <ul
          className="stack-cards"
          style={{ ['--numcards' as string]: projects.length }}
        >
          {projects.map((project, i) => (
            <li key={project.name} className="stack-item">
              <ProjectCard project={project} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: add Projects section with pure-CSS sticky stack

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Experience section

**Files:**
- Create: `portfolio-app/components/experience/ExpCard.tsx`
- Create: `portfolio-app/components/experience/ExperienceSection.tsx`

- [ ] **Step 1: Create ExpCard.tsx**

```bash
mkdir -p portfolio-app/components/experience
```

Create `portfolio-app/components/experience/ExpCard.tsx`:

```tsx
'use client'
import { useRef, useEffect } from 'react'
import type { ExperienceItem } from '@/data/types'

export default function ExpCard({ exp, index }: { exp: ExperienceItem; index: number }) {
  const stickyRef = useRef<HTMLLIElement>(null)
  const cardRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card   = cardRef.current
    const sticky = stickyRef.current
    if (!card || !sticky) return

    const update = () => {
      const vh      = window.innerHeight
      const rect    = sticky.getBoundingClientRect()
      const trigIn  = vh * 0.82
      const trigFull = vh * 0.30
      let tx: number

      if (rect.top > trigIn)        tx = 105
      else if (rect.top < trigFull) tx = 0
      else tx = 105 * (1 - (trigIn - rect.top) / (trigIn - trigFull))

      card.style.transform = `translateX(${tx}%)`
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const num = String(index + 1).padStart(2, '0')
  const periodLines = exp.period.split('\n')

  return (
    <li ref={stickyRef} className="exp-sticky">
      <div className="exp-clip">
        <div ref={cardRef} className="exp-card">
          {/* Left accent column */}
          <div style={{
            padding: '36px 32px',
            borderRight: '1px solid rgba(232,200,74,0.08)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', background: 'rgba(232,200,74,0.02)',
          }}>
            <div style={{
              position: 'absolute', right: '-1px', top: '20%', bottom: '20%',
              width: '1px',
              background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)',
            }} />
            <div style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '0.65rem', color: 'var(--accent)',
              letterSpacing: '0.14em', textTransform: 'uppercase', lineHeight: 1.6,
            }}>
              {periodLines.map((line, i) => (
                <span key={i}>{line}{i < periodLines.length - 1 && <br />}</span>
              ))}
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-serif), serif',
              fontSize: '4.5rem', color: 'rgba(232,200,74,0.06)',
              lineHeight: 1, letterSpacing: '-0.04em',
              alignSelf: 'flex-end', userSelect: 'none',
            }}>
              {num}
            </div>
          </div>

          {/* Right content */}
          <div style={{
            padding: '36px 40px', display: 'flex',
            flexDirection: 'column', justifyContent: 'center', gap: '6px',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-serif), serif',
              fontSize: '1.7rem', lineHeight: 1.1, letterSpacing: '-0.02em',
            }}>
              {exp.role}
            </div>
            <div style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '0.72rem', color: 'var(--accent)',
              letterSpacing: '0.1em', marginBottom: '10px',
            }}>
              {exp.company} · {exp.location}
            </div>
            <p style={{
              fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              {exp.description}
            </p>
          </div>
        </div>
      </div>
    </li>
  )
}
```

- [ ] **Step 2: Create ExperienceSection.tsx**

Create `portfolio-app/components/experience/ExperienceSection.tsx`:

```tsx
import ExpCard from './ExpCard'
import type { ExperienceItem } from '@/data/types'

export default function ExperienceSection({ experience }: { experience: ExperienceItem[] }) {
  return (
    <section id="experience" style={{ padding: '100px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-label reveal">Journey</div>
        <h2 className="reveal" style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '60px',
        }}>
          Experience
        </h2>
        <ul
          className="exp-stack"
          style={{ ['--exp-count' as string]: experience.length }}
        >
          {experience.map((exp, i) => (
            <ExpCard key={exp.company} exp={exp} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: add Experience section with scroll-driven slide-in

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Contact + Footer

**Files:**
- Create: `portfolio-app/components/contact/ContactSection.tsx`
- Create: `portfolio-app/components/footer/Footer.tsx`

- [ ] **Step 1: Create ContactSection.tsx**

```bash
mkdir -p portfolio-app/components/contact portfolio-app/components/footer
```

Create `portfolio-app/components/contact/ContactSection.tsx`:

```tsx
import type { ContactData } from '@/data/types'

export default function ContactSection({ contact }: { contact: ContactData }) {
  return (
    <section id="contact" style={{
      background: 'var(--glass-bg)',
      borderTop: '1px solid var(--glass-border)',
      borderBottom: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)', textAlign: 'center', padding: '100px 60px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '0.68rem', color: 'var(--accent)',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
          marginBottom: '16px',
        }}>
          Get in touch
        </div>

        <h2 style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 0,
        }}>
          {contact.heading}
        </h2>

        <a href={`mailto:${contact.email}`} style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: 'var(--text-primary)', textDecoration: 'none',
          letterSpacing: '-0.02em', display: 'block',
          margin: '20px 0 50px', transition: 'color 0.3s ease',
        }}>
          {contact.email}
        </a>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {contact.socials.map(social => (
            <a key={social.label} href={social.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '0.72rem', color: 'var(--text-secondary)',
              textDecoration: 'none', letterSpacing: '0.1em',
              border: '1px solid rgba(232,200,74,0.15)',
              padding: '12px 24px', borderRadius: '3px', transition: 'all 0.3s ease',
            }}>
              {social.icon} {social.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create Footer.tsx**

Create `portfolio-app/components/footer/Footer.tsx`:

```tsx
import type { FooterData } from '@/data/types'

export default function Footer({ footer }: { footer: FooterData }) {
  return (
    <footer style={{
      padding: '40px 60px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      borderTop: '1px solid rgba(232,200,74,0.06)',
    }}>
      <span style={{
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.06em',
      }}>
        {footer.copy}
      </span>
      <span style={{
        fontFamily: 'var(--font-dm-serif), serif',
        fontSize: '0.9rem', color: 'rgba(232,200,74,0.4)', fontStyle: 'italic',
      }}>
        {footer.signature}
      </span>
    </footer>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app
git commit -m "feat: add Contact and Footer components

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Compose page.tsx — wire everything together

**Files:**
- Modify: `portfolio-app/app/page.tsx`

- [ ] **Step 1: Write page.tsx**

Replace `portfolio-app/app/page.tsx`:

```tsx
import Nav               from '@/components/nav/Nav'
import Hero              from '@/components/hero/Hero'
import StatsStrip        from '@/components/stats/StatsStrip'
import SkillsSection     from '@/components/skills/SkillsSection'
import ProjectsSection   from '@/components/projects/ProjectsSection'
import ExperienceSection from '@/components/experience/ExperienceSection'
import ContactSection    from '@/components/contact/ContactSection'
import Footer            from '@/components/footer/Footer'
import portfolioData     from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export default function Home() {
  return (
    <>
      <Nav  data={data} />
      <main>
        <Hero             data={data} />
        <StatsStrip       stats={data.stats} />
        <SkillsSection    skills={data.skills} />
        <ProjectsSection  projects={data.projects} />
        <ExperienceSection experience={data.experience} />
        <ContactSection   contact={data.contact} />
        <Footer           footer={data.footer} />
      </main>
    </>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
cd portfolio-app && npm test
```

Expected: all tests pass.

- [ ] **Step 3: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000`. Check each item:
- [ ] Gold cursor dot + lagging ring visible
- [ ] Nav: "Nitish.Kushwaha" logo, links (skills / projects / experience / contact), "Hire Me" CTA
- [ ] Hero: badge "Available for work", title with italic "& AI", subtitle, two CTA buttons
- [ ] Terminal: auto-types "help", shows command list; type `about`, `skills`, `projects`, `experience`, `contact` each returns correct output; `clear` clears; unknown command shows error
- [ ] Stats: 3+ / 1+ / 60% / 3 with correct labels
- [ ] Skills: 6 glass cards, each with icon, name, desc, tags
- [ ] Projects: 3 sticky-stacking cards (Vgents, NeuroWrite, Aounder) with visual stats panels
- [ ] Experience: Excellence Technologies card slides in from right on scroll
- [ ] Contact: email + 3 social links (GitHub, LinkedIn, Resume.pdf)
- [ ] Footer: copyright + "Crafted with precision"
- [ ] Scroll reveal: section labels and headings fade-up on scroll

Stop the server.

- [ ] **Step 4: Build for production**

```bash
npm run build
```

Expected: build completes with no errors, no TypeScript errors.

- [ ] **Step 5: Update TODO.md**

In `portfolio-app/../TODO.md` (repo root), mark done:
```markdown
- [x] Implement Next.js migration (Tasks 1–12 complete)
```

- [ ] **Step 6: Final commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add portfolio-app TODO.md
git commit -m "feat: portfolio v1.0 complete — full Next.js migration of gold-theme template

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- [x] Next.js 16.2.6 App Router — Task 1
- [x] TypeScript strict — Task 1 (`--typescript` flag)
- [x] Tailwind CSS v4 with `@theme` — Task 1 + Task 4
- [x] `next/font/google` — Task 5
- [x] `create-next-app` only, no manual boilerplate — Task 1
- [x] `data/portfolio.json` + `data/types.ts` — Task 3
- [x] Server-first, client only where required — Tasks 5–11
- [x] CustomCursor (Client) — Task 5
- [x] RevealInit / IntersectionObserver (Client) — Task 5
- [x] Nav with active scroll highlight (Client) — Task 6
- [x] Hero layout (Server) + Terminal (Client) — Task 7
- [x] StatsStrip (Server) — Task 8
- [x] Skills section (Server) — Task 8
- [x] Projects sticky stack, pure CSS (Server) — Task 9
- [x] Experience slide-in (Client) — Task 10
- [x] Contact (Server) — Task 11
- [x] Footer (Server) — Task 11
- [x] Accent color from JSON via CSS variable in `<head>` — Task 5
- [x] Responsive at 900px — Task 4 (globals.css media query)
- [x] Nitish's real content in portfolio.json — Task 3
- [x] XSS-safe terminal input via `esc()` helper — Task 7
- [x] Tests: types (Task 3), terminal + escapeHtml (Task 7), Tag (Task 6)

**No placeholders found.**

**Type consistency:** All component props use types imported from `@/data/types`. `PortfolioData` is the root type. `ExpCard` takes `ExperienceItem`, `ProjectCard` takes `ProjectItem`, `Tag` takes `string`. `esc()` in Terminal is defined and used before any user input touches HTML strings. Consistent throughout.
