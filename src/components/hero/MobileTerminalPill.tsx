'use client'
import { useTerminal } from '@/context/TerminalContext'

export default function MobileTerminalPill() {
  const { transitionTo, isTransitioning } = useTerminal()

  return (
    <div
      className="mobile-terminal-pill"
      role="button"
      tabIndex={0}
      onClick={() => !isTransitioning && transitionTo('MAXIMIZED')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (!isTransitioning) transitionTo('MAXIMIZED')
        }
      }}
    >
      <div className="mobile-terminal-pill-left">
        <span className="mobile-terminal-pill-icon">⌨</span>
        <span className="mobile-terminal-pill-label">~/nitish-kushwaha</span>
      </div>
      <span className="mobile-terminal-pill-hint">tap to open →</span>
    </div>
  )
}
