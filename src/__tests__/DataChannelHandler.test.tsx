import { render } from '@testing-library/react'
import { DataChannelHandler } from '@/components/voice-tour/DataChannelHandler'

const mockUseDataChannel = jest.fn()
jest.mock('@livekit/components-react', () => ({
  useDataChannel: (topic: string, cb?: unknown) => mockUseDataChannel(topic, cb),
}))

function makeMessage(payload: object) {
  return { payload: new TextEncoder().encode(JSON.stringify(payload)) }
}

describe('DataChannelHandler', () => {
  beforeEach(() => {
    mockUseDataChannel.mockReturnValue({ message: undefined })
    jest.spyOn(document, 'querySelector').mockReturnValue({
      scrollIntoView: jest.fn(),
    } as unknown as Element)
  })

  afterEach(() => jest.restoreAllMocks())

  it('scrolls to valid section', () => {
    const scrollIntoView = jest.fn()
    jest.spyOn(document, 'querySelector').mockReturnValue({ scrollIntoView } as unknown as Element)
    mockUseDataChannel.mockReturnValue({ message: makeMessage({ type: 'scroll', section: 'projects' }) })

    render(<DataChannelHandler onEnd={jest.fn()} />)
    expect(document.querySelector).toHaveBeenCalledWith('#projects')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('does not scroll to invalid section', () => {
    const scrollIntoView = jest.fn()
    jest.spyOn(document, 'querySelector').mockReturnValue({ scrollIntoView } as unknown as Element)
    mockUseDataChannel.mockReturnValue({ message: makeMessage({ type: 'scroll', section: 'evil-script' }) })

    render(<DataChannelHandler onEnd={jest.fn()} />)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('calls onEnd for end_tour message', () => {
    const onEnd = jest.fn()
    mockUseDataChannel.mockReturnValue({ message: makeMessage({ type: 'end_tour' }) })

    render(<DataChannelHandler onEnd={onEnd} />)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })
})
