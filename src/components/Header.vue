<template>
  <header class="header">
    <div class="header-container">
      <!-- Logo区域 -->
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <div class="logo">
            <span class="logo-icon">🌟</span>
            <span class="logo-text">启明星</span>
          </div>
          <div class="logo-subtitle">AI驱动智慧学习平台</div>
        </router-link>
      </div>

      <!-- 主导航菜单 -->
      <nav class="main-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">
              <el-icon><House /></el-icon>
              首页
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/courses" class="nav-link" active-class="active">
              <el-icon><Reading /></el-icon>
              课程学习
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/ai-tutor" class="nav-link" active-class="active">
              <el-icon><ChatDotRound /></el-icon>
              AI导师
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/progress" class="nav-link" active-class="active">
              <el-icon><TrendCharts /></el-icon>
              学习进度
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/community" class="nav-link" active-class="active">
              <el-icon><UserFilled /></el-icon>
              学习社区
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/notifications" class="nav-link" active-class="active">
              <el-icon><Bell /></el-icon>
              通知中心
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/learning-records" class="nav-link" active-class="active">
              <el-icon><Document /></el-icon>
              学习记录
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 右侧功能区 -->
      <div class="header-right">
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索课程、知识点..."
            prefix-icon="Search"
            size="large"
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- 通知图标 -->
        <div class="notification-icon">
          <el-badge :value="notificationCount" :hidden="notificationCount === 0">
            <el-button
              type="text"
              size="large"
              class="notification-btn"
              @click="showNotifications"
            >
              <el-icon size="20"><Bell /></el-icon>
            </el-button>
          </el-badge>
        </div>

        <!-- 用户头像和下拉菜单 -->
        <div class="user-section" v-if="isLoggedIn">
          <el-dropdown @command="handleUserCommand" trigger="click">
            <div class="user-avatar">
              <el-avatar 
                :size="40" 
                :src="userAvatar" 
                :alt="userName"
                class="avatar"
              />
              <span class="user-name">{{ userName }}</span>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item command="notifications">
                  <el-icon><Bell /></el-icon>
                  通知中心
                </el-dropdown-item>
                <el-dropdown-item command="learning-records">
                  <el-icon><Document /></el-icon>
                  学习记录
                </el-dropdown-item>
                <el-dropdown-item command="help">
                  <el-icon><QuestionFilled /></el-icon>
                  帮助中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 未登录状态 -->
        <div class="auth-buttons" v-else>
          <el-button 
            type="text" 
            size="large" 
            class="login-btn"
            @click="goToLogin"
          >
            登录
          </el-button>
          <el-button 
            type="primary" 
            size="large" 
            class="register-btn"
            @click="goToRegister"
          >
            注册
          </el-button>
        </div>
      </div>

      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn" @click="toggleMobileMenu">
        <el-icon size="24"><Menu /></el-icon>
      </div>
    </div>

    <!-- 移动端导航菜单 -->
    <div class="mobile-nav" :class="{ 'mobile-nav-open': isMobileMenuOpen }">
      <div class="mobile-nav-header">
        <div class="mobile-logo">
          <span class="logo-icon">🌟</span>
          <span class="logo-text">启明星</span>
        </div>
        <el-button 
          type="text" 
          class="close-btn"
          @click="toggleMobileMenu"
        >
          <el-icon size="24"><Close /></el-icon>
        </el-button>
      </div>
      <nav class="mobile-nav-menu">
        <ul class="mobile-nav-list">
          <li class="mobile-nav-item">
            <router-link to="/" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><House /></el-icon>
              首页
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/courses" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><Reading /></el-icon>
              课程学习
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/ai-tutor" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><ChatDotRound /></el-icon>
              AI导师
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/progress" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><TrendCharts /></el-icon>
              学习进度
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/community" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><UserFilled /></el-icon>
              学习社区
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/notifications" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><Bell /></el-icon>
              通知中心
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/learning-records" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><Document /></el-icon>
              学习记录
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  House, 
  Reading, 
  ChatDotRound, 
  TrendCharts, 
  UserFilled,
  Search,
  Bell,
  ArrowDown,
  User,
  Setting,
  QuestionFilled,
  SwitchButton,
  Menu,
  Close,
  Document
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const searchQuery = ref('')
const notificationCount = ref(3)
const isMobileMenuOpen = ref(false)

// 路由和状态管理
const router = useRouter()
const authStore = useAuthStore()

// 计算属性
const isLoggedIn = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.name || '用户')
const userAvatar = computed(() => authStore.user?.avatar || '')

// 方法
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 暂时显示搜索提示，后续可以集成到课程页面
    ElMessage.info(`搜索: ${searchQuery.value.trim()}`)
    searchQuery.value = ''
  }
}

const showNotifications = () => {
  // 跳转到通知中心页面
  router.push('/notifications')
}

const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'notifications':
      router.push('/notifications')
      break
    case 'learning-records':
      router.push('/learning-records')
      break
    case 'help':
      router.push('/help')
      break
    case 'logout':
      authStore.logout()
      router.push('/auth')
      break
  }
}

const goToLogin = () => {
  router.push('/auth')
}

const goToRegister = () => {
  router.push('/auth?tab=register')
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo区域 */
.logo-section {
  flex-shrink: 0;
}

.logo-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 28px;
  animation: twinkle 2s ease-in-out infinite;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  font-size: 12px;
  color: #666;
  margin-top: -2px;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 主导航菜单 */
.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 6px;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-2px);
}

.nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-link .el-icon {
  font-size: 14px;
}

/* 右侧功能区 */
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

/* 搜索框 */
.search-box {
  position: relative;
  flex-shrink: 0;
}

.search-input {
  width: 240px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 25px;
  background: #f8f9fa;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 通知图标 */
.notification-btn {
  color: #666;
  transition: all 0.3s ease;
}

.notification-btn:hover {
  color: #667eea;
  transform: scale(1.1);
}

/* 用户区域 */
.user-section {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  background: rgba(102, 126, 234, 0.1);
}

.avatar {
  border: 2px solid #667eea;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.dropdown-arrow {
  color: #999;
  transition: transform 0.3s ease;
}

.user-avatar:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* 认证按钮 */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-btn {
  color: #666;
  font-weight: 500;
}

.login-btn:hover {
  color: #667eea;
}

.register-btn {
  border-radius: 25px;
  padding: 10px 20px;
  font-weight: 500;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

/* 移动端导航 */
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1001;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.mobile-nav-open {
  transform: translateX(0);
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-nav-menu {
  padding: 20px 0;
}

.mobile-nav-list {
  list-style: none;
}

.mobile-nav-item {
  border-bottom: 1px solid #f5f5f5;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
}

.mobile-nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.mobile-nav-link .el-icon {
  font-size: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .search-input {
    width: 200px;
  }
  
  .nav-link {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .nav-list {
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }
  
  .main-nav,
  .search-box,
  .notification-icon,
  .user-section,
  .auth-buttons {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .logo-subtitle {
    display: none;
  }
  
  .logo-text {
    font-size: 20px;
  }
  
  .logo-icon {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .header-container {
    height: 70px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .logo-icon {
    font-size: 22px;
  }
}
</style>
