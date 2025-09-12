// 前端根组件

// 启动时加载数据库相关的初始化逻辑
import '@renderer/databases'

// 引入日志服务
import { loggerService } from '@logger'

// 全局状态管理
// 让整个应用都可访问redux store，提供全局状态管理
// 配合redux-persist使用，可以把 Redux 状态持久化到本地（比如刷新后还能恢复之前的状态）
import TestAssistants from './components/TestAssistants'
// 一个全局UI容器，放置一些全局浮层
// 组件全局主题/语言
// 代码样式
// 全局消息通知样式
// 管理CSS样式表
// 提供全局主题
// 应用路由入口

// 打印日志带上下文
const logger = loggerService.withContext('App.tsx')

function App(): React.ReactElement {
  logger.info('App initialized')

  // return (
  //   <Provider store={store}>
  //     {/* 样式和主题层 */}
  //     <StyleSheetManager>
  //       <ThemeProvider>
  //         <AntdProvider>
  //           {/* 功能层 */}
  //           <NotificationProvider>
  //             <CodeStyleProvider>
  //               {/* 状态持久化层 */}
  //               <PersistGate loading={null} persistor={persistor}>
  //                 {/* UI容器 */}
  //                 <TopViewContainer>
  //                   {/* 页面路由（渲染实际页面） */}
  //                   <Router />
  //                   <TestAssistants />
  //                 </TopViewContainer>
  //               </PersistGate>
  //             </CodeStyleProvider>
  //           </NotificationProvider>
  //         </AntdProvider>
  //       </ThemeProvider>
  //     </StyleSheetManager>
  //   </Provider>
  // )
  return (
    <div>
      <TestAssistants />
    </div>
  )
}

export default App
