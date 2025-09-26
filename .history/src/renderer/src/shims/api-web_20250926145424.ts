// shims/api-web.ts
export {}

// 给浏览器假的实现
if (typeof window !== 'undefined' && !window.api) {
  window.api = {
    storeSync: {
      // 仅在web环境做空实现，接口签名需与 preload 定义保持一致
      subscribe: async () => {},
      unsubscribe: async () => {},
      onUpdate: async (_action: any) => {
        console.warn('[web mock] storeSync.onUpdate called in browser')
        return null as any
      },
      get: (key: string) => {
        console.warn('[web mock] storeSync.get called in browser, key:', key)
        return null
      }
    } as any,
    filesPath: '/mock/files/path',
    isPackaged: false
  } as any
}
