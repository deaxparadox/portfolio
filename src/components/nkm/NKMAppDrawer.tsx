'use client'
import { useState, useRef } from 'react'
import { NKMAction, AppId, APP_DEFS } from './types'

interface Props { open: boolean; dispatch: React.Dispatch<NKMAction> }

export function NKMAppDrawer({ open, dispatch }: Props) {
  const [search, setSearch] = useState('')
  const touchStartY = useRef(0)

  const apps = (Object.entries(APP_DEFS) as [AppId, typeof APP_DEFS[AppId]][])
    .filter(([, def]) => def.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div
      className={`nkm-drawer ${open ? 'open' : ''}`}
      onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        if (e.changedTouches[0].clientY - touchStartY.current > 60) dispatch({ type: 'CLOSE_DRAWER' })
      }}
    >
      <div className="nkm-drawer-handle" />
      <div className="nkm-drawer-search">
        <span className="nkm-drawer-search-ico">🔍</span>
        <input
          type="text"
          placeholder="Search apps…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="nkm-drawer-grid">
        {apps.map(([id, def]) => (
          <div
            key={id}
            className="nkm-drawer-app"
            onClick={() => { dispatch({ type: 'OPEN_APP', appId: id }); setSearch('') }}
          >
            <div className="nkm-da-wrap" style={{ background: def.bg }}>{def.icon}</div>
            <div className="nkm-da-lbl">{def.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
