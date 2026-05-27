import { render, screen } from '@testing-library/react'
import ProjectCard from '@/components/projects/ProjectCard'
import type { ProjectItem } from '@/data/types'

const mockProject: ProjectItem = {
  year: '2024',
  name: 'Vgents',
  description: 'Real-time voice agent platform with WebSocket interaction.',
  tags: ['FastAPI', 'LiveKit', 'Docker', 'PostgreSQL'],
  links: [{ label: 'GitHub →', href: 'https://github.com/test' }],
  visual: {
    glyph: '🎙️',
    stats: [
      { value: 'Real-time', label: 'Voice Streaming', fill: 90 },
      { value: 'Isolated', label: 'Session Security', fill: 95 },
    ],
  },
}

describe('ProjectCard', () => {
  it('renders project name', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText('Vgents')).toBeInTheDocument()
  })

  it('renders eyebrow with correct index and year', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText(/01 · 2024/i)).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText(/Real-time voice agent platform/i)).toBeInTheDocument()
  })

  it('renders all tags', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getAllByText('FastAPI').length).toBeGreaterThan(0)
    expect(screen.getAllByText('LiveKit').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Docker').length).toBeGreaterThan(0)
  })

  it('renders impact value from visual.stats[0]', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText('Real-time')).toBeInTheDocument()
    expect(screen.getByText('Voice Streaming')).toBeInTheDocument()
  })

  it('renders glyph', () => {
    render(<ProjectCard project={mockProject} index={0} />)
    expect(screen.getByText('🎙️')).toBeInTheDocument()
  })

  it('renders correct eyebrow for index 1', () => {
    render(<ProjectCard project={mockProject} index={1} />)
    expect(screen.getByText(/02 · 2024/i)).toBeInTheDocument()
  })
})
