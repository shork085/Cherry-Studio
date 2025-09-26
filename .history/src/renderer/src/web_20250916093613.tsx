import React from 'react'
import { createRoot } from 'react-dom/client'
import styled, { createGlobalStyle } from 'styled-components'
import { Input, Button, theme } from 'antd'
import { SendOutlined, StopOutlined } from '@ant-design/icons'

import { ChatMessage, WebChatBackend } from './services/webchat/ChatBackend'
import WebChatPage from './pages/WebChatPage'

const backend = new WebChatBackend('/api/chat')

const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #f5f7fb;
    --panel: #ffffff;
    --text: #1f2328;
    --subtext: #6b7280;
    --border: #e5e7eb;
    --primary: #1677ff;
    --assistant: #f3f4f6;
  }
  html, body, #root { height: 100%; margin: 0; }
  body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans'; }
`

const Shell = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`

const ChatCard = styled.div`
  width: min(100%, 1080px);
  height: min(100%, 780px);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
`

const Header = styled.div`
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
`

const Messages = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(#fafbff, #fff);
`

const Row = styled.div<{ $self?: boolean }>`
  display: flex;
  width: 100%;
  justify-content: ${(p) => (p.$self ? 'flex-end' : 'flex-start')};
`

const Bubble = styled.div<{ $self?: boolean }>`
  max-width: 72%;
  background: ${(p) => (p.$self ? 'var(--primary)' : 'var(--assistant)')};
  color: ${(p) => (p.$self ? '#fff' : 'var(--text)')};
  padding: 10px 12px;
  border-radius: 16px;
  border-top-${(p) => (p.$self ? 'right' : 'left')}-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
`

const Composer = styled.div`
  padding: 12px;
  border-top: 1px solid var(--border);
  background: var(--panel);
  display: flex;
  gap: 8px;
  align-items: flex-end;
`

const TextArea = styled(Input.TextArea)`
  background: #fff;
  border-radius: 14px !important;
  padding: 10px 12px !important;
`

const IconButton = styled(Button)`
  border-radius: 24px !important;
  height: 40px;
  width: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const WebChat: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const abortRef = React.useRef<AbortController | null>(null)

  const append = (msg: ChatMessage) => setMessages((prev) => [...prev, msg])
  const updateLastAssistant = (delta: string) =>
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== 'assistant') return prev
      const next = [...prev]
      next[next.length - 1] = { ...last, content: (last.content || '') + delta }
      return next
    })

  const onSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    append({ role: 'user', content: text })
    append({ role: 'assistant', content: '' })
    setLoading(true)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      await backend.sendMessage({
        messages: [...messages, { role: 'user', content: text }],
        signal: controller.signal,
        onToken: (t) => updateLastAssistant(t)
      })
    } catch {
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const onStop = () => abortRef.current?.abort()

  const handleAction = () => {
    if (loading) onStop()
    else onSend()
  }

  return (
    <Shell>
      <GlobalStyle />
      <ChatCard>
        <Header>Cherry Studio · Chat</Header>
        <Messages>
          {messages.map((m, i) => (
            <Row key={i} $self={m.role === 'user'}>
              <Bubble $self={m.role === 'user'}>{m.content}</Bubble>
            </Row>
          ))}
        </Messages>
        <Composer>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="输入你的问题..."
          />
          <IconButton type="primary" onClick={handleAction} icon={loading ? <StopOutlined /> : <SendOutlined />} />
        </Composer>
      </ChatCard>
    </Shell>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  // root.render(<WebChat />)
  root.render(<WebChatPage />)
}

// import './shims/electron-web'
// import React from 'react'
// import { createRoot } from 'react-dom/client'
// import AppWeb from './AppWeb'

// const container = document.getElementById('root')
// if (container) {
//   const root = createRoot(container)
//   root.render(<AppWeb />)
//   // root.render(<div>ok</div>)
// }
