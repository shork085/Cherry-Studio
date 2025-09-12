<template>
  <div class="form-gl-view">
    <header class="header">
      <h2>全局数据表单</h2>
      <router-link to="/" class="back-button">← 返回首页</router-link>
    </header>
    
    <main class="form-container">
      <div class="form-grid">
        <div class="form-section">
          <h3>基础信息</h3>
          <form @submit.prevent="handleSubmit" class="data-form">
            <div class="form-row">
              <div class="form-group">
                <label for="projectName">项目名称:</label>
                <input 
                  id="projectName" 
                  v-model="formData.projectName" 
                  type="text" 
                  required 
                  placeholder="请输入项目名称"
                />
              </div>
              
              <div class="form-group">
                <label for="projectType">项目类型:</label>
                <select id="projectType" v-model="formData.projectType" required>
                  <option value="">请选择类型</option>
                  <option value="web">Web应用</option>
                  <option value="mobile">移动应用</option>
                  <option value="desktop">桌面应用</option>
                  <option value="api">API服务</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="startDate">开始日期:</label>
                <input 
                  id="startDate" 
                  v-model="formData.startDate" 
                  type="date" 
                  required 
                />
              </div>
              
              <div class="form-group">
                <label for="endDate">结束日期:</label>
                <input 
                  id="endDate" 
                  v-model="formData.endDate" 
                  type="date" 
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="description">项目描述:</label>
              <textarea 
                id="description" 
                v-model="formData.description" 
                rows="3" 
                placeholder="请输入项目描述"
              ></textarea>
            </div>
          </form>
        </div>
        
        <div class="form-section">
          <h3>技术栈</h3>
          <div class="tech-stack">
            <div class="tech-group">
              <label>前端技术:</label>
              <div class="checkbox-group">
                <label v-for="tech in frontendTechs" :key="tech.value" class="checkbox-label">
                  <input 
                    type="checkbox" 
                    :value="tech.value" 
                    v-model="formData.frontendTechs"
                  />
                  {{ tech.label }}
                </label>
              </div>
            </div>
            
            <div class="tech-group">
              <label>后端技术:</label>
              <div class="checkbox-group">
                <label v-for="tech in backendTechs" :key="tech.value" class="checkbox-label">
                  <input 
                    type="checkbox" 
                    :value="tech.value" 
                    v-model="formData.backendTechs"
                  />
                  {{ tech.label }}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>数据配置</h3>
          <div class="data-config">
            <div class="form-group">
              <label for="dataSource">数据源:</label>
              <select id="dataSource" v-model="formData.dataSource" required>
                <option value="">请选择数据源</option>
                <option value="database">数据库</option>
                <option value="api">API接口</option>
                <option value="file">文件上传</option>
                <option value="manual">手动输入</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="updateFrequency">更新频率:</label>
              <select id="updateFrequency" v-model="formData.updateFrequency">
                <option value="realtime">实时</option>
                <option value="hourly">每小时</option>
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button @click="handleSubmit" class="submit-button" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交全局配置' }}
        </button>
        <button @click="resetForm" class="reset-button">
          重置表单
        </button>
        <button @click="previewData" class="preview-button">
          预览数据
        </button>
      </div>
      
      <div v-if="submittedData" class="submitted-data">
        <h3>已提交的全局配置:</h3>
        <pre>{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const formData = reactive({
  projectName: '',
  projectType: '',
  startDate: '',
  endDate: '',
  description: '',
  frontendTechs: [],
  backendTechs: [],
  dataSource: '',
  updateFrequency: 'daily'
})

const frontendTechs = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' }
]

const backendTechs = [
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' }
]

const submitting = ref(false)
const submittedData = ref(null)

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    window.parent.postMessage({
      type: 'FORM_SUBMIT',
      data: {
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'formView_gl',
        type: 'global_config'
      }
    }, '*')
    
    submittedData.value = { ...formData }
    alert('全局配置提交成功！')
    
  } catch (error) {
    console.error('提交失败:', error)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, {
    projectName: '',
    projectType: '',
    startDate: '',
    endDate: '',
    description: '',
    frontendTechs: [],
    backendTechs: [],
    dataSource: '',
    updateFrequency: 'daily'
  })
  submittedData.value = null
}

const previewData = () => {
  window.parent.postMessage({
    type: 'PREVIEW_DATA',
    data: {
      ...formData,
      timestamp: new Date().toISOString(),
      source: 'formView_gl'
    }
  }, '*')
}
</script>

<style scoped>
.form-gl-view {
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
  padding: 20px;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.form-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  font-size: 1.2rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
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

.tech-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tech-group label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  display: block;
}

.checkbox-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input {
  margin-right: 8px;
  width: auto;
}

.data-config {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 30px 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.submit-button,
.reset-button,
.preview-button {
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

.preview-button {
  background: #48bb78;
  color: white;
}

.preview-button:hover {
  background: #38a169;
}

.submitted-data {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style>
