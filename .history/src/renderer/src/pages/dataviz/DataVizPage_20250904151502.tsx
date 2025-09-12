import React from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
// 在JS中写样式
import styled from 'styled-components'

import AdvancedPage from './AdvancedPage'
import ChartsPage from './ChartsPage'
import HomeFormPage from './HomeFormPage'

// 主组件
const DataVizPage: React.FC = () => {
  const location = useLocation()
  return (
    <Container>
      <Header>
        <Title>
          <TabIcon />
          数据可视化
        </Title>
        <Tabs>
          <Tab to="home" $active={location.pathname.endsWith('/home')}>
            表单
          </Tab>
          <Tab to="charts" $active={location.pathname.endsWith('/charts')}>
            可视化图表
          </Tab>
          <Tab to="advanced" $active={location.pathname.endsWith('/advanced')}>
            3D图表
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
  display: flex;
  align-items: center;

  svg {
    margin-right: 6px;
  }
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

export default DataVizPage

const TabIcon = () => (
  <svg viewBox="0 0 1024 1024" width="18" height="18">
    <path
      d="M512 96c229.75 0 416 186.25 416 416S741.75 928 512 928 96 741.75 96 512 282.25 96 512 96zm0 64C317.9 160 160 317.9 160 512s157.9 352 352 352 352-157.9 352-352S706.1 160 512 160z"
      fill="currentColor"
    />
    <path
      d="M512 272a32 32 0 0132 32v176h176a32 32 0 010 64H512a32 32 0 01-32-32V304a32 32 0 0132-32z"
      fill="currentColor"
    />
  </svg>
)
