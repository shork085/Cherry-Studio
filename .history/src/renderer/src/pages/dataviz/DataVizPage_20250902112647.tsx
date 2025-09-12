import VueContainer from '@renderer/components/VueContainer'
import { Card } from 'antd'
import React from 'react'
import styled from 'styled-components'

// 这里需要导入你的Vue组件
// 暂时创建一个示例Vue组件
const SampleVueComponent = {
  template: `
    <div style="padding: 20px;">
      <h2>数据可视化页面</h2>
      <p>这是一个Vue组件，已成功集成到React应用中！</p>
      <div style="background: #f0f2f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>待集成的功能：</h3>
        <ul>
          <li>表单提交逻辑</li>
          <li>数据可视化图表</li>
          <li>交互功能</li>
        </ul>
      </div>
    </div>
  `
}

const PageContainer = styled.div`
  height: 100vh;
  padding: 20px;
  background: var(--color-background);
`

const DataVizCard = styled(Card)`
  height: calc(100vh - 40px);

  .ant-card-body {
    height: 100%;
    padding: 0;
  }
`

/**
 * 数据可视化页面
 */
const DataVizPage: React.FC = () => {
  const handleVueMounted = (vueApp: any) => {
    console.log('Vue应用已挂载:', vueApp)
  }

  return (
    <PageContainer>
      <DataVizCard title="数据可视化">
        <VueContainer component={SampleVueComponent} onMounted={handleVueMounted} />
      </DataVizCard>
    </PageContainer>
  )
}

export default DataVizPage
