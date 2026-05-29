import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import DeaxButton from '@/components/deax/DeaxButton'
import { VoiceTourProvider, useVoiceTour } from '@/components/voice-tour/VoiceTourContext'
import { ChatProvider, useChatContext } from '@/components/chat/ChatContext'

jest.mock('@/components/chat/chatApi', () => ({
  createSession: jest.fn().mockResolvedValue('mock-tid'),
  streamMessage: jest.fn(),
}))

let mockMode = 'full'
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: (k: string) => k === 'mode' ? mockMode : null }),
  usePathname: () => '/',
}))

function wrap(ui: React.ReactNode) {
  return render(
    <VoiceTourProvider>
      <ChatProvider>{ui}</ChatProvider>
    </VoiceTourProvider>
  )
}

beforeEach(() => { mockMode = 'full' })

describe('DeaxButton', () => {
  it('renders the Deax label', () => {
    wrap(<DeaxButton />)
    expect(screen.getByText(/deax/i)).toBeInTheDocument()
  })

  it('menu is hidden initially', () => {
    wrap(<DeaxButton />)
    expect(screen.queryByText(/Explore full portfolio/i)).not.toBeInTheDocument()
  })

  it('shows menu on click', () => {
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Resume mode/i)).toBeInTheDocument()
  })

  it('Explore full portfolio absent in full mode', () => {
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.queryByText(/Explore full portfolio/i)).not.toBeInTheDocument()
  })

  it('Explore full portfolio visible in resume mode', () => {
    mockMode = 'resume'
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Explore full portfolio/i)).toBeInTheDocument()
  })

  it('shows Talk to Deax in full mode', () => {
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Talk to Deax/i)).toBeInTheDocument()
  })

  it('shows Chat with Deax in full mode', () => {
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Chat with Deax/i)).toBeInTheDocument()
  })

  it('shows Chat with Deax in resume mode', () => {
    mockMode = 'resume'
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Chat with Deax/i)).toBeInTheDocument()
  })

  it('closes menu on second click', () => {
    wrap(<DeaxButton />)
    const btn = screen.getByRole('button', { name: /deax/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText(/Explore full portfolio/i)).not.toBeInTheDocument()
  })

  it('Talk to Deax absent when mode is resume', () => {
    mockMode = 'resume'
    wrap(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.queryByText(/Talk to Deax/i)).not.toBeInTheDocument()
  })

  it('DeaxButton returns null when tour phase is active', () => {
    function ActivePhaseWrapper() {
      const { setPhase } = useVoiceTour()
      useEffect(() => { setPhase('active') }, [])
      return <DeaxButton />
    }
    render(<VoiceTourProvider><ChatProvider><ActivePhaseWrapper /></ChatProvider></VoiceTourProvider>)
    expect(screen.queryByRole('button', { name: /deax menu/i })).not.toBeInTheDocument()
  })

  it('DeaxButton returns null when chat is open', async () => {
    function ChatOpenWrapper() {
      const { openChat } = useChatContext()
      useEffect(() => { openChat() }, [])
      return <DeaxButton />
    }
    render(<VoiceTourProvider><ChatProvider><ChatOpenWrapper /></ChatProvider></VoiceTourProvider>)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /deax menu/i })).not.toBeInTheDocument()
    })
  })
})
