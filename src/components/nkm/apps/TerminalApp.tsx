'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatContext } from '@/components/chat/ChatContext'
import { streamMessage  } from '@/components/chat/chatApi'

interface Line { id: number; html: string }

const gold  = (s: string) => `<span class="nkm-tc-ac">${s}</span>`
const cyan  = (s: string) => `<span class="nkm-tc-cm">${s}</span>`
const dim   = (s: string) => `<span class="nkm-tc-ou">${s}</span>`
const green = (s: string) => `<span class="nkm-tc-ok">${s}</span>`
const red   = (s: string) => `<span class="nkm-tc-er">${s}</span>`
const esc   = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

export function TerminalApp() {
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const bodyRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef    = useRef(0)
  const bootTime = useRef(Date.now())
  const { ensureSession } = useChatContext()
  const ensureRef = useRef(ensureSession)
  ensureRef.current = ensureSession

  const addLine = useCallback((html: string) => {
    setLines(prev => [...prev, { id: ++idRef.current, html }])
  }, [])

  useEffect(() => {
    addLine(`<span class="nkm-tc-ac nkm-tc-b">NK-M Terminal · nksh 1.0.0</span>`)
    addLine(dim('type help · unknown commands go to Deax AI'))
    addLine('')
    setTimeout(() => inputRef.current?.focus(), 150)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const execCmd = useCallback((cmd: string) => {
    switch (cmd.split(' ')[0]) {
      case 'help':
        ;[['about','Who is Nitish'],['skills','Tech stack'],['projects','Shipped work'],
          ['contact','Get in touch'],['neofetch','System info'],['clear','Clear'],['date','Time'],['whoami','User']
        ].forEach(([c,d]) => addLine(`  ${cyan(c.padEnd(12))}${dim(d)}`))
        addLine('')
        break
      case 'about':
        addLine(''); addLine(`  ${gold('Nitish Kushwaha')}  ${dim('//')}  ${cyan('Backend & AI Engineer')}`)
        addLine(`  ${dim('Based in')}     ${cyan('Gurugram, India')}`)
        addLine(`  ${dim('Stack')}        ${cyan('Python, FastAPI, LangGraph, LiveKit')}`)
        addLine(`  ${dim('Status')}       ${green('● Available for new projects')}`); addLine('')
        break
      case 'skills':
        addLine(''); addLine(gold('  AI:'))
        addLine(dim('  LangGraph LangChain OpenAI Gemini RAG'))
        addLine(gold('  Backend:'))
        addLine(dim('  FastAPI Django DRF Flask REST'))
        addLine(gold('  Voice:'))
        addLine(dim('  LiveKit OpenAI-Realtime ElevenLabs Twilio'))
        addLine('')
        break
      case 'projects':
        addLine('')
        ;[['VoiceOps AI','Multi-tenant voice SaaS · LiveKit · 60+ endpoints'],
          ['LexCall','Law firm AI phone · ElevenLabs · live'],
          ["Founder's Lab",'LangGraph co-founder AI · Bubble.io'],
          ['Trajectry','Career platform · 414K jobs · Gemini'],
          ['StructureIQ','Construction PDF · GPT-4o Vision']
        ].forEach(([n,d]) => { addLine(`  ${gold(n)}`); addLine(`  ${dim(d)}`); addLine('') })
        break
      case 'contact':
        addLine('')
        addLine(`  ${dim('Email')}   ${cyan('nitish000000kushwaha@gmail.com')}`)
        addLine(`  ${dim('GitHub')}  ${cyan('github.com/deaxparadox')}`)
        addLine(''); addLine(dim('  Open to full-time, contract & consulting.')); addLine('')
        break
      case 'neofetch': {
        const up = Math.floor((Date.now() - bootTime.current) / 1000)
        addLine(`${gold('  /\\  ')}   ${cyan('nitish')}${dim('@')}${gold('nkm')}`)
        addLine(`${gold(' /  \\ ')}   ${dim('OS:')} ${cyan('NK-M v1.0.0')}`)
        addLine(`${gold('/    \\')}   ${dim('Kernel:')} ${cyan('Next.js 16')}`)
        addLine(`${gold('\\    /')}   ${dim('Uptime:')} ${cyan(`${Math.floor(up/60)}m ${up%60}s`)}`)
        addLine(`${gold(' \\  / ')}   ${dim('Screen:')} ${cyan(`${window.innerWidth}×${window.innerHeight}`)}`)
        addLine(''); const cols=['#da4453','#f67400','#f5c518','#56d364','#3daee9','#bc8cff']
        addLine(cols.map(c=>`<span style="background:${c};padding:0 7px;border-radius:2px;color:transparent">·</span>`).join(' '))
        addLine(''); break
      }
      case 'clear': setLines([]); break
      case 'date':  addLine(dim(new Date().toString())); break
      case 'whoami':addLine(dim('nitish')); break
      case '': break
      default: {
        // Unknown → Deax AI inline streaming
        const streamId = ++idRef.current
        const prefix = `<span class="nkm-deax-block">${gold('deax')} <span class="nkm-tc-ou">›</span> `
        setBusy(true)
        setLines(prev => [...prev, { id: ++idRef.current, html: '' }, { id: streamId, html: prefix + '<span class="nkm-term-caret"></span>' }])
        let firstToken = true
        ensureRef.current().then(tid =>
          streamMessage(cmd, tid, {
            onToken(c) {
              setLines(prev => prev.map(l => {
                if (l.id !== streamId) return l
                if (firstToken) { firstToken = false; return { ...l, html: prefix + esc(c) } }
                return { ...l, html: l.html + esc(c) }
              }))
            },
            onScroll() {},
            onDone() {
              setLines(prev => [...prev, { id: ++idRef.current, html: '' }])
              setBusy(false); setTimeout(() => inputRef.current?.focus(), 50)
            },
            onError() {
              setLines(prev => prev.map(l => l.id === streamId ? { ...l, html: prefix + red('connection error') } : l))
              setBusy(false); setTimeout(() => inputRef.current?.focus(), 50)
            },
          })
        ).catch(() => {
          setLines(prev => prev.map(l => l.id === streamId ? { ...l, html: prefix + red('could not connect') } : l))
          setBusy(false)
        })
      }
    }
  }, [addLine])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (busy) return
    if (e.key === 'Enter') {
      const cmd = input.trim()
      addLine(`${gold('nk@nkm:~$')} ${cyan(esc(input))}`)
      setInput('')
      if (cmd) { setHistory(h => [...h, cmd]); setHistIdx(-1); execCmd(cmd) }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistory(h => {
        const idx = histIdx < 0 ? h.length - 1 : Math.max(0, histIdx - 1)
        setHistIdx(idx); setInput(h[idx] ?? ''); return h
      })
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = histIdx + 1
      if (next >= history.length) { setHistIdx(-1); setInput(''); return }
      setHistIdx(next); setInput(history[next])
    }
  }, [busy, input, history, histIdx, addLine, execCmd])

  const insertKey = (key: string) => {
    if (key === 'Clear') { setLines([]); return }
    if (key === '^C') { setInput(''); addLine(red('^C')); return }
    setInput(prev => prev + key)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="nkm-term" onClick={() => inputRef.current?.focus()}>
      <div className="nkm-term-out" ref={bodyRef}>
        {/* dangerouslySetInnerHTML is safe:
            - User input: sanitized via esc() before addLine()
            - AI tokens: sanitized via esc(c) per token
            - Static strings: hardcoded, no user data */}
        {lines.map(l => (
          <div key={l.id} className="nkm-tl" dangerouslySetInnerHTML={{ __html: l.html }} />
        ))}
      </div>
      <div className="nkm-term-keys">
        {['↑','↓','//','-','.','~','|','Clear','^C'].map(k => (
          <button key={k} className="nkm-term-key" onClick={() => insertKey(k)}>{k}</button>
        ))}
      </div>
      <div className="nkm-term-in-wrap">
        <span className="nkm-term-pr">nk@nkm:~$ </span>
        <input
          ref={inputRef}
          className="nkm-term-in"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={busy}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  )
}
