'use client'
import { useState } from 'react'
import { OSAction, AppId, APP_DEFS } from './types'

interface Props {
  open: boolean
  dispatch: React.Dispatch<OSAction>
}

type Cat = 'all' | 'portfolio' | 'system'

export function NKOSLauncher({ open, dispatch }: Props) {
  const [cat, setCat] = useState<Cat>('all')
  const [search, setSearch] = useState('')

  const apps = (Object.entries(APP_DEFS) as [AppId, typeof APP_DEFS[AppId]][])
    .filter(([, def]) => cat === 'all' || def.cat === cat)
    .filter(([, def]) => def.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className={`nk-launcher ${open ? 'open' : ''}`}>
      <div className="nk-lnch-header">
        <input
          className="nk-lnch-search"
          type="text"
          placeholder="Search applications…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="nk-lnch-body">
        <div className="nk-lnch-cats">
          {(['all','portfolio','system'] as Cat[]).map(c => (
            <div
              key={c}
              className={`nk-lnch-cat ${cat === c ? 'sel' : ''}`}
              onClick={() => setCat(c)}
            >
              {c === 'all' ? '🏠 All' : c === 'portfolio' ? '🗂️ Portfolio' : '⚙️ System'}
            </div>
          ))}
        </div>
        <div className="nk-lnch-grid">
          {apps.map(([id, def]) => (
            <div
              key={id}
              className="nk-lnch-app"
              onClick={() => { dispatch({ type: 'OPEN_APP', appId: id }); dispatch({ type: 'CLOSE_LAUNCHER' }) }}
            >
              <div className="nk-lnch-app-ico">{def.icon}</div>
              <div className="nk-lnch-app-name">{def.title}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="nk-lnch-footer">
        <button className="nk-lnch-foot-btn" title="Close" onClick={() => dispatch({ type: 'CLOSE_LAUNCHER' })}>⚙️</button>
        <button className="nk-lnch-foot-btn danger" title="Shut Down" onClick={() => dispatch({ type: 'SHUTDOWN' })}>⏻</button>
      </div>
    </div>
  )
}
