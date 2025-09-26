// 完整的 Web 版本入口 - 和 Electron 应用一模一样
import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

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

// 注入 Web 环境标识
;(window as any).IS_WEB = true

// 注入 Electron API 占位符
import './electron-web-shims'

function FullWebApp(): React.ReactElement {
  return (
    <Provider store={store}>
      <StyleSheetManager>
        <ThemeProvider>
          <AntdProvider>
            <NotificationProvider>
              <CodeStyleProvider>
                <PersistGate loading={null} persistor={persistor}>
                  <TopViewContainer>
                    <HashRouter>
                      <Router />
                    </HashRouter>
                  </TopViewContainer>
                </PersistGate>
              </CodeStyleProvider>
            </NotificationProvider>
          </AntdProvider>
        </ThemeProvider>
      </StyleSheetManager>
    </Provider>
  )
}

// 自动渲染到 DOM
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<FullWebApp />)
} else {
  console.error('Root container not found')
}
