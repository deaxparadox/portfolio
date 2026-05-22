'use client'
import {
  createContext, useContext, useState, useCallback,
  useRef, useEffect, type ReactNode,
} from 'react'

export type TerminalState = 'EMBEDDED' | 'FLOATING' | 'MAXIMIZED'

interface TerminalContextValue {
  state: TerminalState
  transitionTo: (next: TerminalState) => void
  isTransitioning: boolean
}

const TerminalContext = createContext<TerminalContextValue | null>(null)

// Must exceed Framer Motion spring settle time to prevent race conditions
const TRANSITION_LOCK_MS = 600

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TerminalState>('EMBEDDED')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const lockRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // stateRef lets callbacks read current state without stale closure
  const stateRef = useRef<TerminalState>('EMBEDDED')

  useEffect(() => { stateRef.current = state }, [state])

  const transitionTo = useCallback((next: TerminalState) => {
    if (stateRef.current === next) return
    if (lockRef.current) clearTimeout(lockRef.current)
    setState(next)
    setIsTransitioning(true)
    lockRef.current = setTimeout(() => setIsTransitioning(false), TRANSITION_LOCK_MS)
  }, [])

  useEffect(() => () => {
    if (lockRef.current) clearTimeout(lockRef.current)
  }, [])

  return (
    <TerminalContext.Provider value={{ state, transitionTo, isTransitioning }}>
      {children}
    </TerminalContext.Provider>
  )
}

export function useTerminal(): TerminalContextValue {
  const ctx = useContext(TerminalContext)
  if (!ctx) throw new Error('useTerminal must be used within TerminalProvider')
  return ctx
}
