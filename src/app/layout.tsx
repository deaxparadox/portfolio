import type { Metadata } from 'next'
import { DM_Serif_Display, JetBrains_Mono, Instrument_Sans } from 'next/font/google'
import './globals.css'
import CustomCursor from '@/components/ui/CustomCursor'
import RevealInit   from '@/components/ui/RevealInit'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jetbrains-mono',
})
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-instrument-sans',
})

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Inject accent color from portfolio.json as a CSS variable override */}
        <style>{`:root { --accent: ${data.theme.accentColor}; }`}</style>
      </head>
      <body className={`${dmSerif.variable} ${jetbrainsMono.variable} ${instrumentSans.variable}`}>
        <CustomCursor />
        <RevealInit />

        {/* Ambient radial gradient */}
        <div
          className="fixed inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 15% 20%, rgba(212,160,23,0.09) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 85% 70%, rgba(232,200,74,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 80% 60% at 50% 50%, rgba(10,9,0,0.95) 0%, transparent 100%)
            `,
          }}
        />
        {/* Fractal noise texture */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Grid lines */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(232,200,74,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(232,200,74,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-[2]">{children}</div>
      </body>
    </html>
  )
}
