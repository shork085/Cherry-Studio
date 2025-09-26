// 在浏览器环境中提供 Electron 相关 API 的安全占位，避免引用报错
declare global {
  interface Window {
    api?: any
    electron?: any
    ipcRenderer?: any
  }
}

if (typeof window !== 'undefined') {
  const noop = () => {}
  const noopp = async () => {}

  const safeApi = new Proxy(
    {},
    {
      get: () => noopp
    }
  )

  window.api = window.api || safeApi
  window.electron = window.electron || {}
  window.ipcRenderer = window.ipcRenderer || { on: noop, send: noop, invoke: noopp, removeListener: noop }
}

export {}
