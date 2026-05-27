'use client'
import { useState, useEffect } from 'react'

interface Position { top: string; left: string }

function randomPos(): Position {
  const top  = (10 + Math.random() * 65).toFixed(1) + '%'
  const left = (5  + Math.random() * 60).toFixed(1) + '%'
  return { top, left }
}

const INITIAL: Position[] = [
  { top: '20%', left: '10%' },
  { top: '48%', left: '8%'  },
  { top: '72%', left: '20%' },
]

export default function RoamingBadges({ badges }: { badges: string[] }) {
  const [positions, setPositions] = useState<Position[]>(INITIAL)

  useEffect(() => {
    const id = setInterval(() => {
      setPositions(badges.map(() => randomPos()))
    }, 3000)
    return () => clearInterval(id)
  }, [badges])

  return (
    <div className="pc-badge-container">
      {badges.map((badge, i) => (
        <span
          key={badge}
          className="pc-badge"
          style={{ top: positions[i]?.top, left: positions[i]?.left }}
        >
          {badge}
        </span>
      ))}
    </div>
  )
}
