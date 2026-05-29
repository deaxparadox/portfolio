'use client'
import { useState, useEffect } from 'react'
import { OSState, OSAction } from './types'

interface Props {
  state: OSState
  dispatch: React.Dispatch<OSAction>
}

function Clock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      const h = n.getHours().toString().padStart(2,'0')
      const m = n.getMinutes().toString().padStart(2,'0')
      setTime(`${h}:${m}`)
      const dd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      const mm = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      setDate(`${dd[n.getDay()]}, ${mm[n.getMonth()]} ${n.getDate()}`)
    }
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="nk-clock">
      <div className="nk-clock-time">{time}</div>
      <div className="nk-clock-date">{date}</div>
    </div>
  )
}

export function NKOSTaskbar({ state, dispatch }: Props) {
  return (
    <div className="nk-taskbar">
      <button
        className={`nk-launcher-btn ${state.launcherOpen ? 'open' : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_LAUNCHER' })}
        title="Application Launcher"
      >
        <svg viewBox="0 0 22 22" fill="none">
          {[4,11,18].flatMap(x => [4,11,18].map(y =>
            <circle key={`${x}${y}`} cx={x} cy={y} r="1.8" fill="currentColor"/>
          ))}
        </svg>
      </button>

      <div className="nk-tb-sep" />

      <div className="nk-tb-apps">
        {state.windows.map(win => (
          <button
            key={win.id}
            className={`nk-tb-app ${win.focused && !win.minimized ? 'active' : ''} ${win.minimized ? 'minimized' : ''}`}
            onClick={() => {
              if (win.minimized) dispatch({ type: 'RESTORE_WIN', id: win.id })
              else if (win.focused) dispatch({ type: 'MINIMIZE_WIN', id: win.id })
              else dispatch({ type: 'FOCUS_WIN', id: win.id })
            }}
          >
            <span className="nk-tb-app-ico">{win.icon}</span>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{win.title}</span>
          </button>
        ))}
      </div>

      <div className="nk-sys-tray">
        <div className="nk-tray-ico" title="Volume">🔊</div>
        <div className="nk-tray-ico" title="Network">📶</div>
        <Clock />
      </div>
    </div>
  )
}
