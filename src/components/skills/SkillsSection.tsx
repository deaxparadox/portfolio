import SkillCard from './SkillCard'
import type { SkillItem } from '@/data/types'

export default function SkillsSection({ skills }: { skills: SkillItem[] }) {
  return (
    <section id="skills" style={{ padding: '100px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-label reveal">Capabilities</div>
        <h2 className="reveal" style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '60px',
        }}>
          What I Build
        </h2>
        <div className="skills-grid" style={{ display: 'grid', gap: '20px' }}>
          {skills.map(skill => <SkillCard key={skill.name} skill={skill} />)}
        </div>
      </div>
    </section>
  )
}
