'use client'
import { useEffect, useRef } from 'react'

const WALLPAPERS = [
  { bg: ['#0e0b00','#1a1200','#080500'], accent: [245,197,24] as [number,number,number] },
  { bg: ['#10061a','#241040','#120818'], accent: [148,100,220] as [number,number,number] },
  { bg: ['#061014','#082838','#040c10'], accent: [0,200,180]  as [number,number,number] },
  { bg: ['#100a04','#2a1a06','#180e04'], accent: [230,140,40] as [number,number,number] },
]

interface Props { wallpaperIdx: number }

export function NKOSWallpaper({ wallpaperIdx }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef  = useRef<{ x:number; y:number; r:number; o:number; s:number; to:number }[]>([])
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function resize() {
      canvas!.width  = window.innerWidth
      canvas!.height = window.innerHeight
      starsRef.current = Array.from({ length: 200 }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        r: Math.random() * 1.4 + 0.2,
        o: Math.random() * 0.7 + 0.1,
        s: (Math.random() - 0.5) * 0.04,
        to: Math.random() * 0.7 + 0.1,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      const wp = WALLPAPERS[wallpaperIdx]
      const w = canvas!.width, h = canvas!.height
      const [r,g,b] = wp.accent

      const grd = ctx.createLinearGradient(0,0,w,h)
      grd.addColorStop(0,   wp.bg[0])
      grd.addColorStop(0.5, wp.bg[1])
      grd.addColorStop(1,   wp.bg[2])
      ctx.fillStyle = grd
      ctx.fillRect(0,0,w,h)

      const blobs = [
        {x:w*.18, y:h*.45, r:w*.22, o:.055},
        {x:w*.78, y:h*.2,  r:w*.18, o:.045},
        {x:w*.6,  y:h*.75, r:w*.15, o:.04},
      ]
      blobs.forEach(blob => {
        const g2 = ctx.createRadialGradient(blob.x,blob.y,0,blob.x,blob.y,blob.r)
        g2.addColorStop(0, `rgba(${r},${g},${b},${blob.o})`)
        g2.addColorStop(1, 'transparent')
        ctx.fillStyle = g2
        ctx.beginPath(); ctx.arc(blob.x,blob.y,blob.r,0,Math.PI*2); ctx.fill()
      })

      starsRef.current.forEach(s => {
        s.o += s.s
        if (s.o <= 0.05 || s.o >= s.to + 0.35) s.s *= -1
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0,s.o)})`
        ctx.fill()
      })

      ctx.fillStyle = 'rgba(0,0,0,.18)'
      ctx.beginPath()
      ctx.moveTo(0,h)
      ctx.lineTo(0,h*.72)
      ctx.lineTo(w*.12,h*.48); ctx.lineTo(w*.22,h*.62)
      ctx.lineTo(w*.35,h*.36); ctx.lineTo(w*.48,h*.55)
      ctx.lineTo(w*.6, h*.3);  ctx.lineTo(w*.72,h*.52)
      ctx.lineTo(w*.82,h*.42); ctx.lineTo(w*.92,h*.58)
      ctx.lineTo(w,h*.65); ctx.lineTo(w,h)
      ctx.closePath(); ctx.fill()

      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [wallpaperIdx])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, display: 'block' }}
    />
  )
}
