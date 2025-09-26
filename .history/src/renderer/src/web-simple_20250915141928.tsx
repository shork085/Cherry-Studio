// 完整的 Web 版本入口 - 和 Electron 应用一模一样
// 先设置 Web 标识并注入 Electron 占位符，避免后续模块初始化期访问 Electron API 报错
;(window as any).IS_WEB = true
import './electron-web-shims'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { loggerService } from '@logger'

import store, { persistor } from './store'
import TopViewContainer from './components/TopView'
import WebSidebar from './components/app/WebSidebar'
import AntdProvider from './context/AntdProvider'
import { CodeStyleProvider } from './context/CodeStyleProvider'
import { NotificationProvider } from './context/NotificationProvider'
import StyleSheetManager from './context/StyleSheetManager'
import { ThemeProvider } from './context/ThemeProvider'
import Router from './Router'
import styled from 'styled-components'

function FullWebApp(): React.ReactElement {
  // 初始化日志窗口来源，避免 LoggerService 警告
  loggerService.initWindowSource('web')
  return (
    <Provider store={store}>
      <StyleSheetManager>
        <ThemeProvider>
          <AntdProvider>
            <NotificationProvider>
              <CodeStyleProvider>
                <PersistGate loading={null} persistor={persistor}>
                  <AppContainer>
                    <WebSidebar />
                    <MainContent>
                      <TopViewContainer>
                        <HashRouter>
                          <Router />
                        </HashRouter>
                      </TopViewContainer>
                    </MainContent>
                  </AppContainer>
                </PersistGate>
              </CodeStyleProvider>
            </NotificationProvider>
          </AntdProvider>
        </ThemeProvider>
      </StyleSheetManager>
    </Provider>
  )
}

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
`

const MainContent = styled.div`
  flex: 1;
  margin-left: 240px;
  height: 100vh;
  overflow: hidden;
`

// 自动渲染到 DOM
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<FullWebApp />)
} else {
  console.error('Root container not found')
}
