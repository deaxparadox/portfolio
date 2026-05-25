# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## In Progress

(none)

## v2 Confirmed Scope

**Keep everything**: layout, terminal (fully interactive), sticky projects, slide-in experience, contact, all data.

**Changes:**
1. **Fonts** — Rubik Dirt (headings) · DM Mono (mono) · Syne (body/UI) · Cormorant Garamond (quotes)
2. **Color** — `#f5c518` gold + `--gold-lt`, `--gold-dk`, `--amber` variants
3. **Background** — aurora orbs (3 animated blobs) + floating particles (28)
4. **Ribbon** — marquee scrolling band between Hero and Skills (tech names top, keywords bottom)
5. **Glimpse section** — bento grid: Reads (Atomic Habits) · Toolbox · GitHub heatmap · Hobbies (Gaming, Web Series, Sleeping) · Location (Noida) · Quote ("Make it work, make it right, make it fast." — Kent Beck)
6. **Section dividers** — thin gold gradient lines between sections
7. **Nav** — add "About" → `#glimpse` link
- Note: currently on `v2` branch

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | stable production |
| `dev` | completed v1 work (all mobile + terminal) |
| `v1` | preserved snapshot of v1 — read-only reference |
| `v2` | **active** — new sections, font changes, styling redesign |
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

- [ ] **Smart Terminal mobile half-screen mode** — bottom sheet covering ~50% viewport, portfolio visible + scrollable in top half, `mv <section>` navigates background in real-time. Build after core mobile responsiveness ships.
- [ ] **Smart Terminal mobile floating** — on mobile, floating top-right window is too small; needs design pass
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

- [x] **v2 spec + plan** — fonts, colors, aurora, ribbon, glimpse section ✅
- [x] Implement v2 changes ✅ (commit 5f518b8)
- [x] Template reviewed + tech stack decided (Next.js 16.2.6, TypeScript, Tailwind CSS v4)
- [x] Portfolio v1.0 — all sections built, reviewed, assembled (commit 14af21a)
- [x] **Smart Terminal v1** — spec + plan + full implementation (commit ca81c90)
  - 3 states: EMBEDDED / FLOATING / MAXIMIZED with Framer Motion spring transitions
  - Functional mac dots (red/yellow/green per-state logic)
  - `mv <section>` navigation, `mv hero` re-attach + scroll to top, `ls` list sections
  - Command parser (`parseCommand`) — unknown → AI chat placeholder
  - WiFi placeholder — animated arcs, "Wirelessly Connected / terminal.exe has left the building"
  - Auto-detach via IntersectionObserver, Escape key + backdrop click exit maximized
  - XSS safe throughout (`esc()` on all user input)
- [x] **Floating terminal improvements** (commit 027cb0a)
  - Solid background `rgba(8,7,0,0.93)` in floating mode
  - Draggable via Framer Motion — overlay pattern (fixed viewport → absolute child)
- [x] **Terminal history persistence** (commit 5bd262c)
  - All content state lifted to `TerminalContext` — survives EMBEDDED/FLOATING/MAXIMIZED transitions
  - Boot sequence guarded by `hasBooted` — runs once only
- [x] **Terminal focus UX** (commit d5a12ac)
  - Unfocused: body dims to 45% opacity, border softens
  - Focused: full opacity + gold border glow, 0.35s ease transition
  - `mv hero` auto-focuses terminal after spring settles (800ms / 1100ms)
- [x] **Bug fixes** (commits ecc38a9 → efb4ad6)
  - `domMax` instead of `domAnimation` — drag + layout were silently disabled
  - Drag overlay pattern for `position:fixed` Framer drag
  - `handleGreen` double-branch logic, `mv hero` race condition timeout
  - `colourDataLine` HTML escaping, `<section>` HTML tag layout gap
- [x] Framer Motion (`domMax`) installed — powers all terminal transitions + drag
- [x] Feature roadmap logged: `docs/superpowers/specs/2026-05-22-portfolio-roadmap.md`
