# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## Current Status

- **Active branch:** `v6-data` · latest: `fb3423b`
- **v4:** voice tour + light mode — 80 tests
- **v5-chatbot:** chatbot frontend — 99 tests
- **v6-data:** real data + env fixes — 99 tests ← current
- **Vercel:** live on `dev` — all branches pending merge

## Branch Strategy

| Branch | Status | Tests | Notes |
|---|---|---|---|
| `main` | stable production | — | |
| `dev` | integration base | 80 | v3 merged in |
| `v4` | **complete, not merged** | 80 | voice tour + light mode |
| `v5-chatbot` | **complete, not merged** | 99 | chatbot frontend |
| `v6-data` | **complete, not merged** | 99 | ← CURRENT: data + env fixes |
| `v3` | merged into dev | — | |
| `v1` | frozen snapshot | — | |

**Merge order:** v4 → dev first, then v5-chatbot → dev

---

## Next Actions

- [ ] Merge v4 → dev (`superpowers:finishing-a-development-branch`)
- [ ] Merge v5-chatbot → dev (after v4 merged)
- [ ] Merge v6-data → dev (after v5-chatbot merged)
- [ ] Set `NEXT_PUBLIC_VOICE_AGENT_URL` + `NEXT_PUBLIC_PROJECT_ID=portfolio` in Vercel env vars
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

### Portfolio Data + Env Fixes ✅ (v6-data, fb3423b)
- [x] 5 real client projects (VoiceOps AI, LexCall, Founder's Lab, Trajectry, StructureIQ)
- [x] Skills: added Gemini, OpenAI Realtime, ElevenLabs, Pinecone
- [x] Stats: "7 Products Shipped" replaces "1+ Year Professional"
- [x] Chat session API: now sends `{ project_id }` from `NEXT_PUBLIC_PROJECT_ID` env var
- [x] `.env.example` committed — documents both required vars
- [x] Env var pattern: literal `process.env.KEY` not dynamic `process.env[key]` (Next.js inlining)
- [x] `src/.gitignore` updated: `!.env.example` negation added

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

### After Merge — Unblock AI Features
- [ ] **Set `NEXT_PUBLIC_VOICE_AGENT_URL` in Vercel** — get URL from interview-prep project; unblocks voice tour + chatbot in production
- [ ] **Fix backend guardrail** — `interview-prep/backend/chat/prompts.py`: include last 2 user messages as context in `GUARDRAIL_PROMPT`; currently blocks legit questions like "what are his achievements?"

### Content
- [ ] **Resume PDF** — Host actual PDF, replace `#` in `portfolio.json` contact.socials
- [ ] **Additional experience entries** — 1 card currently (Excellence Technologies); trigger for cinematic redesign when 2nd entry added

### Experience Card Polish
- [ ] Add impact metrics to current slide-in card (no redesign)
- [ ] Full cinematic redesign deferred — needs 2nd experience entry (see `docs/DEFERRED.md`)

### SEO / Discoverability
- [ ] **Open Graph / SEO metadata** — `og:image`, Twitter card, structured data
- [ ] **Analytics** — Plausible or Vercel Analytics

### UI / Polish
- [ ] **Smart Terminal mobile half-screen mode** — bottom sheet ~50% viewport
- [ ] **Mobile hamburger nav** — Nav links hidden at <900px, no hamburger
- [ ] **Project case study pages** — `/projects/[slug]` (links currently "#")

### Deferred Animations
- [ ] **Hanging Nail Spring Animation** — see `docs/DEFERRED.md`, fresh session after v4 verified
