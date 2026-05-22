'use client'
import { useRef, useEffect } from 'react'
import type { ExperienceItem } from '@/data/types'

export default function ExpCard({ exp, index }: { exp: ExperienceItem; index: number }) {
  const stickyRef = useRef<HTMLLIElement>(null)
  const cardRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card   = cardRef.current
    const sticky = stickyRef.current
    if (!card || !sticky) return

    const update = () => {
      const vh       = window.innerHeight
      const rect     = sticky.getBoundingClientRect()
      const trigIn   = vh * 0.82
      const trigFull = vh * 0.30
      let tx: number

      if (rect.top > trigIn)        tx = 105
      else if (rect.top < trigFull) tx = 0
      else tx = 105 * (1 - (trigIn - rect.top) / (trigIn - trigFull))

      card.style.transform = `translateX(${tx}%)`
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const num = String(index + 1).padStart(2, '0')
  const periodLines = exp.period.split('\n')

  return (
    <li ref={stickyRef} className="exp-sticky">
      <div className="exp-clip">
        <div ref={cardRef} className="exp-card">
          <div style={{
            padding: '36px 32px',
            borderRight: '1px solid rgba(232,200,74,0.08)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', background: 'rgba(232,200,74,0.02)',
          }}>
            <div style={{
              position: 'absolute', right: '-1px', top: '20%', bottom: '20%',
              width: '1px',
              background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)',
            }} />
            <div style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '0.65rem', color: 'var(--accent)',
              letterSpacing: '0.14em', textTransform: 'uppercase', lineHeight: 1.6,
            }}>
              {periodLines.map((line, i) => (
                <span key={i}>{line}{i < periodLines.length - 1 && <br />}</span>
              ))}
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-serif), serif',
              fontSize: '4.5rem', color: 'rgba(232,200,74,0.06)',
              lineHeight: 1, letterSpacing: '-0.04em',
              alignSelf: 'flex-end', userSelect: 'none',
            }}>
              {num}
            </div>
          </div>

          <div style={{
            padding: '36px 40px', display: 'flex',
            flexDirection: 'column', justifyContent: 'center', gap: '6px',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-serif), serif',
              fontSize: '1.7rem', lineHeight: 1.1, letterSpacing: '-0.02em',
            }}>
              {exp.role}
            </div>
            <div style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '0.72rem', color: 'var(--accent)',
              letterSpacing: '0.1em', marginBottom: '10px',
            }}>
              {exp.company} · {exp.location}
            </div>
            <p style={{
              fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              {exp.description}
            </p>
          </div>
        </div>
      </div>
    </li>
  )
}
