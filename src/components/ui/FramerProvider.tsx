'use client'
import { LazyMotion, domMax } from 'framer-motion'

// domMax required — domAnimation excludes drag and layout animations
export default function FramerProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>
}
