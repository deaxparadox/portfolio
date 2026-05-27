# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## In Progress

- Resume mode (v3 branch) — complete, pending merge to dev + Vercel push
- Note: currently on `v3` branch

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | stable production |
| `dev` | v2 + SkillsFinder merged (398c377) |
| `v1` | preserved snapshot — read-only reference |
| `v2` | complete — merged into dev |
| `v3` | **active** — resume mode + DeaxButton (e599645) |
| `template1` | original template reference |

---

## Planned Features (in priority order)

### 1. Resume Mode + DeaxButton ✅ (v3 branch, e599645)
- [x] `/?mode=resume` default (proxy.ts redirect)
- [x] `/?mode=full` full experience
- [x] ResumePortfolio — dark/light theme, CustomCursor, all sections
- [x] DeaxButton — persistent floating, mode-switch, "Talk to Deax (soon)"
- [ ] Merge v3 → dev
- [ ] Push dev to Vercel, verify both modes in browser

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
- [ ] Polish current slide-in card (impact metrics, typography)
- [ ] Full cinematic redesign deferred — see `docs/DEFERRED.md`
- [ ] Trigger: 2nd experience entry added to portfolio.json

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
  - 43 tests passing, build clean
- [x] **Resume Mode + DeaxButton** ✅ (2026-05-27, v3 branch, e599645)
  - `/?mode=resume` (default via proxy.ts) — single column, dark/light theme
  - `/?mode=full` — full v2 experience unchanged
  - Sections: Hero (heatmap) · Social · Experience · Skills (terminal) · Projects · Contact · Footer
  - CustomCursor in both modes, `*, *::before, *::after { cursor: none !important }` global
  - DeaxButton: persistent floating bottom-right, mode-switch menu + "Talk to Deax (soon)"
  - Light theme: `#fef9e0` cream bg, near-black text
  - 58 tests passing, build clean
