import type { StatItem } from '@/data/types'

export default function StatsStrip({ stats }: { stats: StatItem[] }) {
  return (
    <div style={{
      borderTop: '1px solid rgba(232,200,74,0.08)',
      borderBottom: '1px solid rgba(232,200,74,0.08)',
      padding: '40px 60px', display: 'flex', justifyContent: 'center',
    }}>
      {stats.map((stat, i) => (
        <div key={i} style={{
          flex: 1, textAlign: 'center', padding: '0 40px', maxWidth: '220px',
          borderRight: i < stats.length - 1 ? '1px solid rgba(232,200,74,0.08)' : 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-dm-serif), serif',
            fontSize: '3rem', color: 'var(--accent)', lineHeight: 1, display: 'block',
          }}>
            {stat.value}
          </span>
          <span style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '0.68rem', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            marginTop: '8px', display: 'block',
          }}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}
