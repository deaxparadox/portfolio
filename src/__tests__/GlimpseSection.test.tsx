import { render, screen } from '@testing-library/react'
import GlimpseSection from '@/components/glimpse/GlimpseSection'
import type { GlimpseData } from '@/data/types'

const mockGlimpse: GlimpseData = {
  reads: { title: 'Atomic Habits', author: 'James Clear', quote: 'Tiny changes' },
  hobbies: [
    { label: 'Gaming', icon: '🎮' },
    { label: 'Web Series', icon: '📺' },
    { label: 'Sleeping', icon: '😴' },
  ],
  location: { city: 'Noida', country: 'India', pin: 'NOIDA, IN', availability: 'Open to Remote' },
  quote: { text: 'Make it work', author: 'Kent Beck' },
}

describe('GlimpseSection', () => {
  it('renders the section heading', () => {
    render(<GlimpseSection glimpse={mockGlimpse} />)
    expect(screen.getByText('A glimpse into')).toBeInTheDocument()
  })

  it('renders the book title', () => {
    render(<GlimpseSection glimpse={mockGlimpse} />)
    expect(screen.getByText('Atomic Habits')).toBeInTheDocument()
  })

  it('renders all hobbies', () => {
    render(<GlimpseSection glimpse={mockGlimpse} />)
    expect(screen.getByText('Gaming')).toBeInTheDocument()
    expect(screen.getByText('Web Series')).toBeInTheDocument()
    expect(screen.getByText('Sleeping')).toBeInTheDocument()
  })

  it('renders the city', () => {
    render(<GlimpseSection glimpse={mockGlimpse} />)
    expect(screen.getByText('Noida, India')).toBeInTheDocument()
  })

  it('renders the quote author', () => {
    render(<GlimpseSection glimpse={mockGlimpse} />)
    expect(screen.getByText('— Kent Beck')).toBeInTheDocument()
  })
})
