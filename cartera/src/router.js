import { createRouter, createWebHistory } from 'vue-router'
import Projects from './views/Projects.vue'
import Create from './views/Create.vue'
import Edit from './views/Edit.vue'
import Statistics from './views/Statistics.vue'
import Home from './views/Home.vue'
import Doc from './views/documents.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/projects', component: Projects },
  { path: '/create', component: Create },
  { path: '/edit/:id', component: Edit, props: true },
  { path: '/statistics', component: Statistics },
  { path: '/documents', component: Doc },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router