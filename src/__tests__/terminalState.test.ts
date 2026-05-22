import { renderHook, act } from '@testing-library/react'
import { TerminalProvider, useTerminal } from '@/context/TerminalContext'
import React from 'react'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(TerminalProvider, null, children)

describe('useTerminal state machine', () => {
  it('starts in EMBEDDED state', () => {
    const { result } = renderHook(() => useTerminal(), { wrapper })
    expect(result.current.state).toBe('EMBEDDED')
  })

  it('transitions EMBEDDED to FLOATING', () => {
    const { result } = renderHook(() => useTerminal(), { wrapper })
    act(() => { result.current.transitionTo('FLOATING') })
    expect(result.current.state).toBe('FLOATING')
  })

  it('transitions FLOATING to MAXIMIZED', () => {
    const { result } = renderHook(() => useTerminal(), { wrapper })
    act(() => { result.current.transitionTo('FLOATING') })
    act(() => { result.current.transitionTo('MAXIMIZED') })
    expect(result.current.state).toBe('MAXIMIZED')
  })

  it('ignores transition to same state', () => {
    const { result } = renderHook(() => useTerminal(), { wrapper })
    const before = result.current.state
    act(() => { result.current.transitionTo('EMBEDDED') })
    expect(result.current.state).toBe(before)
  })

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useTerminal())).toThrow(
      'useTerminal must be used within TerminalProvider'
    )
  })
})
