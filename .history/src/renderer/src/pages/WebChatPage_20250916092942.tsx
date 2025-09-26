import React from 'react'
import styled from 'styled-components'
import { Button, Input } from 'antd'

import { ChatMessage, WebChatBackend } from '@renderer/services/webchat/ChatBackend'

const backend = new WebChatBackend('/api/chat')

const WebChatPage: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('chat_api_key') || '')
  const [showApiKeyConfig, setShowApiKeyConfig] = React.useState(!apiKey)
  // 终止控制器
  const abortRef = React.useRef<AbortController | null>(null)

  const onSend = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    const history = [...messages, userMsg]

    try {
      await backend.sendMessage({
        messages: history,
        apiKey: apiKey || undefined,
        signal: controller.signal,
        onToken: (token) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            if (!last || last.role !== 'assistant') return prev
            // 更新最后一条消息的内容
            const updated = [...prev]
            updated[updated.length - 1] = { ...last, content: (last.content || '') + token }
            return updated
          })
        }
      })
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const onStop = () => {
    abortRef.current?.abort()
  }

  const handleApiKeySave = () => {
    localStorage.setItem('chat_api_key', apiKey)
    setShowApiKeyConfig(false)
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value)
  }

  if (showApiKeyConfig) {
    return (
      <Container>
        <ApiKeyConfig>
          <h3>配置 API Key</h3>
          <p>请输入你的大模型 API Key 以开始对话</p>
          <Input.Password
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="输入 API Key..."
            style={{ marginBottom: 16 }}
          />
          <Button type="primary" onClick={handleApiKeySave} disabled={!apiKey.trim()}>
            保存并开始
          </Button>
        </ApiKeyConfig>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <span>Cherry Studio Chat</span>
        <Button size="small" onClick={() => setShowApiKeyConfig(true)}>
          重新配置 API Key
        </Button>
      </Header>
      <Messages>
        {messages.map((m, i) => (
          <Bubble key={i} $role={m.role}>
            <div className="role">{m.role}</div>
            <div className="content">{m.content}</div>
          </Bubble>
        ))}
      </Messages>
      <Composer>
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder="输入你的问题..."
        />
        <Actions>
          <Button type="primary" onClick={onSend} loading={loading} disabled={!input.trim()}>
            发送
          </Button>
          <Button onClick={onStop} disabled={!loading}>
            停止
          </Button>
        </Actions>
      </Composer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  gap: 12px;
  background: var(--color-bg, #f7f7f7);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  font-weight: 600;
`

const ApiKeyConfig = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;

  h3 {
    margin-bottom: 8px;
    color: var(--color-text, #1f2328);
  }

  p {
    margin-bottom: 24px;
    color: var(--color-subtext, #6b7280);
  }
`

const Messages = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
`

const Bubble = styled.div<{ $role: ChatMessage['role'] }>`
  display: flex;
  gap: 8px;
  .role {
    width: 72px;
    flex-shrink: 0;
    color: #888;
    text-transform: capitalize;
  }
  .content {
    white-space: pre-wrap;
  }
`

const Composer = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
`

export default WebChatPage
