# Deferred Designs

Design work that's complete but not yet implemented. Before building any UI section, check here first — the design may already be done.

---

## Project Cards — Hanging Nail Spring Animation

**No design file** — concept described in session 2026-05-27.

**Design:** Sticky-stack cards get a velocity-driven elastic entrance animation. As a card enters view, the top edge stretches left/right (skewX + horizontal scale, pivot from bottom). Releases back to normal with a spring overshoot — like a card hung on a nail that swings and settles. Faster scroll = more stretch. Reverse animation when scrolling back up.

**Implementation approach:**
- Scoped to full experience only (`FullExperienceShell` already has FramerProvider)
- Use `useScroll` + `useVelocity` from Framer Motion to read scroll speed
- Map velocity to `skewX` and `scaleX` values via `useTransform`
- Spring physics for the settle/bounce (`useSpring` with low damping, low stiffness)
- Each `.stack-item` gets a `motion.li` wrapper

**Why deferred:** Polish animation — needs fresh session with careful tuning. Done poorly it nauseates; done well it's memorable. Deserves proper attention.

**Trigger to implement:** v3 already merged. Build as standalone branch after all current branches (v4→v8-nkm) are merged into dev.

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

### Roaming Badges — ✅ Implemented (2026-05-27, v3)

**Other options for reference:**

| Option | Name | Notes |
|---|---|---|
| A | Case Study Editorial | Ghost number, impact callout, left accent bar on hover. Strong 3-col grid alternative. Revisit if sticky-stack layout is ever dropped. |
| B | Terminal / Code Window | Mac window chrome, syntax-highlighted code snippet per project. Clever but clashes with the Smart Terminal already in the hero. Avoid. |
| D | Receipt / Ticket | Perforated tear line, barcode strip. Most distinctive/memorable. High novelty risk — may feel too cute in a professional context. Keep as wildcard option. |

---

## Voice Agent Tour (Deax full mode) ✅ Implemented

**Spec:** `docs/superpowers/specs/2026-05-28-voice-tour-frontend-design.md`
**Branch:** v4 (merged into dev pending)
**Backend:** interview-prep project — LiveKit token endpoint live

Implemented: boot → intro → active ↔ minimized → ended state machine. Terminal footer hint, MinimizedPill (vertical roll Deax↔Talking), DataChannelHandler for section scroll. Full mode only (`/?mode=full`).
