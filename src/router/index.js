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
    path: '/supabase-test',
    name: 'SupabaseTest',
    component: () => import('../views/SupabaseTest.vue')
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
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  },
          {
          path: '/help',
          name: 'Help',
          component: () => import('../views/Help.vue')
        },
        {
          path: '/notifications',
          name: 'Notifications',
          component: () => import('../views/Notifications.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/learning-records',
          name: 'LearningRecords',
          component: () => import('../views/LearningRecords.vue'),
          meta: { requiresAuth: true }
        }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 延迟执行，确保 Pinia store 已经初始化
  await new Promise(resolve => setTimeout(resolve, 0))
  
  try {
    const authStore = useAuthStore()
    
    console.log('🔐 路由守卫检查:', {
      to: to.path,
      from: from.path,
      isAuthenticated: authStore.isAuthenticated,
      user: !!authStore.user,
      session: !!authStore.session
    })
    
    // 如果访问需要认证的页面但未登录，跳转到登录页
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      console.log('🚫 需要认证，跳转到登录页')
      next('/auth')
    } 
    // 如果已登录用户访问登录页，跳转到首页
    else if (to.meta.requiresGuest && authStore.isAuthenticated) {
      console.log('✅ 已登录用户访问登录页，跳转到首页')
      next('/')
    } 
    // 其他情况正常通过（包括首页访问）
    else {
      console.log('✅ 路由检查通过')
      next()
    }
  } catch (error) {
    console.error('❌ 路由守卫错误:', error)
    // 如果出现错误，允许访问但记录错误
    next()
  }
})

export default router
