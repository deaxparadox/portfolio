// src/components/resume/ResumeSocial.tsx
import type { ThemeTokens } from './types'
import type { SocialLink } from '@/data/types'
import ResumeLink from './ResumeLink'

const mono = "'DM Mono', monospace"

interface Props { T: ThemeTokens; socials: SocialLink[]; email: string }

export default function ResumeSocial({ T, socials, email }: Props) {
  const allLinks = [
    ...socials,
    { label: 'Email', icon: '', href: `mailto:${email}` },
  ]
  return (
    <section>
      <SectionTitle T={T}>Presence on the internet</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 0' }}>
        {allLinks.map((s, i) => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
            <ResumeLink href={s.href} style={{ fontSize: 13 }} T={T}>{s.label}</ResumeLink>
            {i < allLinks.length - 1 && (
              <span style={{ fontFamily: mono, color: T.border, margin: '0 14px', fontSize: 11 }}>·</span>
            )}
          </span>
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ children, T }: { children: string; T: ThemeTokens }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.55 }}>~</span>
      <span>{children}</span>
      <span style={{ opacity: 0.55 }}>~</span>
    </div>
  )
}
