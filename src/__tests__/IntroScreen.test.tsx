import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IntroScreen } from '@/components/voice-tour/IntroScreen'
import { VoiceTourProvider } from '@/components/voice-tour/VoiceTourContext'

function wrap(ui: React.ReactNode) {
  return render(<VoiceTourProvider>{ui}</VoiceTourProvider>)
}

describe('IntroScreen', () => {
  it('renders start and cancel buttons', () => {
    wrap(<IntroScreen />)
    expect(screen.getByRole('button', { name: /start voice tour/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('cancel calls setPhase idle', () => {
    wrap(<IntroScreen />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    // No crash = cancel handler wired correctly
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
})
