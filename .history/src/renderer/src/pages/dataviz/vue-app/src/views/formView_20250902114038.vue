<template>
  <div class="form-view">
    <header class="header">
      <h2>数据表单</h2>
      <router-link to="/" class="back-button">← 返回首页</router-link>
    </header>
    
    <main class="form-container">
      <form @submit.prevent="handleSubmit" class="data-form">
        <div class="form-group">
          <label for="name">名称:</label>
          <input 
            id="name" 
            v-model="formData.name" 
            type="text" 
            required 
            placeholder="请输入名称"
          />
        </div>
        
        <div class="form-group">
          <label for="email">邮箱:</label>
          <input 
            id="email" 
            v-model="formData.email" 
            type="email" 
            required 
            placeholder="请输入邮箱"
          />
        </div>
        
        <div class="form-group">
          <label for="category">类别:</label>
          <select id="category" v-model="formData.category" required>
            <option value="">请选择类别</option>
            <option value="analysis">数据分析</option>
            <option value="visualization">数据可视化</option>
            <option value="report">报告生成</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="description">描述:</label>
          <textarea 
            id="description" 
            v-model="formData.description" 
            rows="4" 
            placeholder="请输入描述信息"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="submit-button" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交数据' }}
          </button>
          <button type="button" @click="resetForm" class="reset-button">
            重置表单
          </button>
        </div>
      </form>
      
      <div v-if="submittedData" class="submitted-data">
        <h3>已提交的数据:</h3>
        <pre>{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const formData = reactive({
  name: '',
  email: '',
  category: '',
  description: ''
})

const submitting = ref(false)
const submittedData = ref(null)

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 发送数据到父窗口
    window.parent.postMessage({
      type: 'FORM_SUBMIT',
      data: {
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'formView'
      }
    }, '*')
    
    submittedData.value = { ...formData }
    alert('数据提交成功！')
    
  } catch (error) {
    console.error('提交失败:', error)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    email: '',
    category: '',
    description: ''
  })
  submittedData.value = null
}
</script>

<style scoped>
.form-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header h2 {
  margin: 0;
  color: #1a202c;
  font-size: 1.5rem;
}

.back-button {
  color: #4299e1;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #ebf8ff;
}

.form-container {
  flex: 1;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.data-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.submit-button,
.reset-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button {
  background: #4299e1;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #3182ce;
}

.submit-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.reset-button {
  background: #e2e8f0;
  color: #4a5568;
}

.reset-button:hover {
  background: #cbd5e0;
}

.submitted-data {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 20px;
}

.submitted-data h3 {
  margin: 0 0 15px 0;
  color: #22543d;
}

.submitted-data pre {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #c6f6d5;
  font-size: 12px;
  overflow-x: auto;
}
</style>
