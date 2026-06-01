'use client'
import { useRef } from 'react'
import { NKMState, NKMAction, AppId, APP_DEFS } from './types'

const HOME_APPS: AppId[] = ['terminal', 'about', 'projects', 'skills', 'contact', 'deax']
const DOCK_APPS: AppId[] = ['terminal', 'projects', 'about']

interface Props { state: NKMState; dispatch: React.Dispatch<NKMAction> }

export function NKMHome({ state, dispatch }: Props) {
  const swipeStartRef = useRef({ x: 0, y: 0 })

  return (
    <div
      className="nkm-scr on nkm-home"
      onTouchStart={e => { swipeStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
      onTouchEnd={e => {
        const dy = swipeStartRef.current.y - e.changedTouches[0].clientY
        if (dy > 80 && !state.activeApp) dispatch({ type: 'OPEN_DRAWER' })
      }}
    >
      <div className="nkm-home-pages">
        <div className="nkm-icon-grid">
          {HOME_APPS.map(id => {
            const def = APP_DEFS[id]
            return (
              <div key={id} className="nkm-app-icon" onClick={() => dispatch({ type: 'OPEN_APP', appId: id })}>
                <div className="nkm-ai-wrap" style={{ background: def.bg }}>{def.icon}</div>
                <div className="nkm-ai-lbl">{def.title}</div>
              </div>
            )
          })}
        </div>
        <div className="nkm-page-dots">
          <div className="nkm-pdot active" />
        </div>
      </div>
      <div className="nkm-dock">
        <div className="nkm-dock-pill">
          {DOCK_APPS.map(id => {
            const def = APP_DEFS[id]
            return (
              <div key={id} className="nkm-dock-ico" onClick={() => dispatch({ type: 'OPEN_APP', appId: id })}>
                <div className="nkm-di-wrap" style={{ background: def.bg }}>{def.icon}</div>
              </div>
            )
          })}
          <div className="nkm-dock-ico" onClick={() => dispatch({ type: 'OPEN_DRAWER' })}>
            <div className="nkm-di-wrap" style={{ background: 'rgba(255,255,255,.1)', fontSize: 18 }}>⠿</div>
          </div>
        </div>
      </div>
    </div>
  )
}
