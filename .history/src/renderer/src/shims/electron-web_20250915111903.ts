// Web 端 Electron API 占位实现
// 在浏览器环境中提供安全的空实现，避免访问 undefined 导致崩溃

declare global {
  interface Window {
    api: any
    ipcRenderer: any
    electronAPI: any
  }
}

// 安全的空实现
const noop = () => Promise.resolve()
const noopSync = () => undefined
const noopObject = () => ({})

// 模拟 window.api
const mockAPI = {
  // 文件系统相关
  filesystem: {
    readFile: noop,
    writeFile: noop,
    exists: noop,
    mkdir: noop,
    readdir: noop,
    stat: noop,
    unlink: noop,
    copyFile: noop,
    moveFile: noop,
  },

  // 数据库相关
  database: {
    query: noop,
    execute: noop,
    transaction: noop,
  },

  // 系统相关
  system: {
    getPlatform: () => 'web',
    getVersion: () => '1.0.0-web',
    openExternal: noop,
    showItemInFolder: noop,
    shell: {
      openExternal: noop,
      showItemInFolder: noop,
    }
  },

  // 窗口相关
  window: {
    minimize: noop,
    maximize: noop,
    close: noop,
    setTitle: noop,
    setSize: noop,
    setPosition: noop,
  },

  // 应用相关
  app: {
    quit: noop,
    getVersion: () => '1.0.0-web',
    getName: () => 'Cherry Studio Web',
    getPath: () => '/',
    isPackaged: false,
  },

  // 通知相关
  notification: {
    show: noop,
    isSupported: () => false,
  },

  // 剪贴板相关
  clipboard: {
    writeText: noop,
    readText: noop,
    writeImage: noop,
    readImage: noop,
  },

  // 对话框相关
  dialog: {
    showOpenDialog: noop,
    showSaveDialog: noop,
    showMessageBox: noop,
    showErrorBox: noop,
  },

  // 菜单相关
  menu: {
    setApplicationMenu: noop,
    buildFromTemplate: noop,
  },

  // 托盘相关
  tray: {
    setContextMenu: noop,
    setToolTip: noop,
    setImage: noop,
    destroy: noop,
  },

  // 快捷键相关
  globalShortcut: {
    register: noop,
    unregister: noop,
    unregisterAll: noop,
  },

  // 数据可视化相关
  dataviz: {
    initDb: noop,
    getFormulaMaterials: noop,
    getFormulaStats: noop,
    getFormulaSolids: noop,
  },

  // 其他可能的 API
  [key: string]: any
}

// 模拟 ipcRenderer
const mockIpcRenderer = {
  invoke: noop,
  send: noop,
  sendSync: noopSync,
  on: noop,
  once: noop,
  removeListener: noop,
  removeAllListeners: noop,
  postMessage: noop,
  sendToHost: noop,
}

// 模拟 electronAPI
const mockElectronAPI = {
  ...mockAPI,
  ipcRenderer: mockIpcRenderer,
}

// 检查是否在 Web 环境
const isWeb = typeof window !== 'undefined' && !window.navigator.userAgent.includes('Electron')

if (isWeb) {
  // 注入 Web 端占位 API
  window.api = mockAPI
  window.ipcRenderer = mockIpcRenderer
  window.electronAPI = mockElectronAPI

  // 设置环境变量
  if (typeof import !== 'undefined' && import.meta) {
    import.meta.env.IS_WEB = true
  }

  console.log('Web environment detected, Electron APIs mocked')
}

export {}
