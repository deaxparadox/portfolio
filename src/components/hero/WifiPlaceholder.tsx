'use client'
import { m } from 'framer-motion'
import { useTerminal } from '@/context/TerminalContext'

export default function WifiPlaceholder() {
  const { transitionTo, isTransitioning } = useTerminal()

  return (
    <m.div
      key="wifi-placeholder"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={() => !isTransitioning && transitionTo('EMBEDDED')}
      style={{
        background: 'rgba(255,240,120,0.04)',
        border: '1px dashed rgba(232,200,74,0.2)',
        borderRadius: '12px',
        minHeight: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        cursor: isTransitioning ? 'default' : 'pointer',
        padding: '32px',
      }}
    >
      {/* WiFi icon */}
      <div style={{ position: 'relative', width: '72px', height: '54px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            border: '1px solid rgba(232,200,74,0.25)',
            width: i === 0 ? '80px' : '104px',
            height: i === 0 ? '80px' : '104px',
            bottom: i === 0 ? '-14px' : '-26px',
            animation: `wifi-ripple 2.4s ease-out ${0.6 + i * 0.3}s infinite`,
          }} />
        ))}
        {[{ size: 22, d: '0.15s' }, { size: 38, d: '0.3s' }, { size: 56, d: '0.45s' }].map(({ size, d }, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            border: '2px solid #e8c84a',
            borderBottomColor: 'transparent', borderLeftColor: 'transparent',
            width: `${size}px`, height: `${size}px`, bottom: '4px',
            transform: 'rotate(-135deg)',
            animation: `wifi-arc 2.4s ease-in-out ${d} infinite`,
          }} />
        ))}
        <div style={{
          position: 'absolute', bottom: 0,
          width: '8px', height: '8px',
          background: '#e8c84a', borderRadius: '50%',
          animation: 'wifi-dot 2.4s ease-in-out infinite',
        }} />
      </div>

      <div style={{
        fontFamily: 'var(--font-dm-serif), serif',
        fontSize: '1.1rem', color: 'rgba(254,249,227,0.75)',
        textAlign: 'center', lineHeight: 1.3,
      }}>
        Wirelessly<br />
        <span style={{ color: '#e8c84a', fontStyle: 'italic' }}>Connected</span>
      </div>

      <div style={{
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '0.6rem', color: 'rgba(254,249,227,0.25)', textAlign: 'center',
      }}>
        terminal.exe has left the building
      </div>

      <div style={{
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '0.62rem', color: 'rgba(232,200,74,0.45)',
        border: '1px solid rgba(232,200,74,0.15)',
        borderRadius: '100px', padding: '5px 16px',
      }}>
        click to reattach
      </div>

      <style>{`
        @keyframes wifi-arc {
          0%   { opacity: 0; transform: rotate(-135deg) scale(0.8); }
          40%  { opacity: 0.9; transform: rotate(-135deg) scale(1); }
          100% { opacity: 0; transform: rotate(-135deg) scale(1.05); }
        }
        @keyframes wifi-ripple {
          0%   { opacity: 0.35; transform: scale(0.7); }
          100% { opacity: 0; transform: scale(1.3); }
        }
        @keyframes wifi-dot {
          0%, 100% { opacity: 0.3; }
          20%      { opacity: 1; }
        }
      `}</style>
    </m.div>
  )
}
