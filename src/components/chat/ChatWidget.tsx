'use client'
import dynamic from 'next/dynamic'

// Must be dynamic(ssr:false) — uses browser-only APIs
export const ChatWidget = dynamic(
  () => import('./ChatWidgetInner').then(m => m.ChatWidgetInner),
  { ssr: false }
)
