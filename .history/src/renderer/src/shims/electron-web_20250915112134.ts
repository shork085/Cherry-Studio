// Web 端 Electron API 占位实现
// 在浏览器环境中提供安全的空实现，避免访问 undefined 导致崩溃

// 安全的空实现
const noop = () => Promise.resolve()

// 检查是否在 Web 环境
const isWeb = typeof window !== 'undefined' && !window.navigator.userAgent.includes('Electron')

if (isWeb) {
  // 创建通用的空实现对象
  const createMockObject = (methods: string[]) => {
    const obj: any = {}
    methods.forEach(method => {
      obj[method] = noop
    })
    return obj
  }

  // 模拟 window.api
  const mockAPI = {
    // 文件系统相关
    filesystem: createMockObject(['readFile', 'writeFile', 'exists', 'mkdir', 'readdir', 'stat', 'unlink', 'copyFile', 'moveFile']),
    
    // 数据库相关
    database: createMockObject(['query', 'execute', 'transaction']),
    
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
    window: createMockObject(['minimize', 'maximize', 'close', 'setTitle', 'setSize', 'setPosition']),
    
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
    clipboard: createMockObject(['writeText', 'readText', 'writeImage', 'readImage']),
    
    // 对话框相关
    dialog: createMockObject(['showOpenDialog', 'showSaveDialog', 'showMessageBox', 'showErrorBox']),
    
    // 菜单相关
    menu: createMockObject(['setApplicationMenu', 'buildFromTemplate']),
    
    // 托盘相关
    tray: createMockObject(['setContextMenu', 'setToolTip', 'setImage', 'destroy']),
    
    // 快捷键相关
    globalShortcut: createMockObject(['register', 'unregister', 'unregisterAll']),
    
    // 数据可视化相关
    dataviz: createMockObject(['initDb', 'getFormulaMaterials', 'getFormulaStats', 'getFormulaSolids']),
  }

  // 模拟 ipcRenderer
  const mockIpcRenderer = createMockObject(['invoke', 'send', 'sendSync', 'on', 'once', 'removeListener', 'removeAllListeners', 'postMessage', 'sendToHost'])

  // 模拟 electronAPI
  const mockElectronAPI = {
    ...mockAPI,
    ipcRenderer: mockIpcRenderer,
  }

  // 注入 Web 端占位 API
  ;(window as any).api = mockAPI
  ;(window as any).ipcRenderer = mockIpcRenderer
  ;(window as any).electronAPI = mockElectronAPI
  
  console.log('Web environment detected, Electron APIs mocked')
}

export {}
