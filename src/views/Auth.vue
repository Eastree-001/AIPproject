<template>
  <div class="auth-container">
    <!-- 左侧信息展示区域 -->
    <div class="info-section">
      <div class="info-content">
        <div class="platform-info">
          <div class="platform-icon">
            <el-icon size="48"><Star /></el-icon>
          </div>
          <h1 class="platform-title">启明星学习平台</h1>
          <h2 class="platform-slogan">让AI成为您的学习伙伴</h2>
          <p class="platform-description">
            三级AI智能体深度参与学习全流程，从课程推荐到智能辅导，让每次学习都拥有AI的智慧加持。
          </p>
        </div>
        
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="24"><Reading /></el-icon>
            </div>
            <div class="feature-content">
              <h3>AI学习助手</h3>
              <p>智能推荐课程、跟踪进度、优化学习路径</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="24"><ChatDotRound /></el-icon>
            </div>
            <div class="feature-content">
              <h3>智能协作辅导</h3>
              <p>任务细化、知识解答、文档整理，让学习更高效</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="24"><TrendCharts /></el-icon>
            </div>
            <div class="feature-content">
              <h3>集体智慧宝库</h3>
              <p>每个学习者的经验都成为平台的共享智慧</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录注册表单区域 -->
    <div class="form-section">
      <div class="form-container">
        <div class="form-header">
          <h2 class="welcome-title">欢迎回来</h2>
          <p class="welcome-subtitle">登录您的启明星学习平台账户</p>
        </div>

        <el-tabs v-model="activeTab" class="auth-tabs" @tab-click="handleTabClick">
          <!-- 登录标签页 -->
          <el-tab-pane label="登录" name="login">
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              class="auth-form"
              size="large"
            >
              <el-form-item prop="email">
                <el-input
                  v-model="loginForm.email"
                  placeholder="请输入您的邮箱地址"
                  prefix-icon="Message"
                  size="large"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入您的密码"
                  prefix-icon="Lock"
                  size="large"
                  show-password
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="loginLoading"
                  @click="handleLogin"
                >
                  登录
                  <el-icon class="btn-icon"><ArrowRight /></el-icon>
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 注册标签页 -->
          <el-tab-pane label="注册" name="register">
            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              class="auth-form"
              size="large"
            >
              <el-form-item prop="email">
                <el-input
                  v-model="registerForm.email"
                  placeholder="请输入您的邮箱地址"
                  prefix-icon="Message"
                  size="large"
                />
              </el-form-item>

              <el-form-item prop="name">
                <el-input
                  v-model="registerForm.name"
                  placeholder="请输入您的姓名"
                  prefix-icon="User"
                  size="large"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  size="large"
                  show-password
                />
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  prefix-icon="Lock"
                  size="large"
                  show-password
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="registerLoading"
                  @click="handleRegister"
                >
                  注册
                  <el-icon class="btn-icon"><ArrowRight /></el-icon>
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <!-- 底部链接 -->
        <div class="form-footer">
          <p v-if="activeTab === 'login'">
            还没有账户？
            <el-button type="text" @click="activeTab = 'register'">立即注册</el-button>
          </p>
          <p v-else>
            已有账户？
            <el-button type="text" @click="activeTab = 'login'">立即登录</el-button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { testConnection } from '../lib/supabase'
import { 
  Star, 
  Reading, 
  ChatDotRound, 
  TrendCharts, 
  ArrowRight 
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('login')
const loginFormRef = ref()
const registerFormRef = ref()
const loginLoading = ref(false)
const registerLoading = ref(false)

// 表单数据
const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: ''
})

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, message: '姓名长度不能少于2位', trigger: 'blur' }
  ]
}

// 组件挂载时测试连接
onMounted(async () => {
  try {
    const isConnected = await testConnection()
    if (isConnected) {
      console.log('✅ Supabase 连接正常')
    } else {
      console.warn('⚠️ Supabase 连接异常')
    }
  } catch (error) {
    console.error('❌ Supabase 连接测试失败:', error)
  }
})

// 方法
const handleTabClick = () => {
  // 切换标签时重置表单
  loginForm.email = ''
  loginForm.password = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.name = ''
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loginLoading.value = true
    
    console.log('开始登录流程...')
    console.log('登录表单数据:', { email: loginForm.email, password: '***' })
    
    const result = await authStore.login(loginForm.email, loginForm.password)
    
    console.log('登录结果:', result)
    
    if (result.success) {
      ElMessage.success('登录成功！欢迎回来！')
      console.log('登录成功，准备跳转')
      
      // 等待一小段时间确保状态更新
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 检查认证状态
      console.log('跳转前认证状态检查:', {
        isAuthenticated: authStore.isAuthenticated,
        user: !!authStore.user,
        session: !!authStore.session
      })
      
      // 跳转到首页，让用户选择下一步操作
      await router.push('/')
      console.log('路由跳转完成')
    } else {
      ElMessage.error(result.error || '登录失败，请检查邮箱和密码')
      console.error('登录失败:', result.error)
    }
  } catch (error) {
    console.error('登录验证失败:', error)
    ElMessage.error('登录失败，请重试')
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    registerLoading.value = true
    
    console.log('开始注册流程...')
    console.log('注册表单数据:', { 
      email: registerForm.email, 
      password: '***', 
      name: registerForm.name 
    })
    
    // 准备用户数据
    const userData = {
      name: registerForm.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.name}`
    }
    
    const result = await authStore.register(
      registerForm.email, 
      registerForm.password, 
      userData
    )
    
    console.log('注册结果:', result)
    
    if (result.success) {
      ElMessage.success('注册成功！欢迎加入启明星平台！')
      // 注册成功后自动切换到登录标签
      activeTab.value = 'login'
      // 清空注册表单
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.name = ''
      // 将邮箱填入登录表单
      loginForm.email = result.user.email
    } else {
      ElMessage.error(result.error || '注册失败，请重试')
      console.error('注册失败:', result.error)
    }
  } catch (error) {
    console.error('注册验证失败:', error)
    ElMessage.error('注册失败，请重试')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.info-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #ffffff;
}

.info-content {
  text-align: center;
  max-width: 500px;
}

.platform-info {
  margin-bottom: 40px;
}

.platform-icon {
  margin-bottom: 12px;
}

.platform-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.platform-slogan {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
}

.platform-description {
  font-size: 1rem;
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 20px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  text-align: left;
}

.feature-icon {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #ffffff;
}

.feature-content p {
  font-size: 0.9rem;
  color: #e0e0e0;
  line-height: 1.5;
  margin: 0;
}

.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-container {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #303133;
}

.welcome-subtitle {
  font-size: 0.9rem;
  color: #909399;
  margin-bottom: 0;
}

.auth-tabs {
  margin-bottom: 30px;
}

.auth-form {
  margin-bottom: 20px;
}

.auth-form .el-form-item {
  margin-bottom: 20px;
}

.auth-form .el-input {
  border-radius: 12px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  margin-left: 8px;
}

.form-footer {
  text-align: center;
  font-size: 0.9rem;
  color: #909399;
}

.form-footer p {
  margin-bottom: 0;
}

.form-footer .el-button {
  color: #667eea;
  font-weight: 500;
  padding: 0;
  margin-left: 4px;
}

.form-footer .el-button:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .auth-container {
    flex-direction: column;
    height: auto;
  }

  .info-section, .form-section {
    width: 100%;
    padding: 20px;
  }

  .info-section {
    order: 2;
  }

  .form-section {
    order: 1;
  }

  .form-container {
    padding: 30px 20px;
    margin: 0;
  }

  .welcome-title {
    font-size: 1.8rem;
  }

  .welcome-subtitle {
    font-size: 0.8rem;
  }

  .platform-title {
    font-size: 2rem;
  }

  .platform-slogan {
    font-size: 1rem;
  }

  .platform-description {
    font-size: 0.9rem;
  }

  .features-list {
    flex-direction: row;
    justify-content: space-around;
    gap: 15px;
  }

  .feature-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
  }

  .feature-content h3 {
    font-size: 1rem;
  }

  .feature-content p {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .info-section, .form-section {
    padding: 15px;
  }

  .form-container {
    padding: 25px 20px;
  }

  .platform-title {
    font-size: 1.8rem;
  }

  .platform-slogan {
    font-size: 0.9rem;
  }

  .platform-description {
    font-size: 0.8rem;
  }

  .features-list {
    flex-direction: column;
    gap: 20px;
  }

  .feature-item {
    flex-direction: row;
    text-align: left;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .platform-title {
    font-size: 1.6rem;
  }

  .welcome-title {
    font-size: 1.6rem;
  }

  .form-container {
    padding: 20px 15px;
  }
}

/* 标签页样式优化 */
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #f0f0f0;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  color: #909399;
}

:deep(.el-tabs__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 3px;
  border-radius: 2px;
}

/* 表单样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #e4e7ed inset;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #667eea inset;
}

/* 动画效果 */
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
