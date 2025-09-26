// 前端路由入口

import '@renderer/databases'

// FC：React函数组件类型；useMemo:暂缓路由配置
import { FC, useMemo } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'

// 左侧导航栏
import Sidebar from './components/app/Sidebar'
// 顶部标签容器
import TabsContainer from './components/Tab/TabContainer'
// 全局导航事件处理
import NavigationHandler from './handler/NavigationHandler'
// 从设置中获取导航栏位置
import { useNavbarPosition } from './hooks/useSettings'
import AgentsPage from './pages/agents/AgentsPage'
import CodeToolsPage from './pages/code/CodeToolsPage'
import DataVizPage from './pages/dataviz/DataVizPage'
import FilesPage from './pages/files/FilesPage'
import HomePage from './pages/home/HomePage'
import KnowledgePage from './pages/knowledge/KnowledgePage'
import LaunchpadPage from './pages/launchpad/LaunchpadPage'
import MinAppsPage from './pages/minapps/MinAppsPage'
import PaintingsRoutePage from './pages/paintings/PaintingsRoutePage'
import SettingsPage from './pages/settings/SettingsPage'
import TranslatePage from './pages/translate/TranslatePage'

// 路由配置
const Router: FC = () => {
  const { navbarPosition } = useNavbarPosition()

  const routes = useMemo(() => {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/paintings/*" element={<PaintingsRoutePage />} />
        <Route path="/translate" element={<TranslatePage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/apps" element={<MinAppsPage />} />
        <Route path="/code" element={<CodeToolsPage />} />
        <Route path="/dataviz/*" element={<DataVizPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
        <Route path="/launchpad" element={<LaunchpadPage />} />
      </Routes>
    )
  }, [])

  // 根据导航栏位置切换布局
  if (navbarPosition === 'left') {
    return (
      <HashRouter>
        <LeftNavbarLayout>
          <Sidebar />
          <MainContent>
            {routes}
          </MainContent>
        </LeftNavbarLayout>
        <NavigationHandler />
      </HashRouter>
    )
  }

  return (
    <HashRouter>
      <NavigationHandler />
      <TabsContainer>{routes}</TabsContainer>
    </HashRouter>
  )
}

// 左侧导航栏布局样式
const LeftNavbarLayout = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: var(--sidebar-width, 60px);
  width: calc(100vw - var(--sidebar-width, 60px));
  height: 100vh;
  -webkit-app-region: no-drag;
`

export default Router
