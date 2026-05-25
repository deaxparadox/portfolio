import { render, screen, fireEvent, act } from '@testing-library/react'
import SkillsFinder from '@/components/skills/SkillsFinder'
import type { SkillItem } from '@/data/types'

const mockSkills: SkillItem[] = [
  {
    icon: '⚡', name: 'AI & GenAI', kind: 'Agents · RAG · LLMs', pct: 92,
    description: 'LLM-driven workflows and intelligent agents.',
    tags: ['LangGraph', 'RAG'],
  },
  {
    icon: '🐍', name: 'Backend APIs', kind: 'Framework / REST / Python', pct: 90,
    description: 'RESTful APIs built for scale.',
    tags: ['FastAPI', 'Django'],
  },
  {
    icon: '🎙️', name: 'Voice & Realtime', kind: 'Realtime / Voice / WebSocket', pct: 85,
    description: 'Real-time voice agents.',
    tags: ['LiveKit'],
  },
]

describe('SkillsFinder', () => {
  it('renders dynamic item count in titlebar', () => {
    render(<SkillsFinder skills={mockSkills} />)
    expect(screen.getByText(/3 items/i)).toBeInTheDocument()
  })

  it('renders first skill as default selection in status bar', () => {
    render(<SkillsFinder skills={mockSkills} />)
    expect(screen.getByText(/1 of 3 selected — AI & GenAI/i)).toBeInTheDocument()
  })

  it('renders all skill names in the sidebar', () => {
    render(<SkillsFinder skills={mockSkills} />)
    expect(screen.getAllByText('AI & GenAI').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Backend APIs').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Voice & Realtime').length).toBeGreaterThan(0)
  })

  it('updates status bar after clicking a sidebar item', () => {
    jest.useFakeTimers()
    render(<SkillsFinder skills={mockSkills} />)
    const backendItems = screen.getAllByText('Backend APIs')
    fireEvent.click(backendItems[0])
    act(() => { jest.runAllTimers() })
    expect(screen.getByText(/2 of 3 selected — Backend APIs/i)).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('renders Grid pill button', () => {
    render(<SkillsFinder skills={mockSkills} />)
    expect(screen.getByText('Grid')).toBeInTheDocument()
  })

  it('renders all skill tags in grid view after toggling', () => {
    jest.useFakeTimers()
    render(<SkillsFinder skills={mockSkills} />)
    fireEvent.click(screen.getByText('Grid'))
    act(() => { jest.runAllTimers() })
    expect(screen.getAllByText('LangGraph').length).toBeGreaterThan(0)
    expect(screen.getAllByText('FastAPI').length).toBeGreaterThan(0)
    jest.useRealTimers()
  })
})
