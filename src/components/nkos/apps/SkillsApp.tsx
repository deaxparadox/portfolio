'use client'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'
import SkillsFinder from '@/components/skills/SkillsFinder'
import { ThemeProvider } from '@/components/resume/ThemeContext'

const data = portfolioData as PortfolioData

export function SkillsApp() {
  return (
    <div className="nk-skills">
      <ThemeProvider>
        <SkillsFinder skills={data.skills} />
      </ThemeProvider>
    </div>
  )
}
