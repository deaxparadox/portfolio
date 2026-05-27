import { render, screen } from '@testing-library/react'
import ResumePortfolio from '@/components/resume/ResumePortfolio'
import type { PortfolioData } from '@/data/types'

const mockData = {
  meta: { title: 'Test', description: 'Test desc' },
  theme: { accentColor: '#f5c518' },
  stats: [],
  skills: [
    { icon: '⚡', name: 'AI & GenAI', kind: 'Agents', pct: 92, description: 'AI stuff', tags: ['LangGraph'] },
  ],
  projects: [
    { year: '2024', name: 'Vgents', description: 'Voice agents', tags: ['FastAPI'], links: [{ label: 'GitHub →', href: '#' }], visual: { glyph: '🎙️', stats: [] } },
  ],
  experience: [
    { period: 'Jan 2025 — Present', role: 'Python Developer', company: 'Excellence Technologies', location: 'Gurugram, IN', description: 'Built things' },
  ],
  contact: {
    heading: 'Get in touch',
    email: 'test@test.com',
    socials: [{ label: 'GitHub', icon: '⌥', href: 'https://github.com/test' }],
  },
  footer: { copy: '© 2026', signature: 'crafted' },
  terminal: { intro: [], commands: { about: [], skills: [], projects: [], experience: [], contact: [] } },
  glimpse: {
    reads: { title: 'Atomic Habits', author: 'James Clear', quote: 'Tiny changes' },
    hobbies: [],
    location: { city: 'Noida', country: 'India', pin: 'NOIDA', availability: 'Remote' },
    quote: { text: 'Make it work', author: 'Kent Beck' },
  },
} as unknown as PortfolioData

describe('ResumePortfolio', () => {
  it('renders name in hero', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('Nitish Kushwaha')).toBeInTheDocument()
  })

  it('renders company name in experience', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('Excellence Technologies')).toBeInTheDocument()
  })

  it('renders project name', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('Vgents')).toBeInTheDocument()
  })

  it('renders theme toggle button', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('Light')).toBeInTheDocument()
  })

  it('renders contact email', () => {
    render(<ResumePortfolio data={mockData} />)
    expect(screen.getByText('test@test.com')).toBeInTheDocument()
  })
})
