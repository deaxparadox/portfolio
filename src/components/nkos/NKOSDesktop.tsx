'use client'
import { useReducer, useCallback } from 'react'
import { osReducer, INITIAL_OS_STATE } from './types'

export function NKOSDesktop() {
  const [state, dispatch] = useReducer(osReducer, INITIAL_OS_STATE)
  const bootDone = useCallback(() => dispatch({ type: 'BOOT_DONE' }), [])

  return (
    <div className="nkos-root">
      {state.screen === 'boot' && (
        <div className="nk-screen active nk-boot" onClick={bootDone}>
          <div style={{ color: 'var(--accent)', fontSize: 20 }}>NK-OS booting… (click to skip)</div>
        </div>
      )}
      {state.screen === 'desktop' && (
        <div style={{ color: 'white', padding: 20 }}>Desktop ready. screen={state.screen}</div>
      )}
    </div>
  )
}
