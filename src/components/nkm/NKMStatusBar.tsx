'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  panelOpen: boolean
  onSwipeDown: () => void
}

export function NKMStatusBar({ panelOpen, onSwipeDown }: Props) {
  const [time, setTime] = useState('')
  const touchStartY = useRef(0)

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setTime(`${n.getHours().toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')}`)
    }
    tick(); const id = setInterval(tick, 20000); return () => clearInterval(id)
  }, [])

  return (
    <div
      className={`nkm-statusbar ${panelOpen ? 'panel-open' : ''}`}
      onClick={onSwipeDown}
      onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        if (e.changedTouches[0].clientY - touchStartY.current > 30) onSwipeDown()
      }}
    >
      <span className="nkm-sb-time">{time}</span>
      <div className="nkm-sb-icons">
        <span className="nkm-sb-ico">▲</span>
        <span className="nkm-sb-ico">📶</span>
        <span className="nkm-sb-bat">●●●●</span>
      </div>
    </div>
  )
}
