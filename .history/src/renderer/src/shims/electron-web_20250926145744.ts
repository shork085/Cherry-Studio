// 浏览器环境下提供 Electron API 的安全占位，避免访问 window.api 报错
export {}

if (typeof window !== 'undefined' && !window.electron) {
  // 提供与 @electron-toolkit/preload 一致的类型签名
  const ipcMock = {
    send: (..._args: any[]) => {
      console.warn('[web mock] ipcRenderer.send called in browser')
    },
    invoke: async (..._args: any[]) => {
      console.warn('[web mock] ipcRenderer.invoke called in browser')
      return null
    },
    on: (_channel: string, _listener: (...args: any[]) => void) => {
      console.warn('[web mock] ipcRenderer.on called in browser')
      return () => {
        // remover
      }
    },
    once: (_channel: string, _listener: (...args: any[]) => void) => {
      console.warn('[web mock] ipcRenderer.once called in browser')
      return () => {}
    },
    removeAllListeners: (_channel?: string) => {}
  }

  window.electron = {
    ipcRenderer: ipcMock as any
  } as any
}
