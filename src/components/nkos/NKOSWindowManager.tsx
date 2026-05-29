'use client'
import { useRef, useEffect } from 'react'
import { OSState, OSAction, WinState } from './types'
import { NKOSWindow } from './NKOSWindow'
import { TerminalApp  } from './apps/TerminalApp'
import { AboutApp     } from './apps/AboutApp'
import { ProjectsApp  } from './apps/ProjectsApp'
import { SkillsApp    } from './apps/SkillsApp'
import { ContactApp   } from './apps/ContactApp'
import { DeaxApp      } from './apps/DeaxApp'

interface Props {
  state: OSState
  dispatch: React.Dispatch<OSAction>
}

function AppContent({ win }: { win: WinState }) {
  switch (win.appId) {
    case 'terminal': return <TerminalApp winId={win.id} />
    case 'about':    return <AboutApp />
    case 'projects': return <ProjectsApp />
    case 'skills':   return <SkillsApp />
    case 'contact':  return <ContactApp />
    case 'deax':     return <DeaxApp />
    default:         return null
  }
}

export function NKOSWindowManager({ state, dispatch }: Props) {
  const dragRef   = useRef<{ winId: string; sx: number; sy: number; wx: number; wy: number } | null>(null)
  const resizeRef = useRef<{ winId: string; sx: number; sy: number; sw: number; sh: number } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const { winId, sx, sy, wx, wy } = dragRef.current
        dispatch({ type: 'MOVE_WIN', id: winId,
          x: Math.max(0, wx + (e.clientX - sx)),
          y: Math.max(0, Math.min(window.innerHeight - 60, wy + (e.clientY - sy))),
        })
      }
      if (resizeRef.current) {
        const { winId, sx, sy, sw, sh } = resizeRef.current
        dispatch({ type: 'RESIZE_WIN', id: winId,
          w: Math.max(280, sw + (e.clientX - sx)),
          h: Math.max(180, sh + (e.clientY - sy)),
        })
      }
    }
    const onUp = () => { dragRef.current = null; resizeRef.current = null }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [dispatch])

  return (
    <div className="nk-win-layer">
      {state.windows.map(win => (
        <NKOSWindow
          key={win.id}
          win={win}
          onFocus={() => dispatch({ type: 'FOCUS_WIN', id: win.id })}
          onClose={() => dispatch({ type: 'CLOSE_WIN', id: win.id })}
          onMinimize={() => dispatch({ type: 'MINIMIZE_WIN', id: win.id })}
          onToggleMax={() => dispatch({ type: 'TOGGLE_MAX', id: win.id })}
          onDragStart={(sx, sy) => {
            dragRef.current = { winId: win.id, sx, sy, wx: win.x, wy: win.y }
          }}
          onResizeStart={(sx, sy) => {
            resizeRef.current = { winId: win.id, sx, sy, sw: win.w, sh: win.h }
          }}
        >
          <AppContent win={win} />
        </NKOSWindow>
      ))}
    </div>
  )
}
