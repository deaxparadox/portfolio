import type { Metadata } from 'next'
import { Oxanium, Noto_Sans, Noto_Sans_Mono } from 'next/font/google'
import './nkm.css'

const oxanium = Oxanium({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--nkm-oxan' })
const notoSans = Noto_Sans({ subsets: ['latin'], weight: ['300','400','500'], variable: '--nkm-font' })
const notoMono = Noto_Sans_Mono({ subsets: ['latin'], weight: ['400','500'], variable: '--nkm-mono' })

export const metadata: Metadata = {
  title: 'NK-M — Nitish Kushwaha',
  description: 'NK-M: A mobile portfolio experience',
}

export default function NKMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`nkm-shell ${oxanium.variable} ${notoSans.variable} ${notoMono.variable}`}>
      {children}
    </div>
  )
}
