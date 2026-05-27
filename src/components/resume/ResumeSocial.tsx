// src/components/resume/ResumeSocial.tsx
import type { ThemeTokens } from './types'
import type { SocialLink } from '@/data/types'
import ResumeLink from './ResumeLink'
import ResumeSectionTitle from './ResumeSectionTitle'

const mono = "'DM Mono', monospace"

interface Props { T: ThemeTokens; socials: SocialLink[]; email: string }

export default function ResumeSocial({ T, socials, email }: Props) {
  const allLinks = [
    ...socials,
    { label: 'Email', icon: '', href: `mailto:${email}` },
  ]
  return (
    <section>
      <ResumeSectionTitle T={T}>Presence on the internet</ResumeSectionTitle>
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
