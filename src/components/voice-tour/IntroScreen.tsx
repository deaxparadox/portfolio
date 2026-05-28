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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="voice-tour-widget"
      style={{
        background: '#0a0800',
        border: '1px solid rgba(245,197,24,0.22)',
        borderRadius: 12,
        padding: '18px 20px',
        width: 260,
        fontFamily: mono,
      }}
    >
      <div style={{ fontSize: 11, color: '#f5c518', letterSpacing: '0.12em', marginBottom: 12 }}>
        $ deax --voice-tour
      </div>
      <div style={{ fontSize: 12, color: '#f5eddb', marginBottom: 14, lineHeight: 1.6 }}>
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
            color: 'rgba(245,197,24,0.40)',
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
