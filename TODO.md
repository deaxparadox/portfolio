# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## In Progress

- Pending: push `dev` to Vercel, verify SkillsFinder + bento + ribbon in browser
- Note: currently on `dev` branch (v2 merged in)

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | stable production |
| `dev` | **active** — v2 merged in, SkillsFinder shipped (398c377) |
| `v1` | preserved snapshot of v1 — read-only reference |
| `v2` | complete — all changes merged into dev |
| `template1` | original template reference |

---

## Planned Features (in priority order)

### 1. Resume Mode (default view)
- [ ] Spec + implement resume mode — stripped layout, no heavy animations, fast load
- [ ] Default route redirects to resume mode (no param = resume mode)
- [ ] Full experience accessible via Deax menu or URL param
- [ ] Smooth Framer Motion transition between resume ↔ full view

### 2. Deax Button + Menu Shell
- [ ] Persistent floating button bottom-right — "Deax" label with bounce animation
- [ ] Menu above button: "Explore the full portfolio" / "Talk to Deax"
- [ ] Mounted in root layout.tsx — persists across all views
- [ ] Works as UI shell even before AI backend is wired

### 3. Chatbot in Resume Mode (text-only Deax)
- [ ] Text-only chat widget in resume mode
- [ ] Answers recruiter questions from portfolio.json + knowledge base
- [ ] Same "Deax" persona as voice agent — text-only interface
- [ ] Spec: chatbot widget, backend integration

### 4. Projects Card Improvements
- [ ] Review Nitish's design for new project cards
- [ ] Keep sticky-stack layout — improve cards only
- [ ] Spec + implement

### 5. Experience Section Redesign
- [ ] Review Nitish's design
- [ ] Defer full redesign until 2nd experience entry exists
- [ ] Design must look intentional with 1 entry, scale to 3+

### 6. Voice Agent Tour (Deax full mode)
- [ ] LiveKit voice + chat — Deax narrates portfolio tour
- [ ] Mounted in root layout, narrates resume → full view transition
- [ ] Blocked on: flagship backend token endpoint
- [ ] See: `docs/superpowers/specs/2026-05-22-portfolio-roadmap.md`

---

## Backlog (UI / Polish)

- [ ] **Smart Terminal mobile half-screen mode** — bottom sheet ~50% viewport, portfolio visible + scrollable behind
- [ ] **Smart Terminal mobile floating** — floating top-right needs design pass on small screens
- [ ] **Mobile hamburger nav** — Nav links hidden at <900px but no hamburger menu
- [ ] **Additional experience entries** — Currently 1 card (Excellence Technologies)
- [ ] **Resume PDF** — Link a hosted resume PDF to the contact "Resume.pdf" link
- [ ] **Project case study pages** — Each card links to "#". Add `/projects/[slug]` later
- [ ] **Open Graph / SEO metadata** — `og:image`, Twitter card, structured data
- [ ] **Analytics** — Plausible or Vercel Analytics after deployment
- [ ] **Framer Motion scroll animations** — Replace manual IntersectionObserver + rAF

---

## Done

- [x] Template reviewed + tech stack decided (Next.js 16.2.6, TypeScript, Tailwind CSS v4)
- [x] Portfolio v1.0 — all sections built, reviewed, assembled
- [x] **Smart Terminal v1** — 3 states, mv navigation, command parser, WiFi placeholder, history persistence, focus UX
- [x] **Mobile responsiveness v1** — bottom nav, terminal pill, 480px breakpoint, tablet 2-col skills
- [x] **Vercel deployment** — live ✅. Fix: Framework Preset → Next.js
- [x] **v2 design** ✅
  - Fonts: Rubik Dirt · DM Mono · Syne · Cormorant Garamond
  - Gold palette: `#f5c518` + amber variant
  - Aurora orbs (3 animated) + floating particles (28)
  - Ribbon marquee — `rotate(-1.5deg)` tilt, left lower than right, both bands visible
  - Section dividers between all sections
  - Glimpse/About bento section (12-col): Atomic Habits · Toolbox · GitHub heatmap · Gaming/Web Series/Sleeping · Noida · Kent Beck quote
  - Nav "About" → #glimpse (desktop + bottom nav)
  - Bento grid: `!important` on all grid rules to override cascade
  - Responsive: tablet 2-col bento, mobile 1-col, BentoReads overflow fix, hobbies pills compact
- [x] **SkillsFinder** ✅ (2026-05-25, commit 398c377)
  - macOS Finder-styled skills section — List + Grid views
  - List: sidebar (210px) + detail panel, animated proficiency bar, gold pill tags
  - Grid: 3-col C2 gradient cards + T3 gold pill tags
  - Mobile: horizontal scrollable icon tab row replaces sidebar
  - Tablet: sidebar shrinks to 160px, reduced padding
  - List↔Grid toggle with 150ms cross-fade
  - 43 tests passing, build clean
