import { parseCommand } from '@/lib/terminalParser'

describe('parseCommand — known commands', () => {
  it('parses lowercase command', () => {
    expect(parseCommand('about')).toEqual({ type: 'command', name: 'about', args: [] })
  })
  it('parses uppercase (case-insensitive)', () => {
    expect(parseCommand('SKILLS')).toEqual({ type: 'command', name: 'skills', args: [] })
  })
  it('trims whitespace', () => {
    expect(parseCommand('  about  ')).toEqual({ type: 'command', name: 'about', args: [] })
  })
  it('parses all standard commands', () => {
    ['help','about','skills','projects','experience','contact','clear','ls'].forEach(cmd => {
      expect(parseCommand(cmd)).toMatchObject({ type: 'command', name: cmd })
    })
  })
})

describe('parseCommand — mv command', () => {
  it('parses mv with valid section', () => {
    expect(parseCommand('mv experience')).toEqual({ type: 'mv', section: 'experience', raw: 'mv experience' })
  })
  it('parses mv hero', () => {
    expect(parseCommand('mv hero')).toEqual({ type: 'mv', section: 'hero', raw: 'mv hero' })
  })
  it('parses mv case-insensitive', () => {
    expect(parseCommand('MV SKILLS')).toEqual({ type: 'mv', section: 'skills', raw: 'MV SKILLS' })
  })
  it('returns mv unknown for invalid section', () => {
    expect(parseCommand('mv nowhere')).toEqual({ type: 'mv', section: 'unknown', raw: 'mv nowhere' })
  })
  it('returns mv unknown when no section given', () => {
    expect(parseCommand('mv')).toEqual({ type: 'mv', section: 'unknown', raw: 'mv' })
  })
})

describe('parseCommand — unknown input', () => {
  it('returns unknown for unrecognised input', () => {
    expect(parseCommand('hello world')).toEqual({ type: 'unknown', raw: 'hello world' })
  })
  it('returns unknown for empty string', () => {
    expect(parseCommand('')).toEqual({ type: 'unknown', raw: '' })
  })
})
