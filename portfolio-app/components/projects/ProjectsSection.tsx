import ProjectCard from './ProjectCard'
import type { ProjectItem } from '@/data/types'

export default function ProjectsSection({ projects }: { projects: ProjectItem[] }) {
  return (
    <section id="projects" style={{ padding: '100px 60px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-label reveal">Work</div>
        <h2 className="reveal" style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '60px',
        }}>
          Selected Projects
        </h2>
        <ul
          className="stack-cards"
          style={{ ['--numcards' as string]: projects.length }}
        >
          {projects.map((project, i) => (
            <li key={project.name} className="stack-item">
              <ProjectCard project={project} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
