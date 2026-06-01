'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useVoiceTour } from '@/components/voice-tour/VoiceTourContext'
import { useChatContext } from '@/components/chat/ChatContext'

const mono = "'DM Mono', monospace"

export default function DeaxButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') ?? 'resume'

  const { phase, startTour } = useVoiceTour()
  const { isOpen: chatIsOpen, openChat } = useChatContext()

  const pathname = usePathname()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // All hooks must be called before any early return
  if (pathname === '/nkos') return null
  if (phase === 'intro' || phase === 'active' || phase === 'minimized' || chatIsOpen) return null

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}
    >
      {/* Menu */}
      {open && (
        <div style={{
          background: 'rgba(7,6,0,0.96)',
          border: '1px solid rgba(245,197,24,0.22)',
          borderRadius: 10,
          padding: '6px 0',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          minWidth: 220,
        }}>
          {mode === 'resume' && (
            <button
              type="button"
              onClick={() => { setOpen(false); router.push('/?mode=full') }}
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
              Explore full portfolio
              <span style={{ color: '#f5c518', fontSize: 14 }}>→</span>
            </button>
          )}

          {mode === 'full' && (
            <>
              <div style={{ height: 1, background: 'rgba(245,197,24,0.10)', margin: '4px 0' }} />
              <button
                type="button"
                onClick={() => { setOpen(false); router.push('/?mode=resume') }}
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
                Resume mode
                <span style={{ color: '#f5c518', fontSize: 14 }}>→</span>
              </button>
            </>
          )}

          <div style={{ height: 1, background: 'rgba(245,197,24,0.10)', margin: '4px 0' }} />
          <button
            type="button"
            onClick={() => { setOpen(false); router.push('/nkos') }}
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
            NK-OS
            <span style={{ color: '#f5c518', fontSize: 12, fontFamily: mono }}>🖥️</span>
          </button>

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
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        aria-label="Deax menu"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: mono, fontSize: 12, letterSpacing: '0.08em',
          color: '#f5c518',
          background: 'rgba(7,6,0,0.90)',
          border: '1px solid rgba(245,197,24,0.30)',
          borderRadius: 20, padding: '9px 18px',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 24px rgba(245,197,24,0.12)',
          transition: 'border-color .2s, box-shadow .2s',
        }}
        onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(245,197,24,0.55)'; b.style.boxShadow = '0 0 32px rgba(245,197,24,0.22)' }}
        onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(245,197,24,0.30)'; b.style.boxShadow = '0 0 24px rgba(245,197,24,0.12)' }}
      >
        Deax
        <span style={{ animation: 'deax-bounce 1.4s ease-in-out infinite', display: 'inline-block' }}>•</span>
      </button>

      <style>{`
        @keyframes deax-bounce {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-4px)}
        }
      `}</style>
    </div>
  )
}
