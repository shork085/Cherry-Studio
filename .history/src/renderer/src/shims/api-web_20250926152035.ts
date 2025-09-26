// shims/api-web.ts
export {}

// 给浏览器假的实现
if (typeof window !== 'undefined' && !window.api) {
  window.api = {
    storeSync: {
      // 与 preload 中的签名保持一致: (action: any) => Promise<any>
      onUpdate: async (_action: any) => {
        console.warn('[web mock] storeSync.onUpdate called in browser')
        return null
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
