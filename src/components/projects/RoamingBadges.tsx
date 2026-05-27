'use client'
import { useState, useEffect, useRef } from 'react'

interface Position { x: number; y: number }

const INITIAL: Position[] = [
  { x: 0.10, y: 0.20 },
  { x: 0.08, y: 0.48 },
  { x: 0.20, y: 0.72 },
]

export default function RoamingBadges({ badges }: { badges: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Position[]>(INITIAL)

  const randomPos = (): Position => ({
    x: 0.05 + Math.random() * 0.60,
    y: 0.10 + Math.random() * 0.65,
  })

  useEffect(() => {
    const update = () => {
      setPositions(badges.map(() => randomPos()))
    }

    const id = setInterval(update, 3000)
    return () => clearInterval(id)
  }, [badges])

  const { width = 380, height = 240 } =
    containerRef.current?.getBoundingClientRect() ?? {}

  return (
    <div ref={containerRef} className="pc-badge-container">
      {badges.map((badge, i) => {
        const pos = positions[i] ?? INITIAL[i]
        return (
          <span
            key={badge}
            className="pc-badge"
            style={{ transform: `translate(${pos.x * width}px, ${pos.y * height}px)` }}
          >
            {badge}
          </span>
        )
      })}
    </div>
  )
}
