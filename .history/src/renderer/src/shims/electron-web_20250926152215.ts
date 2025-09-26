// 浏览器环境下提供 Electron API 的安全占位，避免访问 window.api 报错
export {}

if (typeof window !== 'undefined' && !window.electron) {
  const noop = () => {}
  const noopa = async () => {}
  const proxy = new Proxy(
    {},
    {
      get: () => noopa
    }
  )

  window.electron = {
    ipcRenderer: {
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
      removeAllListeners: (..._args: any[]) => {}
    }
  }

  window.api = window.api || proxy
  window.electron = window.electron || {}
  window.ipcRenderer =
    window.ipcRenderer || ({ on: (_c: string, _l: (...a: any[]) => void) => () => {}, send: noop, invoke: noopa, removeListener: noop } as any)
}

export {}
