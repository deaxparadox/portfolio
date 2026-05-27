import { render, screen, fireEvent } from '@testing-library/react'
import DeaxButton from '@/components/deax/DeaxButton'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('DeaxButton', () => {
  it('renders the Deax label', () => {
    render(<DeaxButton />)
    expect(screen.getByText(/deax/i)).toBeInTheDocument()
  })

  it('menu is hidden initially', () => {
    render(<DeaxButton />)
    expect(screen.queryByText(/Explore full portfolio/i)).not.toBeInTheDocument()
  })

  it('shows menu on click', () => {
    render(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Explore full portfolio/i)).toBeInTheDocument()
  })

  it('shows soon badge on Talk to Deax option', () => {
    render(<DeaxButton />)
    fireEvent.click(screen.getByRole('button', { name: /deax/i }))
    expect(screen.getByText(/Talk to Deax/i)).toBeInTheDocument()
    expect(screen.getByText(/soon/i)).toBeInTheDocument()
  })

  it('closes menu on second click', () => {
    render(<DeaxButton />)
    const btn = screen.getByRole('button', { name: /deax/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText(/Explore full portfolio/i)).not.toBeInTheDocument()
  })
})
