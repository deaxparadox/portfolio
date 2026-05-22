import { isValidSection } from './sections'

export type ParsedCommand =
  | { type: 'command'; name: string; args: string[] }
  | { type: 'mv'; section: string; raw: string }
  | { type: 'unknown'; raw: string }

const KNOWN_COMMANDS = new Set([
  'help', 'about', 'skills', 'projects', 'experience',
  'contact', 'clear', 'ls',
])

export function parseCommand(input: string): ParsedCommand {
  const raw = input
  const lower = input.trim().toLowerCase()
  const parts = lower.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return { type: 'unknown', raw }

  if (parts[0] === 'mv') {
    const section = parts[1] ?? ''
    return { type: 'mv', section: isValidSection(section) ? section : 'unknown', raw }
  }

  if (KNOWN_COMMANDS.has(parts[0])) {
    return { type: 'command', name: parts[0], args: parts.slice(1) }
  }

  return { type: 'unknown', raw }
}
