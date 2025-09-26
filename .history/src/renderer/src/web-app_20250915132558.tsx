// 直接使用 App.tsx 的 Web 版本
import React from 'react'
import { createRoot } from 'react-dom/client'

// 先注入 Web 环境标识和 API 占位符
;(window as any).IS_WEB = true
import './electron-web-shims'

// 延迟导入 App-web，确保环境设置完成
import('./App-web').then(({ default: App }) => {
  console.log('App imported successfully')
  
  const container = document.getElementById('root')
  if (container) {
    console.log('Creating React root...')
    const root = createRoot(container)
    root.render(<App />)
    console.log('App rendered successfully')
  } else {
    console.error('Root container not found!')
  }
}).catch((error) => {
  console.error('Failed to import App:', error)
  
  // 降级到简单版本
  import('./web-simple').then(({ default: SimpleApp }) => {
    const container = document.getElementById('root')
    if (container) {
      const root = createRoot(container)
      root.render(<SimpleApp />)
    }
  })
})
