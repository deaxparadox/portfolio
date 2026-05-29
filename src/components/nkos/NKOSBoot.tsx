'use client'
import { useEffect } from 'react'

interface Props {
  onDone: () => void
}

export function NKOSBoot({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 3400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="nk-screen active nk-boot" onClick={onDone}>
      <div className="nk-boot-inner">
        <div className="nk-boot-logo">
          <div className="nk-boot-glow" />
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="nkcg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffd84d"/>
                <stop offset="100%" stopColor="#c49a00"/>
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="none" stroke="#f5c518" strokeWidth="1.5" opacity=".25"/>
            <ellipse cx="50" cy="50" rx="44" ry="20" fill="none" stroke="#f5c518" strokeWidth="1.2" opacity=".3" transform="rotate(-30 50 50)"/>
            <ellipse cx="50" cy="50" rx="44" ry="20" fill="none" stroke="#f5c518" strokeWidth="1.2" opacity=".3" transform="rotate(30 50 50)"/>
            <circle cx="50" cy="50" r="22" fill="none" stroke="#f5c518" strokeWidth="2.5"/>
            <line x1="50" y1="4"  x2="50" y2="28" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
            <line x1="50" y1="72" x2="50" y2="96" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
            <line x1="4"  y1="50" x2="28" y2="50" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
            <line x1="72" y1="50" x2="96" y2="50" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="50" cy="50" r="12" fill="url(#nkcg)" opacity=".9"/>
            <circle cx="50" cy="50" r="5"  fill="#fff" opacity=".85"/>
            <circle cx="50" cy="28" r="3" fill="#f5c518"/>
            <circle cx="50" cy="72" r="3" fill="#f5c518"/>
            <circle cx="28" cy="50" r="3" fill="#f5c518"/>
            <circle cx="72" cy="50" r="3" fill="#f5c518"/>
          </svg>
        </div>
        <div>
          <div className="nk-boot-title">NK-OS</div>
          <div className="nk-boot-sub">Plasma · v1.0.0</div>
        </div>
        <div className="nk-boot-dots">
          {[0,1,2,3,4].map(i => <div key={i} className="nk-boot-dot" />)}
        </div>
      </div>
    </div>
  )
}
