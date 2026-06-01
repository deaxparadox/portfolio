'use client'
import { useEffect, useRef } from 'react'

const THEMES = [
  { colors: ['#050916','#0e1a38','#071228'], acc: [245,197,24] as [number,number,number] },
  { colors: ['#0e0616','#1e0d36','#0a0818'], acc: [200,140,60]  as [number,number,number] },
  { colors: ['#060e14','#0a2030','#040c10'], acc: [245,197,24]  as [number,number,number] },
]

interface Props { wallpaperIdx: number }

export function NKMWallpaper({ wallpaperIdx }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef  = useRef<{ x:number;y:number;r:number;o:number;s:number;to:number }[]>([])
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    const resize = () => {
      c.width = window.innerWidth; c.height = window.innerHeight
      starsRef.current = Array.from({ length: 140 }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 1.2 + 0.2, o: Math.random() * 0.6 + 0.1,
        s: (Math.random() - .5) * .035, to: Math.random() * 0.65 + 0.1,
      }))
    }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      const th = THEMES[wallpaperIdx]; const W = c.width, H = c.height; const [r,g,b] = th.acc
      const grd = ctx.createLinearGradient(0,0,W*.4,H)
      grd.addColorStop(0, th.colors[0]); grd.addColorStop(.5, th.colors[1]); grd.addColorStop(1, th.colors[2])
      ctx.fillStyle = grd; ctx.fillRect(0,0,W,H)
      ;[{x:W*.1,y:H*.3,r:W*.5,o:.04},{x:W*.85,y:H*.6,r:W*.4,o:.035}].forEach(bl => {
        const g2 = ctx.createRadialGradient(bl.x,bl.y,0,bl.x,bl.y,bl.r)
        g2.addColorStop(0, `rgba(${r},${g},${b},${bl.o})`); g2.addColorStop(1, 'transparent')
        ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(bl.x,bl.y,bl.r,0,Math.PI*2); ctx.fill()
      })
      starsRef.current.forEach(s => {
        s.o += s.s; if (s.o<=.05||s.o>=s.to+.3) s.s *= -1
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0,s.o)})`; ctx.fill()
      })
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath()
      ctx.moveTo(0,H); ctx.lineTo(0,H*.75); ctx.lineTo(W*.08,H*.55); ctx.lineTo(W*.18,H*.68)
      ctx.lineTo(W*.28,H*.42); ctx.lineTo(W*.42,H*.6); ctx.lineTo(W*.55,H*.35)
      ctx.lineTo(W*.68,H*.52); ctx.lineTo(W*.78,H*.44); ctx.lineTo(W*.9,H*.62)
      ctx.lineTo(W,H*.7); ctx.lineTo(W,H); ctx.closePath(); ctx.fill()
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafRef.current) }
  }, [wallpaperIdx])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, display: 'block' }} />
}
