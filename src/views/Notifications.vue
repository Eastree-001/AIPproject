<template>
  <div class="notifications-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">
            <el-icon class="title-icon"><Bell /></el-icon>
            通知中心
          </h1>
          <p class="page-subtitle">查看和管理您的所有通知消息</p>
          <div class="header-actions">
            <el-button type="primary" @click="markAllAsRead">
              <el-icon><Check /></el-icon>
              全部标记为已读
            </el-button>
            <el-button @click="clearAllNotifications">
              <el-icon><Delete /></el-icon>
              清空通知
            </el-button>
          </div>
        </div>

        <!-- 主要内容 -->
        <div class="main-layout">
          <!-- 左侧：通知分类 -->
          <div class="left-section">
            <div class="notifications-nav">
              <div 
                v-for="category in notificationCategories" 
                :key="category.key"
                class="nav-item"
                :class="{ active: activeCategory === category.key }"
                @click="activeCategory = category.key"
              >
                <el-icon class="nav-icon"><component :is="category.icon" /></el-icon>
                <span class="nav-text">{{ category.title }}</span>
                <el-badge 
                  v-if="category.count > 0" 
                  :value="category.count" 
                  :hidden="category.count === 0"
                  class="category-badge"
                />
              </div>
            </div>
          </div>

          <!-- 右侧：通知列表 -->
          <div class="right-section">
            <div class="notifications-header">
              <h2 class="section-title">{{ getCategoryTitle() }}</h2>
              <div class="filter-actions">
                <el-select v-model="filterStatus" placeholder="筛选状态" size="small">
                  <el-option label="全部" value="" />
                  <el-option label="未读" value="unread" />
                  <el-option label="已读" value="read" />
                </el-select>
                <el-select v-model="sortBy" placeholder="排序方式" size="small">
                  <el-option label="最新优先" value="latest" />
                  <el-option label="最早优先" value="earliest" />
                  <el-option label="重要性优先" value="priority" />
                </el-select>
              </div>
            </div>
            
            <div class="notifications-list">
              <div v-if="filteredNotifications.length === 0" class="empty-state">
                <el-icon size="64"><Bell /></el-icon>
                <h3>暂无通知</h3>
                <p>当有新消息时，会在这里显示</p>
              </div>
              
              <div 
                v-for="notification in filteredNotifications" 
                :key="notification.id" 
                class="notification-item"
                :class="{ unread: !notification.isRead, [notification.type]: true }"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-icon">
                  <el-icon :size="24"><component :is="getNotificationIcon(notification.type)" /></el-icon>
                </div>
                
                <div class="notification-content">
                  <div class="notification-header">
                    <h4 class="notification-title">{{ notification.title }}</h4>
                    <div class="notification-meta">
                      <span class="notification-time">{{ formatTime(notification.time) }}</span>
                      <el-tag 
                        v-if="notification.priority === 'high'" 
                        type="danger" 
                        size="small"
                      >
                        重要
                      </el-tag>
                    </div>
                  </div>
                  
                  <p class="notification-message">{{ notification.message }}</p>
                  
                  <div v-if="notification.actions && notification.actions.length > 0" class="notification-actions">
                    <el-button 
                      v-for="action in notification.actions" 
                      :key="action.text"
                      :type="action.type || 'default'"
                      size="small"
                      @click.stop="handleAction(notification, action)"
                    >
                      {{ action.text }}
                    </el-button>
                  </div>
                </div>
                
                <div class="notification-actions-right">
                  <el-button 
                    type="text" 
                    size="small"
                    @click.stop="toggleRead(notification)"
                  >
                    <el-icon><component :is="notification.isRead ? 'View' : 'Hide'" /></el-icon>
                    {{ notification.isRead ? '标记未读' : '标记已读' }}
                  </el-button>
                  
                  <el-button 
                    type="text" 
                    size="small"
                    @click.stop="deleteNotification(notification)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
            
            <!-- 分页 -->
            <div v-if="totalPages > 1" class="pagination-section">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="totalNotifications"
                layout="total, prev, pager, next, jumper"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import Header from '@/components/Header.vue'
import { 
  Bell, 
  Check, 
  Delete, 
  Message, 
  Reading, 
  User, 
  Setting,
  View,
  Hide,
  Star,
  Warning,
  InfoFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const activeCategory = ref('all')
const filterStatus = ref('')
const sortBy = ref('latest')
const currentPage = ref(1)
const pageSize = ref(20)

// 通知分类
const notificationCategories = ref([
  { key: 'all', title: '全部通知', icon: 'Bell', count: 0 },
  { key: 'system', title: '系统通知', icon: 'Setting', count: 0 },
  { key: 'learning', title: '学习提醒', icon: 'Reading', count: 0 },
  { key: 'community', title: '社区消息', icon: 'User', count: 0 },
  { key: 'achievement', title: '成就通知', icon: 'Star', count: 0 }
])

// 通知数据
const notifications = ref([
  {
    id: 1,
    type: 'system',
    title: '系统维护通知',
    message: '系统将于今晚22:00-24:00进行维护升级，期间可能影响部分功能使用。',
    time: '2024-01-27 10:30:00',
    isRead: false,
    priority: 'high',
    actions: [
      { text: '查看详情', type: 'primary', action: 'view' }
    ]
  },
  {
    id: 2,
    type: 'learning',
    title: '学习计划提醒',
    message: '您今天的学习计划还未完成，建议继续学习Vue.js课程。',
    time: '2024-01-27 09:00:00',
    isRead: false,
    priority: 'medium',
    actions: [
      { text: '继续学习', type: 'success', action: 'continue' },
      { text: '查看计划', type: 'default', action: 'view' }
    ]
  },
  {
    id: 3,
    type: 'community',
    title: '新评论通知',
    message: '张小明在您的动态下发表了新评论："这个观点很有见地！"',
    time: '2024-01-27 08:45:00',
    isRead: true,
    priority: 'low',
    actions: [
      { text: '查看评论', type: 'primary', action: 'view' },
      { text: '回复', type: 'default', action: 'reply' }
    ]
  },
  {
    id: 4,
    type: 'achievement',
    title: '成就解锁',
    message: '恭喜您解锁了"坚持不懈"成就！连续学习7天，继续保持！',
    time: '2024-01-27 08:00:00',
    isRead: false,
    priority: 'medium',
    actions: [
      { text: '查看成就', type: 'success', action: 'view' }
    ]
  },
  {
    id: 5,
    type: 'learning',
    title: '课程推荐',
    message: '基于您的学习偏好，我们为您推荐了"React 18 实战教程"课程。',
    time: '2024-01-26 20:30:00',
    isRead: true,
    priority: 'low',
    actions: [
      { text: '查看课程', type: 'primary', action: 'view' },
      { text: '稍后再说', type: 'default', action: 'later' }
    ]
  }
])

// 计算属性
const filteredNotifications = computed(() => {
  let filtered = notifications.value

  // 按分类过滤
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(n => n.type === activeCategory.value)
  }

  // 按状态过滤
  if (filterStatus.value) {
    filtered = filtered.filter(n => 
      filterStatus.value === 'unread' ? !n.isRead : n.isRead
    )
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'latest':
        return new Date(b.time) - new Date(a.time)
      case 'earliest':
        return new Date(a.time) - new Date(b.time)
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      default:
        return 0
    }
  })

  return filtered
})

const totalNotifications = computed(() => filteredNotifications.value.length)
const totalPages = computed(() => Math.ceil(totalNotifications.value / pageSize))

// 方法
const getCategoryTitle = () => {
  const category = notificationCategories.value.find(c => c.key === activeCategory.value)
  return category ? category.title : '全部通知'
}

const getNotificationIcon = (type) => {
  const iconMap = {
    system: 'Setting',
    learning: 'Reading',
    community: 'User',
    achievement: 'Star'
  }
  return iconMap[type] || 'InfoFilled'
}

const handleNotificationClick = (notification) => {
  if (!notification.isRead) {
    notification.isRead = true
    updateCategoryCounts()
  }
  
  // 根据通知类型执行相应操作
  switch (notification.type) {
    case 'learning':
      if (notification.title.includes('学习计划')) {
        router.push('/progress')
      } else if (notification.title.includes('课程推荐')) {
        router.push('/courses')
      }
      break
    case 'community':
      router.push('/community')
      break
    case 'achievement':
      router.push('/profile')
      break
    default:
      // 系统通知，可能显示详情
      break
  }
}

const handleAction = (notification, action) => {
  switch (action.action) {
    case 'continue':
      router.push('/courses')
      break
    case 'view':
      if (notification.type === 'learning') {
        router.push('/progress')
      } else if (notification.type === 'achievement') {
        router.push('/profile')
      }
      break
    case 'reply':
      router.push('/community')
      break
    case 'later':
      // 标记为稍后处理
      notification.isRead = true
      updateCategoryCounts()
      break
  }
}

const toggleRead = (notification) => {
  notification.isRead = !notification.isRead
  updateCategoryCounts()
  ElMessage.success(notification.isRead ? '已标记为已读' : '已标记为未读')
}

const deleteNotification = async (notification) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条通知吗？',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      updateCategoryCounts()
      ElMessage.success('通知已删除')
    }
  } catch {
    // 用户取消操作
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.isRead = true)
  updateCategoryCounts()
  ElMessage.success('所有通知已标记为已读')
}

const clearAllNotifications = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有通知吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    notifications.value = []
    updateCategoryCounts()
    ElMessage.success('所有通知已清空')
  } catch {
    // 用户取消操作
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const updateCategoryCounts = () => {
  notificationCategories.value.forEach(category => {
    if (category.key === 'all') {
      category.count = notifications.value.filter(n => !n.isRead).length
    } else {
      category.count = notifications.value.filter(n => n.type === category.key && !n.isRead).length
    }
  })
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 监听分类变化
const watchCategory = computed(() => activeCategory.value)

// 组件挂载时
onMounted(() => {
  updateCategoryCounts()
  console.log('通知中心页面已加载')
})
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  padding-top: 80px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 页面标题 */
.page-header {
  margin-bottom: 40px;
  padding: 40px 0;
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 2.5rem;
  color: #667eea;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* 主布局 */
.main-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  align-items: start;
}

/* 左侧导航 */
.left-section {
  position: sticky;
  top: 100px;
}

.notifications-nav {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
}

.nav-item:last-child {
  border-bottom: none;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  flex: 1;
  font-weight: 500;
}

.category-badge {
  margin-left: auto;
}

/* 右侧内容 */
.right-section {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.notifications-header {
  padding: 25px 30px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.filter-actions {
  display: flex;
  gap: 15px;
}

/* 通知列表 */
.notifications-list {
  padding: 0;
}

.notification-item {
  display: flex;
  gap: 20px;
  padding: 25px 30px;
  border-bottom: 1px solid #f5f5f5;
  transition: all 0.3s ease;
  cursor: pointer;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f0f9ff;
  border-left: 4px solid #667eea;
}

.notification-item.system {
  border-left-color: #409eff;
}

.notification-item.learning {
  border-left-color: #67c23a;
}

.notification-item.community {
  border-left-color: #e6a23c;
}

.notification-item.achievement {
  border-left-color: #f56c6c;
}

.notification-icon {
  width: 50px;
  height: 50px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  flex-shrink: 0;
}

.notification-item.unread .notification-icon {
  background: #667eea;
  color: white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.notification-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.notification-time {
  font-size: 0.85rem;
  color: #999;
}

.notification-message {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.6;
}

.notification-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.notification-actions-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state .el-icon {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  color: #666;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* 分页 */
.pagination-section {
  padding: 25px 30px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .left-section {
    position: static;
    order: -1;
  }
  
  .notifications-nav {
    display: flex;
    overflow-x: auto;
    border-radius: 15px;
  }
  
  .nav-item {
    flex-shrink: 0;
    min-width: 120px;
    justify-content: center;
    padding: 15px 20px;
  }
  
  .nav-text {
    display: none;
  }
  
  .category-badge {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .page-header {
    padding: 20px 0;
    margin-bottom: 20px;
  }
  
  .page-title {
    font-size: 2.2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .notifications-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .filter-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .notification-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .notification-actions-right {
    flex-direction: row;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .nav-item {
    min-width: 80px;
    padding: 12px 15px;
  }
  
  .notification-item {
    padding: 20px;
  }
  
  .notifications-header {
    padding: 20px;
  }
  
  .filter-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
