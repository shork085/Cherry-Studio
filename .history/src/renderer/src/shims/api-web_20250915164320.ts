// shims/api-web.ts
declare global {
  interface Window {
    api?: {
      storeSync?: {
        onUpdate: (cb: (...args: any[]) => void) => () => void
        get: (key: string) => any
      }
      filesPath?: string
      isPackaged?: boolean
    }
  }
}

// 给浏览器假的实现
if (typeof window !== 'undefined' && !window.api) {
  window.api = {
    storeSync: {
      onUpdate: (cb) => {
        console.warn('[web mock] storeSync.onUpdate called in browser')
        // 返回一个假“取消监听函数”
        return () => {
          console.warn('[web mock] storeSync.onUpdate remover called in browser')
        }
      },
      get: (key) => {
        console.warn('[web mock] storeSync.get called in browser, key:', key)
        return null
      }
    },
    filesPath: '/mock/files/path',
    isPackaged: false
  }
}
