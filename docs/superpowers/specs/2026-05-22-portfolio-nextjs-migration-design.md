# Portfolio — Next.js Migration Design Spec

**Date:** 2026-05-22  
**Author:** Nitish Kushwaha  
**Status:** Approved

---

## 1. Overview

Migrate the existing single-file HTML portfolio template (`template/template-yellow-theme.html`) into a production-grade Next.js 16 application. The migration preserves 100% of the visual design and interactions while adding data-driven content, proper component architecture, and framework-level performance optimisations.

---

## 2. Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router) | Latest stable; Node 22 compatible; Turbopack default |
| Language | TypeScript (strict) | Type safety, better DX, industry standard for Next.js |
| Styling | Tailwind CSS v4 | Best Next.js fit; theming via CSS variables + config |
| Fonts | `next/font/google` | Zero layout shift, auto-subset, no external request |
| Scaffolding | `create-next-app@latest` | Framework CLI only — no manual boilerplate |
| Node version | v22.20.0 | Exceeds Next.js 16 minimum (20.9) |

---

## 3. Engineering Principles

Researched and applied throughout implementation:

1. **Single Responsibility** — each component has one clear purpose; layout components do not contain business logic
2. **Server-first rendering** — `'use client'` only where browser APIs or interactivity are required
3. **Data/UI separation** — all content lives in `data/portfolio.json`; components receive typed props, never hardcoded strings
4. **YAGNI** — no shared abstractions until a pattern appears 3+ times
5. **Open/Closed** — components accept props for variation; no internal branching on magic strings
6. **Single source of truth for theming** — accent color defined once as a CSS custom property, extended into Tailwind config; never repeated as raw hex in components
7. **No manual boilerplate** — framework CLI generates all scaffolding and config files

---

## 4. Architecture

### 4.1 Component Tree

```
app/
  layout.tsx              Server — fonts, metadata, global CSS, CustomCursor
  page.tsx                Server — composes all section components

components/
  nav/
    Nav.tsx               Client — active link highlight on scroll, sticky behaviour
  hero/
    Hero.tsx              Server — two-column layout, hero text content
    Terminal.tsx          Client — interactive terminal (keydown, auto-type, command registry)
  stats/
    StatsStrip.tsx        Server — 4-column stats bar, pure static
  skills/
    SkillsSection.tsx     Server — section label + title + skills grid
    SkillCard.tsx         Server — individual glass card with icon, name, desc, tags
  projects/
    ProjectsSection.tsx   Server — section label + title + sticky stack wrapper
    ProjectCard.tsx       Server — individual project card layout
    StickyStack.tsx       Client — manages sticky scroll stacking, scale transforms
  experience/
    ExperienceSection.tsx Server — section label + title + exp stack wrapper
    ExpCard.tsx           Client — scroll-driven slide-in from right (rAF + getBoundingClientRect)
  contact/
    ContactSection.tsx    Server — email link + social links
  footer/
    Footer.tsx            Server — copyright + signature
  ui/
    CustomCursor.tsx      Client — gold dot cursor + lagging ring, hover expand
    ScrollReveal.tsx      Client — IntersectionObserver wrapper; adds 'visible' class to children
    Tag.tsx               Server — reusable pill tag

data/
  portfolio.json          Single source of truth for all content
  types.ts                TypeScript types mirroring the JSON schema

public/
  (static assets)
```

### 4.2 Server / Client Boundary Summary

| Component | Boundary | Reason |
|---|---|---|
| `Nav` | Client | `window.scrollY` for active link highlight |
| `Terminal` | Client | `keydown`, `requestAnimationFrame`, DOM manipulation |
| `StickyStack` | Client | `scroll` event + `getBoundingClientRect` for scale |
| `ExpCard` | Client | `scroll` event + `translateX` animation |
| `CustomCursor` | Client | `mousemove`, `requestAnimationFrame` |
| `ScrollReveal` | Client | `IntersectionObserver` |
| Everything else | Server | Pure static rendering |

---

## 5. Data Schema — `data/portfolio.json`

```json
{
  "meta": {
    "title": "Nitish Kushwaha — Backend & AI Engineer",
    "description": "Python Backend Developer building scalable APIs, AI agents, and real-time voice systems."
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
      "links": [
        { "label": "GitHub →", "href": "#" }
      ],
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
      "links": [
        { "label": "GitHub →", "href": "#" }
      ],
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
      "links": [
        { "label": "GitHub →", "href": "#" }
      ],
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
    "intro": ["  nitish-kushwaha portfolio v1.0.0", "  type a command and press enter", ""],
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

---

## 6. Theming

The accent color (`#e8c84a` gold) is defined as a CSS custom property `--accent` in `app/globals.css` and extended into the Tailwind config as `colors.accent`. All components use `text-accent`, `border-accent`, `bg-accent` etc. — never raw hex values. To change the theme, update `theme.accentColor` in `portfolio.json` and the corresponding CSS variable.

---

## 7. Background Layers

The template has three fixed background layers that must be preserved:

1. `BgLayer` — radial gradient ambient glow (Server, pure CSS)
2. `NoiseLayer` — SVG fractal noise texture at 3% opacity (Server, pure CSS)
3. `GridLayer` — 80×80 grid of faint lines (Server, pure CSS)

These are rendered in `app/layout.tsx` above `{children}`.

---

## 8. Responsive Behaviour

Mirror the template's breakpoint exactly: `@media (max-width: 900px)`:
- Nav links hidden, hamburger optional (logged as future improvement)
- Hero becomes single column
- Skills grid becomes 1 column
- Project cards lose the visual stats panel
- Footer stacks vertically

Tailwind custom breakpoint: `sm: '900px'` in config.

---

## 9. Out of Scope (v1)

- Framer Motion animations (logged in TODO.md)
- Mobile hamburger nav (logged in TODO.md)
- Project case study pages (`/projects/[slug]`)
- Open Graph / SEO meta images
- Analytics

---

## 10. Folder Location

The Next.js app lives at `portfolio-app/` inside this repo (sibling to `template/`).
