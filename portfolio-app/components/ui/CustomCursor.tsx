'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const ring   = ringRef.current
    if (!cursor || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      cursor.style.left = mx + 'px'
      cursor.style.top  = my + 'px'
    }

    const animRing = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      ring.style.left = rx + 'px'
      ring.style.top  = ry + 'px'
      rafId = requestAnimationFrame(animRing)
    }
    rafId = requestAnimationFrame(animRing)
    document.addEventListener('mousemove', onMouseMove)

    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button, .skill-card, .project-card')) {
        cursor.classList.add('hover'); ring.classList.add('hover')
      }
    }
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button, .skill-card, .project-card')) {
        cursor.classList.remove('hover'); ring.classList.remove('hover')
      }
    }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="cursor" />
      <div ref={ringRef}   className="cursor-ring" />
    </>
  )
}
