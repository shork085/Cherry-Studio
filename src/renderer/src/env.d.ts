/// <reference types="vite/client" />

import type KeyvStorage from '@kangfenmao/keyv-storage'
import { MessageInstance } from 'antd/es/message/interface'
import { HookAPI } from 'antd/es/modal/useModal'
import { NavigateFunction } from 'react-router-dom'

// 自定义环境变量
interface ImportMetaEnv {
  VITE_RENDERER_INTEGRATED_MODEL: string
}

// 扩展importMeta接口
interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    root: HTMLElement
    message: MessageInstance
    modal: HookAPI
    keyv: KeyvStorage
    store: any
    navigate: NavigateFunction
  }
}
