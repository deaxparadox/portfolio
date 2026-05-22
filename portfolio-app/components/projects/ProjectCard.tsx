import Tag from '@/components/ui/Tag'
import type { ProjectItem } from '@/data/types'

export default function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <div className="project-card">
      <div style={{
        position: 'absolute', top: '24px', right: '32px',
        fontFamily: 'var(--font-dm-serif), serif',
        fontSize: '6rem', color: 'rgba(232,200,74,0.04)',
        lineHeight: 1, userSelect: 'none',
      }}>
        {num}
      </div>

      <div>
        <div style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '0.65rem', color: 'var(--accent)',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ display: 'inline-block', width: '24px', height: '1px', background: 'var(--accent)' }} />
          {project.year}
        </div>

        <div style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: '2.4rem', lineHeight: 1.05,
          letterSpacing: '-0.02em', marginBottom: '16px',
        }}>
          {project.name}
        </div>

        <p style={{
          fontSize: '0.9rem', color: 'var(--text-secondary)',
          lineHeight: 1.75, marginBottom: '28px',
        }}>
          {project.description}
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {project.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
          {project.links.map(link => (
            <a key={link.label} href={link.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '0.68rem', color: 'var(--accent)', textDecoration: 'none',
              letterSpacing: '0.06em', border: '1px solid rgba(232,200,74,0.3)',
              padding: '7px 16px', borderRadius: '3px', transition: 'all 0.3s ease',
            }}>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="project-visual" style={{
        background: 'rgba(232,200,74,0.03)',
        border: '1px solid rgba(232,200,74,0.09)',
        borderRadius: '10px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '24px', gap: '20px', alignSelf: 'stretch',
      }}>
        <div style={{ fontSize: '3rem', lineHeight: 1 }}>{project.visual.glyph}</div>
        <div>
          {project.visual.stats.map((stat, i) => (
            <div key={i} style={i > 0 ? { marginTop: '16px' } : {}}>
              <span style={{
                fontFamily: 'var(--font-dm-serif), serif',
                fontSize: '2.4rem', color: 'var(--accent)', lineHeight: 1, display: 'block',
              }}>
                {stat.value}
              </span>
              <span style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                fontSize: '0.6rem', color: 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginTop: '4px',
              }}>
                {stat.label}
              </span>
              <div style={{
                height: '2px', background: 'rgba(232,200,74,0.1)',
                borderRadius: '2px', overflow: 'hidden', marginTop: '6px',
              }}>
                <div style={{
                  height: '100%', width: `${stat.fill}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                  borderRadius: '2px',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
