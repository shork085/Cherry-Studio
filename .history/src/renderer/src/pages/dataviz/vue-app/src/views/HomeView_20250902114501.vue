<template>
  <div class="home-view">
    <header class="header">
      <h1>数据可视化分析</h1>
      <p>欢迎使用Cherry Studio数据可视化模块</p>
    </header>

    <main class="main-content">
      <div class="navigation">
        <router-link to="/form" class="nav-button">
          表单视图
        </router-link>
        <router-link to="/form-gl" class="nav-button">
          全局表单视图
        </router-link>
      </div>

      <div class="status">
        <p>连接状态: <span class="status-connected">已连接</span></p>
        <p>最后更新: {{ lastUpdate }}</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const lastUpdate = ref('')

onMounted(() => {
  lastUpdate.value = new Date().toLocaleString()

  // 请求数据
  window.parent.postMessage({
    type: 'REQUEST_DATA',
    data: { source: 'home' }
  }, '*')
})
</script>

<style scoped>
.home-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 300;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.navigation {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.nav-button {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.status {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.status p {
  margin: 8px 0;
  font-size: 0.9rem;
}

.status-connected {
  color: #4ade80;
  font-weight: 600;
}
</style>
