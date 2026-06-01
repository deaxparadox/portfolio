'use client'
import { useEffect } from 'react'

interface Props { onDone: () => void }

export function NKMBoot({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 3600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="nkm-scr on nkm-boot" onClick={onDone}>
      <div className="nkm-boot-wrap">
        <div className="nkm-boot-logo">
          <div className="nkm-boot-aura" />
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="nkmBcg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffd84d"/>
                <stop offset="100%" stopColor="#c49a00"/>
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#f5c518" strokeWidth="1.2" opacity=".2"/>
            <ellipse cx="50" cy="50" rx="43" ry="19" fill="none" stroke="#f5c518" strokeWidth="1" opacity=".28" transform="rotate(-30 50 50)"/>
            <ellipse cx="50" cy="50" rx="43" ry="19" fill="none" stroke="#f5c518" strokeWidth="1" opacity=".28" transform="rotate(30 50 50)"/>
            <circle cx="50" cy="50" r="21" fill="none" stroke="#f5c518" strokeWidth="2.5"/>
            <line x1="50" y1="5"  x2="50" y2="29" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
            <line x1="50" y1="71" x2="50" y2="95" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
            <line x1="5"  y1="50" x2="29" y2="50" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
            <line x1="71" y1="50" x2="95" y2="50" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="50" cy="50" r="11" fill="url(#nkmBcg)"/>
            <circle cx="50" cy="50" r="4.5" fill="#fff" opacity=".9"/>
            <circle cx="50" cy="29" r="3" fill="#f5c518"/>
            <circle cx="50" cy="71" r="3" fill="#f5c518"/>
            <circle cx="29" cy="50" r="3" fill="#f5c518"/>
            <circle cx="71" cy="50" r="3" fill="#f5c518"/>
          </svg>
        </div>
        <div>
          <div className="nkm-boot-name">NK-M</div>
          <div className="nkm-boot-sub">Mobile · v1.0.0</div>
        </div>
        <div className="nkm-boot-bar"><div className="nkm-boot-prog" /></div>
      </div>
    </div>
  )
}
