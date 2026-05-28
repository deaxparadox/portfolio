import { render, screen, act } from '@testing-library/react'
import { VoiceTourProvider, useVoiceTour } from '@/components/voice-tour/VoiceTourContext'

function Probe() {
  const ctx = useVoiceTour()
  return (
    <div>
      <span data-testid="phase">{ctx.phase}</span>
      <span data-testid="token">{ctx.token ?? 'null'}</span>
      <button onClick={ctx.startTour}>startTour</button>
      <button onClick={() => ctx.setConnection('tok', 'wss://x')}>setConn</button>
      <button onClick={() => ctx.setPhase('ended')}>setEnded</button>
      <button onClick={ctx.reset}>reset</button>
    </div>
  )
}

function wrap(ui: React.ReactNode) {
  return render(<VoiceTourProvider>{ui}</VoiceTourProvider>)
}

describe('VoiceTourContext', () => {
  it('default phase is idle', () => {
    wrap(<Probe />)
    expect(screen.getByTestId('phase')).toHaveTextContent('idle')
  })

  it('startTour sets phase to intro', () => {
    wrap(<Probe />)
    act(() => { screen.getByText('startTour').click() })
    expect(screen.getByTestId('phase')).toHaveTextContent('intro')
  })

  it('setConnection stores token and wsUrl', () => {
    wrap(<Probe />)
    act(() => { screen.getByText('setConn').click() })
    expect(screen.getByTestId('token')).toHaveTextContent('tok')
  })

  it('setPhase updates phase', () => {
    wrap(<Probe />)
    act(() => { screen.getByText('setEnded').click() })
    expect(screen.getByTestId('phase')).toHaveTextContent('ended')
  })

  it('reset clears token and returns to idle', () => {
    wrap(<Probe />)
    act(() => { screen.getByText('setConn').click() })
    act(() => { screen.getByText('reset').click() })
    expect(screen.getByTestId('phase')).toHaveTextContent('idle')
    expect(screen.getByTestId('token')).toHaveTextContent('null')
  })
})
