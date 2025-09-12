import React from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components'

const DataVizPage: React.FC = () => {
  const location = useLocation()
  return (
    <Container>
      <Header>
        <Title>数据可视化</Title>
        <Tabs>
          <Tab to="home" $active={location.pathname.endsWith('/home')}>
            表单
          </Tab>
          <Tab to="charts" $active={location.pathname.endsWith('/charts')}>
            可视化图表
          </Tab>
          <Tab to="advanced" $active={location.pathname.endsWith('/advanced')}>
            高级3D
          </Tab>
        </Tabs>
      </Header>
      <Content>
        <Routes>
          <Route path="" element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomeFormPage />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="advanced" element={<AdvancedPage />} />
        </Routes>
      </Content>
    </Container>
  )
}

const HomeFormPage: React.FC = () => {
  return <Placeholder>这里是表单页面。</Placeholder>
}

const ChartsPage: React.FC = () => {
  return (
    <FlexFill>
      <SimpleChartPanel />
    </FlexFill>
  )
}

const AdvancedPage: React.FC = () => {
  return <Placeholder>这里是高级 3D 可视化页面</Placeholder>
}

const SimpleChartPanel: React.FC = () => {
  return <Placeholder>图表示例稍后加载</Placeholder>
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
`

const Title = styled.div`
  font-weight: 600;
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
`

const StyledLink = styled(NavLink)`
  text-decoration: none;
`

const Tab = styled(StyledLink)<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  background: ${(p) => (p.$active ? 'var(--color-primary-10)' : 'transparent')};
  color: ${(p) => (p.$active ? 'var(--color-primary)' : 'var(--color-text)')};
  border: 1px solid ${(p) => (p.$active ? 'var(--color-primary-20)' : 'var(--color-border)')};
`

const Content = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
`

const FlexFill = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
`

const Placeholder = styled.div`
  padding: 24px;
  color: var(--color-text-secondary);
`

export default DataVizPage
