'use client'
import '@livekit/components-styles'
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import { useVoiceTour } from './VoiceTourContext'
import { IntroScreen } from './IntroScreen'
import { ActivePanel } from './ActivePanel'
import { MinimizedPill } from './MinimizedPill'
import { DataChannelHandler } from './DataChannelHandler'

export function VoiceTourWidgetInner() {
  const { phase, token, wsUrl, setPhase, reset } = useVoiceTour()

  if (phase === 'idle' || phase === 'ended') return null

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 250 }}>
      {phase === 'intro' ? (
        <IntroScreen />
      ) : (
        // LiveKitRoom must never unmount while active — minimized uses display:none
        <LiveKitRoom
          token={token ?? ''}
          serverUrl={wsUrl ?? ''}
          connect={true}
          audio={true}
          video={false}
        >
          {/* Required — without this agent audio is received but never played through speakers */}
          <RoomAudioRenderer />
          <DataChannelHandler onEnd={() => {
            setPhase('ended')
            setTimeout(reset, 300)
          }} />
          <div style={{ display: phase === 'active' ? 'block' : 'none' }}>
            <ActivePanel />
          </div>
          <div style={{ display: phase === 'minimized' ? 'block' : 'none' }}>
            <MinimizedPill />
          </div>
        </LiveKitRoom>
      )}
    </div>
  )
}
