#!/usr/bin/env node

/**
 * Vue应用启动脚本
 * 用于在开发环境下启动Vue数据可视化应用
 */

const { spawn } = require('child_process')
const path = require('path')

const vueAppPath = path.join(__dirname, 'vue-app')

console.log('🚀 启动Vue数据可视化应用...')
console.log(`📁 应用路径: ${vueAppPath}`)

// 启动Vue开发服务器
const vueProcess = spawn('npm', ['run', 'dev'], {
  cwd: vueAppPath,
  stdio: 'inherit',
  shell: true
})

vueProcess.on('error', (error) => {
  console.error('❌ Vue应用启动失败:', error.message)
  process.exit(1)
})

vueProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Vue应用异常退出，退出码: ${code}`)
  } else {
    console.log('✅ Vue应用已停止')
  }
})

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止Vue应用...')
  vueProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 正在停止Vue应用...')
  vueProcess.kill('SIGTERM')
})

console.log('✅ Vue应用启动成功！')
console.log('🌐 访问地址: http://localhost:3001')
console.log('📝 按 Ctrl+C 停止应用')
