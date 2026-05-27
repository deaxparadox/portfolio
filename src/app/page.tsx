// src/app/page.tsx
import ResumePortfolio     from '@/components/resume/ResumePortfolio'
import FullExperienceShell from '@/components/full/FullExperienceShell'
import portfolioData       from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  if (mode === 'full') return <FullExperienceShell data={data} />
  return <ResumePortfolio data={data} />
}
