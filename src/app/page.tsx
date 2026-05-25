import Nav               from '@/components/nav/Nav'
import Hero              from '@/components/hero/Hero'
import Ribbon            from '@/components/ribbon/Ribbon'
import SectionDivider    from '@/components/ui/SectionDivider'
import StatsStrip        from '@/components/stats/StatsStrip'
import SkillsSection     from '@/components/skills/SkillsSection'
import ProjectsSection   from '@/components/projects/ProjectsSection'
import ExperienceSection from '@/components/experience/ExperienceSection'
import ContactSection    from '@/components/contact/ContactSection'
import Footer            from '@/components/footer/Footer'
import portfolioData     from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export default function Home() {
  return (
    <>
      <Nav  data={data} />
      <main>
        <Hero             data={data} />
        <Ribbon />
        <SectionDivider />
        <StatsStrip       stats={data.stats} />
        <SkillsSection    skills={data.skills} />
        <SectionDivider />
        <ProjectsSection  projects={data.projects} />
        <SectionDivider />
        <ExperienceSection experience={data.experience} />
        <SectionDivider />
        <ContactSection   contact={data.contact} />
        <Footer           footer={data.footer} />
      </main>
    </>
  )
}
