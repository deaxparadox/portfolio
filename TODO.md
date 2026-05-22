# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## In Progress

- [ ] Write implementation plan for Next.js migration (spec written, plan pending)

---

## Backlog

- [ ] **Framer Motion integration** — Replace manual `IntersectionObserver` + `requestAnimationFrame` scroll animations with Framer Motion for cleaner, more maintainable animation code. Deferred to keep current build stable. Revisit after v1 ships.
- [ ] **Additional experience entries** — Currently 1 card (Excellence Technologies). Add more roles when available.
- [ ] **Resume PDF** — Link a hosted resume PDF to the contact section's "Resume.pdf" social link.
- [ ] **Project case study pages** — Each project card links to "#" for now. Add individual `/projects/[slug]` pages in a future iteration.
- [ ] **Open Graph / SEO metadata** — Add `og:image`, Twitter card, and structured data after content is finalised.
- [ ] **Analytics** — Consider Plausible or Vercel Analytics after deployment.

---

## Done

- [x] Template reviewed (`template/template-yellow-theme.html`)
- [x] Tech stack decided: Next.js 16.2.6, TypeScript, Tailwind CSS v4
- [x] Architecture decided: Approach B — Server-first components, client boundary only where needed
- [x] Data schema designed: `data/portfolio.json`
- [x] Content mapped: Nitish Kushwaha's resume → JSON structure
- [x] AGENT.md written with project rules
- [x] Spec doc written
