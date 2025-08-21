import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { checkEnvironmentVariables, validateSupabaseConfig, getEnvironmentInfo } from './utils/env-check'

// 环境变量检查
console.log('🚀 启动启明星平台...')
console.log('📋 环境信息:', getEnvironmentInfo())

const envCheck = checkEnvironmentVariables()
if (!envCheck) {
  console.error('❌ 环境变量配置不完整，应用可能无法正常工作')
}

const supabaseCheck = validateSupabaseConfig()
if (!supabaseCheck.valid) {
  console.error('❌ Supabase 配置无效:', supabaseCheck.error)
}

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

// 初始化认证状态
const pinia = app._context.provides.pinia
const authStore = useAuthStore(pinia)

// 等待认证初始化完成后再挂载应用
const initializeApp = async () => {
  try {
    console.log('🔐 初始化认证系统...')
    const subscription = authStore.initAuth()
    
    // 等待一小段时间确保认证状态已加载
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('✅ 认证系统初始化完成')
    console.log('👤 当前用户状态:', authStore.user)
    console.log('🔑 认证状态:', authStore.isAuthenticated)
    
    // 挂载应用
    app.mount('#app')
    
    // 清理订阅（如果需要）
    if (subscription) {
      // 在应用卸载时清理订阅
      window.addEventListener('beforeunload', () => {
        if (subscription && subscription.unsubscribe) {
          subscription.unsubscribe()
        }
      })
    }
  } catch (error) {
    console.error('❌ 认证系统初始化失败:', error)
    // 即使认证失败也挂载应用
    app.mount('#app')
  }
}

// 启动应用
initializeApp()
