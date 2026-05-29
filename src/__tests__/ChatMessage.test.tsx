import { render, screen } from '@testing-library/react'
import { ChatMessage } from '@/components/chat/ChatMessage'

describe('ChatMessage', () => {
  it('user message renders YOU label', () => {
    render(<ChatMessage id="1" role="user" content="Hello" />)
    expect(screen.getByText('YOU')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('assistant message renders DEAX label', () => {
    render(<ChatMessage id="2" role="assistant" content="Hi there" />)
    expect(screen.getByText('DEAX')).toBeInTheDocument()
    expect(screen.getByText('Hi there')).toBeInTheDocument()
  })
})
