'use client'
import { useEffect, useState } from 'react'
import type { PortfolioData } from '@/data/types'

const NAV_IDS = ['skills', 'projects', 'experience', 'contact'] as const

const NAV_ICONS: Record<typeof NAV_IDS[number], string> = {
  skills:     '⚡',
  projects:   '◈',
  experience: '◉',
  contact:    '⌥',
}

export default function Nav({ data }: { data: Pick<PortfolioData, 'hero'> }) {
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      let current = ''
      document.querySelectorAll<HTMLElement>('section[id]').forEach(s => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id
      })
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [first, last] = data.hero.name.split(' ')

  return (
    <>
      {/* Top nav bar */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '24px 60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(10,9,0,0.6)',
          borderBottom: '1px solid rgba(232,200,74,0.08)',
          animation: 'navIn 1s ease forwards',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: '1.3rem', color: 'var(--accent)', letterSpacing: '0.02em',
        }}>
          {first}.{last}
        </div>

        <ul className="nav-links" style={{ display: 'flex', gap: '40px', listStyle: 'none' }}>
          {NAV_IDS.map(id => (
            <li key={id}>
              <a
                href={`#${id}`}
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: '0.72rem', fontWeight: 400,
                  color: active === id ? 'var(--accent)' : 'var(--text-secondary)',
                  textDecoration: 'none', letterSpacing: '0.1em',
                  textTransform: 'uppercase', transition: 'color 0.3s ease',
                }}
              >
                {id}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '0.72rem', fontWeight: 500,
            color: 'var(--bg-dark)', background: 'var(--accent)',
            padding: '10px 24px', borderRadius: '3px',
            textDecoration: 'none', letterSpacing: '0.08em',
            textTransform: 'uppercase', transition: 'background 0.3s ease',
          }}
        >
          Hire Me
        </a>
      </nav>

      {/* Bottom nav bar — shown on mobile/tablet via CSS (.bottom-nav display:flex at ≤900px) */}
      <nav className="bottom-nav" aria-label="Section navigation">
        {NAV_IDS.map(id => (
          <a
            key={id}
            href={`#${id}`}
            className={`bottom-nav-item${active === id ? ' active' : ''}`}
          >
            <span className="bottom-nav-icon" aria-hidden="true">
              {NAV_ICONS[id]}
            </span>
            <span className="bottom-nav-label">{id}</span>
          </a>
        ))}
      </nav>
    </>
  )
}
