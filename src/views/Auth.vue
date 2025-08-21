<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Logo区域 -->
      <div class="logo-section fade-in-up">
        <div class="logo">🌟 启明星</div>
        <div class="subtitle">AI驱动智慧学习与管理平台</div>
      </div>

      <!-- 切换标签 -->
      <div class="tab-section fade-in-up">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="登录" name="login">
            <div class="tab-content">
              <el-form 
                ref="loginFormRef" 
                :model="loginForm" 
                :rules="loginRules" 
                label-position="top"
                class="auth-form"
              >
                <el-form-item label="邮箱" prop="email">
                  <el-input 
                    v-model="loginForm.email" 
                    placeholder="请输入邮箱地址"
                    prefix-icon="Message"
                    size="large"
                  />
                </el-form-item>
                
                <el-form-item label="密码" prop="password">
                  <el-input 
                    v-model="loginForm.password" 
                    type="password" 
                    placeholder="请输入密码"
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
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane label="注册" name="register">
            <div class="tab-content">
              <el-form 
                ref="registerFormRef" 
                :model="registerForm" 
                :rules="registerRules" 
                label-position="top"
                class="auth-form"
              >
                <el-form-item label="邮箱" prop="email">
                  <el-input 
                    v-model="registerForm.email" 
                    placeholder="请输入邮箱地址"
                    prefix-icon="Message"
                    size="large"
                  />
                </el-form-item>
                
                <el-form-item label="密码" prop="password">
                  <el-input 
                    v-model="registerForm.password" 
                    type="password" 
                    placeholder="请输入密码"
                    prefix-icon="Lock"
                    size="large"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirmPassword">
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
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 功能特色 -->
      <div class="features-section fade-in-up">
        <div class="feature-item">
          <el-icon class="feature-icon"><Aim /></el-icon>
          <span>OKR目标管理</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><ChatDotRound /></el-icon>
          <span>AI智能助手</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Reading /></el-icon>
          <span>知识库问答</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

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
  confirmPassword: ''
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
  ]
}

// 方法
const handleTabClick = () => {
  // 切换标签时重置表单
  loginForm.email = ''
  loginForm.password = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loginLoading.value = true
    
    const result = await authStore.login(loginForm.email, loginForm.password)
    
    if (result.success) {
      ElMessage.success('登录成功！')
      router.push('/')
    } else {
      ElMessage.error(result.error || '登录失败，请重试')
    }
  } catch (error) {
    console.error('登录验证失败:', error)
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    registerLoading.value = true
    
    const result = await authStore.register(
      registerForm.email, 
      registerForm.password, 
      registerForm.confirmPassword
    )
    
    if (result.success) {
      ElMessage.success('注册成功！')
      router.push('/dashboard')
    } else {
      ElMessage.error(result.error || '注册失败，请重试')
    }
  } catch (error) {
    console.error('注册验证失败:', error)
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  border: 1px solid #f0f0f0;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 2.5rem;
  color: #409EFF;
  margin-bottom: 12px;
  font-weight: 700;
}

.subtitle {
  color: #606266;
  font-size: 1rem;
  font-weight: 400;
}

.tab-section {
  margin-bottom: 30px;
}

.tab-content {
  padding: 20px 0;
}

.auth-form {
  width: 100%;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.features-section {
  display: flex;
  justify-content: space-around;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 0.9rem;
}

.feature-icon {
  font-size: 1.5rem;
  color: #409EFF;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-card {
    padding: 30px 20px;
    margin: 20px;
  }
  
  .logo {
    font-size: 2rem;
  }
  
  .features-section {
    flex-direction: column;
    gap: 20px;
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
  color: #409EFF;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: #409EFF;
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
  box-shadow: 0 0 0 1px #409EFF inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF inset;
}
</style>
