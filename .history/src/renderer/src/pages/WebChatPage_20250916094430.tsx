import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Button, Input } from 'antd'
import { SendOutlined, StopOutlined } from '@ant-design/icons'

import { ChatMessage, WebChatBackend } from '@renderer/services/webchat/ChatBackend'

const backend = new WebChatBackend('https://api.siliconflow.cn/v1')

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
      <Shell>
        <GlobalStyle />
        <ChatCard>
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
        </ChatCard>
      </Shell>
    )
  }

  return (
    <Shell>
      <GlobalStyle />
      <ChatCard>
        <Header>
          <span>Cherry Studio · Chat</span>
          <Button size="small" onClick={() => setShowApiKeyConfig(true)}>
            重新配置 API Key
          </Button>
        </Header>
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
          <IconButton
            type="primary"
            onClick={loading ? onStop : onSend}
            icon={loading ? <StopOutlined /> : <SendOutlined />}
            disabled={!loading && !input.trim()}
          />
        </Composer>
      </ChatCard>
    </Shell>
  )
}

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
  justify-content: space-between;
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
    color: var(--text);
  }

  p {
    margin-bottom: 24px;
    color: var(--subtext);
  }
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

export default WebChatPage
