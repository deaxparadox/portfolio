import { render, screen } from '@testing-library/react'
import Tag from '@/components/ui/Tag'

describe('Tag', () => {
  it('renders the label text', () => {
    render(<Tag>LangGraph</Tag>)
    expect(screen.getByText('LangGraph')).toBeInTheDocument()
  })

  it('applies the tag CSS class', () => {
    const { container } = render(<Tag>FastAPI</Tag>)
    expect(container.firstChild).toHaveClass('tag')
  })
})
