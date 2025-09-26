// Web 版本入口 - 完整应用
// 在 Web 环境下跳过数据库初始化
if (!(window as any).IS_WEB) {
  import('@renderer/databases')
}

import { loggerService } from '@logger'
import store, { persistor } from '@renderer/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import TopViewContainer from './components/TopView'
import AntdProvider from './context/AntdProvider'
import { CodeStyleProvider } from './context/CodeStyleProvider'
import { NotificationProvider } from './context/NotificationProvider'
import StyleSheetManager from './context/StyleSheetManager'
import { ThemeProvider } from './context/ThemeProvider'
import Router from './Router'

// 注入 Web 环境标识
;(window as any).IS_WEB = true

// 注入 Electron API 占位符
import './electron-web-shims'

const logger = loggerService.withContext('Web.tsx')

function WebApp(): React.ReactElement {
  logger.info('Web App initialized')

  return (
    <Provider store={store}>
      <StyleSheetManager>
        <ThemeProvider>
          <AntdProvider>
            <NotificationProvider>
              <CodeStyleProvider>
                <PersistGate loading={null} persistor={persistor}>
                  <TopViewContainer>
                    <Router />
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

export default WebApp

// 自动渲染到 DOM
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<WebApp />)
} else {
  console.error('Root container not found')
}
