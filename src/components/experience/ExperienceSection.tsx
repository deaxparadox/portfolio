import ExpCard from './ExpCard'
import type { ExperienceItem } from '@/data/types'

export default function ExperienceSection({ experience }: { experience: ExperienceItem[] }) {
  return (
    <section id="experience" style={{ padding: '100px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-label reveal">Journey</div>
        <h2 className="reveal" style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '60px',
        }}>
          Experience
        </h2>
        <ul
          className="exp-stack"
          style={{ ['--exp-count' as string]: experience.length }}
        >
          {experience.map((exp, i) => (
            <ExpCard key={exp.company} exp={exp} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
