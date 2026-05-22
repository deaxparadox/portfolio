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
        <m.div
          key="terminal-floating"
          drag
          dragMomentum={false}
          dragElastic={0.08}
          whileDrag={{ cursor: 'grabbing' }}
          initial={{ opacity: 0, scale: 0.92, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed', top: '80px', right: '24px',
            width: '360px', zIndex: 200,
            cursor: 'grab',
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
      )}
    </AnimatePresence>
  )
}
