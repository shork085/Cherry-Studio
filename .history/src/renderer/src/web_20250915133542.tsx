// Web 版本入口 - 完整应用
import '@renderer/databases'

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
  console.log('WebApp component rendering...')
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

// 如果直接作为模块加载，则自动渲染
if (typeof window !== 'undefined' && document.getElementById('root')) {
  console.log('Auto-rendering WebApp...')
  import('react-dom/client')
    .then(({ createRoot }) => {
      const container = document.getElementById('root')!
      const root = createRoot(container)
      root.render(<WebApp />)
      console.log('WebApp rendered successfully')
    })
    .catch(console.error)
}
