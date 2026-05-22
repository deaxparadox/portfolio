'use client'
import {
  createContext, useContext, useState, useCallback,
  useRef, useEffect, type ReactNode, type Dispatch, type SetStateAction,
} from 'react'

export type TerminalState = 'EMBEDDED' | 'FLOATING' | 'MAXIMIZED'
export interface TerminalLine { id: number; html: string }

interface TerminalContextValue {
  // State machine
  state: TerminalState
  transitionTo: (next: TerminalState) => void
  isTransitioning: boolean
  // Terminal content — persists across EMBEDDED/FLOATING/MAXIMIZED transitions
  lines: TerminalLine[]
  setLines: Dispatch<SetStateAction<TerminalLine[]>>
  inputBuf: string
  setInputBuf: Dispatch<SetStateAction<string>>
  isTyping: boolean
  setIsTyping: Dispatch<SetStateAction<boolean>>
  termTitle: string
  setTermTitle: Dispatch<SetStateAction<string>>
  lineIdRef: React.MutableRefObject<number>
  hasBooted: boolean
  setHasBooted: Dispatch<SetStateAction<boolean>>
}

const TerminalContext = createContext<TerminalContextValue | null>(null)

// Must exceed Framer Motion spring settle time to prevent race conditions
const TRANSITION_LOCK_MS = 600

export function TerminalProvider({ children }: { children: ReactNode }) {
  // State machine
  const [state, setState]               = useState<TerminalState>('EMBEDDED')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const lockRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  // Terminal content state (lives here so it survives mount/unmount of Terminal)
  const [lines, setLines]         = useState<TerminalLine[]>([])
  const [inputBuf, setInputBuf]   = useState('')
  const [isTyping, setIsTyping]   = useState(true)
  const [termTitle, setTermTitle] = useState('~/nitish-kushwaha')
  const [hasBooted, setHasBooted] = useState(false)
  const lineIdRef                 = useRef(0)

  return (
    <TerminalContext.Provider value={{
      state, transitionTo, isTransitioning,
      lines, setLines,
      inputBuf, setInputBuf,
      isTyping, setIsTyping,
      termTitle, setTermTitle,
      lineIdRef,
      hasBooted, setHasBooted,
    }}>
      {children}
    </TerminalContext.Provider>
  )
}

export function useTerminal(): TerminalContextValue {
  const ctx = useContext(TerminalContext)
  if (!ctx) throw new Error('useTerminal must be used within TerminalProvider')
  return ctx
}
