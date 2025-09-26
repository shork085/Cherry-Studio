// 简化的 Web 版本入口 - 避免复杂依赖
import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

import WebChat from './pages/home/WebChat'

// 注入 Web 环境标识
;(window as any).IS_WEB = true

// 注入 Electron API 占位符
import './electron-web-shims'

function SimpleWebApp(): React.ReactElement {
  return (
    <ConfigProvider locale={zhCN}>
      <WebChat />
    </ConfigProvider>
  )
}

// 自动渲染到 DOM
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<SimpleWebApp />)
} else {
  console.error('Root container not found')
}
