export type AppId = 'terminal' | 'about' | 'projects' | 'skills' | 'contact' | 'deax'
export type Screen = 'boot' | 'desktop' | 'shutdown' | 'poweroff'

export interface WinState {
  id: string
  appId: AppId
  title: string
  icon: string
  x: number
  y: number
  w: number
  h: number
  minimized: boolean
  maximized: boolean
  focused: boolean
  zIndex: number
  restoreRect?: { x: number; y: number; w: number; h: number }
}

export interface OSState {
  screen: Screen
  windows: WinState[]
  launcherOpen: boolean
  wallpaperIdx: number
  ctxMenu: { x: number; y: number } | null
  notifs: { id: string; title: string; body: string; icon: string }[]
}

export type OSAction =
  | { type: 'BOOT_DONE' }
  | { type: 'OPEN_APP'; appId: AppId }
  | { type: 'CLOSE_WIN'; id: string }
  | { type: 'FOCUS_WIN'; id: string }
  | { type: 'MINIMIZE_WIN'; id: string }
  | { type: 'RESTORE_WIN'; id: string }
  | { type: 'TOGGLE_MAX'; id: string }
  | { type: 'MOVE_WIN'; id: string; x: number; y: number }
  | { type: 'RESIZE_WIN'; id: string; w: number; h: number }
  | { type: 'TOGGLE_LAUNCHER' }
  | { type: 'CLOSE_LAUNCHER' }
  | { type: 'CYCLE_WALLPAPER' }
  | { type: 'SHOW_CTX'; x: number; y: number }
  | { type: 'HIDE_CTX' }
  | { type: 'SHUTDOWN' }
  | { type: 'POWEROFF' }
  | { type: 'NOTIFY'; title: string; body: string; icon?: string }
  | { type: 'DISMISS_NOTIF'; id: string }

export const APP_DEFS: Record<AppId, { title: string; icon: string; w: number; h: number; cat: string }> = {
  terminal: { title: 'Terminal',  icon: '🖥️', w: 600, h: 400, cat: 'system' },
  about:    { title: 'About Me',  icon: '👤', w: 440, h: 460, cat: 'portfolio' },
  projects: { title: 'Projects',  icon: '📁', w: 740, h: 490, cat: 'portfolio' },
  skills:   { title: 'Skills',    icon: '⚡', w: 680, h: 480, cat: 'portfolio' },
  contact:  { title: 'Contact',   icon: '📬', w: 420, h: 340, cat: 'portfolio' },
  deax:     { title: 'Deax AI',   icon: '🤖', w: 360, h: 480, cat: 'portfolio' },
}

export function osReducer(state: OSState, action: OSAction): OSState {
  switch (action.type) {
    case 'BOOT_DONE':
      return { ...state, screen: 'desktop' }

    case 'OPEN_APP': {
      const def = APP_DEFS[action.appId]
      const existing = state.windows.find(w => w.appId === action.appId && !w.minimized)
      if (existing) return osReducer(state, { type: 'FOCUS_WIN', id: existing.id })
      const minimized = state.windows.find(w => w.appId === action.appId && w.minimized)
      if (minimized) return osReducer(state, { type: 'RESTORE_WIN', id: minimized.id })
      const openCount = state.windows.length % 8
      const off = openCount * 28
      const W = typeof window !== 'undefined' ? window.innerWidth : 1280
      const H = typeof window !== 'undefined' ? window.innerHeight - 46 : 720
      const maxZ = state.windows.reduce((m, w) => Math.max(m, w.zIndex), 200)
      const newWin: WinState = {
        id: `w${Date.now()}`,
        appId: action.appId,
        title: def.title,
        icon: def.icon,
        x: Math.max(10, (W - def.w) / 2 + off),
        y: Math.max(10, (H - def.h) / 2 + off - 30),
        w: def.w, h: def.h,
        minimized: false, maximized: false, focused: true,
        zIndex: maxZ + 1,
      }
      const unfocused = state.windows.map(w => ({ ...w, focused: false }))
      return { ...state, windows: [...unfocused, newWin], launcherOpen: false }
    }

    case 'CLOSE_WIN':
      return { ...state, windows: state.windows.filter(w => w.id !== action.id) }

    case 'FOCUS_WIN': {
      const maxZ = state.windows.reduce((m, w) => Math.max(m, w.zIndex), 200)
      return {
        ...state,
        windows: state.windows.map(w => ({
          ...w,
          focused: w.id === action.id,
          zIndex: w.id === action.id ? maxZ + 1 : w.zIndex,
          minimized: w.id === action.id ? false : w.minimized,
        })),
      }
    }

    case 'MINIMIZE_WIN':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, minimized: true, focused: false } : w
        ),
      }

    case 'RESTORE_WIN':
      return osReducer(state, { type: 'FOCUS_WIN', id: action.id })

    case 'TOGGLE_MAX': {
      const win = state.windows.find(w => w.id === action.id)
      if (!win) return state
      if (win.maximized) {
        const r = win.restoreRect ?? { x: win.x, y: win.y, w: win.w, h: win.h }
        return {
          ...state,
          windows: state.windows.map(w =>
            w.id === action.id
              ? { ...w, maximized: false, x: r.x, y: r.y, w: r.w, h: r.h }
              : w
          ),
        }
      }
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id
            ? { ...w, maximized: true, restoreRect: { x: w.x, y: w.y, w: w.w, h: w.h } }
            : w
        ),
      }
    }

    case 'MOVE_WIN':
      return { ...state, windows: state.windows.map(w => w.id === action.id ? { ...w, x: action.x, y: action.y } : w) }

    case 'RESIZE_WIN':
      return { ...state, windows: state.windows.map(w => w.id === action.id ? { ...w, w: action.w, h: action.h } : w) }

    case 'TOGGLE_LAUNCHER':
      return { ...state, launcherOpen: !state.launcherOpen, ctxMenu: null }

    case 'CLOSE_LAUNCHER':
      return { ...state, launcherOpen: false }

    case 'CYCLE_WALLPAPER':
      return { ...state, wallpaperIdx: (state.wallpaperIdx + 1) % 4 }

    case 'SHOW_CTX':
      return { ...state, ctxMenu: { x: action.x, y: action.y }, launcherOpen: false }

    case 'HIDE_CTX':
      return { ...state, ctxMenu: null }

    case 'SHUTDOWN':
      return { ...state, screen: 'shutdown', windows: [] }

    case 'POWEROFF':
      return { ...state, screen: 'poweroff' }

    case 'NOTIFY': {
      const id = `n${Date.now()}`
      return { ...state, notifs: [...state.notifs, { id, title: action.title, body: action.body, icon: action.icon ?? '' }] }
    }

    case 'DISMISS_NOTIF':
      return { ...state, notifs: state.notifs.filter(n => n.id !== action.id) }

    default:
      return state
  }
}

export const INITIAL_OS_STATE: OSState = {
  screen: 'boot',
  windows: [],
  launcherOpen: false,
  wallpaperIdx: 0,
  ctxMenu: null,
  notifs: [],
}
