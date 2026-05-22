# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## In Progress

- [ ] Terminal focus UX — dim effect when unfocused + auto-focus after `mv hero` (next task)
- Pending: push `dev` branch + PR to `main`, then deploy to Vercel
- Note: `src/` is the Next.js app (was `portfolio-app/`, renamed since repo = `portfolio`)

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

- [ ] **Smart Terminal mobile** — floating terminal on mobile needs its own design pass
- [ ] **Mobile hamburger nav** — Nav links hidden at <900px but no hamburger menu
- [ ] **Additional experience entries** — Currently 1 card (Excellence Technologies)
- [ ] **Resume PDF** — Link a hosted resume PDF to the contact section "Resume.pdf" social link
- [ ] **Project case study pages** — Each card links to "#". Add `/projects/[slug]` pages later
- [ ] **Open Graph / SEO metadata** — Add `og:image`, Twitter card, structured data
- [ ] **Analytics** — Consider Plausible or Vercel Analytics after deployment
- [ ] **Deployment** — Deploy to Vercel (connect GitHub repo, set up domain)
- [ ] **Framer Motion scroll animations** — Replace manual IntersectionObserver + rAF with Framer Motion now that FM is installed

---

## Done

- [x] Template reviewed + tech stack decided (Next.js 16.2.6, TypeScript, Tailwind CSS v4)
- [x] Portfolio v1.0 — all sections built, reviewed, assembled (commit 14af21a)
- [x] **Smart Terminal v1** — spec + plan + implementation (commit ca81c90)
  - 3 states: EMBEDDED / FLOATING / MAXIMIZED
  - Framer Motion `layoutId` spring transitions
  - Functional mac dots (red/yellow/green per-state)
  - `mv <section>` navigation, `mv hero` re-attach, `ls` list sections
  - Command parser (`parseCommand`) with unknown → AI chat placeholder
  - WiFi placeholder — animated arcs, "Wirelessly Connected"
  - Auto-detach via IntersectionObserver
  - Escape key + backdrop click exit maximized
  - XSS safe throughout
- [x] **Floating terminal improvements** — solid background + drag (commit 027cb0a)
  - `rgba(8,7,0,0.93)` background in floating mode
  - `drag` via Framer Motion overlay pattern (`position:absolute` inside fixed viewport container)
- [x] **Bug fixes** (commits ecc38a9 → f3e4717)
  - `domMax` instead of `domAnimation` — drag + layout animations were silently disabled
  - Drag overlay pattern — `position:fixed` breaks Framer drag calculations
  - `handleGreen` double-branch logic bug
  - `mv hero` race condition (450ms → 700ms timeout)
  - `colourDataLine` HTML escaping
  - `<section>` HTML tag in buildHelpLines causing layout gap
  - `mv hero` scroll to top added (history persistence removed boot-sequence as feedback)
- [x] **Terminal history persistence** (commit 5bd262c)
  - `lines`, `inputBuf`, `isTyping`, `termTitle`, `lineIdRef` lifted to `TerminalContext`
  - History survives EMBEDDED/FLOATING/MAXIMIZED transitions
  - Boot sequence guarded by `hasBooted` — runs once only
- [x] Framer Motion — `domMax` provider, powers all terminal transitions
- [x] Feature roadmap logged: `docs/superpowers/specs/2026-05-22-portfolio-roadmap.md`
