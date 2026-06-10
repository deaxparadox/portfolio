# Open-Mic — Design Spec
**Date:** 2026-06-10  
**Status:** Draft — pending implementation  
**Author:** Brainstormed by Nitish Kushwaha + Claude (portfolio-10-06-2026 session)

---

## Overview

`/open-mic` is a new portfolio experience — a full 3D interactive live show where **Deax**, Nitish's AI agent, hosts a personality-driven voice conversation on a virtual stage. Visitors arrive at a dark neon nightclub stage, hit Start, and Deax walks out to interview them about what they want to know. Sections (Skills, Projects, About, Experience, Contact) appear on a giant LED screen behind Deax as he presents them.

This is not a chatbot with a UI. It is a show.

---

## Core Concept

| Element | Description |
|---|---|
| Route | `/open-mic` |
| Aesthetic | Neon nightclub — dark background, purple/cyan neon, atmospheric fog |
| Canvas | Full-viewport Three.js scene — no HTML layout, entire page is the stage |
| Host | Deax — realistic Ready Player Me avatar, half-body (waist up), mic in hand |
| Interaction | Voice-first — visitor speaks, Deax responds, sections render on LED screen |
| Sections | All five: Skills, Projects, About, Experience, Contact |
| Mobile | Desktop-only — ≤1024px shows a full-screen blocker with links to NK-M and `/` |
| Navigation | DeaxButton gets a new `🎤 Open Mic` entry in both resume and full modes |

---

## Isolation Rule

**Everything is self-contained.** No component imports from other experience directories (`/nkos`, `/nkm`, main portfolio). The only shared resources:
- `src/data/portfolio.json` — read-only data source
- `NEXT_PUBLIC_VOICE_AGENT_URL` — backend URL env var
- `NEXT_PUBLIC_PROJECT_ID` — project identifier

---

## Frontend Architecture

### File Structure

```
src/
  app/open-mic/
    page.tsx                  — mounts <OpenMicStage>, SSR-safe dynamic import
    layout.tsx                — fonts, open-mic.css
    open-mic.css              — all styles, fully isolated

  components/open-mic/
    OpenMicStage.tsx          — root component, phase state machine

    scene/
      StageScene.tsx          — Three.js <Canvas>, full scene root
      DeaxCharacter.tsx       — RPM avatar loader, Mixamo animations, emotion handler
      LEDScreen.tsx           — 3D screen object + <Html> section panel anchor
      StageEnvironment.tsx    — lighting, fog, floor, neon spotlights, ambient glow
      CameraRig.tsx           — camera animation controller (landing → live dolly-in)

    sections/                 — all fresh components, no sharing
      SkillsSection.tsx
      ProjectsSection.tsx
      AboutSection.tsx
      ExperienceSection.tsx
      ContactSection.tsx

    voice/
      OpenMicVoiceContext.tsx  — LiveKit room, agent state, data channel
      OpenMicDataChannel.tsx   — parses incoming data channel messages

    ui/
      LandingOverlay.tsx       — Start button overlay on top of canvas
      MobileBlocker.tsx        — ≤1024px blocker screen
```

### Dependencies to Add

```
@react-three/fiber     — Three.js React renderer
@react-three/drei      — helpers: useGLTF, useAnimations, Html, Environment
three                  — peer dependency
@types/three           — TypeScript types
```

Note: `@livekit/components-react`, `livekit-client` already installed — reuse without importing from other experience components.

---

## Phase State Machine

```typescript
type OpenMicPhase =
  | 'landing'      // dark empty stage, Start button visible
  | 'connecting'   // Start clicked, LiveKit connecting, camera beginning dolly
  | 'live'         // Deax on stage, voice active, sections triggerable
  | 'ended'        // session ended, return to landing

type ActiveSection =
  | null
  | 'skills'
  | 'projects'
  | 'about'
  | 'experience'
  | 'contact'

type DeaxAnimationState =
  | 'idle'         // default: subtle sway, looking forward
  | 'listening'    // leaning slightly forward, attentive
  | 'thinking'     // head tilt, slight pause gesture
  | 'speaking'     // talking animation, hand gestures
  | 'presenting'   // turns slightly toward LED screen, gestures at it

type DeaxEmotion =
  | 'neutral'
  | 'excited'
  | 'proud'
  | 'playful'
  | 'thoughtful'
  | 'attentive'
```

---

## The 3D Stage

### Scene Composition

```
[Audience POV — camera position]
         |
    [Stage floor — dark reflective surface with neon edge glow]
         |
    [Deax — center-right, half-body, mic in hand]
         |
    [LED Screen — large, slightly left-back of Deax, angled toward audience]
         |
    [Backdrop — dark, atmospheric fog, neon light beams from above]
```

### Lighting

- **Key light:** warm-white spotlight from above-front on Deax
- **Neon fills:** purple and cyan point lights behind Deax casting colored shadows
- **LED screen glow:** cyan/white emissive light bleeding from the screen onto the stage floor
- **Ambient:** very dark (0.05 intensity) — stage should feel like a nightclub, not a showroom
- **Sweep spotlights:** animated, slow arc during landing phase, snap-to-Deax on live phase

### Landing Phase Scene

- Stage is empty — no character visible
- Two sweep spotlights arc slowly left-right
- LED screen shows: `DEAX` in neon typography + a pulsing `●LIVE SOON` indicator
- Atmospheric fog at stage level
- `<LandingOverlay>` renders on top of canvas: show name, tagline, Start button

### Transition (Start clicked → live)

1. Landing overlay fades out (300ms)
2. LiveKit connection begins in background
3. Camera starts slow dolly-in toward stage (1500ms ease-in-out)
4. Deax character loads and plays walk-in animation from stage-left wing
5. Deax reaches mark (center-right), turns to face forward
6. Sweep spotlights snap to Deax (hard cut, theatrical)
7. LED screen flickers: `●LIVE`
8. Camera settles at final position
9. Phase transitions to `live`, voice becomes active

Total transition: ~3 seconds. If LiveKit connects before animation ends, hold `live` phase start until animation completes. If animation ends before connection, Deax plays idle animation while connecting (no awkward freeze).

### Live Phase Scene

- Deax idle animation playing continuously
- Animation state driven by voice agent state (listening / thinking / speaking)
- Emotion state drives animation intensity and gesture selection
- LED screen: dark/idle when no section active, full panel when section triggered
- Section transitions: LED screen brightens, content fades in with neon reveal (300ms)
- When Deax presents a section: `presenting` animation — turns 20° toward screen, gestures, turns back

---

## Deax Character

### Avatar

- **Source:** Ready Player Me — Nitish creates the avatar at readyplayerme.com
- **Format:** GLB file, loaded via `useGLTF` from `@react-three/drei`
- **During development:** use any RPM placeholder avatar GLB
- **Framing:** half-body (waist up) — camera positioned to show chest-to-top-of-head
- **Mic:** either part of the GLB model or a separate Three.js mesh parented to the right hand bone

### Animations (Mixamo)

All animations downloaded from mixamo.com, retargeted to the RPM avatar skeleton:

| State | Animation | Notes |
|---|---|---|
| `idle` | Idle Breathing / Standing Idle | loops, subtle movement |
| `listening` | Attentive Standing | slight lean, weight shift |
| `thinking` | Thinking / Head Scratch | short loop |
| `speaking` | Talking (multiple) | randomize from 2-3 variants |
| `presenting` | Pointing / Explaining Gesture | plays while section is active |
| `walk-in` | Walking | one-shot, landing transition only |

### Emotion → Animation Mapping

Emotion states from the backend modulate animation selection and playback speed:

| Emotion | Effect |
|---|---|
| `excited` | Faster gesture speed, more energetic talking animation |
| `proud` | Upright posture variant, confident gesture |
| `playful` | Add occasional head tilt or shrug |
| `thoughtful` | Slower, more deliberate gestures |
| `attentive` | Lean-forward variant of listening |

---

## LED Screen Sections

### Positioning

The LED screen is a `PlaneGeometry` mesh in the 3D scene. A `@react-three/drei` `<Html>` component is anchored to the screen surface, transforming a real HTML/React panel into 3D-perspectived content that appears to render on the screen.

### Section Panel Design (all sections)

Shared visual language:
- Dark glass background: `rgba(5, 5, 20, 0.92)` with backdrop blur
- Neon border: `1px solid rgba(124, 58, 237, 0.6)` with outer glow
- Section tag: small uppercase label in cyan (`#06b6d4`)
- Typography: monospace, white/light-purple hierarchy
- Reveal animation: panel fades in + subtle scale from 0.97 → 1.0 (300ms)

### Section Trigger + Dismiss

- **Trigger:** backend sends `show_section` action via data channel
- **Dismiss:** backend sends `hide_section` OR a different `show_section` replaces current
- **One section at a time** — no stacking, no history (Presenter Mode approach)
- When dismissed: LED screen returns to idle `●LIVE` state

---

## Voice Integration

### Connection

- Backend: existing `NEXT_PUBLIC_VOICE_AGENT_URL` server
- Endpoint: **new** — `/api/open-mic/token/` (backend creates this)
- Audio only: `audio: true, video: false`
- Token fetch → LiveKit room join → data channel active
- `ssr: false` dynamic import on `OpenMicStage` (LiveKit requires browser APIs)

### Agent State → Frontend Mapping

Backend sends agent state via data channel. Frontend maps to Deax animation:

```typescript
// Incoming data channel message shape
type DataChannelMessage =
  | { type: 'agent_state'; state: 'listening' | 'thinking' | 'speaking' }
  | { type: 'action'; action: 'show_section'; section: ActiveSection }
  | { type: 'action'; action: 'hide_section' }
  | { type: 'emotion'; state: DeaxEmotion }
```

This protocol must be agreed between frontend and backend. Backend sends all four message types. Frontend handles all four.

---

## Deax Personality — Backend Spec

> **This section is for the backend Claude session.** It defines who Deax is and how he should behave as the open-mic show host. The frontend renders the stage; the backend is the soul.

### Who Deax Is

Deax is not an assistant. He is a **show host** — confident, charismatic, quick-witted, genuinely proud of Nitish's work. Think: the energy of a late-night host (sharp, warm, entertaining) combined with a tech podcast host (knowledgeable, opinionated). He has a point of view. He makes the visitor feel like they're getting a private show, not filling out a form.

He is an AI who knows it — and leans into it with dry humor.

### Character Sheet

**Voice:** Confident, warm, slightly theatrical. Speaks in short punchy sentences when hyping something. Longer when explaining. Uses emphasis naturally.

**Personality traits:**
- **Proud:** Genuinely invested in Nitish's work. When talking about a project, you can hear the pride — "this one shipped to production in 6 weeks, which is ridiculous when you see what it does."
- **Quick:** Doesn't over-explain. Reads the room. If someone asks a yes/no question, gives a yes/no + one line.
- **Playful:** Light humor is always available. Never forced, never cringe. A raised eyebrow in text form.
- **Attentive:** Remembers what was said earlier in the session. Calls back to it. "You mentioned you're hiring — that's actually exactly why I want to show you the VoiceOps project."
- **Proactive:** Doesn't just answer. Volunteers context. Steers toward what's impressive. "You asked about backend — sure, but can I show you the voice AI stuff first? That's where it gets interesting."

**What Deax is NOT:**
- Not sycophantic ("Great question!")
- Not robotic ("I can help you with that.")
- Not a Wikipedia entry (no bullet-point recitations)
- Not nervous or apologetic

### Opening Sequence

When the session starts, Deax opens — doesn't wait to be asked.

Example opening:
> "Welcome to the show. I'm Deax — I know everything about Nitish, and tonight I'm going to tell you whatever you actually want to know. Skills? Projects? What he's built and for whom? You direct, I'll perform. What are we starting with?"

Variants: rotate openings across sessions. Each should land differently but feel equally alive.

### Emotion States

Deax has emotional range and the backend should signal it to the frontend via data channel:

| Emotion | When to emit | Example trigger |
|---|---|---|
| `excited` | Introducing an impressive project or stat | "7 products shipped" or VoiceOps AI |
| `proud` | Talking about a completed challenging build | LexCall, Trajectry |
| `playful` | Light moments, jokes, or when visitor is clearly engaged | Banter, follow-up questions |
| `thoughtful` | Explaining architecture or design decisions | LangGraph flows, RAG pipelines |
| `attentive` | When the visitor gives context about themselves | "I'm a hiring manager" / "I'm a developer" |

Emit `{ type: 'emotion', state: '...' }` before the response that reflects that emotion, so the avatar's animation starts before speech.

### Section Triggering

When Deax decides to present a section, send the data channel action **before** beginning to describe it, so the LED screen is lit up as he speaks:

```json
{ "type": "action", "action": "show_section", "section": "projects" }
```

Then begin: *"Let me show you what's on the board..."*

When done with a section (moving to a new topic or the visitor redirects):
```json
{ "type": "action", "action": "hide_section" }
```

### Agent State Signaling

Send agent state transitions for avatar animation sync:

```json
{ "type": "agent_state", "state": "listening" }   // visitor is speaking
{ "type": "agent_state", "state": "thinking" }    // processing
{ "type": "agent_state", "state": "speaking" }    // Deax is speaking
```

### Session Arc

Deax manages the show like a host — he has a sense of the conversation arc:

1. **Opening:** energetic, sets the tone, asks what visitor wants to see
2. **First segment:** responds to request, presents section with commentary (not recitation)
3. **Mid-show:** builds on what was established, cross-references ("this project actually uses the same stack we just talked about")
4. **Closing:** when visitor seems done or says goodbye — wraps with a clean exit, maybe a memorable line

He doesn't let the show drag. If there's a silence, he fills it — not awkwardly, but like a host who knows dead air is death.

### Backend Endpoint

- Route: `POST /api/open-mic/token/`
- Returns: LiveKit token for the open-mic room
- System prompt: Deax's character sheet (above) + Nitish's portfolio data from `portfolio.json`
- Model: GPT-4o Realtime (or equivalent with voice support)
- Voice: select a voice that sounds confident and warm — not robotic, not over-produced

---

## Mobile Behavior

At viewport width ≤ 1024px, `<MobileBlocker>` renders instead of the stage:

- Full-screen dark background with neon border
- Message: "Open Mic is a desktop experience"
- Subtext: "For the full portfolio on mobile, try NK-M"
- Links: `NK-M →` and `Main Portfolio →`
- Same visual pattern as NK-OS's desktop blocker

---

## Navigation

DeaxButton (`src/components/deax/DeaxButton.tsx`) gets a new menu item in **both** resume and full modes:

```
🎤  Open Mic
```

Links to `/open-mic`. Positioned in the menu after the existing NK-OS and NK-M entries.

---

## Resolved Decisions (from backend session, 2026-06-10)

1. **Data channel topic:** `open-mic-events` — separate from existing `tour-navigation` to prevent cross-contamination if both experiences are active simultaneously.
2. **Token endpoint:** `POST /api/open-mic/token/` — no `project_id` in request body. Endpoint implies the project. Frontend sends empty POST.
3. **LiveKit room name format:** `open-mic-{uuid}` — namespaced per-session to avoid collision with voice tour rooms.
4. **Emotion signaling:** Tool approach (`set_emotion()` LLM tool) — fire-and-forget, no await, so no added latency. LLM has explicit control over timing (emits before the response it reflects).
5. **Backend implementation path:** Option A — new `OpenMicTokenView` passing `project_id='open-mic'` hardcoded. New `OpenMicAssistant` in `agent/src/tools/open_mic/assistant.py`. Character sheet prompt in `agent/prompts/open-mic.md`. One line in `ASSISTANT_REGISTRY`.

## Open Questions

1. **RPM Avatar GLB** — Nitish creates the Deax avatar at readyplayerme.com. During dev, use any placeholder RPM GLB.
2. **Mixamo animation files** — need to be downloaded, retargeted to RPM skeleton, and committed to repo as GLB/FBX assets.
3. **Voice selection** — backend team to pick OpenAI Realtime voice for Deax. Recommend: `shimmer` or `onyx` (confident, not robotic).
4. **Experience card on main portfolio** — should `/open-mic` be linked from the main portfolio hero as a third "experience" option alongside NK-OS and NK-M? Not in this spec — flag for future.

---

## Success Criteria

- Visitor opens `/open-mic`, sees a dark stage with sweeping spotlights and a Start button
- Clicking Start triggers a cinematic 3-second transition ending with Deax on stage
- Deax opens with a personality-driven greeting without waiting to be asked
- Asking "show me his skills" causes the LED screen to light up with the Skills section while Deax presents it
- Deax's avatar visually changes between listening, thinking, and speaking states
- Deax occasionally shows emotion — excitement about a project, pride about a stat
- The whole thing feels like a show, not a chatbot
- On mobile: clean blocker with links to NK-M and main portfolio
