# Chatbot Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a text chatbot widget ("Chat with Deax") that lets visitors talk to a LangGraph AI agent via SSE streaming, with two entry points: a floating widget (both modes) and inline terminal streaming (full mode).

**Architecture:** `ChatContext` (separate from VoiceTourContext) holds session + message state. `ChatWidget` (dynamic ssr:false) is the floating panel. Terminal's unknown command handler streams Deax's response directly into terminal output using the shared `thread_id`. Mutual exclusion enforced by `DeaxButton` at UI level — contexts are independent.

**Tech Stack:** Next.js 16.2.6, TypeScript, React Context, fetch + ReadableStream (SSE), Jest + RTL

**Spec:** `docs/superpowers/specs/2026-05-28-chatbot-frontend-design.md`
**Backend spec:** `interview-prep/docs/phase3/specs/P3-M07-portfolio-chatbot.md`

---

## File Map

### Create
| File | Responsibility |
|---|---|
| `src/components/chat/chatApi.ts` | `createSession()` + `streamMessage()` — pure fetch functions, no React |
| `src/components/chat/ChatContext.tsx` | Context + Provider + `useChatContext()` hook |
| `src/components/chat/ChatWidget.tsx` | `dynamic(ssr:false)` wrapper |
| `src/components/chat/ChatWidgetInner.tsx` | Floating panel shell — returns null when closed |
| `src/components/chat/ChatPanel.tsx` | Message list + input + streaming cursor |
| `src/components/chat/ChatMessage.tsx` | Individual message bubble |
| `src/__tests__/chatApi.test.ts` | SSE parsing, scroll allowlist, error handling |
| `src/__tests__/ChatContext.test.tsx` | State machine tests |
| `src/__tests__/ChatMessage.test.tsx` | Bubble rendering tests |

### Modify
| File | Change |
|---|---|
| `src/app/layout.tsx` | Add `ChatProvider` + `ChatWidget` |
| `src/components/deax/DeaxButton.tsx` | Add "Chat with Deax" (both modes); hide when `isOpen`; grey out when voice tour active |
| `src/components/hero/Terminal.tsx` | Unknown command → stream Deax response inline |
| `src/__tests__/DeaxButton.test.tsx` | Update wrap to include ChatProvider; add 3 new tests |

---

## Task 1: chatApi.ts (TDD)

**Files:**
- Create: `src/components/chat/chatApi.ts`
- Create: `src/__tests__/chatApi.test.ts`

- [ ] **Step 1.1: Write failing tests**

Create `src/__tests__/chatApi.test.ts`:

```ts
import { createSession, streamMessage } from '@/components/chat/chatApi'

function makeStream(events: object[]) {
  const encoder = new TextEncoder()
  const chunks = events.map(e => encoder.encode(`data: ${JSON.stringify(e)}\n\n`))
  let i = 0
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < chunks.length) controller.enqueue(chunks[i++])
      else controller.close()
    },
  })
}

describe('createSession', () => {
  it('returns thread_id on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 201,
      json: async () => ({ thread_id: 'abc-123' }),
    }) as jest.Mock
    expect(await createSession()).toBe('abc-123')
  })
})

describe('streamMessage', () => {
  it('fires onToken for each token event', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200,
      body: makeStream([
        { type: 'token', content: 'Hello' },
        { type: 'token', content: ' world' },
        { type: 'done' },
      ]),
    }) as jest.Mock
    const tokens: string[] = []
    const onDone = jest.fn()
    await streamMessage('hi', 'tid', {
      onToken: t => tokens.push(t),
      onScroll: jest.fn(), onDone, onError: jest.fn(),
    })
    expect(tokens).toEqual(['Hello', ' world'])
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('fires onScroll only for valid sections, not invalid', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200,
      body: makeStream([
        { type: 'action', action: 'scroll', section: 'projects' },
        { type: 'action', action: 'scroll', section: 'evil-script' },
        { type: 'done' },
      ]),
    }) as jest.Mock
    const scrolled: string[] = []
    await streamMessage('show', 'tid', {
      onToken: jest.fn(),
      onScroll: s => scrolled.push(s),
      onDone: jest.fn(), onError: jest.fn(),
    })
    expect(scrolled).toEqual(['projects'])
  })

  it('fires onError with session_expired on 400', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400 }) as jest.Mock
    const onError = jest.fn()
    await streamMessage('hi', 'bad', {
      onToken: jest.fn(), onScroll: jest.fn(), onDone: jest.fn(), onError,
    })
    expect(onError).toHaveBeenCalledWith('session_expired')
  })

  it('fires onDone on done event', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200,
      body: makeStream([{ type: 'done' }]),
    }) as jest.Mock
    const onDone = jest.fn()
    await streamMessage('hi', 'tid', {
      onToken: jest.fn(), onScroll: jest.fn(), onDone, onError: jest.fn(),
    })
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 1.2: Run to confirm failure**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPatterns="chatApi" --no-coverage
```
Expected: FAIL — `Cannot find module '@/components/chat/chatApi'`

- [ ] **Step 1.3: Implement chatApi.ts**

Create `src/components/chat/chatApi.ts`:

```ts
const BASE_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ''

const VALID_SECTIONS = new Set([
  'hero', 'skills', 'projects', 'glimpse', 'experience', 'contact',
])

export async function createSession(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/chat/session/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!res.ok) throw new Error('session_create_failed')
  const data = await res.json()
  return data.thread_id as string
}

export interface StreamCallbacks {
  onToken: (content: string) => void
  onScroll: (section: string) => void
  onDone: () => void
  onError: (msg: string) => void
}

export async function streamMessage(
  message: string,
  threadId: string,
  callbacks: StreamCallbacks,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}/api/chat/message/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, thread_id: threadId }),
    })
  } catch {
    callbacks.onError('network_error')
    return
  }

  if (res.status === 400) { callbacks.onError('session_expired'); return }
  if (!res.ok) { callbacks.onError('server_error'); return }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const json = line.slice(6).trim()
        if (!json) continue
        try {
          const event = JSON.parse(json)
          if (event.type === 'token' && event.content) {
            callbacks.onToken(event.content)
          } else if (event.type === 'action' && event.action === 'scroll') {
            const section = event.section
            if (typeof section === 'string' && VALID_SECTIONS.has(section)) {
              callbacks.onScroll(section)
            }
          } else if (event.type === 'done') {
            callbacks.onDone()
            return
          }
        } catch {
          // malformed event — ignore
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
  callbacks.onDone()
}
```

- [ ] **Step 1.4: Run to confirm passing**

```bash
npm test -- --testPathPatterns="chatApi" --no-coverage
```
Expected: `Tests: 4 passed, 4 total`

- [ ] **Step 1.5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/chat/chatApi.ts src/__tests__/chatApi.test.ts
git commit -m "feat: chatApi — createSession + streamMessage with SSE parsing and VALID_SECTIONS allowlist"
```

---

## Task 2: ChatContext.tsx (TDD)

**Files:**
- Create: `src/components/chat/ChatContext.tsx`
- Create: `src/__tests__/ChatContext.test.tsx`

- [ ] **Step 2.1: Write failing tests**

Create `src/__tests__/ChatContext.test.tsx`:

```tsx
import { render, screen, act, waitFor } from '@testing-library/react'
import { ChatProvider, useChatContext } from '@/components/chat/ChatContext'

jest.mock('@/components/chat/chatApi', () => ({
  createSession: jest.fn().mockResolvedValue('mock-thread-id'),
  streamMessage: jest.fn().mockImplementation((_msg, _tid, cb) => {
    cb.onToken('Hello')
    cb.onDone()
    return Promise.resolve()
  }),
}))

function Probe() {
  const ctx = useChatContext()
  return (
    <div>
      <span data-testid="isOpen">{String(ctx.isOpen)}</span>
      <span data-testid="threadId">{ctx.threadId ?? 'null'}</span>
      <span data-testid="isStreaming">{String(ctx.isStreaming)}</span>
      <span data-testid="msgCount">{ctx.messages.length}</span>
      <button onClick={ctx.openChat}>open</button>
      <button onClick={ctx.closeChat}>close</button>
      <button onClick={() => ctx.sendMessage('hello')}>send</button>
    </div>
  )
}

function wrap(ui: React.ReactNode) {
  return render(<ChatProvider>{ui}</ChatProvider>)
}

describe('ChatContext', () => {
  it('default state: isOpen false, messages empty, threadId null', () => {
    wrap(<Probe />)
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')
    expect(screen.getByTestId('threadId')).toHaveTextContent('null')
    expect(screen.getByTestId('msgCount')).toHaveTextContent('0')
  })

  it('openChat creates session and sets isOpen true', async () => {
    wrap(<Probe />)
    await act(async () => { screen.getByText('open').click() })
    expect(screen.getByTestId('isOpen')).toHaveTextContent('true')
    expect(screen.getByTestId('threadId')).toHaveTextContent('mock-thread-id')
  })

  it('closeChat sets isOpen false', async () => {
    wrap(<Probe />)
    await act(async () => { screen.getByText('open').click() })
    act(() => { screen.getByText('close').click() })
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')
  })

  it('sendMessage appends user then assistant message', async () => {
    wrap(<Probe />)
    await act(async () => { screen.getByText('send').click() })
    expect(screen.getByTestId('msgCount')).toHaveTextContent('2')
  })

  it('isStreaming is false after done', async () => {
    wrap(<Probe />)
    await act(async () => { screen.getByText('send').click() })
    await waitFor(() => {
      expect(screen.getByTestId('isStreaming')).toHaveTextContent('false')
    })
  })
})
```

- [ ] **Step 2.2: Run to confirm failure**

```bash
npm test -- --testPathPatterns="ChatContext" --no-coverage
```
Expected: FAIL — `Cannot find module '@/components/chat/ChatContext'`

- [ ] **Step 2.3: Implement ChatContext.tsx**

Create `src/components/chat/ChatContext.tsx`:

```tsx
'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createSession, streamMessage } from './chatApi'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface ChatContextValue {
  isOpen: boolean
  messages: Message[]
  threadId: string | null
  isStreaming: boolean
  openChat: () => void
  closeChat: () => void
  sendMessage: (text: string) => Promise<void>
  ensureSession: () => Promise<string>
}

const ChatContext = createContext<ChatContextValue>({
  isOpen: false, messages: [], threadId: null, isStreaming: false,
  openChat: () => {}, closeChat: () => {},
  sendMessage: async () => {}, ensureSession: async () => '',
})

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const msgIdRef = useRef(0)
  const threadIdRef = useRef<string | null>(null)
  threadIdRef.current = threadId

  const ensureSession = useCallback(async (): Promise<string> => {
    if (threadIdRef.current) return threadIdRef.current
    const id = await createSession()
    setThreadId(id)
    return id
  }, [])

  const openChat = useCallback(async () => {
    try { await ensureSession() } catch { return }
    setIsOpen(true)
  }, [ensureSession])

  const closeChat = useCallback(() => setIsOpen(false), [])

  const sendMessage = useCallback(async (text: string) => {
    let tid: string
    try { tid = await ensureSession() } catch { return }

    const userId = String(++msgIdRef.current)
    const assistantId = String(++msgIdRef.current)

    setMessages(prev => [
      ...prev,
      { id: userId, role: 'user', content: text },
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ])
    setIsStreaming(true)

    let errorCode = ''
    await streamMessage(text, tid, {
      onToken(content) {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: m.content + content } : m
        ))
      },
      onScroll(section) {
        document.querySelector('#' + section)?.scrollIntoView({ behavior: 'smooth' })
      },
      onDone() {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, streaming: false } : m
        ))
        setIsStreaming(false)
      },
      onError(msg) { errorCode = msg },
    })

    if (errorCode === 'session_expired') {
      setThreadId(null)
      try {
        const newTid = await createSession()
        setThreadId(newTid)
        await streamMessage(text, newTid, {
          onToken(content) {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: m.content + content } : m
            ))
          },
          onScroll(section) {
            document.querySelector('#' + section)?.scrollIntoView({ behavior: 'smooth' })
          },
          onDone() {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, streaming: false } : m
            ))
            setIsStreaming(false)
          },
          onError() {
            setMessages(prev => prev.map(m =>
              m.id === assistantId
                ? { ...m, content: 'Could not reach Deax. Try again.', streaming: false }
                : m
            ))
            setIsStreaming(false)
          },
        })
      } catch {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Could not reach Deax. Try again.', streaming: false }
            : m
        ))
        setIsStreaming(false)
      }
    } else if (errorCode) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Could not reach Deax. Try again.', streaming: false }
          : m
      ))
      setIsStreaming(false)
    }
  }, [ensureSession])

  return (
    <ChatContext.Provider value={{
      isOpen, messages, threadId, isStreaming,
      openChat, closeChat, sendMessage, ensureSession,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  return useContext(ChatContext)
}
```

- [ ] **Step 2.4: Run to confirm passing**

```bash
npm test -- --testPathPatterns="ChatContext" --no-coverage
```
Expected: `Tests: 5 passed, 5 total`

- [ ] **Step 2.5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/chat/ChatContext.tsx src/__tests__/ChatContext.test.tsx
git commit -m "feat: ChatContext — session lifecycle, message state, SSE streaming, retry on expired session"
```

---

## Task 3: ChatMessage.tsx (TDD)

**Files:**
- Create: `src/components/chat/ChatMessage.tsx`
- Create: `src/__tests__/ChatMessage.test.tsx`

- [ ] **Step 3.1: Write failing tests**

Create `src/__tests__/ChatMessage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { ChatMessage } from '@/components/chat/ChatMessage'

describe('ChatMessage', () => {
  it('user message renders YOU label', () => {
    render(<ChatMessage id="1" role="user" content="Hello" />)
    expect(screen.getByText('YOU')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('assistant message renders DEAX label', () => {
    render(<ChatMessage id="2" role="assistant" content="Hi there" />)
    expect(screen.getByText('DEAX')).toBeInTheDocument()
    expect(screen.getByText('Hi there')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3.2: Run to confirm failure**

```bash
npm test -- --testPathPatterns="ChatMessage" --no-coverage
```
Expected: FAIL — `Cannot find module '@/components/chat/ChatMessage'`

- [ ] **Step 3.3: Implement ChatMessage.tsx**

Create `src/components/chat/ChatMessage.tsx`:

```tsx
'use client'
import type { Message } from './ChatContext'

const mono = 'var(--font-jetbrains-mono), monospace'

type Props = Pick<Message, 'id' | 'role' | 'content'> & { streaming?: boolean }

export function ChatMessage({ role, content, streaming }: Props) {
  const isUser = role === 'user'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <span style={{
        fontSize: 8, letterSpacing: '0.10em',
        color: isUser ? 'rgba(245,237,219,0.35)' : 'rgba(245,197,24,0.45)',
        marginBottom: 3, fontFamily: mono,
      }}>
        {isUser ? 'YOU' : 'DEAX'}
      </span>
      <div style={{
        maxWidth: 220,
        background: isUser ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isUser ? 'rgba(245,197,24,0.20)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: isUser ? '10px 10px 2px 10px' : '2px 10px 10px 10px',
        padding: '7px 10px',
        fontSize: 11,
        color: '#f5eddb',
        fontFamily: mono,
        lineHeight: 1.5,
        wordBreak: 'break-word',
      }}>
        {content}
        {streaming && <span style={{ animation: 'chat-blink .8s steps(1) infinite', display: 'inline-block' }}>▊</span>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3.4: Run to confirm passing**

```bash
npm test -- --testPathPatterns="ChatMessage" --no-coverage
```
Expected: `Tests: 2 passed, 2 total`

- [ ] **Step 3.5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/chat/ChatMessage.tsx src/__tests__/ChatMessage.test.tsx
git commit -m "feat: ChatMessage — user/assistant bubbles with streaming cursor"
```

---

## Task 4: ChatPanel.tsx

**Files:**
- Create: `src/components/chat/ChatPanel.tsx`

No unit tests — requires live interaction. Verified manually in browser.

- [ ] **Step 4.1: Implement ChatPanel.tsx**

Create `src/components/chat/ChatPanel.tsx`:

```tsx
'use client'
import { useRef, useEffect, useState } from 'react'
import { useChatContext } from './ChatContext'
import { ChatMessage } from './ChatMessage'

const mono = 'var(--font-jetbrains-mono), monospace'

export function ChatPanel() {
  const { messages, isStreaming, sendMessage } = useChatContext()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Message list */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 10,
        scrollbarWidth: 'thin',
      }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 10, color: 'rgba(245,237,219,0.30)', fontFamily: mono, textAlign: 'center', marginTop: 20 }}>
            Ask me anything about Nitish's work.
          </div>
        )}
        {messages.map(m => (
          <ChatMessage key={m.id} id={m.id} role={m.role} content={m.content} streaming={m.streaming} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid rgba(245,197,24,0.10)',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <style>{`@keyframes chat-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Ask anything…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#f5eddb', fontFamily: mono, fontSize: 11,
            opacity: isStreaming ? 0.4 : 1,
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            background: isStreaming || !input.trim() ? 'rgba(245,197,24,0.3)' : '#f5c518',
            border: 'none', cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
            color: '#0a0800', fontFamily: mono, fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4.2: Run full tests to confirm no regressions**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```
Expected: all previous tests still passing.

- [ ] **Step 4.3: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/chat/ChatPanel.tsx
git commit -m "feat: ChatPanel — message list, auto-scroll, streaming-aware input"
```

---

## Task 5: ChatWidgetInner + ChatWidget

**Files:**
- Create: `src/components/chat/ChatWidgetInner.tsx`
- Create: `src/components/chat/ChatWidget.tsx`

No unit tests — requires browser environment.

- [ ] **Step 5.1: Implement ChatWidgetInner.tsx**

Create `src/components/chat/ChatWidgetInner.tsx`:

```tsx
'use client'
import { useChatContext } from './ChatContext'
import { ChatPanel } from './ChatPanel'

const mono = 'var(--font-jetbrains-mono), monospace'

export function ChatWidgetInner() {
  const { isOpen, closeChat } = useChatContext()

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 250,
      width: 300,
      background: '#0a0800',
      border: '1px solid rgba(245,197,24,0.22)',
      borderRadius: 12,
      boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column',
      maxHeight: 420,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid rgba(245,197,24,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: '#f5c518', letterSpacing: '0.12em', fontFamily: mono }}>
          $ deax --chat
        </span>
        <button
          type="button"
          onClick={closeChat}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(245,237,219,0.35)', fontFamily: mono, fontSize: 12,
          }}
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Chat panel */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatPanel />
      </div>
    </div>
  )
}
```

- [ ] **Step 5.2: Implement ChatWidget.tsx**

Create `src/components/chat/ChatWidget.tsx`:

```tsx
'use client'
import dynamic from 'next/dynamic'

// Must be dynamic(ssr:false) — uses browser-only APIs
export const ChatWidget = dynamic(
  () => import('./ChatWidgetInner').then(m => m.ChatWidgetInner),
  { ssr: false }
)
```

- [ ] **Step 5.3: Run full tests**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```
Expected: all tests passing.

- [ ] **Step 5.4: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/chat/ChatWidgetInner.tsx src/components/chat/ChatWidget.tsx
git commit -m "feat: ChatWidget — floating panel shell, terminal-style header, dynamic ssr:false"
```

---

## Task 6: Wire layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 6.1: Read current layout**

Read `src/app/layout.tsx` to confirm current structure before editing.

- [ ] **Step 6.2: Add ChatProvider and ChatWidget**

In `src/app/layout.tsx`, add two imports after the existing imports:

```tsx
import { ChatProvider } from '@/components/chat/ChatContext'
import { ChatWidget } from '@/components/chat/ChatWidget'
```

Wrap the existing `VoiceTourProvider` content with `ChatProvider` and add `<ChatWidget />`. The body should look exactly like:

```tsx
<body className={`${rubikDirt.variable} ${dmMono.variable} ${syne.variable} ${cormorant.variable}`}>
  <VoiceTourProvider>
    <ChatProvider>
      {children}
      <Suspense fallback={null}>
        <DeaxButton />
      </Suspense>
      <VoiceTourWidget />
      <ChatWidget />
    </ChatProvider>
  </VoiceTourProvider>
</body>
```

- [ ] **Step 6.3: Run tests**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```
Expected: all tests passing.

- [ ] **Step 6.4: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/app/layout.tsx
git commit -m "feat: wire ChatProvider + ChatWidget into root layout"
```

---

## Task 7: DeaxButton modifications (TDD)

**Files:**
- Modify: `src/components/deax/DeaxButton.tsx`
- Modify: `src/__tests__/DeaxButton.test.tsx`

- [ ] **Step 7.1: Update test file first**

Read `src/__tests__/DeaxButton.test.tsx`. Replace entire file content with:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { useEffect } from 'react'
import DeaxButton from '@/components/deax/DeaxButton'
import { VoiceTourProvider, useVoiceTour } from '@/components/voice-tour/VoiceTourContext'
import { ChatProvider, useChatContext } from '@/components/chat/ChatContext'

jest.mock('@/components/chat/chatApi', () => ({
  createSession: jest.fn().mockResolvedValue('mock-tid'),
  streamMessage: jest.fn(),
}))

let mockMode = 'full'
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: (k: string) => k === 'mode' ? mockMode : null }),
}))

function wrap(ui: React.ReactNode) {
  return render(
    <VoiceTourProvider>
      <ChatProvider>{ui}</ChatProvider>
    </VoiceTourProvider>
  )
}

beforeEach(() => { mockMode = 'full' })

describe('DeaxButton', () => {
  it('renders the Deax label', () => {
    wrap(<DeaxButton />)
    expect(screen.getByText(/deax/i)).toBeInTheDocument()
  })

  it('menu is hidden initially', () => {
    wrap(<DeaxButton />)
    expect(screen.queryByText(/Explore full portfolio/i)).not.toBeInTheDocument()
  })

  it('shows menu on click', () => {
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Explore full portfolio/i)).toBeInTheDocument()
  })

  it('shows Talk to Deax in full mode', () => {
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Talk to Deax/i)).toBeInTheDocument()
  })

  it('shows Chat with Deax in full mode', () => {
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Chat with Deax/i)).toBeInTheDocument()
  })

  it('shows Chat with Deax in resume mode', () => {
    mockMode = 'resume'
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Chat with Deax/i)).toBeInTheDocument()
  })

  it('closes menu on second click', () => {
    wrap(<DeaxButton />)
    const btn = screen.getByRole('button', { name: /deax/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText(/Explore full portfolio/i)).not.toBeInTheDocument()
  })

  it('Talk to Deax absent when mode is resume', () => {
    mockMode = 'resume'
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.queryByText(/Talk to Deax/i)).not.toBeInTheDocument()
  })

  it('DeaxButton returns null when tour phase is active', () => {
    function ActivePhaseWrapper() {
      const { setPhase } = useVoiceTour()
      useEffect(() => { setPhase('active') }, [])
      return <DeaxButton />
    }
    render(<VoiceTourProvider><ChatProvider><ActivePhaseWrapper /></ChatProvider></VoiceTourProvider>)
    expect(screen.queryByRole('button', { name: /deax menu/i })).not.toBeInTheDocument()
  })

  it('DeaxButton returns null when chat is open', () => {
    function ChatOpenWrapper() {
      const { openChat } = useChatContext()
      useEffect(() => { openChat() }, [])
      return <DeaxButton />
    }
    render(<VoiceTourProvider><ChatProvider><ChatOpenWrapper /></ChatProvider></VoiceTourProvider>)
    expect(screen.queryByRole('button', { name: /deax menu/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 7.2: Run to confirm which tests fail**

```bash
npm test -- --testPathPatterns="DeaxButton" --no-coverage
```
Note which tests fail — the new "Chat with Deax" tests and "returns null when chat is open" will fail.

- [ ] **Step 7.3: Modify DeaxButton.tsx**

Read `src/components/deax/DeaxButton.tsx` in full first. Then apply these changes:

**Add import** (after existing imports):
```tsx
import { useChatContext } from '@/components/chat/ChatContext'
```

**Add hook** (after `const { phase, startTour } = useVoiceTour()`):
```tsx
const { isOpen: chatIsOpen, openChat } = useChatContext()
```

**Add return null** (update the existing early return to include chat check):
```tsx
// Hide when tour is in progress OR chat is open
if (phase === 'intro' || phase === 'active' || phase === 'minimized' || chatIsOpen) return null
```

**Add "Chat with Deax" menu item** — add this block after the mode-switch button(s) and before "Talk to Deax". It should appear regardless of mode (both resume and full). Insert after the closing `</>` of the mode-switch block and before the `{mode === 'full' && (<button... Talk to Deax` block:

```tsx
<div style={{ height: 1, background: 'rgba(245,197,24,0.10)', margin: '4px 0' }} />
<button
  type="button"
  onClick={() => { setOpen(false); openChat() }}
  style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '10px 16px',
    fontFamily: mono, fontSize: 12, color: '#f5eddb',
    background: 'none', border: 'none', cursor: 'pointer',
    letterSpacing: '0.04em', transition: 'background .15s',
    opacity: (phase !== 'idle' && phase !== 'ended') ? 0.4 : 1,
    pointerEvents: (phase !== 'idle' && phase !== 'ended') ? 'none' : 'auto',
  }}
  onMouseEnter={e => { if (phase === 'idle' || phase === 'ended') (e.currentTarget).style.background = 'rgba(245,197,24,0.07)' }}
  onMouseLeave={e => { (e.currentTarget).style.background = 'none' }}
>
  Chat with Deax
  <span style={{ color: '#f5c518', fontSize: 14 }}>💬</span>
</button>
```

- [ ] **Step 7.4: Run DeaxButton tests**

```bash
npm test -- --testPathPatterns="DeaxButton" --no-coverage
```
Expected: `Tests: 10 passed, 10 total`

- [ ] **Step 7.5: Run full suite**

```bash
npm test
```
Expected: all passing.

- [ ] **Step 7.6: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/deax/DeaxButton.tsx src/__tests__/DeaxButton.test.tsx
git commit -m "feat: DeaxButton — Chat with Deax (both modes), hide when chat open, grey out when tour active"
```

---

## Task 8: Terminal inline streaming

**Files:**
- Modify: `src/components/hero/Terminal.tsx`

No unit tests — requires browser. Verified manually.

- [ ] **Step 8.1: Read Terminal.tsx**

Read `src/components/hero/Terminal.tsx` in full to understand the current structure before editing. Key section: the `executeCommand` useCallback and the unknown command handler (around lines 143–166).

- [ ] **Step 8.2: Add imports**

Add these imports at the top of `Terminal.tsx` (with existing imports):

```tsx
import { useChatContext } from '@/components/chat/ChatContext'
import { streamMessage } from '@/components/chat/chatApi'
```

- [ ] **Step 8.3: Add hook and ref inside Terminal function**

Inside the `Terminal` function body, after the existing `const { phase, startTour } = useVoiceTour()` line, add:

```tsx
const { ensureSession } = useChatContext()
// Stable ref so executeCommand's useCallback doesn't need ensureSession in its deps
const ensureSessionRef = useRef(ensureSession)
ensureSessionRef.current = ensureSession
```

- [ ] **Step 8.4: Replace the unknown command handler**

Find the `if (parsed.type === 'unknown')` block (lines ~152–166). Replace it entirely with:

```tsx
if (parsed.type === 'unknown') {
  // Echo the command
  addLine(gold('$ ') + `<span style="color:#a8d8ea">${esc(input)}</span>`)

  // Add streaming response line
  const streamId = ++lineIdRef.current
  setLines(prev => [
    ...prev,
    { id: streamId, html: `${gold('deax')} <span style="color:rgba(245,237,219,0.4)">></span> ` },
  ])
  setIsTyping(true)

  ensureSessionRef.current().then(tid => {
    return streamMessage(input, tid, {
      onToken(content) {
        setLines(prev => prev.map(l =>
          l.id === streamId
            ? { ...l, html: l.html + esc(content) }
            : l
        ))
      },
      onScroll(section) {
        document.querySelector('#' + section)?.scrollIntoView({ behavior: 'smooth' })
      },
      onDone() {
        setLines(prev => prev.map(l =>
          l.id === streamId ? { ...l, html: l.html + '\n' } : l
        ))
        setIsTyping(false)
        setTimeout(() => inputRef.current?.focus(), 50)
      },
      onError() {
        setLines(prev => prev.map(l =>
          l.id === streamId
            ? { ...l, html: l.html + `<span style="color:#ff6b6b">connection error — try again</span>` }
            : l
        ))
        setIsTyping(false)
        setTimeout(() => inputRef.current?.focus(), 50)
      },
    })
  }).catch(() => {
    setLines(prev => prev.map(l =>
      l.id === streamId
        ? { ...l, html: l.html + `<span style="color:#ff6b6b">could not connect</span>` }
        : l
    ))
    setIsTyping(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  })
  return
}
```

- [ ] **Step 8.5: Run tests to confirm no regressions**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```
Expected: all tests passing.

- [ ] **Step 8.6: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/hero/Terminal.tsx
git commit -m "feat: terminal — unknown commands stream Deax response inline via ChatContext"
```

---

## Task 9: Final verification

- [ ] **Step 9.1: Run full test suite**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```
Expected: ~91 tests passing across all suites.

- [ ] **Step 9.2: Build check**

```bash
npm run build 2>&1 | tail -15
```
Expected: `✓` — no TypeScript or build errors.

- [ ] **Step 9.3: Dev server smoke test**

```bash
npm run dev
```

Open `http://localhost:3000/?mode=resume` and verify:
- DeaxButton menu shows "Chat with Deax"
- Clicking "Chat with Deax" opens floating widget at bottom-right
- DeaxButton disappears when widget is open
- Widget shows "$ deax --chat" header + close button
- Can type a message and it sends (needs live backend)
- Close button returns DeaxButton

Open `http://localhost:3000/?mode=full` and verify:
- DeaxButton shows "Chat with Deax" AND "Talk to Deax"
- Terminal unknown command → Deax response streams inline in terminal
- "Talk to Deax" and "Chat with Deax" are mutually exclusive (one greys out when other active)

- [ ] **Step 9.4: Final commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add -A
git commit -m "chore: chatbot frontend complete — widget, context, terminal integration, DeaxButton wired"
```
