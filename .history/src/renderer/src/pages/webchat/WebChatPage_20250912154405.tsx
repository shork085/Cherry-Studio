import React from 'react'
import styled from 'styled-components'
import { Button, Input } from 'antd'
import { StopCircle, SendHorizonal } from 'lucide-react'
import { ChatMessage } from '@renderer/services/chatBackend'
import { WebChatBackend } from '@renderer/services/webChatBackend'

const backend = new WebChatBackend('/api/chat')

const WebChatPage: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [text, setText] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const abortRef = React.useRef<() => void>()

  const append = (msg: ChatMessage) => setMessages((prev) => [...prev, msg])
  const updateLastAssistant = (delta: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== 'assistant') return prev
      const next = [...prev]
      next[next.length - 1] = { ...last, content: last.content + delta }
      return next
    })
  }

  const onSend = async () => {
    if (!text.trim() || loading) return
    const user: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    append(user)
    setText('')
    const assistant: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: '' }
    append(assistant)
    setLoading(true)
    const { abort } = backend.send([...messages, user], (chunk) => {
      if (chunk.type === 'text' && chunk.data) updateLastAssistant(chunk.data)
      if (chunk.type === 'done' || chunk.type === 'error') setLoading(false)
    })
    abortRef.current = abort
  }

  const onStop = () => {
    abortRef.current?.()
    setLoading(false)
  }

  return (
    <Container>
      <Messages>
        {messages.map((m) => (
          <Msg key={m.id} $role={m.role}>
            <b>{m.role === 'user' ? '我' : '助手'}</b>
            <div>{m.content}</div>
          </Msg>
        ))}
      </Messages>
      <Footer>
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder="输入消息..."
        />
        <Actions>
          <Button type="default" icon={<StopCircle size={18} />} onClick={onStop} disabled={!loading}>
            停止
          </Button>
          <Button type="primary" icon={<SendHorizonal size={18} />} onClick={onSend} loading={loading}>
            发送
          </Button>
        </Actions>
      </Footer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 12px;
  gap: 8px;
`

const Messages = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
`

const Msg = styled.div<{ $role: 'user' | 'assistant' }>`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  b {
    width: 36px;
    flex: none;
    color: var(--color-text-2);
  }
  div {
    white-space: pre-wrap;
  }
`

const Footer = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
`

export default WebChatPage


