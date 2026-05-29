# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## Current Status

- **Active branch:** `v6-data` (latest)
- **v4:** voice tour + light mode — 80 tests
- **v5-chatbot:** chatbot frontend — 99 tests
- **v6-data:** real project data — 99 tests ← current
- **Vercel:** live on `dev` — all branches pending merge

## Branch Strategy

| Branch | Status | Tests | Notes |
|---|---|---|---|
| `main` | stable production | — | |
| `dev` | integration base | 80 | v3 merged in |
| `v4` | **complete, not merged** | 80 | voice tour + light mode |
| `v5-chatbot` | **complete, not merged** | 99 | chatbot frontend |
| `v6-data` | **complete, not merged** | 99 | ← CURRENT: real project data |
| `v5-chatbot` | **complete, not merged** | 99 | chatbot on top of v4 |
| `v3` | merged into dev | — | |
| `v1` | frozen snapshot | — | |

**Merge order:** v4 → dev first, then v5-chatbot → dev

---

## Next Actions

- [ ] Merge v4 → dev (`superpowers:finishing-a-development-branch`)
- [ ] Merge v5-chatbot → dev (after v4 merged)
- [ ] Merge v6-data → dev (after v5-chatbot merged)
- [ ] Set `NEXT_PUBLIC_VOICE_AGENT_URL` in Vercel env vars (get from interview-prep project)
- [ ] Fix backend guardrail false positives — `interview-prep/backend/chat/prompts.py` (include last 2 messages as context in GUARDRAIL_PROMPT)

---

## Completed Features

### Resume Mode + DeaxButton + Project Cards ✅ (v3 → dev)
- [x] `/?mode=resume` default (proxy.ts redirect)
- [x] ResumePortfolio — dark/light theme, all sections
- [x] DeaxButton — persistent floating, mode-switch menu
- [x] Magazine split project cards + roaming badges
- [x] Merge v3 → dev ✅ · Vercel live ✅

### Light Mode Improvements ✅ (v4, fe8120b)
- [x] Amber color tokens: `gold: '#b8860b'`, `bg: '#fdf6e3'`
- [x] Floating amber orbs CSS animation (mirrors dark mode aurora)
- [x] All borders/accents amber-tinted — brand identity preserved in light mode

### Voice Tour ✅ (v4, c39e3f9 + fixes)
- [x] Full mode only (`/?mode=full`)
- [x] 5-phase state machine: idle → intro → active ↔ minimized → ended
- [x] FloatingWidget, ActivePanel, MinimizedPill (vertical roll Deax↔Talking)
- [x] DataChannelHandler — section scroll + end_tour
- [x] Terminal footer hint "talk to deax instead →"
- [x] DeaxButton wired — "Talk to Deax", hides when tour active
- [x] Build clean, 80 tests passing

### Portfolio Data ✅ (v6-data, 7844d82)
- [x] 5 real client projects (VoiceOps AI, LexCall, Founder's Lab, Trajectry, StructureIQ)
- [x] Skills updated: added Gemini, OpenAI Realtime, ElevenLabs, Pinecone
- [x] Stats: "7 Products Shipped" replaces "1+ Year Professional"
- [x] Terminal commands updated for all 5 projects
- [x] Project analysis docs: `/home/lap-68/Documents/gt-dp/project-analysis/`

### Chatbot Frontend ✅ (v5-chatbot, 7cd4ae0 + fixes)
- [x] `chatApi.ts` — createSession, streamMessage, VALID_SECTIONS, session_expired retry
- [x] `ChatContext.tsx` — session lifecycle, in-flight promise guard, message state
- [x] `ChatMessage.tsx` — user/assistant bubbles (YOU/DEAX)
- [x] `ChatPanel.tsx` — message list, auto-scroll, streaming cursor ▊
- [x] `ChatWidgetInner.tsx` + `ChatWidget.tsx` — floating panel, scroll fixed
- [x] Both modes: "Chat with Deax" in DeaxButton menu
- [x] Terminal inline streaming — bold commands, left-border block, t-caret thinking indicator
- [x] DeaxButton: "Explore full portfolio" hidden in full mode
- [x] Build clean, 99 tests passing

---

## Backlog (in priority order)

### Experience Card Polish
- [ ] Add impact metrics to current slide-in card (no redesign)
- [ ] Full cinematic redesign deferred — needs 2nd experience entry (see `docs/DEFERRED.md`)

### Hanging Nail Spring Animation
- [ ] Deferred — see `docs/DEFERRED.md`
- [ ] Trigger: fresh session after v4 verified

### UI / Polish
- [ ] **Smart Terminal mobile half-screen mode** — bottom sheet ~50% viewport
- [ ] **Mobile hamburger nav** — Nav links hidden at <900px, no hamburger
- [ ] **Resume PDF** — Host and link actual PDF
- [ ] **Project case study pages** — `/projects/[slug]` (links currently "#")
- [ ] **Open Graph / SEO metadata** — `og:image`, Twitter card
- [ ] **Analytics** — Plausible or Vercel Analytics
- [ ] **Additional experience entries** — 1 card currently (Excellence Technologies)
