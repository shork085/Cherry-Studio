// 浏览器环境下提供 Electron API 的安全占位，避免访问 window.api 报错
// declare global {
//   interface Window {
//     api?: any
//     electron?: any
//     ipcRenderer?: any
//   }
// }
declare global {
  interface Window {
    electron?: {
      ipcRenderer?: {
        send: (...args: any[]) => void
        invoke: (...args: any[]) => Promise<any>
        on: (...args: any[]) => void
        removeAllListeners: (...args: any[]) => void
      }
    }
  }
}

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
      on: (..._args: any[]) => {
        console.warn('[web mock] ipcRenderer.on 被调用，但这是浏览器环境')
      },
      removeAllListeners: (..._args: any[]) => {}
    }
  }

  window.api = window.api || proxy
  window.electron = window.electron || {}
  window.ipcRenderer = window.ipcRenderer || { on: noop, send: noop, invoke: noopa, removeListener: noop }
}

export {}
