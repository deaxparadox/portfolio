# TODO

Tracks in-progress work, backlog, and deferred decisions.

---

## Current Status

- **Active branch:** `v8-nkm` · latest: `829b49d`
- **v4:** voice tour + light mode — 80 tests
- **v5-chatbot:** chatbot frontend — 99 tests
- **v6-data:** real project data + env fixes — 99 tests
- **v7-nkos:** NK-OS desktop at /nkos — 99 tests
- **v8-nkm:** NK-M mobile OS at /nkm — 99 tests ← current
- **Vercel:** live on `dev` — all branches pending merge

## Branch Strategy

| Branch | Status | Tests | Notes |
|---|---|---|---|
| `main` | stable production | — | |
| `dev` | integration base | 80 | v3 merged in |
| `v4` | complete, not merged | 80 | voice tour + light mode |
| `v5-chatbot` | complete, not merged | 99 | chatbot frontend |
| `v6-data` | complete, not merged | 99 | data + env fixes |
| `v7-nkos` | complete, not merged | 99 | NK-OS desktop |
| `v8-nkm` | **complete, not merged** | 99 | ← CURRENT: NK-M mobile |
| `v3` | merged into dev | — | |

**Merge order:** v4 → v5-chatbot → v6-data → v7-nkos → v8-nkm → dev

---

## Next Actions

- [ ] Merge v4 → dev (`superpowers:finishing-a-development-branch`)
- [ ] Merge v5-chatbot → dev (after v4 merged)
- [ ] Merge v6-data → dev (after v5-chatbot merged)
- [ ] Merge v7-nkos → dev (after v6-data merged)
- [ ] Merge v8-nkm → dev (after v7-nkos merged)
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

### NK-OS ✅ (v7-nkos, fdc20b2)
- [x] Full KDE Plasma-inspired desktop OS at `/nkos`
- [x] Gold accent theme — isolated `nkos.css`, cursor override
- [x] Boot screen (3.4s gold animation, click to skip)
- [x] Animated canvas wallpaper — stars, nebula, 4 variants, F5 to cycle
- [x] Window system — drag, resize, minimize, maximize, focus
- [x] Taskbar — launcher, open apps, clock
- [x] App launcher — search + All/Portfolio/System categories
- [x] Right-click context menu
- [x] 6 apps: Terminal (portfolio cmds + Deax AI), About (heatmap), Projects (file mgr), Skills (native), Contact, Deax
- [x] Shutdown/poweroff sequence
- [x] Mobile fallback message
- [x] DeaxButton "NK-OS 🖥️" entry point from any portfolio page
- [x] Fixed: DeaxButton hooks order (usePathname early return was before useEffect)
- [x] Fixed: SkillsApp rebuilt from scratch — SkillsFinder has inline styles, can't be adapted
- [x] 99 tests passing

### NK-M ✅ (v8-nkm, 829b49d)
- [x] Plasma Mobile-inspired OS at `/nkm` — mobile/tablet only (≤1024px)
- [x] Gold accent, Oxanium + Noto Sans + Noto Mono fonts, isolated nkm.css
- [x] Boot screen (3.6s progress bar, tap to skip)
- [x] Lock screen — Oxanium clock, portfolio notifs, swipe-up to unlock
- [x] Home screen — 4-col icon grid, page dots, bottom dock
- [x] Status bar, notification panel (8 quick tiles + sliders), power menu (bottom sheet)
- [x] App drawer — swipe-up gesture, search
- [x] 6 full-screen apps: Terminal (+ Deax AI + quick-key toolbar), About, Projects, Skills (accordion), Contact, Deax
- [x] Desktop blocker (>1024px) with links to /nkos + /
- [x] Shutdown → spinner → poweroff → power button to reboot
- [x] Home bar — tap=back, triple-tap=power menu
- [x] DeaxButton "NK-M 📱" in both modes, hides on /nkm
- [x] 99 tests passing

### Bugs Fixed This Session
- [x] `getEnv()` dynamic `process.env[key]` → Next.js doesn't inline → chat "could not connect"
- [x] CSS `!important` can't override inline styles → rebuilt SkillsApp from scratch
- [x] React hooks order: `usePathname` return before `useEffect` → hydration mismatch
- [x] Chat widget not scrollable → flex chain `display:flex + minHeight:0` fix

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
