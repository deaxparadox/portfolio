import type { PortfolioData } from '@/data/types'
import rawData from '@/data/portfolio.json'

describe('portfolio.json', () => {
  it('satisfies the PortfolioData type at compile time', () => {
    const data: PortfolioData = rawData as PortfolioData
    expect(data.meta.title).toBeTruthy()
    expect(data.hero.name).toBeTruthy()
    expect(Array.isArray(data.skills)).toBe(true)
    expect(data.skills.length).toBeGreaterThan(0)
    expect(Array.isArray(data.projects)).toBe(true)
    expect(data.projects.length).toBeGreaterThan(0)
    expect(Array.isArray(data.experience)).toBe(true)
    expect(data.contact.email).toBeTruthy()
    expect(data.terminal.commands.about).toBeTruthy()
  })

  it('each skill has required fields', () => {
    const data: PortfolioData = rawData as PortfolioData
    data.skills.forEach(skill => {
      expect(skill.icon).toBeTruthy()
      expect(skill.name).toBeTruthy()
      expect(Array.isArray(skill.tags)).toBe(true)
    })
  })

  it('each project has visual stats with fill values 0-100', () => {
    const data: PortfolioData = rawData as PortfolioData
    data.projects.forEach(project => {
      project.visual.stats.forEach(stat => {
        expect(stat.fill).toBeGreaterThanOrEqual(0)
        expect(stat.fill).toBeLessThanOrEqual(100)
      })
    })
  })
})
