// src/components/resume/ResumeProjects.tsx
import type { ThemeTokens } from './types'
import type { ProjectItem } from '@/data/types'
import ResumeLink from './ResumeLink'

const mono = "'DM Mono', monospace"
const dirt = "'Rubik Dirt', sans-serif"
const sans = "'Syne', sans-serif"

interface Props { T: ThemeTokens; projects: ProjectItem[] }

export default function ResumeProjects({ T, projects }: Props) {
  return (
    <section id="projects">
      <SectionTitle T={T}>Things I&apos;ve built</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {projects.map((p, i) => (
          <div key={p.name} style={{
            paddingTop: i === 0 ? 0 : 28,
            paddingBottom: 28,
            borderBottom: i < projects.length - 1 ? `1px solid ${T.border}` : 'none',
            transition: 'border-color .35s',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: T.dimLo, letterSpacing: '0.10em', minWidth: 22 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 style={{ fontFamily: dirt, fontSize: 20, color: T.txt, letterSpacing: '-0.3px', lineHeight: 1, transition: 'color .35s' }}>
                {p.name}
              </h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
                {p.links.map(link => (
                  <ResumeLink key={link.label} href={link.href} style={{ fontSize: 11, letterSpacing: '0.06em' }} T={T}>
                    {link.label}
                  </ResumeLink>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, color: T.dim, lineHeight: 1.80, paddingLeft: 36, maxWidth: 560, fontFamily: sans, transition: 'color .35s' }}>
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ children, T }: { children: string; T: ThemeTokens }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.55 }}>~</span><span>{children}</span><span style={{ opacity: 0.55 }}>~</span>
    </div>
  )
}
