# Deferred Designs

Design work that's complete but not yet implemented. Before building any UI section, check here first — the design may already be done.

---

## Experience Section — Cinematic Dossier

**File:** `docs/templates/experience-cinematic.jsx`

**Design:** Scroll-driven sticky viewport. Left panel shows chapter title + narrative. Right panel is a stacked dossier card with rotate/scale animation. Progress dots + scroll hint. Each entry = one full card.

**Why deferred:** Only 1 experience entry (Excellence Technologies) exists. The design needs 2+ entries to earn its scroll budget and card stack. With one entry the section is 100vh of scroll for a single card — over-engineered for the content.

**Trigger to implement:** Second experience entry added to `portfolio.json`.

**Notes:**
- The JSX splits one role into 4 chapters (Foundation / AI Layer / Voice System / Infrastructure) as a workaround for single entry. This was explored and rejected — prefer one card per company.
- Data model: each `ExperienceItem` maps to one dossier card. The `act`, `headline`, `detail`, `metric`, `classification`, `status` fields in the JSX need to be added to `portfolio.json` when implementing.
- Current decision: polish the existing slide-in card instead.

---

## Project Cards — Alternatives

**File:** `docs/templates/project-card-options.html` (contains A, B, C, D)

**Selected design:** Option C — Magazine Split (implemented in v3 / full experience).

**Other options for reference:**

| Option | Name | Notes |
|---|---|---|
| A | Case Study Editorial | Ghost number, impact callout, left accent bar on hover. Strong 3-col grid alternative. Revisit if sticky-stack layout is ever dropped. |
| B | Terminal / Code Window | Mac window chrome, syntax-highlighted code snippet per project. Clever but clashes with the Smart Terminal already in the hero. Avoid. |
| D | Receipt / Ticket | Perforated tear line, barcode strip. Most distinctive/memorable. High novelty risk — may feel too cute in a professional context. Keep as wildcard option. |

---

## Voice Agent Tour (Deax full mode)

**No design file yet** — spec in `docs/superpowers/specs/2026-05-22-portfolio-roadmap.md`

**Why deferred:** Blocked on flagship backend LiveKit token endpoint. Full voice + chat narrated tour is the most complex feature in the roadmap.

**Trigger to implement:** Backend token API available (or mockable).
