// src/components/resume/ResumeNav.tsx
'use client'
import { useTheme } from './ThemeContext'
import type { ThemeTokens } from './types'

const mono = "'DM Mono', monospace"
const dirt = "'Rubik Dirt', sans-serif"

const NAV_LINKS = ['projects', 'skills', 'experience', 'contact'] as const

interface Props { T: ThemeTokens }

export default function ResumeNav({ T }: Props) {
  const { theme, toggleTheme } = useTheme()
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: T.nav,
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      borderBottom: `1px solid ${T.border}`,
      padding: '13px 0',
      transition: 'background .35s, border-color .35s',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: dirt, fontSize: 17, color: T.gold, letterSpacing: '-0.5px', lineHeight: 1, paddingRight: "20px" }}>NK</span>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {NAV_LINKS.map(id => (
            <a key={id} href={`#${id}`} style={{
              fontFamily: mono, fontSize: 11, letterSpacing: '0.08em',
              color: T.dim, textDecoration: 'none', transition: 'color .18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = T.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = T.dim)}
            >{id}</a>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: mono, fontSize: 10, letterSpacing: '0.10em',
              color: T.gold, background: 'transparent',
              border: `1px solid ${T.border}`,
              borderRadius: 4, padding: '5px 12px',
              cursor: 'pointer', transition: 'all .22s', lineHeight: 1,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = T.bgTerm }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <span style={{ fontSize: 13 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </nav>
  )
}
