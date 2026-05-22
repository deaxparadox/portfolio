# Portfolio — Feature Roadmap

**Date:** 2026-05-22  
**Status:** Planning

Four independent subsystems to be built in sequence. Each gets its own spec → plan → implementation cycle.

---

## Subsystem 1 — Visual Improvements

**Priority:** First  
**Blockers:** None  
**Status:** Brainstorming in progress

Polish and improve the existing portfolio UI. Specific improvements to be defined during brainstorm. No new dependencies — pure frontend work on the existing Next.js app.

---

## Subsystem 2 — Voice Agent Widget (LiveKit)

**Priority:** Second  
**Blockers:** Flagship backend must expose a LiveKit token endpoint (or be mockable)  
**Status:** Logged, not started

LiveKit-powered conversational voice agent embedded in the portfolio. Visitors can talk to the agent in natural language. The agent:
- Answers questions about Nitish (about, skills, projects, experience, contact)
- Navigates the portfolio page in real-time (`router.push('#section')`) while speaking — e.g. visitor asks about experience → agent navigates to `#experience` then talks about it
- Is **dynamic**: name, room prefix, personality configurable per portfolio/project (driven by `portfolio.json` or env vars)
- Backend is Nitish's flagship AI agent project (separate repo, still in development)

**Frontend responsibilities:**
- LiveKit room connection + token fetch from flagship backend
- Audio UI (speak button, waveform/indicator, agent name)
- Navigation bridge: agent sends section events → Next.js `router.push()`
- Config: agent name, room prefix, backend URL from `portfolio.json` or `.env`

**Open questions to resolve during brainstorm:**
- What does the flagship backend's token API look like? (endpoint, auth, params)
- How does the agent signal navigation intent to the frontend? (data messages, function calls, custom events)
- Where does agent config live — `portfolio.json`, `.env.local`, or both?

---

## Subsystem 3 — Chatbot Widget

**Priority:** Third  
**Blockers:** Backend chat API (may reuse flagship backend or be separate)  
**Status:** Logged, not started

Text-based conversational assistant with the same navigation behavior as the voice agent. Visitor types a question → chatbot responds and navigates the portfolio to the relevant section.

**Relationship to voice agent:** Shares the navigation bridge logic. Can reuse the same "section routing" system designed for Subsystem 2.

**Open questions:**
- Does this use the same flagship backend (different modality) or a separate chat API?
- UI: floating chat bubble? Side panel? Inline?

---

## Subsystem 4 — Combined Mode (Voice + Chat)

**Priority:** Fourth  
**Blockers:** Subsystems 2 and 3 must be complete  
**Status:** Logged, not started

Voice and chat simultaneously in one unified interface — likely only achievable via LiveKit (which supports both audio and data channels). Visitor can speak AND type; agent responds via both voice and text.

**Relationship to LiveKit:** LiveKit data channels can carry chat messages alongside audio streams, making this a natural extension of Subsystem 2.

---

## Build Order

```
Subsystem 1 (Visual) → Subsystem 2 (Voice) → Subsystem 3 (Chat) → Subsystem 4 (Combined)
         ↑ now                 ↑ after flagship backend ready
```

---

## Notes

- Subsystems 2, 3, 4 all share a **navigation bridge** — a React hook or context that listens for agent navigation intents and calls `router.push()`. Design this once in Subsystem 2 and reuse.
- The flagship backend project is a separate repo being built in parallel by Nitish. Portfolio frontend should be designed with a clean API boundary so it can connect to whatever endpoint the backend exposes.
- Similar planning exists in the flagship project — keep the API contract in sync between both.
