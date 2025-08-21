import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/Auth.vue'),
    meta: { requiresGuest: true }
  },

  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: () => import('../views/StudentDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/Courses.vue')
  },
  {
    path: '/ai-tutor',
    name: 'AITutor',
    component: () => import('../views/AITutor.vue')
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import('../views/Progress.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('../views/Community.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果访问需要认证的页面但未登录，跳转到登录页
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth')
  } 
  // 如果未登录用户访问首页，跳转到登录页
  else if (to.path === '/' && !authStore.isAuthenticated) {
    next('/auth')
  }
  // 如果已登录用户访问登录页，跳转到首页
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } 
  // 其他情况正常通过
  else {
    next()
  }
})

export default router
