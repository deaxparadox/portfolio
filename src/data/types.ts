// portfolio-app/data/types.ts

export interface PortfolioMeta {
  title: string
  description: string
}

export interface PortfolioTheme {
  accentColor: string
}

export interface HeroLink {
  label: string
  href: string
}

export interface HeroData {
  name: string
  badge: string
  titleLines: [string, string, string]
  titleAccentLine: number
  subtitle: string
  ctaPrimary: HeroLink
  ctaSecondary: HeroLink
}

export interface StatItem {
  value: string
  label: string
}

export interface SkillItem {
  icon: string
  name: string
  description: string
  tags: string[]
}

export interface ProjectVisualStat {
  value: string
  label: string
  fill: number
}

export interface ProjectVisual {
  glyph: string
  stats: [ProjectVisualStat, ProjectVisualStat]
}

export interface ProjectLink {
  label: string
  href: string
}

export interface ProjectItem {
  year: string
  name: string
  description: string
  tags: string[]
  links: ProjectLink[]
  visual: ProjectVisual
}

export interface ExperienceItem {
  period: string
  role: string
  company: string
  location: string
  description: string
}

export interface SocialLink {
  label: string
  icon: string
  href: string
}

export interface ContactData {
  heading: string
  email: string
  socials: SocialLink[]
}

export interface FooterData {
  copy: string
  signature: string
}

export interface TerminalCommands {
  about: string[]
  skills: string[]
  projects: string[]
  experience: string[]
  contact: string[]
}

export interface TerminalData {
  intro: string[]
  commands: TerminalCommands
}

export interface GlimpseReads {
  title: string
  author: string
  quote: string
}

export interface GlimpseHobby {
  label: string
  icon: string
}

export interface GlimpseLocation {
  city: string
  country: string
  pin: string
  availability: string
}

export interface GlimpseQuote {
  text: string
  author: string
}

export interface GlimpseData {
  reads: GlimpseReads
  hobbies: GlimpseHobby[]
  location: GlimpseLocation
  quote: GlimpseQuote
}

export interface PortfolioData {
  meta: PortfolioMeta
  theme: PortfolioTheme
  hero: HeroData
  stats: StatItem[]
  skills: SkillItem[]
  projects: ProjectItem[]
  experience: ExperienceItem[]
  contact: ContactData
  footer: FooterData
  terminal: TerminalData
  glimpse: GlimpseData
}
