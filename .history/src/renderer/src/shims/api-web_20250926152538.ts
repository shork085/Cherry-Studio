// shims/api-web.ts
export {}

// 给浏览器假的实现
if (typeof window !== 'undefined' && !window.api) {
  window.api = ({
    storeSync: {
      subscribe: async () => {
        console.warn('[web mock] storeSync.subscribe called in browser')
        return null
      },
      unsubscribe: async () => {
        console.warn('[web mock] storeSync.unsubscribe called in browser')
        return null
      },
      // 与 preload 中的签名保持一致: (action: any) => Promise<any>
      onUpdate: async (_action: any) => {
        console.warn('[web mock] storeSync.onUpdate called in browser')
        return null
      }
    }
  } as any)
}
