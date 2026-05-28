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

    let cancelled = false

    el.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
    el.style.transform = 'translateY(-100%)'
    el.style.opacity = '0'

    const t = setTimeout(() => {
      if (cancelled) return
      setLabel(next)
      el.style.transition = 'none'
      el.style.transform = 'translateY(100%)'
      el.style.opacity = '0'
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (cancelled) return
        el.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
        el.style.transform = 'translateY(0)'
        el.style.opacity = '1'
      }))
    }, 300)

    return () => { cancelled = true; clearTimeout(t) }
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
      <span style={{ overflow: 'hidden', height: 16, position: 'relative', display: 'inline-block', width: 64 }}>
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
