import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

// 创建Vue应用
const app = createApp(App)

// 使用Pinia状态管理
app.use(createPinia())

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')

// 通知父窗口应用已准备就绪
window.parent.postMessage(
  {
    type: 'DATAVIZ_READY',
    data: { timestamp: Date.now() }
  },
  '*'
)

// 监听来自父窗口的消息
window.addEventListener('message', (event) => {
  const { type, data } = event.data

  switch (type) {
    case 'CHERRY_DATA':
      console.log('收到来自Cherry Studio的数据:', data)
      // 这里可以处理来自Cherry Studio的数据
      break
    default:
      console.log('收到未知消息类型:', type, data)
  }
})
