'use client'
import { m, AnimatePresence } from 'framer-motion'
import { useTerminal } from '@/context/TerminalContext'
import Terminal from '@/components/hero/Terminal'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export default function TerminalMaximized() {
  const { state, transitionTo } = useTerminal()
  return (
    <AnimatePresence>
      {state === 'MAXIMIZED' && (
        <m.div
          key="terminal-maximized"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(6,5,0,0.97)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // On mobile: go to EMBEDDED (no floating window on small screens)
              const target = typeof window !== 'undefined' && window.innerWidth <= 900
                ? 'EMBEDDED' : 'FLOATING'
              transitionTo(target)
            }
          }}
        >
          <m.div
            layoutId="terminal"
            layout
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            style={{ width: '100%', maxWidth: '900px', maxHeight: '80vh' }}
          >
            <Terminal data={data.terminal} maximized />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
