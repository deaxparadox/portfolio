# Chatbot Frontend — Design Spec

**Date:** 2026-05-28
**Branch:** to be created from `v4` (e.g. `v5-chatbot`)
**Backend spec:** `interview-prep/docs/phase3/specs/P3-M07-portfolio-chatbot.md`
**Backend:** Already specced. Django `chat` app, LangGraph 5-node graph, SSE streaming.

---

## What This Is

A text chatbot widget ("Chat with Deax") powered by a LangGraph agent. Two entry points:
1. **Floating widget** — opened via DeaxButton in both `/?mode=resume` and `/?mode=full`
2. **Terminal inline** — unknown commands in the Smart Terminal (full mode only) stream Deax's response directly into the terminal output

Both entry points share the same `thread_id` — Deax remembers the full conversation regardless of which entry point was used.

---

## Backend Contract

### Session creation
```
POST $NEXT_PUBLIC_VOICE_AGENT_URL/api/chat/session/
Content-Type: application/json
Body: {}

Response 201: { "thread_id": "<uuid>" }
```

Call once on first `openChat()`. Store `thread_id` for the session lifetime.

### Message + SSE stream
```
POST $NEXT_PUBLIC_VOICE_AGENT_URL/api/chat/message/
Content-Type: application/json
Body: { "message": "...", "thread_id": "<uuid>" }

Response 200: Content-Type: text/event-stream

data: {"type": "token",  "content": "I'd love"}
data: {"type": "action", "action": "scroll", "section": "projects"}
data: {"type": "token",  "content": " to show you the projects section."}
data: {"type": "done"}
```

Error — unknown thread_id:
```
Response 400: { "error": "Invalid session." }
```

### Environment variable
Reuses `NEXT_PUBLIC_VOICE_AGENT_URL` — no new variable needed. Chat endpoints are on the same host as the voice agent.

---

## Architecture

### Component tree in `layout.tsx`

```
VoiceTourProvider
  ChatProvider
    {children}
    Suspense → DeaxButton   ← reads both contexts for mutual exclusion
    VoiceTourWidget
    ChatWidget
```

Both contexts are available to any child component. `DeaxButton` reads both to enforce mutual exclusion at UI level — the contexts themselves are independent.

### Files to create

```
src/components/chat/
├── ChatContext.tsx      ← context + provider + useChatContext hook
├── ChatWidget.tsx       ← dynamic(ssr:false) wrapper
├── ChatWidgetInner.tsx  ← floating panel shell
├── ChatPanel.tsx        ← message list + input + streaming cursor
├── ChatMessage.tsx      ← individual message bubble
└── chatApi.ts          ← createSession() + streamMessage()
```

### Files to modify

```
src/app/layout.tsx                   ← add ChatProvider + ChatWidget
src/components/deax/DeaxButton.tsx   ← "Chat with Deax" option in both modes
src/components/hero/Terminal.tsx     ← unknown command → stream inline via ChatContext
src/components/voice-tour/VoiceTourContext.tsx  ← startTour() checks chatIsOpen
```

### z-index

Widget at `250` — same as VoiceTourWidget. They are mutually exclusive so they never overlap.

---

## State

### Message type

```ts
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean   // true while SSE tokens are still arriving
}
```

### ChatContext value

```ts
interface ChatContextValue {
  isOpen: boolean
  messages: Message[]
  threadId: string | null
  isStreaming: boolean
  openChat: () => void                      // creates session if needed, sets isOpen true
  closeChat: () => void                     // sets isOpen false
  sendMessage: (text: string) => Promise<void>  // used by ChatPanel AND Terminal
}
```

### Session lifecycle

- `threadId` starts `null`
- First `openChat()` → `POST /api/chat/session/` → stores `threadId`
- `threadId` persists for the browser session (page reload = new session = fresh memory)
- Both floating widget and terminal use the same `threadId`

### Streaming state

- `isStreaming = true` while SSE is active
- Last message has `streaming: true`, its `content` grows token by token
- On `done`: `isStreaming = false`, `streaming` flag removed from last message
- Input disabled while `isStreaming`

---

## Mutual Exclusion

Chat and voice tour cannot be open simultaneously — both occupy `bottom: 28, right: 28`.

Enforced **at UI level only** — the contexts are independent and do not read each other:

- `DeaxButton` reads both `chatIsOpen` and `voiceTourPhase` before calling `openChat()` or `startTour()`. If the other is active, the button is greyed out and the click is a no-op.
- `Terminal.tsx` footer hint (voice tour) and terminal inline chat both check phase/isOpen before acting.
- Neither `ChatContext` nor `VoiceTourContext` imports or reads the other — clean separation.

---

## Components

### `chatApi.ts`

Pure functions, no React. Two exports:

```ts
async function createSession(): Promise<string>
// POST /api/chat/session/ → returns thread_id

async function streamMessage(
  message: string,
  threadId: string,
  callbacks: {
    onToken: (content: string) => void
    onScroll: (section: string) => void
    onDone: () => void
    onError: (msg: string) => void
  }
): Promise<void>
```

SSE consumed via `fetch` + `ReadableStream` — `EventSource` is GET-only, can't send POST body.

**Parsing:** split response body by `\n`, find lines starting with `data: `, parse JSON, route by `type`.

**Scroll security:** `VALID_SECTIONS = new Set(['hero','skills','projects','glimpse','experience','contact'])` — validate `section` before firing `onScroll`. Silently ignore anything not in the set.

**400 recovery:** if response status is 400 (expired `thread_id`), `onError` fires with `"session_expired"` — `ChatContext` handles retry (create new session, resend message once).

---

### `ChatContext.tsx`

Holds all state. `sendMessage()` flow:

1. Append user message to `messages`
2. Append empty assistant message with `streaming: true`
3. Call `chatApi.streamMessage()`:
   - `onToken` → update last message `content` in-place via `setMessages`
   - `onScroll` → `document.querySelector('#' + section)?.scrollIntoView({ behavior: 'smooth' })`
   - `onDone` → remove `streaming` flag, set `isStreaming = false`
   - `onError("session_expired")` → clear `threadId`, call `createSession()`, retry message once
   - `onError(other)` → mark last message with error text, set `isStreaming = false`

Pattern identical to `ThemeContext.tsx` and `VoiceTourContext.tsx` — same Provider + hook structure.

---

### `ChatWidget.tsx`

```ts
'use client'
import dynamic from 'next/dynamic'

export const ChatWidget = dynamic(
  () => import('./ChatWidgetInner').then(m => m.ChatWidgetInner),
  { ssr: false }
)
```

`'use client'` required — `dynamic` with `ssr:false` needs a Client Component in App Router.

---

### `ChatWidgetInner.tsx`

- Returns `null` when `!isOpen`
- Fixed `bottom: 28, right: 28, zIndex: 250`
- Terminal-style header: `$ deax --chat` + close button (calls `closeChat()`)
- Body: `<ChatPanel />`
- Width: `300px` (wider than voice tour panel — needs space for conversation)
- Max height: `420px` with scrollable message list

---

### `ChatPanel.tsx`

- Scrollable message list — auto-scrolls to bottom on new content (`useEffect` on `messages`)
- Each message: `<ChatMessage role content streaming />`
- Streaming assistant message shows blinking cursor `▊` appended to content while `streaming: true`
- Input: `<input>` + send button
- Send on Enter (no Shift+Enter) or button click
- Input and button disabled while `isStreaming`
- On send: calls `sendMessage(inputValue)`, clears input

---

### `ChatMessage.tsx`

```
User message:    right-aligned, background rgba(245,197,24,0.12), border rgba(245,197,24,0.20)
                 border-radius: 10px 10px 2px 10px
                 Label: "YOU" — right-aligned, 8px, dimmed

Assistant msg:   left-aligned, background rgba(255,255,255,0.04), border rgba(255,255,255,0.08)
                 border-radius: 2px 10px 10px 10px
                 Label: "DEAX" — left-aligned, 8px, gold muted
```

Font: `var(--font-jetbrains-mono)` (DM Mono) — consistent with Smart Terminal and voice tour.

---

### `DeaxButton.tsx` — modifications

Add `"Chat with Deax"` menu item in **both modes** (resume + full):

```tsx
{/* Always visible regardless of mode */}
<button onClick={() => { setOpen(false); openChat() }}>
  Chat with Deax
  <span>💬</span>
</button>
```

Greyed out (pointer-events none, opacity 0.4) when voice tour is active (`phase !== 'idle' && phase !== 'ended'`).

DeaxButton returns `null` when `chatIsOpen === true` — same pattern as voice tour. The chat widget's close button (✕) is the exit. This keeps the bottom-right corner uncluttered: one thing at a time.

---

### `Terminal.tsx` — modifications

Replace the unknown command handler's "AI chat is not available yet" with inline streaming:

```tsx
// Unknown command in executeCommand():
// 1. Echo the command as gold prompt + cyan input (existing pattern)
// 2. Add "DEAX" response line with temp streaming id
// 3. Call sendMessage(input) from ChatContext
// 4. onToken callbacks update that line's content in-place via setLines
// 5. onDone finalises, re-enables terminal input
// 6. onScroll fires scrollIntoView (same as widget)
```

**Terminal does NOT open the floating widget** — response stays inline.

**Implementation detail:** streaming line updated in-place:
```ts
const streamId = ++lineIdRef.current
addLine(`<span style="color:#f5c518">deax</span> <span style="color:rgba(245,237,219,0.4)">></span> `)
// on each token:
setLines(prev => prev.map(l =>
  l.id === streamId ? { ...l, html: l.html + esc(token) } : l
))
```

---

## Error Handling

| Error | Where | Recovery |
|---|---|---|
| Session create fails | `openChat()` | Show error in widget header "Connection failed", retry button, don't set `isOpen` |
| Message fetch fails | `sendMessage()` | Replace streaming message with "Could not reach Deax. Try again.", re-enable input |
| 400 Invalid session | `chatApi.ts` `onError("session_expired")` | Clear `threadId`, create new session, retry message once automatically |
| SSE stream drops mid-response | `chatApi.ts` | `onError` fires, partial content preserved + " [connection lost]" appended |
| Invalid scroll section | `chatApi.ts` | VALID_SECTIONS check — silently ignored |
| Terminal streaming fails | `Terminal.tsx` | Add red error line `> connection error`, re-enable input |

---

## Testing

New test files in `src/__tests__/`:

### `ChatContext.test.tsx` (5 tests)
- Default: `isOpen false`, `messages []`, `threadId null`
- `openChat()` calls `createSession` and sets `isOpen true`
- `closeChat()` sets `isOpen false`
- `sendMessage()` appends user message then assistant message
- `isStreaming` true during stream, false after done

### `chatApi.test.ts` (4 tests)
- `createSession` returns `thread_id` on 201
- `streamMessage` fires `onToken` for each token event
- `streamMessage` fires `onScroll` only for valid sections
- `streamMessage` fires `onDone` on done event

### `ChatMessage.test.tsx` (2 tests)
- User message renders with "YOU" label
- Assistant message renders with "DEAX" label

**Total new: ~11 tests. Suite: 80 → ~91 passing.**

---

## What's Not Tested (manual verification)

- Actual SSE streaming in browser (requires live backend)
- Terminal inline streaming animation
- Auto-scroll behaviour in ChatPanel
- Mutual exclusion UX (chat + voice tour buttons)

---

## How to Resume

```bash
git checkout v4
git checkout -b v5-chatbot
cd src && npm test   # 80 passing baseline
```

Build order: chatApi → ChatContext → ChatMessage → ChatPanel → ChatWidgetInner → ChatWidget → layout wiring → DeaxButton → Terminal → tests
