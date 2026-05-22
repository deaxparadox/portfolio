import type { TerminalData } from '@/data/types'
import portfolioData from '@/data/portfolio.json'

const termData = portfolioData.terminal as TerminalData

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getCommandOutput(data: TerminalData, cmd: string): string[] | null {
  const key = cmd.trim().toLowerCase() as keyof typeof data.commands
  return key in data.commands ? data.commands[key] : null
}

describe('terminal command registry', () => {
  it('returns lines for "about"', () => {
    const output = getCommandOutput(termData, 'about')
    expect(output).not.toBeNull()
    expect(output!.length).toBeGreaterThan(0)
  })

  it('returns lines for all standard commands', () => {
    ['about', 'skills', 'projects', 'experience', 'contact'].forEach(cmd => {
      expect(getCommandOutput(termData, cmd)).not.toBeNull()
    })
  })

  it('returns null for unknown commands', () => {
    expect(getCommandOutput(termData, 'unknown')).toBeNull()
  })

  it('is case-insensitive via toLowerCase', () => {
    expect(getCommandOutput(termData, 'ABOUT')).not.toBeNull()
  })
})

describe('escapeHtml', () => {
  it('escapes < and > to prevent XSS in terminal input echo', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
  })

  it('escapes & in user input', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })

  it('passes through normal text unchanged', () => {
    expect(escapeHtml('about')).toBe('about')
  })
})
