// src/components/resume/ResumeExperience.tsx
import type { ThemeTokens } from './types'
import type { ExperienceItem } from '@/data/types'
import ResumeSectionTitle from './ResumeSectionTitle'

const mono = "'DM Mono', monospace"
const sans = "'Syne', sans-serif"

interface Props { T: ThemeTokens; experience: ExperienceItem[] }

export default function ResumeExperience({ T, experience }: Props) {
  return (
    <section id="experience">
      <ResumeSectionTitle T={T}>Work Experience</ResumeSectionTitle>
      {experience.map(ex => (
        <div key={ex.company} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ marginBottom: 5, fontFamily: sans, fontSize: 14, fontWeight: 600, color: T.txt, transition: 'color .35s' }}>
              {ex.company}
            </div>
            <div style={{ fontFamily: mono, fontSize: 12, color: T.dim, letterSpacing: '0.04em', transition: 'color .35s' }}>
              {ex.role}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: T.gold, letterSpacing: '0.06em', marginBottom: 2, transition: 'color .35s' }}>
              {ex.period.replace('\n', ' ')}
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: T.dimLo, letterSpacing: '0.06em', transition: 'color .35s' }}>
              {ex.location}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

