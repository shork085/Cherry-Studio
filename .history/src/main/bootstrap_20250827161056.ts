// 从共享配置里引入一些固定需要复制的目录名
import { occupiedDirs } from '@shared/config/constant'
// Electron 主进程的 app 对象，代表整个应用的生命周期
import { app } from 'electron'
// Node.js 的文件系统和路径模块
import fs from 'fs'
import path from 'path'

// 初始化应用数据目录的函数
import { initAppDataDir } from './utils/init'

// 在应用启动时，检查是否是打包后的应用，如果是，则初始化应用数据目录
app.isPackaged && initAppDataDir()

// 从命令行参数里找有没有传--new-data-path=，如果有，说明用户要把应用的数据迁移到新的位置
function copyOccupiedDirsInMainProcess() {
  const newAppDataPath = process.argv
    .slice(1)
    .find((arg) => arg.startsWith('--new-data-path='))
    ?.split('--new-data-path=')[1]
  // 如果没找到，说明用户没有传--new-data-path=，说明用户没有要迁移数据的需求
  if (!newAppDataPath) {
    return
  }

  // 如果是windows平台
  if (process.platform === 'win32') {
    // 获取当前用户数据目录
    const appDataPath = app.getPath('userData')
    // 遍历occupiedDirs（比如缓存/配置/数据库文件夹）
    occupiedDirs.forEach((dir) => {
      const dirPath = path.join(appDataPath, dir)
      const newDirPath = path.join(newAppDataPath, dir)
      //如果原始目录存在，就复制到新的数据目录里
      if (fs.existsSync(dirPath)) {
        fs.cpSync(dirPath, newDirPath, { recursive: true })
      }
    })
  }
}

// 启动时执行一次，确保 在渲染进程（UI）还没起来之前，就先把这些关键文件复制过去
copyOccupiedDirsInMainProcess()
