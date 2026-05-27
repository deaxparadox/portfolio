// src/components/resume/ResumeSkills.tsx
import type { ThemeTokens } from './types'
import type { SkillItem } from '@/data/types'
import ResumeSectionTitle from './ResumeSectionTitle'

const mono = "'DM Mono', monospace"

interface Props { T: ThemeTokens; skills: SkillItem[] }

export default function ResumeSkills({ T, skills }: Props) {
  const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <section id="skills">
      <ResumeSectionTitle T={T}>Stack I use</ResumeSectionTitle>
      <div style={{
        fontFamily: mono,
        background: T.bgTerm,
        border: `1px solid ${T.border}`,
        borderRadius: 8, padding: '22px 26px',
        transition: 'background .35s, border-color .35s',
      }}>
        <div style={{ fontSize: 12, color: T.gold, marginBottom: 18, letterSpacing: '0.06em', opacity: 0.75 }}>
          ~/nitish/skills
        </div>
        {skills.map(skill => (
          <div key={skill.name} style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap' }}>
            <span style={{ color: T.gold, fontSize: 12, opacity: 0.65 }}>$&nbsp;</span>
            <span style={{ color: T.gold, fontSize: 12 }}>ls&nbsp;</span>
            <span style={{ color: T.dim, fontSize: 12 }}>{slug(skill.name)}/</span>
            <div style={{ width: '100%', height: 6 }} />
            <div style={{ paddingLeft: 20, display: 'flex', flexWrap: 'wrap', gap: '5px 18px' }}>
              {skill.tags.map(tag => (
                <span key={tag} style={{ fontSize: 13, fontWeight: 500, color: T.txt, letterSpacing: '0.01em', transition: 'color .35s' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ color: T.gold, fontSize: 12, opacity: 0.65 }}>$</span>
          <span style={{
            display: 'inline-block', width: 7, height: 14,
            background: T.gold, marginLeft: 4,
            animation: 'rp-blink 1s step-end infinite',
            verticalAlign: 'middle',
          }} />
        </div>
      </div>
    </section>
  )
}

