'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import type { TerminalData } from '@/data/types'
import { useTerminal } from '@/context/TerminalContext'
import { parseCommand } from '@/lib/terminalParser'
import { SECTIONS } from '@/lib/sections'

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
    `  ${cyan('ls')}          ${dim('->')}  List sections`,
    `  ${cyan('mv')} ${dim('&lt;section&gt;')}  ${dim('->')}  Navigate to section`,
    `  ${cyan('clear')}       ${dim('->')}  Clear terminal`,
    '',
  ]
}

function buildLsLines(): string[] {
  return [
    '',
    gold('  Navigable sections:'),
    '',
    ...SECTIONS.map(s => `  ${cyan(s)}`),
    '',
    dim('  usage: mv &lt;section&gt;'),
    '',
  ]
}

function colourDataLine(raw: string): string {
  const escaped = esc(raw)
  if (escaped.includes('Available for new projects')) {
    return escaped.replace('Available for new projects', green('● Available for new projects'))
  }
  if (/^  \w[\w&; ]+  \/\/ /.test(escaped)) {
    const idx = escaped.indexOf('  //')
    return gold(escaped.slice(0, idx)) + muted(escaped.slice(idx))
  }
  return escaped
}

interface TerminalProps { data: TerminalData; maximized?: boolean }
export default function Terminal({ data, maximized = false }: TerminalProps) {
  const bodyRef    = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const {
    state, transitionTo, isTransitioning,
    lines, setLines,
    inputBuf, setInputBuf,
    isTyping, setIsTyping,
    termTitle, setTermTitle,
    lineIdRef,
    hasBooted, setHasBooted,
  } = useTerminal()

  const addLine = useCallback((html: string) => {
    setLines(prev => [...prev, { id: ++lineIdRef.current, html }])
  }, [setLines, lineIdRef])

  // Safe to call in event handlers — not during render
  const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 480

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  useEffect(() => {
    if (!maximized) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // On mobile: dismiss to EMBEDDED (no floating window on small screens)
        transitionTo(isMobileViewport() ? 'EMBEDDED' : 'FLOATING')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [maximized, transitionTo])

  const executeMv = useCallback((section: string) => {
    if (section === 'unknown' || section === '') {
      addLine(`  ${red('mv: missing or unknown section')}`)
      addLine(`  ${dim('valid: ' + SECTIONS.join(', '))}`)
      addLine('')
      setIsTyping(false)
      return
    }
    if (section === 'hero') {
      if (state === 'EMBEDDED') {
        addLine(`  ${dim('already here.')}`)
        addLine('')
        setIsTyping(false)
        return
      }
      addLine(`  ${dim('→ reattaching to hero')}`)
      addLine('')
      setIsTyping(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (state === 'MAXIMIZED') {
        transitionTo('FLOATING')
        setTimeout(() => transitionTo('EMBEDDED'), 700)
        setTimeout(() => inputRef.current?.focus(), 1100)
      } else {
        transitionTo('EMBEDDED')
        setTimeout(() => inputRef.current?.focus(), 800)
      }
      return
    }
    addLine(`  ${dim(`→ navigating to #${section}`)}`)
    addLine('')
    setIsTyping(false)
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
    // On mobile: no floating window — scroll only, dismiss terminal if maximized
    if (!isMobileViewport() && state !== 'FLOATING') transitionTo('FLOATING')
    if (isMobileViewport() && state === 'MAXIMIZED') transitionTo('EMBEDDED')
  }, [state, transitionTo, addLine])

  const executeCommand = useCallback((input: string) => {
    const parsed = parseCommand(input)
    setIsTyping(true)

    if (parsed.type === 'mv') {
      executeMv(parsed.section)
      return
    }

    if (parsed.type === 'unknown') {
      const errLines = [
        `  ${red('unknown command: ')}${white(esc(input))}`,
        `  ${dim('AI chat is not available yet. type ')}${cyan('help')}${dim(' for commands.')}`,
        '',
      ]
      let i = 0
      const next = () => {
        if (i >= errLines.length) { setIsTyping(false); setTimeout(() => inputRef.current?.focus(), 50); return }
        addLine(errLines[i++])
        setTimeout(next, 60)
      }
      next()
      return
    }

    const key = parsed.name
    if (key === 'clear') { setLines([]); setInputBuf(''); setIsTyping(false); return }

    const outputLines: string[] =
      key === 'help' ? buildHelpLines()
      : key === 'ls'  ? buildLsLines()
      : key in data.commands
        ? (data.commands as unknown as Record<string, string[]>)[key].map(colourDataLine)
        : []

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
  }, [data.commands, addLine, executeMv])

  // Boot sequence — guarded by hasBooted so it only runs once,
  // not on every mount when the terminal transitions between states
  useEffect(() => {
    if (hasBooted) return
    setHasBooted(true)
    const t = setTimeout(() => {
      setTermTitle('~/nitish-kushwaha -- interactive')
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

  const dotDisabled = (dot: 'red' | 'yellow' | 'green') => {
    if (dot === 'red')    return state !== 'FLOATING'
    if (dot === 'yellow') return state === 'EMBEDDED'
    return false
  }
  const handleRed    = () => { if (!isTransitioning && state === 'FLOATING') transitionTo('EMBEDDED') }
  const handleYellow = () => {
    if (isTransitioning) return
    if (state === 'FLOATING')  transitionTo('EMBEDDED')
    // On mobile: MAXIMIZED → EMBEDDED (skip FLOATING); on desktop: MAXIMIZED → FLOATING
    if (state === 'MAXIMIZED') transitionTo(isMobileViewport() ? 'EMBEDDED' : 'FLOATING')
  }
  const handleGreen  = () => {
    if (isTransitioning) return
    // On mobile: MAXIMIZED → EMBEDDED (skip FLOATING); on desktop: MAXIMIZED → FLOATING
    if (state === 'MAXIMIZED') transitionTo(isMobileViewport() ? 'EMBEDDED' : 'FLOATING')
    else transitionTo('MAXIMIZED')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isTyping || isTransitioning) return
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
    <div
      className="terminal-card"
      onFocus={() => setIsFocused(true)}
      onClick={() => inputRef.current?.focus()}
      style={{
        transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
        borderColor: isFocused ? 'rgba(232,200,74,0.4)' : 'rgba(232,200,74,0.12)',
        boxShadow: isFocused
          ? '0 0 40px rgba(232,200,74,0.15), inset 0 1px 0 rgba(255,240,120,0.1)'
          : '0 0 20px rgba(232,200,74,0.04), inset 0 1px 0 rgba(255,240,120,0.04)',
      }}
    >
      <div className="terminal-bar">
        <span
          className="t-dot r"
          onClick={(e) => { e.stopPropagation(); handleRed() }}
          style={{ opacity: dotDisabled('red') ? 0.3 : 1, cursor: dotDisabled('red') ? 'default' : 'pointer' }}
          title={state === 'FLOATING' ? 'reattach to hero' : ''}
        />
        <span
          className="t-dot y"
          onClick={(e) => { e.stopPropagation(); handleYellow() }}
          style={{ opacity: dotDisabled('yellow') ? 0.3 : 1, cursor: dotDisabled('yellow') ? 'default' : 'pointer' }}
          title={state === 'MAXIMIZED' ? 'minimize to float' : state === 'FLOATING' ? 'reattach to hero' : ''}
        />
        <span
          className="t-dot g"
          onClick={(e) => { e.stopPropagation(); handleGreen() }}
          style={{ cursor: 'pointer' }}
          title={state === 'MAXIMIZED' ? 'exit fullscreen' : 'maximize'}
        />
        <span style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '0.68rem', color: 'var(--text-muted)',
          marginLeft: '8px', letterSpacing: '0.06em',
        }}>
          {termTitle}
        </span>
      </div>

      <div
        ref={bodyRef}
        className="terminal-body"
        style={{
          height: maximized ? '70vh' : '360px',
          opacity: isFocused ? 1 : 0.45,
          transition: 'opacity 0.35s ease',
        }}
      >
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={() => {}}
        value=""
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
      />
    </div>
  )
}
