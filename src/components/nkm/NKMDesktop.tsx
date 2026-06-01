'use client'
import { useReducer, useCallback, useEffect, useRef } from 'react'
import { nkmReducer, INITIAL_STATE } from './types'
import { NKMBoot       } from './NKMBoot'
import { NKMWallpaper  } from './NKMWallpaper'
import { NKMLock       } from './NKMLock'
import { NKMStatusBar  } from './NKMStatusBar'
import { NKMHome       } from './NKMHome'
import { NKMAppDrawer  } from './NKMAppDrawer'
import { NKMNotifPanel } from './NKMNotifPanel'
import { NKMPowerMenu  } from './NKMPowerMenu'
import { NKMApp        } from './NKMApp'

export function NKMDesktop() {
  const [state, dispatch] = useReducer(nkmReducer, INITIAL_STATE)
  const bootDone = useCallback(() => dispatch({ type: 'BOOT_DONE' }), [])
  const homeBarTapsRef  = useRef(0)
  const homeBarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Shutdown → poweroff after 2.8s
  useEffect(() => {
    if (state.screen === 'shutdown') {
      const t = setTimeout(() => dispatch({ type: 'POWEROFF' }), 2800)
      return () => clearTimeout(t)
    }
  }, [state.screen])

  const handleHomeBar = useCallback(() => {
    homeBarTapsRef.current++
    if (homeBarTimerRef.current) clearTimeout(homeBarTimerRef.current)
    if (homeBarTapsRef.current >= 3) {
      homeBarTapsRef.current = 0
      dispatch({ type: 'OPEN_POWER' })
      return
    }
    homeBarTimerRef.current = setTimeout(() => {
      homeBarTapsRef.current = 0
      dispatch({ type: 'CLOSE_APP' })
      dispatch({ type: 'CLOSE_DRAWER' })
      dispatch({ type: 'CLOSE_NOTIF' })
    }, 320)
  }, [])

  const showStatus = state.screen === 'home' || state.screen === 'lock'

  return (
    <div className="nkm-root">
      {/* Desktop blocker — CSS handles show/hide via media query */}
      <div className="nkm-desktop-block">
        <div className="nkm-db-icon">📱</div>
        <div className="nkm-db-line" />
        <div className="nkm-db-title">NK-M</div>
        <div className="nkm-db-sub">
          This experience is designed for smartphones and tablets.<br />
          Open on your phone, or resize your browser to a mobile viewport.
        </div>
        <div className="nkm-db-hint">Screen too wide (&gt; 1024px)</div>
        <div className="nkm-db-links">
          <a href="/nkos" className="nkm-db-link">→ Try NK-OS on desktop</a>
          <a href="/" className="nkm-db-link">← Back to portfolio</a>
        </div>
      </div>

      {/* Wallpaper */}
      <NKMWallpaper wallpaperIdx={state.wallpaperIdx} />

      {/* Boot */}
      {state.screen === 'boot' && <NKMBoot onDone={bootDone} />}

      {/* Lock */}
      {state.screen === 'lock' && <NKMLock onUnlock={() => dispatch({ type: 'UNLOCK' })} />}

      {/* Home */}
      {state.screen === 'home' && (
        <NKMHome state={state} dispatch={dispatch} />
      )}

      {/* Status bar (lock + home) */}
      {showStatus && (
        <NKMStatusBar
          panelOpen={state.notifPanelOpen}
          onSwipeDown={() => dispatch({ type: state.notifPanelOpen ? 'CLOSE_NOTIF' : 'OPEN_NOTIF' })}
        />
      )}

      {/* Notification panel */}
      <NKMNotifPanel state={state} dispatch={dispatch} />

      {/* App drawer */}
      <NKMAppDrawer open={state.drawerOpen} dispatch={dispatch} />

      {/* Active app */}
      {state.screen === 'home' && <NKMApp state={state} dispatch={dispatch} />}

      {/* Power menu */}
      <NKMPowerMenu open={state.powerMenuOpen} dispatch={dispatch} />

      {/* Home bar */}
      {state.screen === 'home' && (
        <div className="nkm-home-bar" onClick={handleHomeBar} />
      )}

      {/* Toast area */}
      <div className="nkm-toast-area" id="nkm-toast-area" />

      {/* Shutdown */}
      {state.screen === 'shutdown' && (
        <div className="nkm-scr on nkm-shutdown">
          <div className="nkm-sd-ring" />
          <div className="nkm-sd-label">Shutting down</div>
        </div>
      )}

      {/* Poweroff */}
      {state.screen === 'poweroff' && (
        <div className="nkm-scr on nkm-poweroff">
          <button className="nkm-po-ring" onClick={bootDone}>⏻</button>
          <div className="nkm-po-hint">Hold to power on</div>
        </div>
      )}
    </div>
  )
}
