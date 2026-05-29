import type { Metadata } from 'next'
import { Noto_Sans, Noto_Sans_Mono } from 'next/font/google'
import './nkos.css'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--nk-font',
})

const notoMono = Noto_Sans_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--nk-mono',
})

export const metadata: Metadata = {
  title: 'NK-OS — Nitish Kushwaha',
  description: 'NK-OS: A desktop portfolio experience',
}

export default function NKOSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`nkos-shell ${notoSans.variable} ${notoMono.variable}`}>
      {children}
    </div>
  )
}
