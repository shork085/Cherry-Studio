import { defineCustomElement } from 'vue'

import App from './App.vue'

// 将根组件封装为自定义元素，标签名固定为 data-viz-app
const DataVizElement = defineCustomElement(App)

// 避免重复注册
if (!customElements.get('data-viz-app')) {
  customElements.define('data-viz-app', DataVizElement)
}

export {}
