# Voice Tour Frontend — Design Spec

**Date:** 2026-05-28  
**Branch:** to be created from `dev` (e.g. `v4-voice-tour`)  
**Mode:** Full experience only (`/?mode=full`)  
**Backend:** Already built in `interview-prep` project. Do not rebuild.

---

## What This Is

A voice tour widget that lets visitors talk to "Deax" — an AI agent that narrates the portfolio and navigates between sections. The agent speaks, the visitor can ask questions, and the frontend scrolls to relevant sections on command.

The widget is only active on `/?mode=full`. Resume mode visitors never see it.

---

## Backend Contract (do not change)

### Token endpoint

```
POST $NEXT_PUBLIC_VOICE_AGENT_URL/api/voice-tour/token/
Content-Type: application/json

{ "project_id": "portfolio" }

Response: { "token": "<LiveKit JWT>", "ws_url": "wss://..." }
```

No auth required. Call when visitor confirms mic.

### Data channel messages

Topic: `tour-navigation`

```json
{ "type": "scroll", "section": "projects" }
{ "type": "end_tour" }
```

Valid sections: `hero`, `skills`, `projects`, `glimpse`, `experience`, `contact`

Future (not yet): `{ "type": "navigate", "path": "/projects/vgents" }` — see Future section.

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_VOICE_AGENT_URL=https://your-interview-prep-backend.com
```

---

## Architecture

### Component tree in `layout.tsx`

```
VoiceTourProvider
  ├── {children}             ← FullExperienceShell or ResumePortfolio
  ├── Suspense → DeaxButton  ← hides when phase is intro/active/minimized
  └── VoiceTourWidget        ← invisible when phase is idle/ended
```

### Files to create

```
src/components/voice-tour/
├── VoiceTourContext.tsx       ← Context + Provider + useVoiceTour hook
├── VoiceTourWidget.tsx        ← dynamic(ssr:false) wrapper
├── VoiceTourWidgetInner.tsx   ← LiveKitRoom lives here, never unmounts
├── IntroScreen.tsx            ← mic permission + token fetch + start button
├── ActivePanel.tsx            ← terminal-style panel, BarVisualizer
├── MinimizedPill.tsx          ← vertical roll Deax ↔ Talking pill
└── DataChannelHandler.tsx     ← section scroll + end_tour handler
```

### Files to modify

```
src/app/layout.tsx                    ← add VoiceTourProvider + VoiceTourWidget
src/components/deax/DeaxButton.tsx    ← wire "Talk to Deax", hide when tour active
src/components/hero/Terminal.tsx      ← add "talk to deax instead →" footer hint
```

### z-index

| Component | z-index |
|---|---|
| Nav | 100 |
| DeaxButton / TerminalFloating | 200 |
| VoiceTourWidget | 250 |
| TerminalMaximized | 300 |

Widget at 250 — above DeaxButton, below TerminalMaximized (fullscreen terminal correctly covers widget).

### Packages to install

```bash
npm install @livekit/components-react @livekit/components-styles livekit-client
```

**Critical:** Import `@livekit/components-styles` as a JS import, not a CSS `@import`. Tailwind v4 incompatibility.

```ts
import '@livekit/components-styles'  // ✅ correct
// @import '@livekit/components-styles'  // ❌ breaks with Tailwind v4
```

---

## State Machine

Five phases. `VoiceTourContext` owns the state.

```
idle
 │  user clicks "Talk to Deax" (full mode only) OR terminal footer hint
 ▼
intro          ← IntroScreen: mic info + "Start voice tour" button
 │  fetch token succeeds → setConnection(token, wsUrl) → setPhase('active')
 ▼
active         ← ActivePanel: terminal widget + BarVisualizer + agent state label
 │  minimize button
 ▼
minimized      ← MinimizedPill: vertical roll Deax ↔ Talking, mic icon, glow
 │  click pill to expand back to active
 ▲──────────────┘
 │  "end tour" button OR agent sends { type: "end_tour" }
 ▼
ended          ← nothing renders, reset() called after 300ms → back to idle
```

### Visibility per phase

| Phase | DeaxButton | Widget |
|---|---|---|
| `idle` | visible | hidden (`return null`) |
| `intro` | hidden | IntroScreen |
| `active` | hidden | ActivePanel (inside LiveKitRoom) |
| `minimized` | hidden | MinimizedPill (inside LiveKitRoom, display:none on ActivePanel) |
| `ended` | visible (after reset) | hidden |

DeaxButton returns `null` when `phase` is `intro`, `active`, or `minimized`.

---

## Components

### `VoiceTourContext.tsx`

```ts
type TourPhase = 'idle' | 'intro' | 'active' | 'minimized' | 'ended'

interface VoiceTourContextValue {
  phase: TourPhase
  token: string | null
  wsUrl: string | null
  startTour: () => void           // setPhase('intro')
  setConnection: (token: string, wsUrl: string) => void
  setPhase: (phase: TourPhase) => void
  reset: () => void               // phase → idle, clears token + wsUrl
}
```

Exports `VoiceTourProvider` and `useVoiceTour()`. Pattern identical to `ThemeContext.tsx`.

---

### `VoiceTourWidget.tsx`

Thin wrapper only. Single responsibility: prevent SSR crash.

```ts
export const VoiceTourWidget = dynamic(
  () => import('./VoiceTourWidgetInner').then(m => m.VoiceTourWidgetInner),
  { ssr: false }
)
```

---

### `VoiceTourWidgetInner.tsx`

Reads context. Returns null when `idle` or `ended`. Renders `IntroScreen` when `intro`. Mounts `<LiveKitRoom>` once when leaving `intro` — never unmounts until `ended`.

```
phase = idle/ended   → return null
phase = intro        → <IntroScreen />
phase = active/minimized →
  <LiveKitRoom token wsUrl audio video={false}>
    <RoomAudioRenderer />           ← REQUIRED — without this audio is received but not played
    <DataChannelHandler />
    <div style display:block/none> <ActivePanel />   </div>
    <div style display:block/none> <MinimizedPill /> </div>
  </LiveKitRoom>
```

Position: `fixed`, `bottom: 28px`, `right: 28px`, `zIndex: 250`.
DeaxButton hides when tour is active so there is no overlap — widget sits in the exact same spot.

---

### `IntroScreen.tsx`

Terminal-styled card. States: default, loading, error.

- "Start voice tour" button → fetches token → on success: `setConnection` + `setPhase('active')`
- On fetch failure: stay on intro, show `"Could not connect. Please try again."` inline, re-enable button
- "Cancel" → `setPhase('idle')`
- No pre-requesting mic permission — LiveKit handles it on connect

---

### `ActivePanel.tsx`

Uses `useVoiceAssistant()` from `@livekit/components-react`.

Terminal-style layout:
```
$ deax --connect
────────────────────────────────
> {stateLabel}               ← Connecting… / Listening… / Thinking… / Speaking
[BarVisualizer]              ← only rendered when state is 'speaking'
────────────────────────────────
[ minimize ]    [ end tour ]
```

State labels:
```ts
const STATE_LABEL: Record<string, string> = {
  initializing: 'Connecting…',
  disconnected: 'Connecting…',
  listening:    'Listening…',
  thinking:     'Thinking…',
  speaking:     'Speaking',
}
```

---

### `MinimizedPill.tsx`

Reads `agentState` from `useVoiceAssistant()`. Must be inside `<LiveKitRoom>`.

- Mic icon `🎙` replaces the bouncing dot from DeaxButton
- Label: vertical roll animation between `"Deax"` (listening/thinking/connecting) and `"Talking"` (speaking)
- Animation: word slides up+out, new word slides in from below — `transform: translateY` + `opacity`
- Glow: `box-shadow` pulses stronger when speaking, dims otherwise
- Click → `setPhase('active')`

Visually identical to DeaxButton pill so the transition feels seamless to the visitor.

---

### `DataChannelHandler.tsx`

Must be a child of `<LiveKitRoom>`. Returns null (no visual).

```ts
const VALID_SECTIONS = new Set(['hero', 'skills', 'projects', 'glimpse', 'experience', 'contact'])

// scroll handler
if (payload.type === 'scroll') {
  if (!VALID_SECTIONS.has(payload.section)) return  // allowlist — silent reject
  document.querySelector('#' + payload.section)?.scrollIntoView({ behavior: 'smooth' })
}

// end handler
if (payload.type === 'end_tour') onEnd()

// FUTURE: navigate handler (add when /projects/[slug] pages exist)
// if (payload.type === 'navigate') {
//   const VALID_PATHS = new Set(['/projects/vgents', ...])
//   if (VALID_PATHS.has(payload.path)) router.push(payload.path)
// }
```

All wrapped in try/catch — malformed messages silently ignored.

---

### `Terminal.tsx` — modification

Add footer inside embedded terminal. Only shown when `phase === 'idle'`.

```
[ existing terminal content ]
──────────────────────────────   ← 1px gold divider line
🎙  talk to deax instead →       ← monospace, gold muted, clickable
```

On click → `startTour()`. Hidden once tour starts (phase leaves idle).

---

### `DeaxButton.tsx` — modification

Two changes:

1. Returns `null` when `phase` is `intro`, `active`, or `minimized`
2. "Talk to Deax" menu item:
   - Only shown when `mode === 'full'`
   - Calls `startTour()` on click
   - Removes `[soon]` badge and `opacity: 0.45` disabled state

---

## Visual Design

All components use portfolio CSS variables. No hardcoded colours in widget components.

```css
/* globals.css — add to voice tour section */
.voice-tour-widget {
  --vt-bg:       #0a0800;
  --vt-border:   rgba(245, 197, 24, 0.22);
  --vt-text:     #f5eddb;
  --vt-text-dim: rgba(245, 197, 24, 0.40);
  --vt-accent:   #f5c518;          /* same as --accent */
}
```

Widget `font-family`: `var(--font-jetbrains-mono)` (DM Mono) — matches Smart Terminal.

---

## Error Handling

| Error | Where | Recovery |
|---|---|---|
| Token fetch network failure | IntroScreen | Show inline error, re-enable button, user retries |
| Token fetch bad response | IntroScreen | Same as above |
| Mic permission denied | LiveKit internal | ActivePanel shows "Connecting…" indefinitely, user clicks "end tour" |
| LiveKit connection drop | LiveKit internal (auto-reconnect) | State label shows "Connecting…", user can end tour if stuck |
| DataChannel malformed message | DataChannelHandler try/catch | Silently ignored |

---

## Testing

New test files in `src/__tests__/`:

### `VoiceTourContext.test.tsx` (5 tests)
- Default phase is `idle`
- `startTour()` sets phase to `intro`
- `setConnection()` stores token + wsUrl
- `setPhase('ended')` updates phase
- `reset()` clears token, wsUrl, returns to `idle`

### `DeaxButton.test.tsx` (3 new, adds to existing 5)
- "Talk to Deax" visible when `mode=full` and `phase=idle`
- "Talk to Deax" absent when `mode=resume`
- DeaxButton returns null when `phase=active`

### `IntroScreen.test.tsx` (4 tests)
- Renders start + cancel buttons
- Cancel calls `setPhase('idle')`
- Shows error message when fetch fails
- Start button disabled while loading

### `DataChannelHandler.test.tsx` (3 tests)
- Valid section → `scrollIntoView` called
- Invalid section → `scrollIntoView` not called
- `end_tour` → `onEnd` callback fires

**Total new: ~15 tests. Suite: 65 → ~80 passing.**

ActivePanel and MinimizedPill are not unit tested — they depend on `useVoiceAssistant()` from LiveKit which requires a live room. Manual verification in browser.

---

## Future: Multi-Page Navigation

When `/projects/[slug]` pages are added:

1. Add `navigate` message type to `DataChannelHandler` (slot marked with comment)
2. Add `VALID_PATHS` allowlist matching new routes
3. Use `router.push(payload.path)` — tour survives because `VoiceTourWidget` is in root layout which never unmounts across App Router navigations

No architectural changes needed — the foundation is already correct.

---

## How to Resume

```bash
git checkout dev
git checkout -b v4-voice-tour
cd src
npm install @livekit/components-react @livekit/components-styles livekit-client
npm test   # should still be 65 passing before any changes
```

Build order: Context → Widget shell → IntroScreen → ActivePanel → MinimizedPill → DataChannelHandler → layout wiring → Terminal footer → DeaxButton changes → tests
