'use client'
import { useReducer, useCallback } from 'react'
import { nkmReducer, INITIAL_STATE } from './types'
import { NKMBoot      } from './NKMBoot'
import { NKMWallpaper } from './NKMWallpaper'

export function NKMDesktop() {
  const [state, dispatch] = useReducer(nkmReducer, INITIAL_STATE)
  const bootDone = useCallback(() => dispatch({ type: 'BOOT_DONE' }), [])

  return (
    <div className="nkm-root">
      <NKMWallpaper wallpaperIdx={state.wallpaperIdx} />
      {state.screen === 'boot' && <NKMBoot onDone={bootDone} />}
      {state.screen !== 'boot' && (
        <div style={{ color: 'white', padding: 60, position: 'relative', zIndex: 2 }}>
          screen: {state.screen}
        </div>
      )}
    </div>
  )
}
