'use client'
import { m, AnimatePresence } from 'framer-motion'
import { useTerminal } from '@/context/TerminalContext'
import Terminal from '@/components/hero/Terminal'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export default function TerminalFloating() {
  const { state } = useTerminal()
  return (
    <AnimatePresence>
      {state === 'FLOATING' && (
        /* Fixed full-viewport overlay — pointer-events:none so it doesn't
           block page interaction. The draggable child re-enables them. */
        <div
          className="terminal-floating-viewport"
          style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none' }}
        >
          <m.div
            key="terminal-floating"
            drag
            dragMomentum={false}
            dragElastic={0.08}
            whileDrag={{ cursor: 'grabbing' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', top: '80px', right: '24px',
              width: '360px',
              cursor: 'grab',
              pointerEvents: 'all',
            }}
          >
            <m.div
              layoutId="terminal"
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                '--glass-bg': 'rgba(8, 7, 0, 0.93)',
                '--glass-border': 'rgba(232, 200, 74, 0.35)',
              } as React.CSSProperties}
            >
              <Terminal data={data.terminal} />
            </m.div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  )
}
