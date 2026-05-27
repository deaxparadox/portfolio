import Nav               from '@/components/nav/Nav'
import Hero              from '@/components/hero/Hero'
import Ribbon            from '@/components/ribbon/Ribbon'
import SectionDivider    from '@/components/ui/SectionDivider'
import StatsStrip        from '@/components/stats/StatsStrip'
import SkillsFinder      from '@/components/skills/SkillsFinder'
import ProjectsSection   from '@/components/projects/ProjectsSection'
import GlimpseSection    from '@/components/glimpse/GlimpseSection'
import ExperienceSection from '@/components/experience/ExperienceSection'
import ContactSection    from '@/components/contact/ContactSection'
import Footer            from '@/components/footer/Footer'
import CustomCursor      from '@/components/ui/CustomCursor'
import RevealInit        from '@/components/ui/RevealInit'
import AuroraBackground  from '@/components/ui/AuroraBackground'
import Particles         from '@/components/ui/Particles'
import FramerProvider    from '@/components/ui/FramerProvider'
import { TerminalProvider } from '@/context/TerminalContext'
import TerminalFloating  from '@/components/terminal/TerminalFloating'
import TerminalMaximized from '@/components/terminal/TerminalMaximized'
import type { PortfolioData } from '@/data/types'

interface Props { data: PortfolioData }

export default function FullExperienceShell({ data }: Props) {
  return (
    <FramerProvider>
      <TerminalProvider>
        <CustomCursor />
        <RevealInit />
        <AuroraBackground />
        <Particles />

        {/* Ambient radial gradient */}
        <div
          className="fixed inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 15% 20%, rgba(212,160,23,0.09) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 85% 70%, rgba(232,200,74,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 80% 60% at 50% 50%, rgba(10,9,0,0.95) 0%, transparent 100%)
            `,
          }}
        />
        {/* Fractal noise texture */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Grid lines */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(232,200,74,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(232,200,74,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-[2]">
          <Nav data={data} />
          <main>
            <Hero             data={data} />
            <Ribbon />
            <SectionDivider />
            <StatsStrip       stats={data.stats} />
            <SkillsFinder     skills={data.skills} />
            <SectionDivider />
            <ProjectsSection  projects={data.projects} />
            <SectionDivider />
            <GlimpseSection   glimpse={data.glimpse} />
            <SectionDivider />
            <ExperienceSection experience={data.experience} />
            <SectionDivider />
            <ContactSection   contact={data.contact} />
            <Footer           footer={data.footer} />
          </main>
        </div>

        <TerminalFloating />
        <TerminalMaximized />
      </TerminalProvider>
    </FramerProvider>
  )
}
