'use client'
import { createContext, useContext, useState } from 'react'

type TourPhase = 'idle' | 'intro' | 'active' | 'minimized' | 'ended'

interface VoiceTourContextValue {
  phase: TourPhase
  token: string | null
  wsUrl: string | null
  startTour: () => void
  setConnection: (token: string, wsUrl: string) => void
  setPhase: (phase: TourPhase) => void
  reset: () => void
}

const VoiceTourContext = createContext<VoiceTourContextValue>({
  phase: 'idle',
  token: null,
  wsUrl: null,
  startTour: () => {},
  setConnection: () => {},
  setPhase: () => {},
  reset: () => {},
})

export function VoiceTourProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhaseState] = useState<TourPhase>('idle')
  const [token, setToken] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)

  const startTour = () => setPhaseState('intro')

  const setConnection = (t: string, w: string) => {
    setToken(t)
    setWsUrl(w)
  }

  const setPhase = (p: TourPhase) => setPhaseState(p)

  const reset = () => {
    setPhaseState('idle')
    setToken(null)
    setWsUrl(null)
  }

  return (
    <VoiceTourContext.Provider value={{ phase, token, wsUrl, startTour, setConnection, setPhase, reset }}>
      {children}
    </VoiceTourContext.Provider>
  )
}

export function useVoiceTour() {
  return useContext(VoiceTourContext)
}
