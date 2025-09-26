// 浏览器环境下提供 Electron API 的安全占位，避免访问 window.api 报错
export {}

if (typeof window !== 'undefined' && !window.electron) {
  const noopa = async () => {}
  const proxy = new Proxy(
    {},
    {
      get: () => noopa
    }
  )

  const ipcMock = {
      send: (..._args: any[]) => {
        console.warn('[web mock] ipcRenderer.send 被调用，但这是浏览器环境')
      },
      invoke: async (..._args: any[]) => {
        console.warn('[web mock] ipcRenderer.invoke 被调用，但这是浏览器环境')
        return null
      },
      // 签名需返回一个取消监听函数 () => void
      on: (_channel: string, _listener: (...args: any[]) => void) => {
        console.warn('[web mock] ipcRenderer.on 被调用，但这是浏览器环境')
        return () => {}
      },
      once: (_channel: string, _listener: (...args: any[]) => void) => {
        console.warn('[web mock] ipcRenderer.once 被调用，但这是浏览器环境')
        return () => {}
      },
      removeAllListeners: (_channel?: string) => {},
      removeListener: (_channel: string, _listener: (...args: any[]) => void) => {},
      postMessage: (..._args: any[]) => {},
      sendSync: (..._args: any[]) => undefined
    }

  window.electron = { ...(window.electron as any), ipcRenderer: ipcMock as any }

  window.api = window.api || proxy
  window.electron = window.electron || {}
  ;(window as any).ipcRenderer = (window as any).ipcRenderer || (ipcMock as any)
}

export {}
