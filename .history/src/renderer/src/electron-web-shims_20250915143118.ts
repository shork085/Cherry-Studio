// Electron API 占位符 - 用于浏览器环境
// 避免在浏览器中访问 window.api 等 Electron 专属 API 时崩溃

// 设置全局标识
;(window as any).IS_WEB = true

// 创建空的 API 对象（显式字段）
const emptyApi = {
  // 通用方法 - 返回空结果或 Promise.resolve
  invoke: () => Promise.resolve(null),
  send: () => {},
  on: () => {},
  off: () => {},
  removeAllListeners: () => {},

  // 文件相关
  openFile: () => Promise.resolve(null),
  saveFile: () => Promise.resolve(null),
  readFile: () => Promise.resolve(''),
  writeFile: () => Promise.resolve(true),

  // 系统相关
  showMessageBox: () => Promise.resolve({ response: 0 }),
  showOpenDialog: () => Promise.resolve({ canceled: true, filePaths: [] }),
  showSaveDialog: () => Promise.resolve({ canceled: true, filePath: '' }),

  // 窗口相关
  minimize: () => {},
  maximize: () => {},
  close: () => {},
  setTitle: () => {},

  // 应用相关
  getVersion: () => Promise.resolve('1.0.0'),
  getPath: () => Promise.resolve(''),
  getAppPath: () => Promise.resolve(''),

  // 数据库相关
  dataviz: {
    initDb: () => Promise.resolve(true),
    getFormulaMaterials: () => Promise.resolve([]),
    getFormulaStats: () => Promise.resolve([]),
    getFormulaSolids: () => Promise.resolve([])
  },

  // 文件读写（供 miniapps、自定义配置等使用）
  file: {
    read: async (_path: string) => '[]',
    writeWithId: async (_path: string, _content: string) => true
  },

  // 窗口相关（Electron 专属）：提供空实现，避免浏览器报错
  window: {
    setMinimumSize: (_w: number, _h: number) => {},
    resetMinimumSize: () => {}
  },

  // 其他可能的 API
  clipboard: {
    readText: () => Promise.resolve(''),
    writeText: () => Promise.resolve(true)
  },

  shell: {
    openExternal: () => Promise.resolve(true),
    openPath: () => Promise.resolve('')
  }
}

// 注入到 window.api
;(window as any).api = emptyApi

// 注入 ipcRenderer 占位符
;(window as any).ipcRenderer = {
  invoke: emptyApi.invoke,
  send: emptyApi.send,
  on: emptyApi.on,
  off: emptyApi.off,
  removeAllListeners: emptyApi.removeAllListeners
}

// 注入其他可能的 Electron 对象
;(window as any).electronAPI = emptyApi
;(window as any).electron = {
  ipcRenderer: {
    invoke: emptyApi.invoke,
    send: emptyApi.send,
    on: emptyApi.on,
    off: emptyApi.off,
    removeAllListeners: emptyApi.removeAllListeners
  }
}

// 兜底：提供一个深层 Proxy，避免访问未知子属性时报错
try {
  const asyncNoop = async () => null as any
  const deepProxy: any = new Proxy(asyncNoop, {
    get: (_target, _prop) => deepProxy,
    set: () => true,
    apply: () => Promise.resolve(null)
  })

  // 仅当属性不存在时，回退到深层 Proxy
  const attachFallback = (obj: any) =>
    new Proxy(obj, {
      get(target, prop: any) {
        const value = (target as any)[prop]
        return value === undefined ? deepProxy : value
      }
    })

  ;(window as any).api = attachFallback((window as any).api)
  ;(window as any).ipcRenderer = attachFallback((window as any).ipcRenderer)
  ;(window as any).electronAPI = attachFallback((window as any).electronAPI)
} catch {}

console.log('Electron API shims loaded for web environment')
