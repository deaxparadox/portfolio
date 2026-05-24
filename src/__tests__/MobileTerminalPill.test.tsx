import { render, screen } from '@testing-library/react'
import MobileTerminalPill from '@/components/hero/MobileTerminalPill'
import { TerminalProvider } from '@/context/TerminalContext'
import React from 'react'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(TerminalProvider, null, children)

describe('MobileTerminalPill', () => {
  it('renders the terminal label', () => {
    render(<MobileTerminalPill />, { wrapper })
    expect(screen.getByText('~/nitish-kushwaha')).toBeInTheDocument()
  })

  it('renders the tap hint', () => {
    render(<MobileTerminalPill />, { wrapper })
    expect(screen.getByText('tap to open →')).toBeInTheDocument()
  })

  it('has the mobile-terminal-pill class', () => {
    const { container } = render(<MobileTerminalPill />, { wrapper })
    expect(container.firstChild).toHaveClass('mobile-terminal-pill')
  })
})
