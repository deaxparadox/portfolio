import type { GlimpseHobby } from '@/data/types'

export default function BentoHobbies({ hobbies }: { hobbies: GlimpseHobby[] }) {
  return (
    <div className="bc bc-beyond">
      <div className="bc-label">Beyond the Code</div>
      <div className="bc-title">More than just dev</div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '4px' }}>
        There&apos;s more to me than coding — exploring, learning, and enjoying the journey.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
        {hobbies.map(h => (
          <span key={h.label} className="hpill"><span>{h.icon}</span><span>{h.label}</span></span>
        ))}
      </div>
    </div>
  )
}
