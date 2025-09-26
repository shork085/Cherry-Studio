// 浏览器环境下提供 Electron API 的安全占位，避免访问 window.api 报错
// declare global {
//   interface Window {
//     api?: any
//     electron?: any
//     ipcRenderer?: any
//   }
// }

if (typeof window !== 'undefined') {
  const noop = () => {}
  const noopa = async () => {}
  const proxy = new Proxy(
    {},
    {
      get: () => noopa
    }
  )

  window.api = window.api || proxy
  window.electron = window.electron || {}
  window.ipcRenderer = window.ipcRenderer || { on: noop, send: noop, invoke: noopa, removeListener: noop }
}

export {}
