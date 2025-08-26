<template>
  <div class="settings-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">
            <el-icon class="title-icon"><Setting /></el-icon>
            设置
          </h1>
          <p class="page-subtitle">个性化您的学习体验和账户设置</p>
        </div>

        <!-- 主要内容 -->
        <div class="main-layout">
          <!-- 左侧：设置导航 -->
          <div class="left-section">
            <div class="settings-nav">
              <div 
                v-for="section in settingsSections" 
                :key="section.key"
                class="nav-item"
                :class="{ active: activeSection === section.key }"
                @click="activeSection = section.key"
              >
                <el-icon class="nav-icon"><component :is="section.icon" /></el-icon>
                <span class="nav-text">{{ section.title }}</span>
                <el-icon class="nav-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>

          <!-- 右侧：设置内容 -->
          <div class="right-section">
            <!-- 账户设置 -->
            <div v-if="activeSection === 'account'" class="settings-content">
              <div class="content-header">
                <h2 class="content-title">账户设置</h2>
                <p class="content-subtitle">管理您的账户信息和安全设置</p>
              </div>
              
              <div class="settings-form">
                <el-form :model="accountForm" label-position="top">
                  <el-form-item label="邮箱地址">
                    <el-input v-model="accountForm.email" disabled>
                      <template #append>
                        <el-button type="text" @click="changeEmail = true">修改</el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                  
                  <el-form-item label="用户名">
                    <el-input v-model="accountForm.username" />
                  </el-form-item>
                  
                  <el-form-item label="修改密码">
                    <el-button @click="changePassword = true">修改密码</el-button>
                  </el-form-item>
                  
                  <el-form-item label="账户状态">
                    <el-tag type="success">正常</el-tag>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="saveAccountSettings">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- 通知设置 -->
            <div v-if="activeSection === 'notifications'" class="settings-content">
              <div class="content-header">
                <h2 class="content-title">通知设置</h2>
                <p class="content-subtitle">自定义您希望接收的通知类型和频率</p>
              </div>
              
              <div class="settings-form">
                <el-form :model="notificationForm" label-position="top">
                  <el-form-item label="学习提醒">
                    <el-switch v-model="notificationForm.studyReminders" />
                    <span class="setting-hint">每日学习计划和进度提醒</span>
                  </el-form-item>
                  
                  <el-form-item label="课程更新">
                    <el-switch v-model="notificationForm.courseUpdates" />
                    <span class="setting-hint">新课程和内容更新通知</span>
                  </el-form-item>
                  
                  <el-form-item label="社区互动">
                    <el-switch v-model="notificationForm.communityActivity" />
                    <span class="setting-hint">评论、点赞等社区活动通知</span>
                  </el-form-item>
                  
                  <el-form-item label="成就通知">
                    <el-switch v-model="notificationForm.achievements" />
                    <span class="setting-hint">学习成就和里程碑通知</span>
                  </el-form-item>
                  
                  <el-form-item label="邮件通知">
                    <el-switch v-model="notificationForm.emailNotifications" />
                    <span class="setting-hint">重要通知的邮件提醒</span>
                  </el-form-item>
                  
                  <el-form-item label="通知时间">
                    <el-select v-model="notificationForm.notificationTime" placeholder="选择通知时间">
                      <el-option label="实时" value="realtime" />
                      <el-option label="每小时" value="hourly" />
                      <el-option label="每天" value="daily" />
                      <el-option label="每周" value="weekly" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- 隐私设置 -->
            <div v-if="activeSection === 'privacy'" class="settings-content">
              <div class="content-header">
                <h2 class="content-title">隐私设置</h2>
                <p class="content-subtitle">控制您的个人信息和学习数据的可见性</p>
              </div>
              
              <div class="settings-form">
                <el-form :model="privacyForm" label-position="top">
                  <el-form-item label="个人资料可见性">
                    <el-radio-group v-model="privacyForm.profileVisibility">
                      <el-radio label="public">公开</el-radio>
                      <el-radio label="friends">仅好友可见</el-radio>
                      <el-radio label="private">仅自己可见</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <el-form-item label="学习进度可见性">
                    <el-radio-group v-model="privacyForm.progressVisibility">
                      <el-radio label="public">公开</el-radio>
                      <el-radio label="friends">仅好友可见</el-radio>
                      <el-radio label="private">仅自己可见</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <el-form-item label="社区动态可见性">
                    <el-radio-group v-model="privacyForm.postVisibility">
                      <el-radio label="public">公开</el-radio>
                      <el-radio label="friends">仅好友可见</el-radio>
                      <el-radio label="private">仅自己可见</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <el-form-item label="搜索可见性">
                    <el-switch v-model="privacyForm.searchable" />
                    <span class="setting-hint">允许其他用户通过搜索找到您</span>
                  </el-form-item>
                  
                  <el-form-item label="数据分析参与">
                    <el-switch v-model="privacyForm.dataAnalytics" />
                    <span class="setting-hint">参与匿名学习数据分析，帮助改进平台</span>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="savePrivacySettings">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- 主题设置 -->
            <div v-if="activeSection === 'appearance'" class="settings-content">
              <div class="content-header">
                <h2 class="content-title">外观设置</h2>
                <p class="content-subtitle">个性化您的学习界面外观</p>
              </div>
              
              <div class="settings-form">
                <el-form :model="appearanceForm" label-position="top">
                  <el-form-item label="主题模式">
                    <el-radio-group v-model="appearanceForm.theme">
                      <el-radio label="light">浅色模式</el-radio>
                      <el-radio label="dark">深色模式</el-radio>
                      <el-radio label="auto">跟随系统</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <el-form-item label="主色调">
                    <div class="color-options">
                      <div 
                        v-for="color in colorOptions" 
                        :key="color.value"
                        class="color-option"
                        :class="{ selected: appearanceForm.primaryColor === color.value }"
                        :style="{ backgroundColor: color.value }"
                        @click="appearanceForm.primaryColor = color.value"
                      >
                        <el-icon v-if="appearanceForm.primaryColor === color.value"><Check /></el-icon>
                      </div>
                    </div>
                  </el-form-item>
                  
                  <el-form-item label="字体大小">
                    <el-slider 
                      v-model="appearanceForm.fontSize" 
                      :min="12" 
                      :max="20" 
                      :step="1"
                      show-input
                    />
                  </el-form-item>
                  
                  <el-form-item label="动画效果">
                    <el-switch v-model="appearanceForm.animations" />
                    <span class="setting-hint">启用界面动画和过渡效果</span>
                  </el-form-item>
                  
                  <el-form-item label="紧凑模式">
                    <el-switch v-model="appearanceForm.compactMode" />
                    <span class="setting-hint">减少界面间距，显示更多内容</span>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="saveAppearanceSettings">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- 学习设置 -->
            <div v-if="activeSection === 'learning'" class="settings-content">
              <div class="content-header">
                <h2 class="content-title">学习设置</h2>
                <p class="content-subtitle">优化您的学习体验和偏好</p>
              </div>
              
              <div class="settings-form">
                <el-form :model="learningForm" label-position="top">
                  <el-form-item label="自动播放">
                    <el-switch v-model="learningForm.autoPlay" />
                    <span class="setting-hint">课程视频自动播放下一节</span>
                  </el-form-item>
                  
                  <el-form-item label="学习提醒">
                    <el-time-picker 
                      v-model="learningForm.reminderTime" 
                      placeholder="选择提醒时间"
                      format="HH:mm"
                    />
                  </el-form-item>
                  
                  <el-form-item label="学习时长目标">
                    <el-input-number 
                      v-model="learningForm.dailyGoal" 
                      :min="15" 
                      :max="480" 
                      :step="15"
                    />
                    <span class="setting-hint">分钟/天</span>
                  </el-form-item>
                  
                  <el-form-item label="休息提醒">
                    <el-switch v-model="learningForm.breakReminders" />
                    <span class="setting-hint">学习一段时间后提醒休息</span>
                  </el-form-item>
                  
                  <el-form-item label="学习报告">
                    <el-select v-model="learningForm.reportFrequency" placeholder="选择报告频率">
                      <el-option label="每日" value="daily" />
                      <el-option label="每周" value="weekly" />
                      <el-option label="每月" value="monthly" />
                      <el-option label="不发送" value="never" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="saveLearningSettings">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- 数据管理 -->
            <div v-if="activeSection === 'data'" class="settings-content">
              <div class="content-header">
                <h2 class="content-title">数据管理</h2>
                <p class="content-subtitle">管理您的学习数据和账户信息</p>
              </div>
              
              <div class="settings-form">
                <div class="data-actions">
                  <div class="action-item">
                    <div class="action-info">
                      <h4>导出学习数据</h4>
                      <p>下载您的学习记录、进度和成就数据</p>
                    </div>
                    <el-button type="primary" @click="exportData">导出数据</el-button>
                  </div>
                  
                  <div class="action-item">
                    <div class="action-info">
                      <h4>清除学习记录</h4>
                      <p>删除所有学习记录，但保留账户信息</p>
                    </div>
                    <el-button type="danger" @click="clearLearningData">清除记录</el-button>
                  </div>
                  
                  <div class="action-item">
                    <div class="action-info">
                      <h4>删除账户</h4>
                      <p>永久删除您的账户和所有相关数据</p>
                    </div>
                    <el-button type="danger" @click="deleteAccount">删除账户</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 修改邮箱模态框 -->
    <el-dialog v-model="changeEmail" title="修改邮箱地址" width="400px">
      <el-form :model="emailForm" label-position="top">
        <el-form-item label="新邮箱地址">
          <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱地址" />
        </el-form-item>
        <el-form-item label="当前密码">
          <el-input v-model="emailForm.password" type="password" placeholder="请输入当前密码" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="changeEmail = false">取消</el-button>
        <el-button type="primary" @click="saveNewEmail">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码模态框 -->
    <el-dialog v-model="changePassword" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-position="top">
        <el-form-item label="当前密码">
          <el-input v-model="passwordForm.currentPassword" type="password" placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="changePassword = false">取消</el-button>
        <el-button type="primary" @click="saveNewPassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import { 
  Setting, 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Reading, 
  Database,
  ArrowRight,
  Check
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const activeSection = ref('account')
const changeEmail = ref(false)
const changePassword = ref(false)

// 设置分类
const settingsSections = [
  { key: 'account', title: '账户设置', icon: 'User' },
  { key: 'notifications', title: '通知设置', icon: 'Bell' },
  { key: 'privacy', title: '隐私设置', icon: 'Lock' },
  { key: 'appearance', title: '外观设置', icon: 'Palette' },
  { key: 'learning', title: '学习设置', icon: 'Reading' },
  { key: 'data', title: '数据管理', icon: 'Database' }
]

// 账户设置表单
const accountForm = reactive({
  email: 'zhang@example.com',
  username: 'zhangxiaoming'
})

// 通知设置表单
const notificationForm = reactive({
  studyReminders: true,
  courseUpdates: true,
  communityActivity: true,
  achievements: true,
  emailNotifications: false,
  notificationTime: 'realtime'
})

// 隐私设置表单
const privacyForm = reactive({
  profileVisibility: 'public',
  progressVisibility: 'friends',
  postVisibility: 'public',
  searchable: true,
  dataAnalytics: true
})

// 外观设置表单
const appearanceForm = reactive({
  theme: 'light',
  primaryColor: '#667eea',
  fontSize: 14,
  animations: true,
  compactMode: false
})

// 学习设置表单
const learningForm = reactive({
  autoPlay: false,
  reminderTime: new Date(2024, 0, 1, 20, 0),
  dailyGoal: 60,
  breakReminders: true,
  reportFrequency: 'weekly'
})

// 颜色选项
const colorOptions = [
  { value: '#667eea', name: '默认蓝' },
  { value: '#67c23a', name: '清新绿' },
  { value: '#e6a23c', name: '温暖橙' },
  { value: '#f56c6c', name: '活力红' },
  { value: '#909399', name: '优雅灰' },
  { value: '#9c27b0', name: '神秘紫' }
]

// 表单数据
const emailForm = reactive({
  newEmail: '',
  password: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 方法
const saveAccountSettings = () => {
  ElMessage.success('账户设置保存成功！')
}

const saveNotificationSettings = () => {
  ElMessage.success('通知设置保存成功！')
}

const savePrivacySettings = () => {
  ElMessage.success('隐私设置保存成功！')
}

const saveAppearanceSettings = () => {
  ElMessage.success('外观设置保存成功！')
}

const saveLearningSettings = () => {
  ElMessage.success('学习设置保存成功！')
}

const saveNewEmail = () => {
  if (!emailForm.newEmail || !emailForm.password) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  ElMessage.success('邮箱修改成功！')
  changeEmail.value = false
  emailForm.newEmail = ''
  emailForm.password = ''
}

const saveNewPassword = () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }
  
  ElMessage.success('密码修改成功！')
  changePassword.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const exportData = () => {
  ElMessage.success('数据导出功能开发中...')
}

const clearLearningData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有学习记录吗？此操作不可恢复。',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('学习记录已清除')
  } catch {
    // 用户取消操作
  }
}

const deleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除账户吗？此操作不可恢复，所有数据将被永久删除。',
      '危险操作',
      {
        confirmButtonText: '删除账户',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    ElMessage.success('账户删除功能开发中...')
  } catch {
    // 用户取消操作
  }
}

// 组件挂载时
onMounted(() => {
  console.log('设置页面已加载')
})
</script>

<style scoped>
.settings-page {
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

.settings-nav {
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

.nav-arrow {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 右侧内容 */
.right-section {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.settings-content {
  padding: 30px;
}

.content-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.content-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.content-subtitle {
  color: #666;
  line-height: 1.6;
}

/* 设置表单 */
.settings-form {
  max-width: 600px;
}

.setting-hint {
  margin-left: 10px;
  color: #999;
  font-size: 0.85rem;
}

/* 颜色选择 */
.color-options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #333;
  transform: scale(1.1);
}

.color-option.selected .el-icon {
  color: white;
  font-size: 1.2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 数据管理 */
.data-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.action-item:hover {
  border-color: #667eea;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
}

.action-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.1rem;
}

.action-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
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
  
  .settings-nav {
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
  
  .nav-arrow {
    display: none;
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
  
  .settings-content {
    padding: 20px;
  }
  
  .content-title {
    font-size: 1.5rem;
  }
  
  .action-item {
    flex-direction: column;
    gap: 15px;
    text-align: center;
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
  
  .color-options {
    gap: 10px;
  }
  
  .color-option {
    width: 35px;
    height: 35px;
  }
}
</style>
