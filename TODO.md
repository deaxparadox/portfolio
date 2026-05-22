# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## In Progress

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

- [ ] **Smart Terminal v2** — lift terminal line/input state to TerminalContext so history persists across EMBEDDED/FLOATING/MAXIMIZED transitions (v1 loses history on each transition — known, intentional for v1)
- [ ] **Smart Terminal mobile** — floating terminal on mobile needs its own design pass (currently untested on small screens)
- [ ] **Mobile hamburger nav** — Nav links hidden at <900px but no hamburger menu
- [ ] **Additional experience entries** — Currently 1 card (Excellence Technologies). Add more roles when available.
- [ ] **Resume PDF** — Link a hosted resume PDF to the contact section "Resume.pdf" social link.
- [ ] **Project case study pages** — Each card links to "#". Add `/projects/[slug]` pages later.
- [ ] **Open Graph / SEO metadata** — Add `og:image`, Twitter card, structured data after content is finalised.
- [ ] **Analytics** — Consider Plausible or Vercel Analytics after deployment.
- [ ] **Deployment** — Deploy to Vercel (connect GitHub repo, set up domain).
- [ ] **Framer Motion scroll animations** — Replace manual IntersectionObserver + rAF animations with Framer Motion (now that FM is installed). Lower priority since current animations work.

---

## Done

- [x] Template reviewed (`template/template-yellow-theme.html`)
- [x] Tech stack decided: Next.js 16.2.6, TypeScript, Tailwind CSS v4
- [x] Architecture decided: Approach B — Server-first, client only where needed
- [x] Data schema designed + portfolio.json populated with Nitish Kushwaha's real data
- [x] AGENT.md written with 6 project rules
- [x] Spec: `docs/superpowers/specs/2026-05-22-portfolio-nextjs-migration-design.md`
- [x] Plan: `docs/superpowers/plans/2026-05-22-portfolio-nextjs-migration.md`
- [x] Portfolio v1.0 — all sections built, reviewed, assembled (commit 14af21a)
  - Scaffold, Jest, types, CSS, layout, Tag, Nav, Hero, Terminal, Stats, Skills, Projects, Experience, Contact, Footer
- [x] **Smart Terminal v1** — spec + plan + implementation complete (commit ca81c90)
  - 3 states: EMBEDDED / FLOATING / MAXIMIZED
  - Framer Motion `layoutId` spring transitions between states
  - Functional mac dot buttons (red/yellow/green with per-state logic)
  - `mv <section>` navigation command — scrolls + detaches terminal
  - `ls` command — lists navigable sections
  - `mv hero` — re-attaches terminal to hero (no scroll)
  - Command parser (`parseCommand`) — routes to known commands or "AI chat not available yet" placeholder
  - WiFi placeholder — animated signal arcs, "Wirelessly Connected", click to reattach
  - Auto-detach via IntersectionObserver when hero scrolls out of view
  - Escape key exits maximized state
  - Backdrop click exits maximized state
  - XSS safe throughout (`esc()` on all user input)
  - 29 tests passing
- [x] Framer Motion — installed + LazyMotion provider, powers terminal transitions
- [x] Feature roadmap logged: `docs/superpowers/specs/2026-05-22-portfolio-roadmap.md`
