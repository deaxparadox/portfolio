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

## Planned Features (in order)

### Subsystem 2 — Voice Agent Widget (LiveKit)
- [ ] Spec: LiveKit voice agent frontend — dynamic config, portfolio navigation bridge
- [ ] Implement voice agent widget
- [ ] Blocked on: flagship backend token endpoint being ready (or mockable)
- See: `docs/superpowers/specs/2026-05-22-portfolio-roadmap.md`

### Subsystem 3 — Chatbot Widget
- [ ] Spec: text chatbot with portfolio navigation
- [ ] Implement chatbot widget
- [ ] Blocked on: Subsystem 2 complete (shares navigation bridge)

### Subsystem 4 — Combined Mode (Voice + Chat)
- [ ] Spec + implement combined LiveKit voice+chat interface
- [ ] Blocked on: Subsystems 2 + 3 complete

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
