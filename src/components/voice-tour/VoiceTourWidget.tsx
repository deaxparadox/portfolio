'use client'
import dynamic from 'next/dynamic'

// Must be dynamic(ssr:false) — LiveKit uses browser-only WebRTC APIs
export const VoiceTourWidget = dynamic(
  () => import('./VoiceTourWidgetInner').then(m => m.VoiceTourWidgetInner),
  { ssr: false }
)
