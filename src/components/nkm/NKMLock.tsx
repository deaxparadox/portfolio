'use client'
import { useState, useEffect, useRef } from 'react'

interface Props { onUnlock: () => void }

export function NKMLock({ onUnlock }: Props) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const touchStartY = useRef(0)

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      const h = n.getHours().toString().padStart(2,'0')
      const m = n.getMinutes().toString().padStart(2,'0')
      setTime(`${h}:${m}`)
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
      setDate(`${days[n.getDay()]}, ${months[n.getMonth()]} ${n.getDate()}`)
    }
    tick(); const id = setInterval(tick, 20000); return () => clearInterval(id)
  }, [])

  return (
    <div
      className="nkm-scr on nkm-lock"
      onClick={onUnlock}
      onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        const dy = touchStartY.current - e.changedTouches[0].clientY
        if (dy > 60) onUnlock()
      }}
    >
      <div className="nkm-lock-top">
        <div className="nkm-lock-clock">{time}</div>
        <div className="nkm-lock-date">{date}</div>
      </div>
      <div className="nkm-lock-notifs">
        <div className="nkm-lock-notif">
          <div className="nkm-ln-ico">📌</div>
          <div>
            <div className="nkm-ln-t">Available for work</div>
            <div className="nkm-ln-b">Gurugram, India · Open to Remote</div>
          </div>
        </div>
        <div className="nkm-lock-notif">
          <div className="nkm-ln-ico">⚡</div>
          <div>
            <div className="nkm-ln-t">7 products shipped</div>
            <div className="nkm-ln-b">3 cloud platforms · Python / AI / Voice</div>
          </div>
        </div>
      </div>
      <div className="nkm-lock-bottom">
        <div className="nkm-lock-arrow">↑</div>
        <div className="nkm-lock-swipe">Swipe up to unlock</div>
      </div>
    </div>
  )
}
