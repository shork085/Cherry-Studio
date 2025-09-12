import { defineCustomElement } from 'vue'

import App from './App.vue'

const AppElement = defineCustomElement(App)
customElements.define('data-viz-app', AppElement)
