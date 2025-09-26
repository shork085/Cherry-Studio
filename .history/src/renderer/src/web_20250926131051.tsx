import { createRoot } from 'react-dom/client'
import WebChatPage from './pages/WebChatPage'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<WebChatPage />)
}

// import './shims/electron-web'
// import React from 'react'
// import { createRoot } from 'react-dom/client'
// import AppWeb from './AppWeb'

// const container = document.getElementById('root')
// if (container) {
//   const root = createRoot(container)
//   root.render(<AppWeb />)
//   // root.render(<div>ok</div>)
// }
