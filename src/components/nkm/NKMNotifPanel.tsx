'use client'
import { useRef } from 'react'
import { NKMState, NKMAction } from './types'

const TILES = [
  { id: 'wifi',  ico: '📶', lbl: 'Wi-Fi' },
  { id: 'bt',    ico: '🔵', lbl: 'BT' },
  { id: 'dnd',   ico: '🔕', lbl: 'DND' },
  { id: 'rotate',ico: '🔄', lbl: 'Rotate' },
  { id: 'loc',   ico: '📍', lbl: 'Location' },
  { id: 'torch', ico: '🔦', lbl: 'Torch' },
  { id: 'air',   ico: '✈️', lbl: 'Airplane' },
  { id: 'dark',  ico: '🌙', lbl: 'Dark' },
]

interface Props { state: NKMState; dispatch: React.Dispatch<NKMAction> }

export function NKMNotifPanel({ state, dispatch }: Props) {
  const touchStartY = useRef(0)

  return (
    <div
      className={`nkm-notif-panel ${state.notifPanelOpen ? 'open' : ''}`}
      onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        if (e.changedTouches[0].clientY - touchStartY.current > 60) dispatch({ type: 'CLOSE_NOTIF' })
      }}
    >
      <div className="nkm-np-quick">
        {TILES.map(t => (
          <div
            key={t.id}
            className={`nkm-np-tile ${state.quickTiles[t.id] ? 'on' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_TILE', tile: t.id })}
          >
            <div className="nkm-np-tile-ico">{t.ico}</div>
            <div className="nkm-np-tile-lbl">{t.lbl}</div>
          </div>
        ))}
      </div>
      <div className="nkm-np-slider-row">
        <span className="nkm-np-slider-ico">🔆</span>
        <input className="nkm-np-slider" type="range" min="10" max="100" defaultValue="75" />
        <span className="nkm-np-slider-ico" style={{ fontSize: 18 }}>☀️</span>
      </div>
      <div className="nkm-np-slider-row">
        <span className="nkm-np-slider-ico">🔇</span>
        <input className="nkm-np-slider" type="range" min="0" max="100" defaultValue="70" />
        <span className="nkm-np-slider-ico">🔊</span>
      </div>
      <div className="nkm-np-divider" />
      <div style={{ padding: '6px 16px', fontSize: 12, color: 'var(--text3)' }}>
        📌 Available for work · 7 products shipped
      </div>
      <button className="nkm-np-clear" onClick={() => dispatch({ type: 'CLOSE_NOTIF' })}>
        Close
      </button>
    </div>
  )
}
