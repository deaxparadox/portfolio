'use client'
import { NKMState, NKMAction, APP_DEFS, AppId } from './types'
import { TerminalApp } from './apps/TerminalApp'
import { AboutApp    } from './apps/AboutApp'
import { ProjectsApp } from './apps/ProjectsApp'
import { SkillsApp   } from './apps/SkillsApp'
import { ContactApp  } from './apps/ContactApp'
import { DeaxApp     } from './apps/DeaxApp'

function AppBody({ appId }: { appId: AppId }) {
  switch (appId) {
    case 'terminal': return <TerminalApp />
    case 'about':    return <AboutApp />
    case 'projects': return <ProjectsApp />
    case 'skills':   return <SkillsApp />
    case 'contact':  return <ContactApp />
    case 'deax':     return <DeaxApp />
    default:         return null
  }
}

interface Props { state: NKMState; dispatch: React.Dispatch<NKMAction> }

export function NKMApp({ state, dispatch }: Props) {
  const { activeApp } = state
  if (!activeApp) return null
  const def = APP_DEFS[activeApp]

  return (
    <div className={`nkm-app ${activeApp ? 'open' : ''}`}>
      <div className="nkm-app-topbar">
        <button className="nkm-app-back" onClick={() => dispatch({ type: 'CLOSE_APP' })}>‹</button>
        <span className="nkm-app-title">{def.icon} {def.title}</span>
      </div>
      <div className="nkm-app-body">
        <AppBody appId={activeApp} />
      </div>
    </div>
  )
}
