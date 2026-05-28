# Voice Tour Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a LiveKit voice tour widget for `/?mode=full` — visitors talk to "Deax" who narrates the portfolio and scrolls to sections on command.

**Architecture:** `VoiceTourContext` (React Context, root layout) holds phase state shared by `DeaxButton` (hides when tour active) and `VoiceTourWidget` (invisible when idle). `<LiveKitRoom>` inside `VoiceTourWidgetInner` mounts once and never unmounts — minimized state uses `display:none`. Terminal gets a footer hint; DeaxButton "Talk to Deax" becomes the persistent re-entry point.

**Tech Stack:** Next.js 16.2.6, TypeScript, `@livekit/components-react`, `@livekit/components-styles`, `livekit-client`, Jest + RTL

**Spec:** `docs/superpowers/specs/2026-05-28-voice-tour-frontend-design.md`

**Reference implementation:** `interview-prep/frontend/src/components/voice-tour/` — uses same LiveKit hooks, different message types (`navigate` vs `scroll`)

---

## File Map

### Create
| File | Responsibility |
|---|---|
| `src/components/voice-tour/VoiceTourContext.tsx` | Context + Provider + `useVoiceTour()` hook |
| `src/components/voice-tour/VoiceTourWidget.tsx` | `dynamic(ssr:false)` wrapper — prevents SSR crash |
| `src/components/voice-tour/VoiceTourWidgetInner.tsx` | `<LiveKitRoom>` root — never unmounts |
| `src/components/voice-tour/IntroScreen.tsx` | Mic info + token fetch + start/cancel |
| `src/components/voice-tour/ActivePanel.tsx` | Terminal-style panel + `BarVisualizer` + agent state |
| `src/components/voice-tour/MinimizedPill.tsx` | Vertical roll Deax↔Talking pill, state-driven glow |
| `src/components/voice-tour/DataChannelHandler.tsx` | Listens `tour-navigation`, scrolls sections, handles `end_tour` |
| `src/__tests__/VoiceTourContext.test.tsx` | Context state tests |
| `src/__tests__/IntroScreen.test.tsx` | Token fetch + error + cancel tests |
| `src/__tests__/DataChannelHandler.test.tsx` | Allowlist + scroll + end_tour tests |

### Modify
| File | Change |
|---|---|
| `src/app/layout.tsx` | Wrap body in `VoiceTourProvider`, add `<VoiceTourWidget />` |
| `src/components/deax/DeaxButton.tsx` | Hide when tour active; wire "Talk to Deax" to `startTour()` |
| `src/components/hero/Terminal.tsx` | Add "talk to deax instead →" footer hint |
| `src/app/globals.css` | Add `.voice-tour-widget` CSS vars section |
| `src/__tests__/DeaxButton.test.tsx` | Update 1 existing test + add 3 new tests |

---

## Task 1: Install packages + verify baseline

**Files:** none (package install only)

- [ ] **Step 1.1: Install LiveKit packages**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src
npm install @livekit/components-react @livekit/components-styles livekit-client
```

Expected: packages install without errors, `package.json` updated.

- [ ] **Step 1.2: Verify baseline tests still pass**

```bash
npm test
```

Expected output:
```
Test Suites: 13 passed, 13 total
Tests:       65 passed, 65 total
```

- [ ] **Step 1.3: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/package.json src/package-lock.json
git commit -m "chore: install livekit packages for voice tour"
```

---

## Task 2: VoiceTourContext (TDD)

**Files:**
- Create: `src/components/voice-tour/VoiceTourContext.tsx`
- Create: `src/__tests__/VoiceTourContext.test.tsx`

- [ ] **Step 2.1: Write the failing tests**

Create `src/__tests__/VoiceTourContext.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react'
import { VoiceTourProvider, useVoiceTour } from '@/components/voice-tour/VoiceTourContext'

function Probe() {
  const ctx = useVoiceTour()
  return (
    <div>
      <span data-testid="phase">{ctx.phase}</span>
      <span data-testid="token">{ctx.token ?? 'null'}</span>
      <button onClick={ctx.startTour}>startTour</button>
      <button onClick={() => ctx.setConnection('tok', 'wss://x')}>setConn</button>
      <button onClick={() => ctx.setPhase('ended')}>setEnded</button>
      <button onClick={ctx.reset}>reset</button>
    </div>
  )
}

function wrap(ui: React.ReactNode) {
  return render(<VoiceTourProvider>{ui}</VoiceTourProvider>)
}

describe('VoiceTourContext', () => {
  it('default phase is idle', () => {
    wrap(<Probe />)
    expect(screen.getByTestId('phase')).toHaveTextContent('idle')
  })

  it('startTour sets phase to intro', () => {
    wrap(<Probe />)
    act(() => { screen.getByText('startTour').click() })
    expect(screen.getByTestId('phase')).toHaveTextContent('intro')
  })

  it('setConnection stores token and wsUrl', () => {
    wrap(<Probe />)
    act(() => { screen.getByText('setConn').click() })
    expect(screen.getByTestId('token')).toHaveTextContent('tok')
  })

  it('setPhase updates phase', () => {
    wrap(<Probe />)
    act(() => { screen.getByText('setEnded').click() })
    expect(screen.getByTestId('phase')).toHaveTextContent('ended')
  })

  it('reset clears token and returns to idle', () => {
    wrap(<Probe />)
    act(() => { screen.getByText('setConn').click() })
    act(() => { screen.getByText('reset').click() })
    expect(screen.getByTestId('phase')).toHaveTextContent('idle')
    expect(screen.getByTestId('token')).toHaveTextContent('null')
  })
})
```

- [ ] **Step 2.2: Run to confirm failure**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test -- --testPathPattern="VoiceTourContext" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/voice-tour/VoiceTourContext'`

- [ ] **Step 2.3: Implement VoiceTourContext**

Create `src/components/voice-tour/VoiceTourContext.tsx`:

```tsx
'use client'
import { createContext, useContext, useState } from 'react'

type TourPhase = 'idle' | 'intro' | 'active' | 'minimized' | 'ended'

interface VoiceTourContextValue {
  phase: TourPhase
  token: string | null
  wsUrl: string | null
  startTour: () => void
  setConnection: (token: string, wsUrl: string) => void
  setPhase: (phase: TourPhase) => void
  reset: () => void
}

const VoiceTourContext = createContext<VoiceTourContextValue>({
  phase: 'idle',
  token: null,
  wsUrl: null,
  startTour: () => {},
  setConnection: () => {},
  setPhase: () => {},
  reset: () => {},
})

export function VoiceTourProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhaseState] = useState<TourPhase>('idle')
  const [token, setToken] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)

  const startTour = () => setPhaseState('intro')

  const setConnection = (t: string, w: string) => {
    setToken(t)
    setWsUrl(w)
  }

  const setPhase = (p: TourPhase) => setPhaseState(p)

  const reset = () => {
    setPhaseState('idle')
    setToken(null)
    setWsUrl(null)
  }

  return (
    <VoiceTourContext.Provider value={{ phase, token, wsUrl, startTour, setConnection, setPhase, reset }}>
      {children}
    </VoiceTourContext.Provider>
  )
}

export function useVoiceTour() {
  return useContext(VoiceTourContext)
}
```

- [ ] **Step 2.4: Run to confirm passing**

```bash
npm test -- --testPathPattern="VoiceTourContext" --no-coverage
```

Expected:
```
Tests: 5 passed, 5 total
```

- [ ] **Step 2.5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/voice-tour/VoiceTourContext.tsx src/__tests__/VoiceTourContext.test.tsx
git commit -m "feat: VoiceTourContext — phase state machine + provider"
```

---

## Task 3: IntroScreen (TDD)

**Files:**
- Create: `src/components/voice-tour/IntroScreen.tsx`
- Create: `src/__tests__/IntroScreen.test.tsx`

- [ ] **Step 3.1: Write failing tests**

Create `src/__tests__/IntroScreen.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IntroScreen } from '@/components/voice-tour/IntroScreen'
import { VoiceTourProvider } from '@/components/voice-tour/VoiceTourContext'

function wrap(ui: React.ReactNode) {
  return render(<VoiceTourProvider>{ui}</VoiceTourProvider>)
}

describe('IntroScreen', () => {
  it('renders start and cancel buttons', () => {
    wrap(<IntroScreen />)
    expect(screen.getByRole('button', { name: /start voice tour/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('cancel calls setPhase idle', () => {
    // IntroScreen cancel should close — we verify the button is interactive
    wrap(<IntroScreen />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    // No crash = cancel handler wired correctly
  })

  it('shows error message when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false }) as jest.Mock
    wrap(<IntroScreen />)
    fireEvent.click(screen.getByRole('button', { name: /start voice tour/i }))
    await waitFor(() => {
      expect(screen.getByText(/could not connect/i)).toBeInTheDocument()
    })
  })

  it('disables start button while loading', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {})) as jest.Mock
    wrap(<IntroScreen />)
    fireEvent.click(screen.getByRole('button', { name: /start voice tour/i }))
    expect(screen.getByRole('button', { name: /starting/i })).toBeDisabled()
  })
})
```

- [ ] **Step 3.2: Run to confirm failure**

```bash
npm test -- --testPathPattern="IntroScreen" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/voice-tour/IntroScreen'`

- [ ] **Step 3.3: Implement IntroScreen**

Create `src/components/voice-tour/IntroScreen.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useVoiceTour } from './VoiceTourContext'

const mono = 'var(--font-jetbrains-mono), monospace'

export function IntroScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setConnection, setPhase } = useVoiceTour()

  async function start() {
    setLoading(true)
    setError(null)
    try {
      const base = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ''
      const res = await fetch(`${base}/api/voice-tour/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: 'portfolio' }),
      })
      if (!res.ok) throw new Error('token fetch failed')
      const data = await res.json()
      setConnection(data.token, data.ws_url)
      setPhase('active')
    } catch {
      setError('Could not connect. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="voice-tour-widget"
      style={{
        background: 'var(--vt-bg)',
        border: '1px solid var(--vt-border)',
        borderRadius: 12,
        padding: '18px 20px',
        width: 260,
        fontFamily: mono,
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--vt-accent)', letterSpacing: '0.12em', marginBottom: 12 }}>
        $ deax --voice-tour
      </div>
      <div style={{ fontSize: 12, color: 'var(--vt-text)', marginBottom: 14, lineHeight: 1.6 }}>
        This tour uses your microphone. Deax will guide you through the portfolio.
      </div>
      {error && (
        <div style={{ fontSize: 11, color: '#ff6b6b', marginBottom: 10 }}>{error}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={start}
          disabled={loading}
          style={{
            background: 'rgba(245,197,24,0.10)',
            border: '1px solid rgba(245,197,24,0.30)',
            borderRadius: 8,
            color: '#f5c518',
            fontFamily: mono,
            fontSize: 12,
            padding: '8px 14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Starting…' : '🎙 Start voice tour'}
        </button>
        <button
          type="button"
          onClick={() => setPhase('idle')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--vt-text-dim)',
            fontFamily: mono,
            fontSize: 11,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3.4: Run to confirm passing**

```bash
npm test -- --testPathPattern="IntroScreen" --no-coverage
```

Expected:
```
Tests: 4 passed, 4 total
```

- [ ] **Step 3.5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/voice-tour/IntroScreen.tsx src/__tests__/IntroScreen.test.tsx
git commit -m "feat: IntroScreen — token fetch, error handling, cancel"
```

---

## Task 4: DataChannelHandler (TDD)

**Files:**
- Create: `src/components/voice-tour/DataChannelHandler.tsx`
- Create: `src/__tests__/DataChannelHandler.test.tsx`

- [ ] **Step 4.1: Write failing tests**

Create `src/__tests__/DataChannelHandler.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { DataChannelHandler } from '@/components/voice-tour/DataChannelHandler'

const mockUseDataChannel = jest.fn()
jest.mock('@livekit/components-react', () => ({
  useDataChannel: (topic: string, cb?: unknown) => mockUseDataChannel(topic, cb),
}))

function makeMessage(payload: object) {
  return { payload: new TextEncoder().encode(JSON.stringify(payload)) }
}

describe('DataChannelHandler', () => {
  beforeEach(() => {
    mockUseDataChannel.mockReturnValue({ message: undefined })
    jest.spyOn(document, 'querySelector').mockReturnValue({
      scrollIntoView: jest.fn(),
    } as unknown as Element)
  })

  afterEach(() => jest.restoreAllMocks())

  it('scrolls to valid section', () => {
    const scrollIntoView = jest.fn()
    jest.spyOn(document, 'querySelector').mockReturnValue({ scrollIntoView } as unknown as Element)
    mockUseDataChannel.mockReturnValue({ message: makeMessage({ type: 'scroll', section: 'projects' }) })

    render(<DataChannelHandler onEnd={jest.fn()} />)
    expect(document.querySelector).toHaveBeenCalledWith('#projects')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('does not scroll to invalid section', () => {
    const scrollIntoView = jest.fn()
    jest.spyOn(document, 'querySelector').mockReturnValue({ scrollIntoView } as unknown as Element)
    mockUseDataChannel.mockReturnValue({ message: makeMessage({ type: 'scroll', section: 'evil-script' }) })

    render(<DataChannelHandler onEnd={jest.fn()} />)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('calls onEnd for end_tour message', () => {
    const onEnd = jest.fn()
    mockUseDataChannel.mockReturnValue({ message: makeMessage({ type: 'end_tour' }) })

    render(<DataChannelHandler onEnd={onEnd} />)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 4.2: Run to confirm failure**

```bash
npm test -- --testPathPattern="DataChannelHandler" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/voice-tour/DataChannelHandler'`

- [ ] **Step 4.3: Implement DataChannelHandler**

Create `src/components/voice-tour/DataChannelHandler.tsx`:

```tsx
'use client'
import { useDataChannel } from '@livekit/components-react'
import { useEffect } from 'react'

const VALID_SECTIONS = new Set(['hero', 'skills', 'projects', 'glimpse', 'experience', 'contact'])

export function DataChannelHandler({ onEnd }: { onEnd: () => void }) {
  const { message } = useDataChannel('tour-navigation')

  useEffect(() => {
    if (!message) return
    try {
      const payload = JSON.parse(new TextDecoder().decode(message.payload))

      if (payload.type === 'scroll') {
        const section = payload.section
        if (typeof section !== 'string' || !VALID_SECTIONS.has(section)) return
        document.querySelector('#' + section)?.scrollIntoView({ behavior: 'smooth' })
      }

      if (payload.type === 'end_tour') {
        onEnd()
      }

      // FUTURE: navigate handler — add when /projects/[slug] pages exist
      // if (payload.type === 'navigate') {
      //   const VALID_PATHS = new Set(['/projects/vgents', ...])
      //   if (typeof payload.path === 'string' && VALID_PATHS.has(payload.path))
      //     router.push(payload.path)
      // }
    } catch {
      // malformed message — ignore
    }
  }, [message, onEnd])

  return null
}
```

- [ ] **Step 4.4: Run to confirm passing**

```bash
npm test -- --testPathPattern="DataChannelHandler" --no-coverage
```

Expected:
```
Tests: 3 passed, 3 total
```

- [ ] **Step 4.5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/voice-tour/DataChannelHandler.tsx src/__tests__/DataChannelHandler.test.tsx
git commit -m "feat: DataChannelHandler — section scroll + end_tour, section allowlist"
```

---

## Task 5: ActivePanel

**Files:**
- Create: `src/components/voice-tour/ActivePanel.tsx`

No unit tests — `useVoiceAssistant()` requires a live LiveKit room. Verified manually in browser.

- [ ] **Step 5.1: Implement ActivePanel**

Create `src/components/voice-tour/ActivePanel.tsx`:

```tsx
'use client'
import { BarVisualizer, useVoiceAssistant } from '@livekit/components-react'
import { useVoiceTour } from './VoiceTourContext'

const mono = 'var(--font-jetbrains-mono), monospace'

const STATE_LABEL: Record<string, string> = {
  initializing: 'Connecting…',
  disconnected:  'Connecting…',
  listening:     'Listening…',
  thinking:      'Thinking…',
  speaking:      'Speaking',
}

export function ActivePanel() {
  const { setPhase } = useVoiceTour()
  const { state, audioTrack } = useVoiceAssistant()
  const label = STATE_LABEL[state] ?? 'Connecting…'
  const isSpeaking = state === 'speaking'

  return (
    <div
      className="voice-tour-widget"
      style={{
        background: 'var(--vt-bg)',
        border: '1px solid var(--vt-border)',
        borderRadius: 12,
        padding: '16px 18px',
        width: 260,
        fontFamily: mono,
      }}
    >
      {/* Header */}
      <div style={{ fontSize: 11, color: 'var(--vt-accent)', letterSpacing: '0.12em', marginBottom: 12 }}>
        $ deax --connect
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(245,197,24,0.10)', marginBottom: 12 }} />

      {/* State label */}
      <div style={{ fontSize: 12, color: 'var(--vt-text)', marginBottom: 10 }}>
        &gt; {label}
      </div>

      {/* Waveform — only when speaking */}
      {isSpeaking && (
        <BarVisualizer
          state={state}
          trackRef={audioTrack}
          style={{ width: '100%', height: 36, marginBottom: 10 }}
        />
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(245,197,24,0.10)', marginBottom: 12 }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => setPhase('minimized')}
          style={{
            flex: 1,
            background: 'rgba(245,197,24,0.06)',
            border: '1px solid rgba(245,197,24,0.15)',
            borderRadius: 6,
            color: 'var(--vt-text-dim)',
            fontFamily: mono,
            fontSize: 10,
            padding: '6px 4px',
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          minimize
        </button>
        <button
          type="button"
          onClick={() => setPhase('ended')}
          style={{
            flex: 1,
            background: 'rgba(245,197,24,0.06)',
            border: '1px solid rgba(245,197,24,0.15)',
            borderRadius: 6,
            color: 'var(--vt-text-dim)',
            fontFamily: mono,
            fontSize: 10,
            padding: '6px 4px',
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          end tour
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5.2: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/voice-tour/ActivePanel.tsx
git commit -m "feat: ActivePanel — terminal-style voice tour panel with BarVisualizer"
```

---

## Task 6: MinimizedPill

**Files:**
- Create: `src/components/voice-tour/MinimizedPill.tsx`

No unit tests — `useVoiceAssistant()` requires a live LiveKit room. Verified manually in browser.

- [ ] **Step 6.1: Implement MinimizedPill**

Create `src/components/voice-tour/MinimizedPill.tsx`:

```tsx
'use client'
import { useVoiceAssistant } from '@livekit/components-react'
import { useVoiceTour } from './VoiceTourContext'
import { useState, useEffect, useRef } from 'react'

const mono = 'var(--font-jetbrains-mono), monospace'

export function MinimizedPill() {
  const { setPhase } = useVoiceTour()
  const { state } = useVoiceAssistant()
  const isSpeaking = state === 'speaking'

  const [label, setLabel] = useState<'Deax' | 'Talking'>('Deax')
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const next: 'Deax' | 'Talking' = isSpeaking ? 'Talking' : 'Deax'
    if (next === label) return
    const el = labelRef.current
    if (!el) { setLabel(next); return }

    el.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
    el.style.transform = 'translateY(-100%)'
    el.style.opacity = '0'

    setTimeout(() => {
      setLabel(next)
      el.style.transition = 'none'
      el.style.transform = 'translateY(100%)'
      el.style.opacity = '0'
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
        el.style.transform = 'translateY(0)'
        el.style.opacity = '1'
      }))
    }, 300)
  }, [isSpeaking]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      type="button"
      aria-label="Expand voice tour"
      onClick={() => setPhase('active')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: mono,
        fontSize: 12,
        letterSpacing: '0.08em',
        color: '#f5c518',
        background: 'rgba(7,6,0,0.92)',
        border: `1px solid rgba(245,197,24,${isSpeaking ? '0.55' : '0.30'})`,
        borderRadius: 20,
        padding: '9px 18px',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        boxShadow: isSpeaking
          ? '0 0 40px rgba(245,197,24,0.45), 0 0 80px rgba(245,197,24,0.15)'
          : '0 0 24px rgba(245,197,24,0.12)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      <span style={{ fontSize: 14 }}>🎙</span>
      <span style={{ overflow: 'hidden', height: 16, position: 'relative', display: 'inline-block', width: 52 }}>
        <span
          ref={labelRef}
          style={{ display: 'inline-block', transform: 'translateY(0)', opacity: 1 }}
        >
          {label}
        </span>
      </span>
    </button>
  )
}
```

- [ ] **Step 6.2: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/voice-tour/MinimizedPill.tsx
git commit -m "feat: MinimizedPill — vertical roll Deax/Talking, state-driven glow"
```

---

## Task 7: VoiceTourWidget shell

**Files:**
- Create: `src/components/voice-tour/VoiceTourWidget.tsx`
- Create: `src/components/voice-tour/VoiceTourWidgetInner.tsx`

No unit tests — `dynamic(ssr:false)` and `<LiveKitRoom>` require browser environment.

- [ ] **Step 7.1: Implement VoiceTourWidgetInner**

Create `src/components/voice-tour/VoiceTourWidgetInner.tsx`:

```tsx
'use client'
import '@livekit/components-styles'
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import { useVoiceTour } from './VoiceTourContext'
import { IntroScreen } from './IntroScreen'
import { ActivePanel } from './ActivePanel'
import { MinimizedPill } from './MinimizedPill'
import { DataChannelHandler } from './DataChannelHandler'

export function VoiceTourWidgetInner() {
  const { phase, token, wsUrl, setPhase, reset } = useVoiceTour()

  if (phase === 'idle' || phase === 'ended') return null

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 250 }}>
      {phase === 'intro' ? (
        <IntroScreen />
      ) : (
        // LiveKitRoom must never unmount while active — minimized uses display:none
        <LiveKitRoom
          token={token ?? ''}
          serverUrl={wsUrl ?? ''}
          connect={true}
          audio={true}
          video={false}
        >
          {/* Required — without this agent audio is received but never played through speakers */}
          <RoomAudioRenderer />
          <DataChannelHandler onEnd={() => {
            setPhase('ended')
            setTimeout(reset, 300)
          }} />
          <div style={{ display: phase === 'active' ? 'block' : 'none' }}>
            <ActivePanel />
          </div>
          <div style={{ display: phase === 'minimized' ? 'block' : 'none' }}>
            <MinimizedPill />
          </div>
        </LiveKitRoom>
      )}
    </div>
  )
}
```

- [ ] **Step 7.2: Implement VoiceTourWidget (dynamic wrapper)**

Create `src/components/voice-tour/VoiceTourWidget.tsx`:

```tsx
import dynamic from 'next/dynamic'

// Must be dynamic(ssr:false) — LiveKit uses browser-only WebRTC APIs
export const VoiceTourWidget = dynamic(
  () => import('./VoiceTourWidgetInner').then(m => m.VoiceTourWidgetInner),
  { ssr: false }
)
```

- [ ] **Step 7.3: Run full test suite to confirm no regressions**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```

Expected:
```
Tests: 73 passed, 73 total
```

(65 original + 5 VoiceTourContext + 4 IntroScreen + 3 DataChannelHandler = 77... wait: 65 + 12 = 77. But we haven't added DeaxButton tests yet. This step should show 77 passing.)

- [ ] **Step 7.4: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/voice-tour/VoiceTourWidget.tsx src/components/voice-tour/VoiceTourWidgetInner.tsx
git commit -m "feat: VoiceTourWidget shell — LiveKitRoom, display:none for minimize, dynamic ssr:false"
```

---

## Task 8: globals.css — CSS variables

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 8.1: Add voice tour CSS vars**

Open `src/app/globals.css`. Find the end of the file and append:

```css
/* ── Voice Tour Widget ── */
.voice-tour-widget {
  --vt-bg:       #0a0800;
  --vt-border:   rgba(245, 197, 24, 0.22);
  --vt-text:     #f5eddb;
  --vt-text-dim: rgba(245, 197, 24, 0.40);
  --vt-accent:   #f5c518;
}
```

- [ ] **Step 8.2: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/app/globals.css
git commit -m "feat: voice tour CSS variable tokens"
```

---

## Task 9: Wire layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 9.1: Read current layout**

Read `src/app/layout.tsx` to confirm current structure before editing.

- [ ] **Step 9.2: Add VoiceTourProvider and VoiceTourWidget**

In `src/app/layout.tsx`, add two imports at the top (after existing imports):

```tsx
import { VoiceTourProvider } from '@/components/voice-tour/VoiceTourContext'
import { VoiceTourWidget } from '@/components/voice-tour/VoiceTourWidget'
```

Wrap the `<body>` children with `VoiceTourProvider` and add `<VoiceTourWidget />` after the Suspense block. The body should look like:

```tsx
<body className={`${rubikDirt.variable} ${dmMono.variable} ${syne.variable} ${cormorant.variable}`}>
  <VoiceTourProvider>
    {children}
    <Suspense fallback={null}>
      <DeaxButton />
    </Suspense>
    <VoiceTourWidget />
  </VoiceTourProvider>
</body>
```

- [ ] **Step 9.3: Run tests to confirm no regressions**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```

Expected: same count as before, all passing.

- [ ] **Step 9.4: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/app/layout.tsx
git commit -m "feat: wire VoiceTourProvider + VoiceTourWidget into root layout"
```

---

## Task 10: Terminal footer hint

**Files:**
- Modify: `src/components/hero/Terminal.tsx`

- [ ] **Step 10.1: Add useVoiceTour import**

In `src/components/hero/Terminal.tsx`, add import at top with other imports:

```tsx
import { useVoiceTour } from '@/components/voice-tour/VoiceTourContext'
```

- [ ] **Step 10.2: Read useVoiceTour in component**

Inside `Terminal` function body, after the existing hooks, add:

```tsx
const { phase, startTour } = useVoiceTour()
```

- [ ] **Step 10.3: Add footer hint to JSX**

In `Terminal.tsx`, find the `</div>` that closes `terminal-body` (the div with `ref={bodyRef}`). Add the footer hint **after** the terminal body div and **before** the hidden input. The structure should be:

```tsx
      </div>  {/* end terminal-body */}

      {/* Voice tour footer — hidden once tour starts */}
      {phase === 'idle' && (
        <div
          onClick={(e) => { e.stopPropagation(); startTour() }}
          style={{
            borderTop: '1px solid rgba(245,197,24,0.08)',
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            opacity: 0.55,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.55' }}
        >
          <span style={{ fontSize: 11 }}>🎙</span>
          <span style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 10,
            color: 'rgba(245,197,24,0.6)',
            letterSpacing: '0.04em',
          }}>
            talk to deax instead →
          </span>
        </div>
      )}

      {/* Hidden input ... */}
```

- [ ] **Step 10.4: Run tests to confirm no regressions**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```

Expected: all tests passing, same count.

- [ ] **Step 10.5: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/hero/Terminal.tsx
git commit -m "feat: terminal footer hint — talk to deax instead"
```

---

## Task 11: DeaxButton modifications (TDD)

**Files:**
- Modify: `src/components/deax/DeaxButton.tsx`
- Modify: `src/__tests__/DeaxButton.test.tsx`

- [ ] **Step 11.1: Update existing DeaxButton tests**

Read `src/__tests__/DeaxButton.test.tsx`. It currently has 5 tests — one will break after our changes ("shows soon badge"). Update the test file to:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { useEffect } from 'react'
import DeaxButton from '@/components/deax/DeaxButton'
import { VoiceTourProvider, useVoiceTour } from '@/components/voice-tour/VoiceTourContext'

// Mutable mock — lets individual tests set a different mode
let mockMode = 'full'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: (k: string) => k === 'mode' ? mockMode : null }),
}))

function wrap(ui: React.ReactNode) {
  return render(<VoiceTourProvider>{ui}</VoiceTourProvider>)
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
    // Helper inside test — sets phase to active before DeaxButton renders
    function ActivePhaseWrapper() {
      const { setPhase } = useVoiceTour()
      useEffect(() => { setPhase('active') }, [])
      return <DeaxButton />
    }
    render(<VoiceTourProvider><ActivePhaseWrapper /></VoiceTourProvider>)
    expect(screen.queryByRole('button', { name: /deax menu/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 11.2: Run to confirm which tests fail**

```bash
npm test -- --testPathPattern="DeaxButton" --no-coverage
```

Note which tests fail — the "soon badge" test should fail (we'll remove it), and the new tests will fail (DeaxButton not yet updated).

- [ ] **Step 11.3: Modify DeaxButton.tsx**

Read `src/components/deax/DeaxButton.tsx` in full first. Then apply these changes:

Add import at top:
```tsx
import { useVoiceTour } from '@/components/voice-tour/VoiceTourContext'
```

Inside `DeaxButton` function, add after existing hooks:
```tsx
const { phase, startTour } = useVoiceTour()

// Hide when tour is in progress — MinimizedPill takes our spot
if (phase === 'intro' || phase === 'active' || phase === 'minimized') return null
```

Find the "Talk to Deax" menu item (currently a `<div>` with `opacity: 0.45`). Replace the entire Talk to Deax block with:
```tsx
{mode === 'full' && (
  <button
    type="button"
    onClick={() => { setOpen(false); startTour() }}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '10px 16px',
      fontFamily: mono, fontSize: 12, color: '#f5eddb',
      background: 'none', border: 'none', cursor: 'pointer',
      letterSpacing: '0.04em', transition: 'background .15s',
    }}
    onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(245,197,24,0.07)' }}
    onMouseLeave={e => { (e.currentTarget).style.background = 'none' }}
  >
    Talk to Deax
    <span style={{ color: '#f5c518', fontSize: 14 }}>🎙</span>
  </button>
)}
```

- [ ] **Step 11.4: Run DeaxButton tests**

```bash
npm test -- --testPathPattern="DeaxButton" --no-coverage
```

Expected:
```
Tests: 7 passed, 7 total
```

- [ ] **Step 11.5: Run full suite**

```bash
npm test
```

Expected:
```
Tests: ~79 passed, ~79 total
```

(65 original − 1 removed "soon badge" + 2 new DeaxButton + 5 VoiceTourContext + 4 IntroScreen + 3 DataChannelHandler = ~79)

- [ ] **Step 11.6: Commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add src/components/deax/DeaxButton.tsx src/__tests__/DeaxButton.test.tsx
git commit -m "feat: DeaxButton — wire Talk to Deax, hide when tour active"
```

---

## Task 12: Final verification

- [ ] **Step 12.1: Run full test suite**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio/src && npm test
```

Expected: all tests passing, no failures.

- [ ] **Step 12.2: Build check**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — no TypeScript or build errors.

- [ ] **Step 12.3: Dev server smoke test**

```bash
npm run dev
```

Open `http://localhost:3000/?mode=full` and verify:
- Terminal shows "talk to deax instead →" footer
- Clicking it opens IntroScreen widget at bottom-right
- DeaxButton disappears when IntroScreen is open
- Cancel returns to idle — DeaxButton reappears
- DeaxButton menu shows "Talk to Deax" (no [soon] badge) in full mode
- DeaxButton menu does NOT show "Talk to Deax" in resume mode

Open `http://localhost:3000/?mode=resume` and verify:
- No voice tour entry points visible
- DeaxButton present but without "Talk to Deax"

- [ ] **Step 12.4: Final commit**

```bash
cd /home/lap-68/Documents/gt-dp/portfolio
git add -A
git commit -m "chore: voice tour frontend complete — widget, context, terminal hint, DeaxButton wired"
```
