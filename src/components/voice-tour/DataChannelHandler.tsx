'use client'
import { useDataChannel } from '@livekit/components-react'
import { useEffect } from 'react'

const VALID_SECTIONS = new Set(['hero', 'skills', 'projects', 'glimpse', 'experience', 'contact'])

export function DataChannelHandler({ onEnd }: { onEnd: () => void }) {
  const { message } = useDataChannel('tour-navigation')

  useEffect(() => {
    if (!message) return
    try {
      const payload = JSON.parse(new TextDecoder().decode(message.payload))

      if (payload.type === 'scroll') {
        const section = payload.section
        if (typeof section !== 'string' || !VALID_SECTIONS.has(section)) return
        document.querySelector('#' + section)?.scrollIntoView({ behavior: 'smooth' })
      }

      if (payload.type === 'end_tour') {
        onEnd()
      }

      // FUTURE: navigate handler — add when /projects/[slug] pages exist
      // if (payload.type === 'navigate') {
      //   const VALID_PATHS = new Set(['/projects/vgents', ...])
      //   if (typeof payload.path === 'string' && VALID_PATHS.has(payload.path))
      //     router.push(payload.path)
      // }
    } catch {
      // malformed message — ignore
    }
  }, [message, onEnd])

  return null
}
