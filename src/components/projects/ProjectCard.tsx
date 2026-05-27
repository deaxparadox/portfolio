import type { ProjectItem } from '@/data/types'

const GRADIENTS = [
  'linear-gradient(135deg, rgba(245,197,24,0.13) 0%, rgba(232,144,10,0.07) 50%, rgba(6,5,0,0.3) 100%)',
  'linear-gradient(135deg, rgba(196,154,0,0.11) 0%, rgba(245,197,24,0.08) 50%, rgba(6,5,0,0.3) 100%)',
  'linear-gradient(135deg, rgba(232,144,10,0.13) 0%, rgba(255,216,77,0.07) 50%, rgba(6,5,0,0.3) 100%)',
]

const BADGE_POSITIONS = [
  { top: '22%', left: '10%', delay: '0s' },
  { top: '48%', left: '7%',  delay: '0.6s' },
  { top: '70%', left: '18%', delay: '1.2s' },
]

export default function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const num = String(index + 1).padStart(2, '0')
  const gradient = GRADIENTS[index % GRADIENTS.length]
  const floatingBadges = project.tags.slice(0, 3)
  const impact = project.visual.stats[0]

  return (
    <div className="project-card">
      {/* Left panel */}
      <div className="pc-left">
        <div>
          <div className="pc-top-row">
            <div className="pc-meta">
              <div className="pc-eyebrow">{num} · {project.year}</div>
              <div className="pc-title">{project.name}</div>
            </div>
            <div className="pc-ghost" aria-hidden="true">{num}</div>
          </div>
          <p className="pc-desc">{project.description}</p>
        </div>
        <div className="pc-bottom-row">
          <div className="pc-tags">
            {project.tags.map(tag => (
              <span key={tag} className="pc-tag">{tag}</span>
            ))}
          </div>
          {project.links[0] && (
            <a
              href={project.links[0].href}
              className="pc-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.links[0].label}
            </a>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="pc-right">
        <div className="pc-visual" style={{ background: gradient }}>
          <div className="pc-glyph">{project.visual.glyph}</div>
          <div className="pc-badge-container">
            {floatingBadges.map((badge, i) => (
              <span
                key={badge}
                className="pc-badge"
                style={{
                  top: BADGE_POSITIONS[i].top,
                  left: BADGE_POSITIONS[i].left,
                  animationDelay: BADGE_POSITIONS[i].delay,
                }}
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="pc-impact">
            <span className="pc-impact-value">{impact.value}</span>
            <span className="pc-impact-label">{impact.label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
