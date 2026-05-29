'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatContext } from '@/components/chat/ChatContext'
import { streamMessage } from '@/components/chat/chatApi'

interface Line { id: number; html: string }

const gold  = (s: string) => `<span class="nk-tc-ac">${s}</span>`
const cyan  = (s: string) => `<span class="nk-tc-cm">${s}</span>`
const dim   = (s: string) => `<span class="nk-tc-ou">${s}</span>`
const green = (s: string) => `<span class="nk-tc-ok">${s}</span>`
const red   = (s: string) => `<span class="nk-tc-er">${s}</span>`

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

interface Props { winId: string }

export function TerminalApp({ winId }: Props) {
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [busy, setBusy] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(0)
  const bootTime = useRef(Date.now())
  const { ensureSession } = useChatContext()
  const ensureRef = useRef(ensureSession)
  ensureRef.current = ensureSession

  const addLine = useCallback((html: string) => {
    setLines(prev => [...prev, { id: ++idRef.current, html }])
  }, [])

  useEffect(() => {
    addLine(`<span class="nk-tc-ac nk-tc-b">╔══════════════════════════════════╗</span>`)
    addLine(`<span class="nk-tc-ac nk-tc-b">║  NK-OS Terminal  ·  nksh 1.0.0  ║</span>`)
    addLine(`<span class="nk-tc-ac nk-tc-b">╚══════════════════════════════════╝</span>`)
    addLine(dim('Type help for commands · unknown commands go to Deax AI'))
    addLine('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const execCmd = useCallback((cmd: string) => {
    const parts = cmd.trim().split(/\s+/)
    const name = parts[0]

    switch (name) {
      case 'help':
        addLine(gold('Available commands:'))
        ;[
          ['about',     'Who is Nitish'],
          ['skills',    'Tech stack'],
          ['projects',  'Shipped products'],
          ['contact',   'Get in touch'],
          ['neofetch',  'System info'],
          ['clear',     'Clear terminal'],
          ['date',      'Current time'],
          ['whoami',    'Current user'],
        ].forEach(([c,d]) =>
          addLine(`  ${cyan(c.padEnd(12))}${dim(d)}`)
        )
        addLine('')
        break

      case 'about':
        addLine('')
        addLine(`  ${gold('Nitish Kushwaha')}  ${dim('//')}  ${cyan('Backend & AI Engineer')}`)
        addLine('')
        addLine(`  ${dim('Based in')}     ${cyan('Gurugram, Haryana, India')}`)
        addLine(`  ${dim('Focus')}        ${cyan('AI agents, voice systems & scalable APIs')}`)
        addLine(`  ${dim('Exp')}          ${cyan('3+ years Linux & cloud · 7 products shipped')}`)
        addLine(`  ${dim('Stack')}        ${cyan('Python, FastAPI, Django, LangGraph, LiveKit')}`)
        addLine(`  ${dim('Status')}       ${green('● Available for new projects')}`)
        addLine('')
        break

      case 'skills':
        addLine('')
        addLine(gold('  AI & GenAI'))
        addLine(dim('  LangGraph  LangChain  OpenAI  Gemini  RAG'))
        addLine('')
        addLine(gold('  Backend'))
        addLine(dim('  FastAPI  Django  DRF  Flask  REST'))
        addLine('')
        addLine(gold('  Voice & Realtime'))
        addLine(dim('  LiveKit  OpenAI Realtime  ElevenLabs  Twilio SIP'))
        addLine('')
        addLine(gold('  Databases'))
        addLine(dim('  PostgreSQL  Redis  Pinecone  Supabase'))
        addLine('')
        addLine(gold('  DevOps & Cloud'))
        addLine(dim('  Docker  Nginx  AWS  Azure  GCP  Linux'))
        addLine('')
        break

      case 'projects':
        addLine('')
        ;[
          ['01  VoiceOps AI',    'Multi-tenant AI voice SaaS · 60+ endpoints · live customers'],
          ['02  LexCall',        'AI phone system for law firm · live at manninglaw.chat'],
          ["03  Founder's Lab",  'LangGraph co-founder AI · Bubble.io · real users'],
          ['04  Trajectry',      'Career intelligence platform · 414K jobs · Gemini + LiveKit'],
          ['05  StructureIQ',    'AI construction PDF analyzer · GPT-4o Vision · 167 pages'],
        ].forEach(([n, d]) => {
          addLine(`  ${gold(n)}`)
          addLine(`  ${dim(d)}`)
          addLine('')
        })
        break

      case 'contact':
        addLine('')
        addLine(gold("  Let's work together"))
        addLine('')
        addLine(`  ${dim('Email')}       ${cyan('nitish000000kushwaha@gmail.com')}`)
        addLine(`  ${dim('GitHub')}      ${cyan('github.com/deaxparadox')}`)
        addLine(`  ${dim('LinkedIn')}    ${cyan('linkedin.com/in/deaxparadox')}`)
        addLine('')
        addLine(dim('  Open to full-time, contract & consulting.'))
        addLine('')
        break

      case 'neofetch': {
        const up = Math.floor((Date.now() - bootTime.current) / 1000)
        const m = Math.floor(up/60), s = up%60
        addLine(`${gold('     .o.       .o.      ')}   ${cyan('nitish')}${dim('@')}${gold('nkos')}`)
        addLine(`${gold('    .888.     .888.     ')}   ${dim('────────────────────')}`)
        addLine(`${gold('   .8"888.   .8"888.    ')}   ${dim('OS:')}     ${cyan('NK-OS v1.0.0')}`)
        addLine(`${gold("  .8' `888. .8' `888.   ")}   ${dim('Host:')}   ${cyan('WebDE Platform')}`)
        addLine(`${gold(' .88ooo8888.88ooo8888.  ')}   ${dim('Kernel:')} ${cyan('Next.js 16.2.6')}`)
        addLine(`${gold(".8'     `888'     `888. ")}   ${dim('Uptime:')} ${cyan(`${m}m ${s}s`)}`)
        addLine(`${gold('o88o     o8888o     o88o')}   ${dim('Shell:')}  ${cyan('nksh 1.0.0')}`)
        addLine(`${gold('                        ')}   ${dim('DE:')}     ${cyan('NK Plasma')}`)
        addLine(`${gold('                        ')}   ${dim('Res:')}    ${cyan(`${window.innerWidth}×${window.innerHeight}`)}`)
        addLine('')
        const cols = ['#da4453','#f67400','#f5c518','#56d364','#3daee9','#bc8cff','#f0f0f0','#8b949e']
        addLine(cols.map(c => `<span style="background:${c};padding:0 9px;color:transparent;border-radius:3px">·</span>`).join(' '))
        addLine('')
        break
      }

      case 'clear':
        setLines([])
        break

      case 'date':
        addLine(dim(new Date().toString()))
        break

      case 'whoami':
        addLine(dim('nitish'))
        break

      case '':
        break

      default: {
        // Unknown → Deax AI inline streaming
        const streamId = ++idRef.current
        const deaxPrefix = `<span class="nk-term-deax-block">${gold('deax')} <span class="nk-tc-ou">›</span> `

        setBusy(true)
        setLines(prev => [
          ...prev,
          { id: ++idRef.current, html: '' },
          { id: streamId, html: deaxPrefix + '<span class="nk-term-caret"></span>' },
        ])

        let firstToken = true
        ensureRef.current().then(tid =>
          streamMessage(cmd, tid, {
            onToken(content) {
              setLines(prev => prev.map(l => {
                if (l.id !== streamId) return l
                if (firstToken) {
                  firstToken = false
                  return { ...l, html: deaxPrefix + esc(content) }
                }
                return { ...l, html: l.html + esc(content) }
              }))
            },
            onScroll(section) {
              document.querySelector('#' + section)?.scrollIntoView({ behavior: 'smooth' })
            },
            onDone() {
              setLines(prev => [...prev, { id: ++idRef.current, html: '' }])
              setBusy(false)
              setTimeout(() => inputRef.current?.focus(), 50)
            },
            onError() {
              setLines(prev => prev.map(l =>
                l.id === streamId
                  ? { ...l, html: deaxPrefix + red('connection error — try again') }
                  : l
              ))
              setBusy(false)
              setTimeout(() => inputRef.current?.focus(), 50)
            },
          })
        ).catch(() => {
          setLines(prev => prev.map(l =>
            l.id === streamId
              ? { ...l, html: deaxPrefix + red('could not connect') }
              : l
          ))
          setBusy(false)
          setTimeout(() => inputRef.current?.focus(), 50)
        })
        break
      }
    }
  }, [addLine]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (busy) return
    if (e.key === 'Enter') {
      const cmd = input.trim()
      addLine(`${gold('nk@nkos:~$')} ${cyan(esc(input))}`)
      setInput('')
      if (cmd) {
        setHistory(h => [...h, cmd])
        setHistIdx(-1)
        execCmd(cmd)
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistory(h => {
        const idx = histIdx < 0 ? h.length - 1 : Math.max(0, histIdx - 1)
        setHistIdx(idx)
        setInput(h[idx] ?? '')
        return h
      })
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = histIdx + 1
      if (next >= history.length) { setHistIdx(-1); setInput(''); return }
      setHistIdx(next)
      setInput(history[next])
    }
  }, [busy, input, history, histIdx, addLine, execCmd])

  return (
    <div className="nk-term" onClick={() => inputRef.current?.focus()}>
      <div className="nk-term-out" ref={bodyRef}>
        {/* dangerouslySetInnerHTML is safe:
            - User input: sanitized via esc() before addLine()
            - AI tokens: sanitized via esc(content) per token
            - Static strings: hardcoded, no user data */}
        {lines.map(l => (
          <div key={l.id} className="nk-tl" dangerouslySetInnerHTML={{ __html: l.html }} />
        ))}
      </div>
      <div className="nk-term-in-row">
        <span className="nk-term-pr-lbl">nk@nkos:~$ </span>
        <input
          ref={inputRef}
          className="nk-term-in"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={busy}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  )
}
