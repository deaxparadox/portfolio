import Tag from '@/components/ui/Tag'
import type { SkillItem } from '@/data/types'

export default function SkillCard({ skill }: { skill: SkillItem }) {
  return (
    <div className="skill-card reveal">
      <span style={{ fontSize: '1.8rem', marginBottom: '16px', display: 'block' }}>
        {skill.icon}
      </span>
      <div style={{
        fontFamily: 'var(--font-dm-serif), serif',
        fontSize: '1.2rem', marginBottom: '12px',
      }}>
        {skill.name}
      </div>
      <p style={{
        fontSize: '0.85rem', color: 'var(--text-secondary)',
        lineHeight: 1.6, marginBottom: '20px',
      }}>
        {skill.description}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {skill.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
      </div>
    </div>
  )
}
