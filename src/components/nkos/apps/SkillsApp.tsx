'use client'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'
import SkillsFinder from '@/components/skills/SkillsFinder'

const data = portfolioData as PortfolioData

export function SkillsApp() {
  return (
    <div className="nk-skills">
      <SkillsFinder skills={data.skills} />
    </div>
  )
}
