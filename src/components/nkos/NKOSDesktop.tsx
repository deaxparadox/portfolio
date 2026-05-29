'use client'
import { useReducer, useCallback, useEffect, useRef } from 'react'
import { osReducer, INITIAL_OS_STATE, APP_DEFS, AppId } from './types'
import { NKOSBoot         } from './NKOSBoot'
import { NKOSWallpaper    } from './NKOSWallpaper'
import { NKOSWindowManager } from './NKOSWindowManager'
import { NKOSTaskbar      } from './NKOSTaskbar'
import { NKOSLauncher     } from './NKOSLauncher'
import { NKOSContextMenu  } from './NKOSContextMenu'

const DESKTOP_APPS: AppId[] = ['terminal', 'about', 'projects', 'skills', 'contact', 'deax']

export function NKOSDesktop() {
  const [state, dispatch] = useReducer(osReducer, INITIAL_OS_STATE)
  const bootDone = useCallback(() => dispatch({ type: 'BOOT_DONE' }), [])
  const notifTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Auto-dismiss notifications after 3.4s
  useEffect(() => {
    state.notifs.forEach(n => {
      if (!notifTimers.current[n.id]) {
        notifTimers.current[n.id] = setTimeout(() => {
          dispatch({ type: 'DISMISS_NOTIF', id: n.id })
          delete notifTimers.current[n.id]
        }, 3400)
      }
    })
  }, [state.notifs])

  // Shutdown → poweroff after 2.6s
  useEffect(() => {
    if (state.screen === 'shutdown') {
      const t = setTimeout(() => dispatch({ type: 'POWEROFF' }), 2600)
      return () => clearTimeout(t)
    }
  }, [state.screen])

  // Global keyboard shortcuts (desktop only)
  useEffect(() => {
    if (state.screen !== 'desktop') return
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault()
        dispatch({ type: 'OPEN_APP', appId: 'terminal' })
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'CLOSE_LAUNCHER' })
        dispatch({ type: 'HIDE_CTX' })
      }
      if (e.key === 'F5') {
        e.preventDefault()
        dispatch({ type: 'CYCLE_WALLPAPER' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.screen])

  // Right-click on desktop background
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.nk-win') || target.closest('.nk-taskbar') || target.closest('.nk-launcher')) return
    e.preventDefault()
    dispatch({ type: 'SHOW_CTX', x: e.clientX, y: e.clientY })
  }, [])

  // Click anywhere to close launcher + ctx menu
  const onDesktopClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.nk-ctx')) dispatch({ type: 'HIDE_CTX' })
    if (!target.closest('.nk-launcher') && !target.closest('.nk-launcher-btn')) {
      dispatch({ type: 'CLOSE_LAUNCHER' })
    }
  }, [])

  return (
    <div className="nkos-root">
      {/* Mobile fallback */}
      <div className="nkos-mobile">
        <div className="nkos-mobile-icon">🖥️</div>
        <h2>NK-OS is a desktop experience</h2>
        <p>Visit on a screen wider than 768px to explore the full OS portfolio.</p>
        <a href="/">← Back to portfolio</a>
      </div>

      {/* Boot screen */}
      {state.screen === 'boot' && <NKOSBoot onDone={bootDone} />}

      {/* Desktop */}
      {state.screen === 'desktop' && (
        <div
          style={{ position: 'fixed', inset: 0 }}
          onContextMenu={onContextMenu}
          onClick={onDesktopClick}
        >
          <NKOSWallpaper wallpaperIdx={state.wallpaperIdx} />

          {/* Desktop icons */}
          <div className="nk-icons">
            {DESKTOP_APPS.map(id => {
              const def = APP_DEFS[id]
              return (
                <div
                  key={id}
                  className="nk-icon"
                  onDoubleClick={() => dispatch({ type: 'OPEN_APP', appId: id })}
                >
                  <div className="nk-icon-emoji">{def.icon}</div>
                  <div className="nk-icon-label">{def.title}</div>
                </div>
              )
            })}
          </div>

          <NKOSWindowManager state={state} dispatch={dispatch} />
          <NKOSLauncher open={state.launcherOpen} dispatch={dispatch} />
          {state.ctxMenu && (
            <NKOSContextMenu x={state.ctxMenu.x} y={state.ctxMenu.y} dispatch={dispatch} />
          )}
          <NKOSTaskbar state={state} dispatch={dispatch} />

          {/* Notifications */}
          <div className="nk-notifs">
            {state.notifs.map(n => (
              <div key={n.id} className="nk-notif" onClick={() => dispatch({ type: 'DISMISS_NOTIF', id: n.id })}>
                <div className="nk-notif-title">{n.icon} {n.title}</div>
                <div className="nk-notif-body">{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shutdown */}
      {state.screen === 'shutdown' && (
        <div className="nk-screen active nk-shutdown">
          <div className="nk-sd-ring" />
          <div className="nk-sd-txt">Shutting Down</div>
        </div>
      )}

      {/* Power off */}
      {state.screen === 'poweroff' && (
        <div className="nk-screen active nk-poweroff">
          <button className="nk-po-btn" onClick={bootDone}>⏻</button>
          <div className="nk-po-hint">Press to power on</div>
        </div>
      )}
    </div>
  )
}
