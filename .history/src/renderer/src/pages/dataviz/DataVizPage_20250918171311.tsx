import { Navbar, NavbarLeft } from '@renderer/components/app/Navbar'
import { useNavbarPosition } from '@renderer/hooks/useSettings'
import { getTitleLabel } from '@renderer/i18n/label'
import { Input } from 'antd'
import { Search } from 'lucide-react'
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
  const [search, setSearch] = React.useState('')
  const { isLeftNavbar } = useNavbarPosition()

  const isHome = location.pathname.endsWith('/home')

  return (
    <Container>
      {/* 导航栏在左侧时 */}
      {isLeftNavbar && (
        <Navbar>
          <NavbarLeft>
            <LeftTopBar>
              <Title>{getTitleLabel('dataviz')}</Title>
              <Tabs>
                <Tab to="home" $active={isHome}>
                  表单
                </Tab>
                <Tab to="charts" $active={location.pathname.endsWith('/charts')}>
                  可视化图表
                </Tab>
                <Tab to="advanced" $active={location.pathname.endsWith('/advanced')}>
                  3D图表
                </Tab>
              </Tabs>
              {isHome && (
                <HeaderRight>
                  <Input
                    placeholder="原料代码或描述..."
                    className="nodrag"
                    style={{
                      width: '65%',
                      height: 28,
                      borderRadius: 15,
                      background: '#fff',
                      left: 10
                    }}
                    size="small"
                    suffix={<Search size={18} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </HeaderRight>
              )}
              {isHome && (
                <CenterBox>
                  <Input
                    placeholder="输入配比..."
                    className="nodrag"
                    style={{
                      width: '50%',
                      height: 28,
                      borderRadius: 15,
                      background: '#fff',
                      left: 0
                    }}
                    size="small"
                  />
                </CenterBox>
              )}
            </LeftTopBar>
          </NavbarLeft>
        </Navbar>
      )}

      {/* 导航栏在顶部 */}
      {!isLeftNavbar && (
        <Header>
          <Tabs>
            <Tab to="home" $active={isHome}>
              表单
            </Tab>
            <Tab to="charts" $active={location.pathname.endsWith('/charts')}>
              可视化图表
            </Tab>
            <Tab to="advanced" $active={location.pathname.endsWith('/advanced')}>
              3D图表
            </Tab>
          </Tabs>
          {isHome && (
            <CenterBox>
              <Input
                placeholder="输入配比..."
                className="nodrag"
                style={{
                  width: '50%',
                  height: 28,
                  borderRadius: 15,
                  background: '#fff',
                  left: '100%'
                }}
                size="small"
              />
            </CenterBox>
          )}
          {isHome && (
            <HeaderRight>
              <Input
                placeholder="原料代码或描述..."
                className="nodrag"
                style={{
                  width: '90%',
                  height: 28,
                  borderRadius: 15,
                  background: '#fff'
                }}
                size="small"
                suffix={<Search size={18} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </HeaderRight>
          )}
        </Header>
      )}
      <Content>
        <Routes>
          <Route path="" element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomeFormPage searchKeyword={search} />} />
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
  [navbar-position='left'] & {
    max-width: calc(100vw - var(--sidebar-width));
  }
  [navbar-position='top'] & {
    max-width: 100vw;
  }
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
  color: var(--color-text-1);
`

// reserved for future use

const LeftTopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: none;
  width: 100%;
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  -webkit-app-region: none;
`

const CenterBox = styled.div`
  display: flex;
  justify-content: flex-start;
  -webkit-app-region: none;
`

const HeaderRight = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  -webkit-app-region: none;
`

const StyledLink = styled(NavLink)`
  text-decoration: none;
`

const Tab = styled(StyledLink)<{ $active?: boolean }>`
  padding: 4px 12px;
  border-radius: 8px;
  height: 30px;
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
