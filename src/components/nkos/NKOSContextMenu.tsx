'use client'
import { OSAction } from './types'

interface Props {
  x: number
  y: number
  dispatch: React.Dispatch<OSAction>
}

export function NKOSContextMenu({ x, y, dispatch }: Props) {
  const close = () => dispatch({ type: 'HIDE_CTX' })

  const items = [
    { label: '🖥️ Open Terminal',   action: () => { dispatch({ type: 'OPEN_APP', appId: 'terminal' }); close() } },
    { label: '📁 Open Projects',    action: () => { dispatch({ type: 'OPEN_APP', appId: 'projects' }); close() } },
    null,
    { label: '🖼️ Change Wallpaper', action: () => { dispatch({ type: 'CYCLE_WALLPAPER' }); close() } },
    { label: 'ℹ️  About NK-OS',     action: () => { dispatch({ type: 'OPEN_APP', appId: 'about' }); close() } },
    null,
    { label: '⏻  Shut Down', danger: true, action: () => { dispatch({ type: 'SHUTDOWN' }); close() } },
  ]

  return (
    <div
      className="nk-ctx open"
      style={{
        left: Math.min(x, window.innerWidth - 200),
        top:  Math.min(y, window.innerHeight - 220),
      }}
    >
      {items.map((item, i) =>
        item === null
          ? <div key={i} className="nk-ctx-sep" />
          : <div
              key={i}
              className={`nk-ctx-item ${(item as {danger?: boolean}).danger ? 'danger' : ''}`}
              onClick={(item as {action: () => void}).action}
            >
              {(item as {label: string}).label}
            </div>
      )}
    </div>
  )
}
