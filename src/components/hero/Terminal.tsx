'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import type { TerminalData } from '@/data/types'

interface Line { id: number; html: string }

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const gold  = (s: string) => `<span style="color:#e8c84a">${s}</span>`
const cyan  = (s: string) => `<span style="color:#a8d8ea">${s}</span>`
const green = (s: string) => `<span style="color:#9de99d">${s}</span>`
const dim   = (s: string) => `<span style="color:rgba(254,249,227,0.28)">${s}</span>`
const muted = (s: string) => `<span style="color:rgba(254,249,227,0.5)">${s}</span>`
const white = (s: string) => `<span style="color:#fef9e3">${s}</span>`
const red   = (s: string) => `<span style="color:#ff6b6b">${s}</span>`

function buildHelpLines(): string[] {
  return [
    '',
    gold('  Available commands:'), '',
    `  ${cyan('about')}       ${dim('->')}  Who I am`,
    `  ${cyan('skills')}      ${dim('->')}  Tech stack &amp; expertise`,
    `  ${cyan('projects')}    ${dim('->')}  Selected work`,
    `  ${cyan('experience')}  ${dim('->')}  Work history`,
    `  ${cyan('contact')}     ${dim('->')}  Get in touch`,
    `  ${cyan('clear')}       ${dim('->')}  Clear terminal`,
    '',
  ]
}

function colourDataLine(raw: string): string {
  if (raw.includes('Available for new projects')) {
    return raw.replace('Available for new projects', green('● Available for new projects'))
  }
  if (/^  \w[\w& ]+  \/\/ /.test(raw)) {
    const idx = raw.indexOf('  //')
    return gold(raw.slice(0, idx)) + muted(raw.slice(idx))
  }
  return raw
}

export default function Terminal({ data, maximized: _maximized }: { data: TerminalData; maximized?: boolean }) {
  const [lines, setLines]       = useState<Line[]>([])
  const [inputBuf, setInputBuf] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [title, setTitle]       = useState('~/nitish-kushwaha')
  const bodyRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef    = useRef(0)

  const addLine = useCallback((html: string) => {
    setLines(prev => [...prev, { id: ++idRef.current, html }])
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const executeCommand = useCallback((cmd: string) => {
    const key = cmd.trim().toLowerCase()
    setIsTyping(true)

    if (key === 'clear') {
      setLines([]); setInputBuf(''); setIsTyping(false)
      return
    }

    const outputLines: string[] =
      key === 'help'
        ? buildHelpLines()
        : key in data.commands
          ? data.commands[key as keyof typeof data.commands].map(colourDataLine)
          : [`  ${red('command not found: ')}${white(esc(cmd))}  ${dim('(type help)')}`, '']

    let i = 0
    const next = () => {
      if (i >= outputLines.length) {
        setIsTyping(false)
        setTimeout(() => inputRef.current?.focus(), 50)
        return
      }
      addLine(outputLines[i++])
      setTimeout(next, Math.max(30, Math.min(100, (outputLines[i - 1] ?? '').length * 3)))
    }
    next()
  }, [data.commands, addLine])

  useEffect(() => {
    const t = setTimeout(() => {
      setTitle('~/nitish-kushwaha -- interactive')
      data.intro.forEach((line, i) =>
        setTimeout(() => addLine(muted(line)), 100 + i * 60)
      )
      const chars = 'help'.split('')
      let buf = ''
      chars.forEach((ch, i) =>
        setTimeout(() => { buf += ch; setInputBuf(buf) }, 600 + i * 100)
      )
      setTimeout(() => {
        setInputBuf('')
        addLine(gold('$ ') + `<span style="color:#a8d8ea">help</span>`)
        executeCommand('help')
      }, 600 + chars.length * 100 + 350)
    }, 900)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isTyping) return
    if (e.key === 'Enter') {
      const cmd = inputBuf
      addLine(gold('$ ') + `<span style="color:#a8d8ea">${esc(cmd)}</span>`)
      setInputBuf('')
      executeCommand(cmd)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      setInputBuf(p => p.slice(0, -1))
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault(); setLines([]); setInputBuf('')
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setInputBuf(p => p + e.key)
    }
  }

  // NOTE: dangerouslySetInnerHTML is used ONLY for static JSON output lines and buildHelpLines().
  // User input (inputBuf) is rendered as a React text node — never via innerHTML.
  // When user commands are echoed back (addLine calls), they are sanitized via esc() first.
  return (
    <div className="terminal-card" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-bar">
        <span className="t-dot r" /><span className="t-dot y" /><span className="t-dot g" />
        <span style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '0.68rem', color: 'var(--text-muted)',
          marginLeft: '8px', letterSpacing: '0.06em',
        }}>
          {title}
        </span>
      </div>

      <div ref={bodyRef} className="terminal-body">
        {lines.map(line => (
          <div
            key={line.id}
            className="t-line"
            // Safe: static JSON data or buildHelpLines(). User input is esc()-sanitized before addLine().
            dangerouslySetInnerHTML={{ __html: line.html }}
          />
        ))}
        <div className="t-line">
          <span dangerouslySetInnerHTML={{ __html: gold('$ ') }} />
          <span style={{ color: '#a8d8ea' }}>{inputBuf}</span>
          {!isTyping && <span className="t-caret" />}
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        onKeyDown={handleKeyDown}
        onChange={() => {}}
        value=""
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
      />
    </div>
  )
}
