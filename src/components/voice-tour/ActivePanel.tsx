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
        background: '#0a0800',
        border: '1px solid rgba(245,197,24,0.22)',
        borderRadius: 12,
        padding: '16px 18px',
        width: 260,
        fontFamily: mono,
      }}
    >
      <div style={{ fontSize: 11, color: '#f5c518', letterSpacing: '0.12em', marginBottom: 12 }}>
        $ deax --connect
      </div>
      <div style={{ height: 1, background: 'rgba(245,197,24,0.10)', marginBottom: 12 }} />
      <div style={{ fontSize: 12, color: '#f5eddb', marginBottom: 10 }}>
        &gt; {label}
      </div>
      {isSpeaking && (
        <BarVisualizer
          state={state}
          trackRef={audioTrack}
          style={{ width: '100%', height: 36, marginBottom: 10 }}
        />
      )}
      <div style={{ height: 1, background: 'rgba(245,197,24,0.10)', marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => setPhase('minimized')}
          style={{
            flex: 1,
            background: 'rgba(245,197,24,0.06)',
            border: '1px solid rgba(245,197,24,0.15)',
            borderRadius: 6,
            color: 'rgba(245,197,24,0.40)',
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
            color: 'rgba(245,197,24,0.40)',
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
