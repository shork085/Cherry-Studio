import { createRouter, createWebHistory } from 'vue-router'

import FormView from '../views/formView.vue'
import FormViewGl from '../views/formView_gl.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory('/dataviz/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/form',
      name: 'form',
      component: FormView
    },
    {
      path: '/form-gl',
      name: 'form-gl',
      component: FormViewGl
    }
  ]
})

export default router
