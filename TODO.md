# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## In Progress

- Pending: push `v2` branch to Vercel, verify bento grid renders correctly in browser
- Note: currently on `v2` branch

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | stable production |
| `dev` | completed v1 (mobile + terminal + all fixes) |
| `v1` | preserved snapshot of v1 — read-only reference |
| `v2` | **active** — new fonts, aurora, ribbon, glimpse section |
| `template1` | original template reference |

---

## Planned Features (in order)

### Subsystem 1 — Visual Improvements
- [ ] Brainstorm + spec visual improvements (deferred — no specific improvements in mind yet)
- [ ] Implement visual improvements

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

- [ ] **Smart Terminal mobile half-screen mode** — bottom sheet covering ~50% viewport, portfolio visible + scrollable in top half, `mv <section>` navigates background in real-time.
- [ ] **Smart Terminal mobile floating** — on mobile, floating top-right window is too small; needs design pass
- [ ] **Mobile hamburger nav** — Nav links hidden at <900px but no hamburger menu
- [ ] **Additional experience entries** — Currently 1 card (Excellence Technologies)
- [ ] **Resume PDF** — Link a hosted resume PDF to the contact section "Resume.pdf" social link
- [ ] **Project case study pages** — Each card links to "#". Add `/projects/[slug]` pages later
- [ ] **Open Graph / SEO metadata** — Add `og:image`, Twitter card, structured data
- [ ] **Analytics** — Consider Plausible or Vercel Analytics after deployment
- [ ] **Framer Motion scroll animations** — Replace manual IntersectionObserver + rAF with Framer Motion now that FM is installed

---

## Done

- [x] Template reviewed + tech stack decided (Next.js 16.2.6, TypeScript, Tailwind CSS v4)
- [x] Portfolio v1.0 — all sections built, reviewed, assembled (commit 14af21a)
- [x] **Smart Terminal v1** — spec + plan + full implementation
  - 3 states: EMBEDDED / FLOATING / MAXIMIZED with Framer Motion spring transitions
  - Functional mac dots, `mv` navigation, command parser, WiFi placeholder
  - History persistence, focus UX, XSS safe
- [x] **Mobile responsiveness v1** — bottom nav, terminal pill, 480px breakpoint, tablet 2-col skills
- [x] **Vercel deployment** — live ✅. Fix: Framework Preset → Next.js
- [x] **v2 design** ✅ (branch `v2`, latest commit f53cabe)
  - Fonts: Rubik Dirt · DM Mono · Syne · Cormorant Garamond
  - Gold palette: `#f5c518` + amber variant
  - Aurora orbs (3 animated) + floating particles (28)
  - Ribbon marquee between Hero and Skills
  - Section dividers between all sections
  - Glimpse/About bento section: Atomic Habits · Toolbox · GitHub heatmap · Gaming/Web Series/Sleeping · Noida · Kent Beck quote
  - Nav "About" → #glimpse
  - Fix: bento grid `!important` to force 12-col layout
