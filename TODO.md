# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## RESUME POINT (next session)

**Pick up at: review Tasks 8–11, then implement + review Task 12**

Steps to run in next session:
1. **Review Tasks 8–11** (implemented, build passes, review was interrupted mid-session)
   - Commits to review: `fae4689..fc494e4` (4 commits)
   - Run spec + quality review subagent for: StatsStrip, SkillCard, SkillsSection, ProjectCard, ProjectsSection, ExpCard, ExperienceSection, ContactSection, Footer
2. **Implement Task 12** — compose `page.tsx` (wires all sections together)
   - Import Nav, Hero, StatsStrip, SkillsSection, ProjectsSection, ExperienceSection, ContactSection, Footer
   - Run full test suite (`npm test`)
   - Start dev server + manually verify all sections render
   - Run `npm run build` — confirm production build passes
3. **Review Task 12** — spec + quality review
4. **Final review + finishing-a-development-branch skill**

---

## In Progress

- All implementation tasks complete. Pending: final review + deployment.
- Note: `portfolio-app/` renamed to `src/` (repo itself is named `portfolio`)

---

## Backlog

- [ ] **Framer Motion integration** — Replace manual `IntersectionObserver` + `requestAnimationFrame` scroll animations with Framer Motion for cleaner, more maintainable animation code. Deferred to keep current build stable. Revisit after v1 ships.
- [ ] **Mobile hamburger nav** — Nav links hidden at <900px but no hamburger menu. Add in a future iteration.
- [ ] **Additional experience entries** — Currently 1 card (Excellence Technologies). Add more roles when available.
- [ ] **Resume PDF** — Link a hosted resume PDF to the contact section's "Resume.pdf" social link.
- [ ] **Project case study pages** — Each project card links to "#". Add `/projects/[slug]` pages in a future iteration.
- [ ] **Open Graph / SEO metadata** — Add `og:image`, Twitter card, structured data after content is finalised.
- [ ] **Analytics** — Consider Plausible or Vercel Analytics after deployment.
- [ ] **Deployment** — Deploy to Vercel (connect GitHub repo, set up domain).

---

## Done

- [x] Template reviewed (`template/template-yellow-theme.html`)
- [x] Tech stack decided: Next.js 16.2.6, TypeScript, Tailwind CSS v4
- [x] Architecture decided: Approach B — Server-first components, client boundary only where needed
- [x] Data schema designed + portfolio.json populated with Nitish Kushwaha's real data
- [x] AGENT.md written with 6 project rules
- [x] Spec doc written: `docs/superpowers/specs/2026-05-22-portfolio-nextjs-migration-design.md`
- [x] Implementation plan written: `docs/superpowers/plans/2026-05-22-portfolio-nextjs-migration.md`
- [x] Task 1: Scaffold Next.js 16 app (reviewed ✅) — commit 1946f90
- [x] Task 2: Jest + RTL test setup (reviewed ✅) — commit 7b5f015
- [x] Task 3: Data layer types.ts + portfolio.json (reviewed ✅) — commit 90aab17
- [x] Task 4: globals.css — full CSS port with Tailwind v4 theme (reviewed ✅) — commit bc0f2fc
- [x] Task 5: layout.tsx + CustomCursor + RevealInit (reviewed ✅) — commit ef832a4
- [x] Task 6: Tag + Nav components (reviewed ✅) — commit 9839df6
- [x] Task 7: Hero + Terminal with XSS-safe input (reviewed ✅) — commit 79b4959
- [x] Task 8: StatsStrip + SkillsSection (implemented ✅, review pending) — commit fae4689
- [x] Task 9: Projects section / sticky stack (implemented ✅, review pending) — commit b72dcba
- [x] Task 10: Experience section / slide-in (implemented ✅, review pending) — commit 6d2c690
- [x] Task 11: Contact + Footer (implemented ✅, review pending) — commit fc494e4
- [x] Task 12: Compose page.tsx — full portfolio assembled (reviewed ✅) — commit 14af21a
