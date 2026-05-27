// src/app/layout.tsx
import type { Metadata } from 'next'
import {
  Rubik_Dirt,
  DM_Mono,
  Syne,
  Cormorant_Garamond,
} from 'next/font/google'
import './globals.css'
import DeaxButton from '@/components/deax/DeaxButton'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

const rubikDirt = Rubik_Dirt({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jetbrains-mono',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`:root { --accent: ${data.theme.accentColor}; }`}</style>
      </head>
      <body className={`${rubikDirt.variable} ${dmMono.variable} ${syne.variable} ${cormorant.variable}`}>
        {children}
        <DeaxButton />
      </body>
    </html>
  )
}
