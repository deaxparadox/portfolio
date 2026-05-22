export const SECTIONS = ['hero', 'skills', 'projects', 'experience', 'contact'] as const
export type Section = typeof SECTIONS[number]

export function isValidSection(s: string): s is Section {
  return (SECTIONS as readonly string[]).includes(s)
}
