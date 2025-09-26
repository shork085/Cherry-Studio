import React, { FC, useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Button, Input } from 'antd'
import { SendOutlined, StopOutlined } from '@ant-design/icons'

import { ChatMessage, WebChatBackend } from '@renderer/services/webchat/ChatBackend'

const backend = new WebChatBackend('/api/chat')

interface Props {
  assistant?: any
  activeTopic?: any
  setActiveTopic?: (topic: any) => void
  setActiveAssistant?: (assistant: any) => void
}

const WebChat: FC<Props> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onSend = async () => {
    if (!input.trim() || loading) return
    
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input 
    }
    
    setMessages((prev) => [...prev, userMsg, { 
      id: (Date.now() + 1).toString(), 
      role: 'assistant', 
      content: '' 
    }])
    setInput('')
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    const history = [...messages, userMsg]

    try {
      await backend.sendMessage({
        messages: history,
        signal: controller.signal,
        onToken: (token) => {
          setMessages((prev) => {
            const updated = [...prev]
            const lastIndex = updated.length - 1
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = { 
                ...updated[lastIndex], 
                content: (updated[lastIndex].content || '') + token 
              }
            }
            return updated
          })
        }
      })
    } catch (e) {
      console.warn('Chat error:', e)
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const onStop = () => {
    abortRef.current?.abort()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <Container>
      <ChatHeader>
        <Title>Web Chat</Title>
        <Subtitle>基于 Web 的 AI 对话界面</Subtitle>
      </ChatHeader>
      
      <MessagesContainer>
        {messages.length === 0 ? (
          <WelcomeMessage>
            <h3>欢迎使用 Web Chat</h3>
            <p>输入你的问题开始对话，支持流式回复体验。</p>
          </WelcomeMessage>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={msg.id || index} $role={msg.role}>
              <MessageHeader>
                <RoleLabel $role={msg.role}>
                  {msg.role === 'user' ? '用户' : 'AI 助手'}
                </RoleLabel>
              </MessageHeader>
              <MessageContent>
                {msg.content}
                {loading && msg.role === 'assistant' && !msg.content && (
                  <TypingIndicator>AI 正在思考...</TypingIndicator>
                )}
              </MessageContent>
            </MessageBubble>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <InputArea>
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题... (Enter 发送，Shift+Enter 换行)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={loading}
          />
          <ButtonGroup>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onSend}
              loading={loading}
              disabled={!input.trim()}
            >
              发送
            </Button>
            {loading && (
              <Button
                icon={<StopOutlined />}
                onClick={onStop}
              >
                停止
              </Button>
            )}
          </ButtonGroup>
        </InputArea>
      </InputContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg, #f7f7f7);
`

const ChatHeader = styled.div`
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text, #333);
`

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--color-text-2, #666);
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-2, #666);
  
  h3 {
    margin: 0 0 8px 0;
    color: var(--color-text, #333);
  }
  
  p {
    margin: 0;
  }
`

const MessageBubble = styled.div<{ $role: ChatMessage['role'] }>`
  display: flex;
  flex-direction: column;
  max-width: 80%;
  align-self: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
`

const MessageHeader = styled.div`
  margin-bottom: 4px;
`

const RoleLabel = styled.span<{ $role: ChatMessage['role'] }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.$role === 'user' ? '#1890ff' : '#52c41a'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const MessageContent = styled.div`
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
`

const InputContainer = styled.div`
  padding: 16px 20px;
  background: white;
  border-top: 1px solid var(--color-border, #e8e8e8);
`

const InputArea = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const TypingIndicator = styled.div`
  color: var(--color-text-2, #999);
  font-style: italic;
`

export default WebChat
