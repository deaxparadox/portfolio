import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IntroScreen } from '@/components/voice-tour/IntroScreen'
import { VoiceTourProvider, useVoiceTour } from '@/components/voice-tour/VoiceTourContext'

beforeAll(() => {
  process.env.NEXT_PUBLIC_VOICE_AGENT_URL = 'http://localhost:8027'
  process.env.NEXT_PUBLIC_PROJECT_ID = 'portfolio'
})

function wrap(ui: React.ReactNode) {
  return render(<VoiceTourProvider>{ui}</VoiceTourProvider>)
}

describe('IntroScreen', () => {
  it('renders start and cancel buttons', () => {
    wrap(<IntroScreen />)
    expect(screen.getByRole('button', { name: /start voice tour/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('cancel returns phase to idle', () => {
    function PhaseReader() {
      const { phase } = useVoiceTour()
      return <span data-testid="phase">{phase}</span>
    }
    render(
      <VoiceTourProvider>
        <IntroScreen />
        <PhaseReader />
      </VoiceTourProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.getByTestId('phase')).toHaveTextContent('idle')
  })

  it('shows error message when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false }) as jest.Mock
    wrap(<IntroScreen />)
    fireEvent.click(screen.getByRole('button', { name: /start voice tour/i }))
    await waitFor(() => {
      expect(screen.getByText(/could not connect/i)).toBeInTheDocument()
    })
  })

  it('disables start button while loading', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {})) as jest.Mock
    wrap(<IntroScreen />)
    fireEvent.click(screen.getByRole('button', { name: /start voice tour/i }))
    expect(screen.getByRole('button', { name: /starting/i })).toBeDisabled()
  })

  it('on success calls setPhase active', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token', ws_url: 'wss://test' }),
    }) as jest.Mock

    function PhaseReader() {
      const { phase } = useVoiceTour()
      return <span data-testid="phase">{phase}</span>
    }
    render(
      <VoiceTourProvider>
        <IntroScreen />
        <PhaseReader />
      </VoiceTourProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /start voice tour/i }))
    await waitFor(() => {
      expect(screen.getByTestId('phase')).toHaveTextContent('active')
    })
  })
})
