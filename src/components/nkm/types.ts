export type AppId = 'terminal' | 'about' | 'projects' | 'skills' | 'contact' | 'deax'
export type Screen = 'boot' | 'lock' | 'home' | 'shutdown' | 'poweroff'

export interface NKMState {
  screen: Screen
  activeApp: AppId | null
  drawerOpen: boolean
  notifPanelOpen: boolean
  powerMenuOpen: boolean
  wallpaperIdx: number
  quickTiles: Record<string, boolean>
}

export type NKMAction =
  | { type: 'BOOT_DONE' }
  | { type: 'UNLOCK' }
  | { type: 'OPEN_APP'; appId: AppId }
  | { type: 'CLOSE_APP' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'OPEN_NOTIF' }
  | { type: 'CLOSE_NOTIF' }
  | { type: 'OPEN_POWER' }
  | { type: 'CLOSE_POWER' }
  | { type: 'SHUTDOWN' }
  | { type: 'REBOOT' }
  | { type: 'POWEROFF' }
  | { type: 'TOGGLE_TILE'; tile: string }
  | { type: 'CYCLE_WALLPAPER' }
  | { type: 'LOCK' }

export const APP_DEFS: Record<AppId, { title: string; icon: string; bg: string }> = {
  terminal: { title: 'Terminal',  icon: '🖥️', bg: 'linear-gradient(135deg,#1a1200,#3d2d00)' },
  about:    { title: 'About Me',  icon: '👤', bg: 'linear-gradient(135deg,#1a1000,#4a2e00)' },
  projects: { title: 'Projects',  icon: '📁', bg: 'linear-gradient(135deg,#1a1a00,#3d3800)' },
  skills:   { title: 'Skills',    icon: '⚡', bg: 'linear-gradient(135deg,#161200,#3a2e00)' },
  contact:  { title: 'Contact',   icon: '📬', bg: 'linear-gradient(135deg,#0d1400,#1f3000)' },
  deax:     { title: 'Deax AI',   icon: '🤖', bg: 'linear-gradient(135deg,#0a0d1a,#1a2040)' },
}

export const INITIAL_STATE: NKMState = {
  screen: 'boot',
  activeApp: null,
  drawerOpen: false,
  notifPanelOpen: false,
  powerMenuOpen: false,
  wallpaperIdx: 0,
  quickTiles: { wifi: true, bt: true, dnd: false, rotate: false, loc: true, torch: false, air: false, dark: true },
}

export function nkmReducer(state: NKMState, action: NKMAction): NKMState {
  switch (action.type) {
    case 'BOOT_DONE':   return { ...state, screen: 'lock' }
    case 'UNLOCK':      return { ...state, screen: 'home' }
    case 'OPEN_APP':    return { ...state, activeApp: action.appId, drawerOpen: false, notifPanelOpen: false }
    case 'CLOSE_APP':   return { ...state, activeApp: null }
    case 'OPEN_DRAWER': return { ...state, drawerOpen: true, notifPanelOpen: false }
    case 'CLOSE_DRAWER':return { ...state, drawerOpen: false }
    case 'OPEN_NOTIF':  return { ...state, notifPanelOpen: true, drawerOpen: false }
    case 'CLOSE_NOTIF': return { ...state, notifPanelOpen: false }
    case 'OPEN_POWER':  return { ...state, powerMenuOpen: true }
    case 'CLOSE_POWER': return { ...state, powerMenuOpen: false }
    case 'SHUTDOWN':    return { ...INITIAL_STATE, screen: 'shutdown' }
    case 'REBOOT':      return { ...INITIAL_STATE, screen: 'shutdown' }
    case 'POWEROFF':    return { ...state, screen: 'poweroff' }
    case 'LOCK':        return { ...state, screen: 'lock', activeApp: null, drawerOpen: false, powerMenuOpen: false }
    case 'TOGGLE_TILE': return { ...state, quickTiles: { ...state.quickTiles, [action.tile]: !state.quickTiles[action.tile] } }
    case 'CYCLE_WALLPAPER': return { ...state, wallpaperIdx: (state.wallpaperIdx + 1) % 3 }
    default: return state
  }
}
