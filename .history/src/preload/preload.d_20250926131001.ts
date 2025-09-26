import { ElectronAPI } from '@electron-toolkit/preload'

import type { WindowApiType } from './index'

/** you don't need to declare this in your code, it's automatically generated */
declare global {
  interface Window {
    electron: ElectronAPI & {
      process?: {
        platform?: string
        env?: {
          NODE_ENV?: string
          [key: string]: string | undefined
        }
      }
      ipcRenderer?: {
        send: (...args: any[]) => void
        invoke: (...args: any[]) => Promise<any>
        on: (channel: string, listener: (...args: any[]) => void) => () => void
        once: (channel: string, listener: (...args: any[]) => void) => () => void
        removeAllListeners: (channel?: string) => void
      }
    }
    api: WindowApiType
  }
}
