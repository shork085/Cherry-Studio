import React from 'react'
import { createRoot } from 'react-dom/client'
import styled, { createGlobalStyle } from 'styled-components'
import WebChatPage from './pages/WebChatPage'

const GlobalStyle = createGlobalStyle`
  :root {
    --color-bg: #f5f5f7;
    --color-text: #1f1f1f;
    --color-border: #e5e5e5;
    --color-primary: #1677ff;
    --color-primary-10: rgba(22, 119, 255, 0.06);
    --color-primary-20: rgba(22, 119, 255, 0.18);
  }
  html, body, #root { height: 100%; margin: 0; }
  body { background: var(--color-bg); color: var(--color-text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; }
` 

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Header = styled.div`
  height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
`

const Brand = styled.div`
  font-weight: 600;
  color: var(--color-text);
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 8px;
`

const Tab = styled.div<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  background: ${(p) => (p.$active ? 'var(--color-primary-10)' : 'transparent')};
  color: ${(p) => (p.$active ? 'var(--color-primary)' : 'var(--color-text)')};
  border: 1px solid ${(p) => (p.$active ? 'var(--color-primary-20)' : 'var(--color-border)')};
  user-select: none;
`

const Content = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  background: #fff;
`

const Sidebar = styled.div`
  width: 200px;
  border-right: 1px solid var(--color-border);
  background: #fff;
  display: none; /* 简化：隐藏侧边栏，仅保留整体观感 */
`

const Main = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`

const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <AppShell>
      <GlobalStyle />
      <Header>
        <Brand>Cherry Studio</Brand>
        <Tabs>
          <Tab $active>聊天</Tab>
          <Tab>应用</Tab>
          <Tab>设置</Tab>
        </Tabs>
      </Header>
      <Content>
        <Sidebar />
        <Main>
          <WebChatPage />
        </Main>
      </Content>
    </AppShell>
  )
}
