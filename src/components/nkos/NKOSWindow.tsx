'use client'
import { WinState } from './types'

interface Props {
  win: WinState
  children: React.ReactNode
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onToggleMax: () => void
  onDragStart: (startX: number, startY: number) => void
  onResizeStart: (startX: number, startY: number) => void
}

export function NKOSWindow({
  win, children, onFocus, onClose, onMinimize, onToggleMax,
  onDragStart, onResizeStart,
}: Props) {
  const style: React.CSSProperties = win.maximized
    ? { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: win.zIndex, display: win.minimized ? 'none' : 'flex' }
    : { position: 'absolute', left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.zIndex, display: win.minimized ? 'none' : 'flex' }

  return (
    <div
      className={`nk-win ${win.focused ? 'focused' : ''} ${win.maximized ? 'maximized' : ''}`}
      style={style}
      onMouseDown={onFocus}
    >
      <div
        className="nk-win-tb"
        onMouseDown={e => {
          if ((e.target as HTMLElement).closest('.nk-win-ctrls')) return
          if (win.maximized) return
          onDragStart(e.clientX, e.clientY)
          e.preventDefault()
        }}
        onDoubleClick={onToggleMax}
      >
        <span className="nk-win-ico">{win.icon}</span>
        <span className="nk-win-lbl">{win.title}</span>
        <div className="nk-win-ctrls">
          <button className="nk-wbtn close"    onClick={e => { e.stopPropagation(); onClose() }}     title="Close">✕</button>
          <button className="nk-wbtn minimize" onClick={e => { e.stopPropagation(); onMinimize() }}  title="Minimize">─</button>
          <button className="nk-wbtn maximize" onClick={e => { e.stopPropagation(); onToggleMax() }} title="Maximize">□</button>
        </div>
      </div>
      <div className="nk-win-body">
        {children}
      </div>
      {!win.maximized && (
        <div
          className="nk-win-resize"
          onMouseDown={e => { onResizeStart(e.clientX, e.clientY); e.preventDefault(); e.stopPropagation() }}
        />
      )}
    </div>
  )
}
