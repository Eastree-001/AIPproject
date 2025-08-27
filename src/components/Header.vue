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

      <!-- 移动端搜索框 -->
      <div class="mobile-search">
        <el-input
          v-model="searchQuery"
          placeholder="搜索课程、知识点..."
          prefix-icon="Search"
          size="large"
          class="mobile-search-input"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 移动端用户信息 -->
      <div class="mobile-user-info" v-if="isLoggedIn">
        <div class="mobile-user-avatar">
          <el-avatar :size="50" :src="userAvatar" :alt="userName" />
          <div class="mobile-user-details">
            <div class="mobile-user-name">{{ userName }}</div>
            <div class="mobile-user-status">在线学习中</div>
          </div>
        </div>
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
              <el-badge :value="notificationCount" :hidden="notificationCount === 0" class="mobile-badge" />
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/learning-records" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><Document /></el-icon>
              学习记录
            </router-link>
          </li>
          
          <!-- 移动端专属菜单项 -->
          <li class="mobile-nav-item" v-if="isLoggedIn">
            <router-link to="/profile" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><User /></el-icon>
              个人资料
            </router-link>
          </li>
          <li class="mobile-nav-item" v-if="isLoggedIn">
            <router-link to="/settings" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><Setting /></el-icon>
              设置
            </router-link>
          </li>
          <li class="mobile-nav-item" v-if="isLoggedIn">
            <router-link to="/help" class="mobile-nav-link" @click="toggleMobileMenu">
              <el-icon><QuestionFilled /></el-icon>
              帮助中心
            </router-link>
          </li>
        </ul>

        <!-- 移动端认证按钮 -->
        <div class="mobile-auth-section">
          <div v-if="isLoggedIn" class="mobile-logout">
            <el-button 
              type="danger" 
              size="large" 
              class="mobile-logout-btn"
              @click="handleLogout"
            >
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
          <div v-else class="mobile-auth-buttons">
            <el-button 
              type="default" 
              size="large" 
              class="mobile-login-btn"
              @click="goToLogin"
            >
              登录
            </el-button>
            <el-button 
              type="primary" 
              size="large" 
              class="mobile-register-btn"
              @click="goToRegister"
            >
              注册
            </el-button>
          </div>
        </div>
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

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
  toggleMobileMenu()
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
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 24px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo区域 */
.logo-section {
  flex-shrink: 0;
  z-index: 10;
  position: relative;
  margin-right: 20px;
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
  padding: 4px 16px;
  margin: 0 20px;
  z-index: 10;
  position: relative;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  min-width: 0;
  padding: 8px 0;
}

.nav-item {
  position: relative;
  margin: 4px 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 18px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
  z-index: 5;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  z-index: 12;
}

.nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px) scale(1.02);
}

.nav-link.active:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  z-index: 14;
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
  z-index: 10;
  position: relative;
  margin-left: 20px;
}

/* 搜索框 */
.search-box {
  position: relative;
  flex-shrink: 0;
  z-index: 15;
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
  display: flex;
  flex-direction: column;
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
  flex: 1;
  display: flex;
  flex-direction: column;
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

/* 移动端搜索框 */
.mobile-search {
  padding: 16px 24px;
  border-bottom: 1px solid #f5f5f5;
}

.mobile-search-input :deep(.el-input__wrapper) {
  border-radius: 25px;
  background: #f8f9fa;
}

/* 移动端用户信息 */
.mobile-user-info {
  padding: 20px 24px;
  border-bottom: 1px solid #f5f5f5;
}

.mobile-user-avatar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-user-details {
  flex: 1;
}

.mobile-user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.mobile-user-status {
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

/* 移动端认证区域 */
.mobile-auth-section {
  padding: 20px 24px;
  border-top: 1px solid #f5f5f5;
  margin-top: auto;
}

.mobile-logout-btn {
  width: 100%;
  border-radius: 25px;
}

.mobile-auth-buttons {
  display: flex;
  gap: 12px;
}

.mobile-login-btn,
.mobile-register-btn {
  flex: 1;
  border-radius: 25px;
}

/* 移动端徽章 */
.mobile-badge {
  margin-left: auto;
}

.mobile-nav-link {
  position: relative;
  justify-content: flex-start;
}

.mobile-badge :deep(.el-badge__content) {
  position: static;
  transform: none;
  margin-left: 8px;
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  min-width: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-input {
    width: 180px;
  }
  
  .nav-link {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .nav-list {
    gap: 8px;
  }
  
  .nav-item {
    margin: 3px 1px;
  }
  
  .main-nav {
    margin: 0 15px;
    padding: 4px 12px;
  }
  
  .logo-section {
    margin-right: 15px;
  }
  
  .header-right {
    gap: 10px;
    margin-left: 15px;
  }
}

@media (max-width: 1024px) {
  .search-input {
    width: 160px;
  }
  
  .nav-link {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .nav-list {
    gap: 6px;
  }
  
  .nav-item {
    margin: 2px 1px;
  }
  
  .main-nav {
    margin: 0 12px;
    padding: 4px 8px;
  }
  
  .logo-section {
    margin-right: 12px;
  }
  
  .header-right {
    gap: 8px;
    margin-left: 12px;
  }
  
  .user-name {
    display: none;
  }
}

@media (max-width: 900px) {
  .search-box {
    display: none;
  }
  
  .nav-link {
    padding: 6px 10px;
    font-size: 11px;
    gap: 2px;
  }
  
  .nav-list {
    gap: 4px;
  }
  
  .nav-item {
    margin: 2px 0;
  }
  
  .main-nav {
    margin: 0 8px;
    padding: 4px 6px;
  }
  
  .logo-section {
    margin-right: 8px;
  }
  
  .header-right {
    gap: 6px;
    margin-left: 8px;
  }
  
  .nav-link .el-icon {
    font-size: 12px;
  }
  
  .notification-icon {
    display: none;
  }
}

@media (max-width: 820px) {
  .header-container {
    padding: 0 12px;
  }
  
  .nav-list {
    gap: 2px;
  }
  
  .nav-link {
    padding: 5px 8px;
    font-size: 10px;
    gap: 1px;
  }
  
  .nav-item {
    margin: 1px 0;
  }
  
  .main-nav {
    margin: 0 6px;
    padding: 2px 4px;
  }
  
  .logo-section {
    margin-right: 6px;
  }
  
  .header-right {
    gap: 5px;
    margin-left: 6px;
  }
  
  .nav-link .el-icon {
    font-size: 11px;
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
