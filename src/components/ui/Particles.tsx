'use client'
import { useEffect, useRef } from 'react'

export default function Particles() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      const size = Math.random() * 3 + 1
      p.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${Math.random() * 100}%`,
        `bottom:-10px`,
        `animation-duration:${Math.random() * 22 + 16}s`,
        `animation-delay:${Math.random() * 22}s`,
      ].join(';')
      container.appendChild(p)
    }

    return () => { container.innerHTML = '' }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}
    />
  )
}
