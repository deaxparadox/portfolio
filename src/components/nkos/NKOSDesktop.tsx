'use client'
import { useReducer, useCallback } from 'react'
import { osReducer, INITIAL_OS_STATE } from './types'
import { NKOSBoot } from './NKOSBoot'

export function NKOSDesktop() {
  const [state, dispatch] = useReducer(osReducer, INITIAL_OS_STATE)
  const bootDone = useCallback(() => dispatch({ type: 'BOOT_DONE' }), [])

  return (
    <div className="nkos-root">
      {state.screen === 'boot' && <NKOSBoot onDone={bootDone} />}
      {state.screen === 'desktop' && (
        <div style={{ color: 'white', padding: 20 }}>Desktop coming soon… screen={state.screen}</div>
      )}
    </div>
  )
}
