import { render, screen, act, waitFor } from '@testing-library/react'
import { ChatProvider, useChatContext } from '@/components/chat/ChatContext'

jest.mock('@/components/chat/chatApi', () => ({
  createSession: jest.fn().mockResolvedValue('mock-thread-id'),
  streamMessage: jest.fn().mockImplementation((_msg: string, _tid: string, cb: { onToken: (s: string) => void; onDone: () => void }) => {
    cb.onToken('Hello')
    cb.onDone()
    return Promise.resolve()
  }),
}))

function Probe() {
  const ctx = useChatContext()
  return (
    <div>
      <span data-testid="isOpen">{String(ctx.isOpen)}</span>
      <span data-testid="threadId">{ctx.threadId ?? 'null'}</span>
      <span data-testid="isStreaming">{String(ctx.isStreaming)}</span>
      <span data-testid="msgCount">{ctx.messages.length}</span>
      <button onClick={ctx.openChat}>open</button>
      <button onClick={ctx.closeChat}>close</button>
      <button onClick={() => ctx.sendMessage('hello')}>send</button>
    </div>
  )
}

function wrap(ui: React.ReactNode) {
  return render(<ChatProvider>{ui}</ChatProvider>)
}

describe('ChatContext', () => {
  it('default state: isOpen false, messages empty, threadId null', () => {
    wrap(<Probe />)
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')
    expect(screen.getByTestId('threadId')).toHaveTextContent('null')
    expect(screen.getByTestId('msgCount')).toHaveTextContent('0')
  })

  it('openChat creates session and sets isOpen true', async () => {
    wrap(<Probe />)
    await act(async () => { screen.getByText('open').click() })
    expect(screen.getByTestId('isOpen')).toHaveTextContent('true')
    expect(screen.getByTestId('threadId')).toHaveTextContent('mock-thread-id')
  })

  it('closeChat sets isOpen false', async () => {
    wrap(<Probe />)
    await act(async () => { screen.getByText('open').click() })
    act(() => { screen.getByText('close').click() })
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')
  })

  it('sendMessage appends user then assistant message', async () => {
    wrap(<Probe />)
    await act(async () => { screen.getByText('send').click() })
    expect(screen.getByTestId('msgCount')).toHaveTextContent('2')
  })

  it('isStreaming is false after done', async () => {
    wrap(<Probe />)
    await act(async () => { screen.getByText('send').click() })
    await waitFor(() => {
      expect(screen.getByTestId('isStreaming')).toHaveTextContent('false')
    })
  })
})
