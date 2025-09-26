import { loggerService } from '@logger'
import { Middleware } from '@reduxjs/toolkit'
import { IpcChannel } from '@shared/IpcChannel'
import type { StoreSyncAction } from '@types'

const logger = loggerService.withContext('StoreSyncService')

// 同步选项类型定义
type SyncOptions = {
  // 一个“白名单”数组，定义了哪些 Action 需要被同步
  syncList: string[]
}

/**
 * StoreSyncService class manages Redux store synchronization between multiple windows
 * It uses singleton pattern to ensure only one sync service instance exists in the application
 *
 * Main features:
 * 1. Synchronizes Redux actions between windows via IPC
 * 2. Provides Redux middleware to intercept and broadcast actions that need syncing
 * 3. Supports whitelist configuration for action types to sync
 * 4. Handles window subscription and unsubscription logic
 */
export class StoreSyncService {
  private static instance: StoreSyncService //静态实例引用
  private options: SyncOptions = {
    // 同步配置选项
    syncList: []
  }
  // 移除IPC监听器
  private broadcastSyncRemover: (() => void) | null = null

  // 私有构造
  private constructor() {
    return
  }

  /**
   * Get the singleton instance of StoreSyncService
   * 获取单例实例的静态方法
   */
  public static getInstance(): StoreSyncService {
    if (!StoreSyncService.instance) {
      StoreSyncService.instance = new StoreSyncService()
    }
    return StoreSyncService.instance
  }

  /**
   * Set sync options 同步白名单
   * @param options Partial sync options
   */
  public setOptions(options: Partial<SyncOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * Create Redux middleware to intercept and broadcast actions
   * Actions will not be broadcasted if they are not in whitelist or come from sync
   * 拦截本窗口发起的action
   */
  public createMiddleware(): Middleware {
    return () => (next) => (action) => {
      // Process the action normally first 先让下一个中间件正常处理action
      const result = next(action)

      // Check if this action came from sync or is a whitelisted action
      const syncAction = action as StoreSyncAction
      if (!syncAction.meta?.fromSync && this.shouldSyncAction(syncAction.type)) {
        // Send to main process for broadcasting to other windows using the preload API
        if (window.api?.storeSync) {
          window.api.storeSync.onUpdate(syncAction)
        }
      }

      return result
    }
  }

  /**
   * Check if action type is in whitelist
   * @param actionType Action type to check
   * @returns Whether the action should be synced
   */
  private shouldSyncAction(actionType: string): boolean {
    // If no whitelist is specified, sync nothing
    if (!this.options.syncList.length) {
      return false
    }

    // Check if the action belongs to a store slice we want to sync
    return this.options.syncList.some((prefix) => {
      return actionType.startsWith(prefix)
    })
  }

  /**
   * Subscribe to sync service
   * Sets up IPC listener and registers cleanup on window close
   * 订阅同步事件，监听从其它窗口发来的action
   */
  public subscribe(): void {
    // 如果已订阅或api不存在，则返回
    if (this.broadcastSyncRemover || !window.api?.storeSync) {
      return
    }

    // 监听广播事件
    this.broadcastSyncRemover = window.electron?.ipcRenderer?.on(
      // 频道名
      IpcChannel.StoreSync_BroadcastSync,
      (_, action: StoreSyncAction) => {
        try {
          // Dispatch to the store
          // 将接受到的action派发给本窗口store
          if (window.store) {
            window.store.dispatch(action)
          }
        } catch (error) {
          logger.error('Error dispatching synced action:', error as Error)
        }
      }
    )

    // 调用预加载脚本的API
    window.api.storeSync.subscribe()

    // 监听窗口关闭事件，取消订阅
    window.addEventListener('beforeunload', () => {
      this.unsubscribe()
    })
  }

  /**
   * Unsubscribe from sync service
   * Cleans up IPC listener and related resources
   */
  public unsubscribe(): void {
    if (window.api?.storeSync) {
      window.api.storeSync.unsubscribe()
    }

    // 移除IPC监听器
    if (this.broadcastSyncRemover) {
      this.broadcastSyncRemover()
      this.broadcastSyncRemover = null
    }
  }
}

// Export singleton instance
export default StoreSyncService.getInstance()
