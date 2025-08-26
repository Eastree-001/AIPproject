<template>
  <div class="profile-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">
            <el-icon class="title-icon"><User /></el-icon>
            个人资料
          </h1>
          <p class="page-subtitle">管理您的个人信息和学习偏好</p>
        </div>

        <!-- 主要内容 -->
        <div class="main-layout">
          <!-- 左侧：个人信息 -->
          <div class="left-section">
            <!-- 基本信息卡片 -->
            <div class="profile-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><User /></el-icon>
                  基本信息
                </h3>
                <el-button type="text" @click="editProfile = true">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
              </div>
              <div class="card-content">
                <div class="profile-avatar">
                  <el-avatar :size="120" :src="userProfile.avatar" />
                  <el-button type="primary" size="small" @click="changeAvatar = true">
                    更换头像
                  </el-button>
                </div>
                
                <div class="profile-info">
                  <div class="info-item">
                    <label>姓名</label>
                    <span>{{ userProfile.name }}</span>
                  </div>
                  <div class="info-item">
                    <label>邮箱</label>
                    <span>{{ userProfile.email }}</span>
                  </div>
                  <div class="info-item">
                    <label>注册时间</label>
                    <span>{{ formatDate(userProfile.createdAt) }}</span>
                  </div>
                  <div class="info-item">
                    <label>学习等级</label>
                    <span class="level-badge">{{ userProfile.level }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 学习偏好卡片 -->
            <div class="preferences-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><Setting /></el-icon>
                  学习偏好
                </h3>
                <el-button type="text" @click="editPreferences = true">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
              </div>
              <div class="card-content">
                <div class="preferences-grid">
                  <div class="preference-item">
                    <label>学习时长</label>
                    <span>{{ userProfile.preferences.studyTime }}分钟/天</span>
                  </div>
                  <div class="preference-item">
                    <label>学习时段</label>
                    <span>{{ userProfile.preferences.studyPeriod }}</span>
                  </div>
                  <div class="preference-item">
                    <label>难度偏好</label>
                    <span>{{ userProfile.preferences.difficulty }}</span>
                  </div>
                  <div class="preference-item">
                    <label>学习提醒</label>
                    <el-switch v-model="userProfile.preferences.notifications" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：统计和成就 -->
          <div class="right-section">
            <!-- 学习统计卡片 -->
            <div class="stats-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><TrendCharts /></el-icon>
                  学习统计
                </h3>
              </div>
              <div class="card-content">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-number">{{ userProfile.stats.totalCourses }}</div>
                    <div class="stat-label">总课程数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ userProfile.stats.completedCourses }}</div>
                    <div class="stat-label">已完成</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ userProfile.stats.totalHours }}</div>
                    <div class="stat-label">学习时长</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ userProfile.stats.avgScore }}</div>
                    <div class="stat-label">平均分数</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 最近成就卡片 -->
            <div class="achievements-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><Trophy /></el-icon>
                  最近成就
                </h3>
                <el-button type="text" @click="viewAllAchievements">
                  查看全部
                </el-button>
              </div>
              <div class="card-content">
                <div class="achievements-list">
                  <div v-for="achievement in recentAchievements" :key="achievement.id" 
                       class="achievement-item">
                    <div class="achievement-icon">
                      <el-icon :size="24"><component :is="achievement.icon" /></el-icon>
                    </div>
                    <div class="achievement-info">
                      <div class="achievement-name">{{ achievement.name }}</div>
                      <div class="achievement-desc">{{ achievement.description }}</div>
                      <div class="achievement-date">{{ formatDate(achievement.date) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 学习日历卡片 -->
            <div class="calendar-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><Calendar /></el-icon>
                  学习日历
                </h3>
              </div>
              <div class="card-content">
                <div class="calendar-placeholder">
                  <el-icon size="48"><Calendar /></el-icon>
                  <p>学习日历</p>
                  <small>显示您的学习记录和计划</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 编辑个人信息模态框 -->
    <el-dialog v-model="editProfile" title="编辑个人信息" width="500px">
      <el-form :model="profileForm" label-position="top" :rules="profileRules" ref="profileFormRef">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="profileForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="个人简介">
          <el-input 
            v-model="profileForm.bio" 
            type="textarea" 
            :rows="3"
            placeholder="介绍一下自己..."
          />
        </el-form-item>
        
        <el-form-item label="学习目标">
          <el-input 
            v-model="profileForm.goals" 
            type="textarea" 
            :rows="3"
            placeholder="您的学习目标是什么？"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editProfile = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑学习偏好模态框 -->
    <el-dialog v-model="editPreferences" title="编辑学习偏好" width="500px">
      <el-form :model="preferencesForm" label-position="top">
        <el-form-item label="每日学习时长">
          <el-select v-model="preferencesForm.studyTime" placeholder="选择学习时长" style="width: 100%">
            <el-option label="30分钟" value="30" />
            <el-option label="60分钟" value="60" />
            <el-option label="90分钟" value="90" />
            <el-option label="120分钟" value="120" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="学习时段">
          <el-select v-model="preferencesForm.studyPeriod" placeholder="选择学习时段" style="width: 100%">
            <el-option label="早晨 (6:00-9:00)" value="早晨" />
            <el-option label="上午 (9:00-12:00)" value="上午" />
            <el-option label="下午 (14:00-18:00)" value="下午" />
            <el-option label="晚上 (19:00-22:00)" value="晚上" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="难度偏好">
          <el-select v-model="preferencesForm.difficulty" placeholder="选择难度偏好" style="width: 100%">
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
            <el-option label="混合" value="混合" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="学习提醒">
          <el-switch v-model="preferencesForm.notifications" />
          <span class="preference-hint">开启后将发送学习提醒</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editPreferences = false">取消</el-button>
        <el-button type="primary" @click="savePreferences">保存</el-button>
      </template>
    </el-dialog>

    <!-- 更换头像模态框 -->
    <el-dialog v-model="changeAvatar" title="更换头像" width="400px">
      <div class="avatar-options">
        <div class="avatar-grid">
          <div 
            v-for="avatar in avatarOptions" 
            :key="avatar"
            class="avatar-option"
            :class="{ selected: avatar === userProfile.avatar }"
            @click="selectAvatar(avatar)"
          >
            <el-avatar :size="80" :src="avatar" />
          </div>
        </div>
        <div class="avatar-upload">
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="handleAvatarUpload"
          >
            <el-button type="primary">上传自定义头像</el-button>
          </el-upload>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="changeAvatar = false">取消</el-button>
        <el-button type="primary" @click="saveAvatar">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import { 
  User, 
  Edit, 
  TrendCharts, 
  Trophy, 
  Calendar,
  Star,
  Check,
  Clock,
  Reading
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const editProfile = ref(false)
const editPreferences = ref(false)
const changeAvatar = ref(false)
const profileFormRef = ref()

// 用户资料数据
const userProfile = reactive({
  name: '张小明',
  email: 'zhang@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
  bio: '热爱学习的前端开发者，正在学习Vue.js和React技术栈。',
  goals: '掌握现代前端开发技术，成为全栈开发工程师。',
  createdAt: '2024-01-01',
  level: '中级学习者',
  preferences: {
    studyTime: 60,
    studyPeriod: '晚上',
    difficulty: '中级',
    notifications: true
  },
  stats: {
    totalCourses: 15,
    completedCourses: 8,
    totalHours: 156,
    avgScore: 87
  }
})

// 表单数据
const profileForm = reactive({
  name: userProfile.name,
  bio: userProfile.bio,
  goals: userProfile.goals
})

const preferencesForm = reactive({
  studyTime: userProfile.preferences.studyTime,
  studyPeriod: userProfile.preferences.studyPeriod,
  difficulty: userProfile.preferences.difficulty,
  notifications: userProfile.preferences.notifications
})

// 头像选项
const avatarOptions = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhao',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sun'
]

// 最近成就
const recentAchievements = ref([
  {
    id: 1,
    name: '坚持不懈',
    description: '连续学习7天',
    icon: 'TrendCharts',
    date: '2024-01-25'
  },
  {
    id: 2,
    name: '知识探索者',
    description: '完成5门课程',
    icon: 'Reading',
    date: '2024-01-20'
  },
  {
    id: 3,
    name: '时间管理大师',
    description: '累计学习100小时',
    icon: 'Clock',
    date: '2024-01-15'
  }
])

// 表单验证规则
const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, message: '姓名长度不能少于2位', trigger: 'blur' }
  ]
}

// 方法
const saveProfile = async () => {
  try {
    await profileFormRef.value.validate()
    
    Object.assign(userProfile, {
      name: profileForm.name,
      bio: profileForm.bio,
      goals: profileForm.goals
    })
    
    ElMessage.success('个人信息保存成功！')
    editProfile.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const savePreferences = () => {
  Object.assign(userProfile.preferences, preferencesForm)
  ElMessage.success('学习偏好保存成功！')
  editPreferences.value = false
}

const selectAvatar = (avatar) => {
  userProfile.avatar = avatar
}

const saveAvatar = () => {
  ElMessage.success('头像更换成功！')
  changeAvatar.value = false
}

const handleAvatarUpload = (file) => {
  // 这里可以实现文件上传逻辑
  const reader = new FileReader()
  reader.onload = (e) => {
    userProfile.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const viewAllAchievements = () => {
  ElMessage.info('查看全部成就')
  // 这里可以跳转到成就页面
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 组件挂载时
onMounted(() => {
  console.log('个人资料页面已加载')
})
</script>

<style scoped>
.profile-page {
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
  grid-template-columns: 1fr 400px;
  gap: 30px;
  align-items: start;
}

/* 左侧区域 */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 卡片样式 */
.profile-card,
.preferences-card,
.stats-card,
.achievements-card,
.calendar-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px 25px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.card-icon {
  color: #667eea;
}

.card-content {
  padding: 25px;
}

/* 个人信息 */
.profile-avatar {
  text-align: center;
  margin-bottom: 25px;
}

.profile-avatar .el-avatar {
  margin-bottom: 15px;
  border: 4px solid #f0f0f0;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.info-item span {
  color: #333;
  font-weight: 500;
}

.level-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
}

/* 学习偏好 */
.preferences-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preference-item label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.preference-item span {
  color: #333;
  font-weight: 500;
}

.preference-hint {
  margin-left: 10px;
  color: #999;
  font-size: 0.85rem;
}

/* 右侧区域 */
.right-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* 成就列表 */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.achievement-item:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
}

.achievement-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.achievement-date {
  font-size: 0.8rem;
  color: #999;
}

/* 日历占位符 */
.calendar-placeholder {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.calendar-placeholder .el-icon {
  margin-bottom: 16px;
}

.calendar-placeholder p {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.calendar-placeholder small {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 头像选择 */
.avatar-options {
  text-align: center;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.avatar-option {
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.avatar-option:hover {
  border-color: #667eea;
  background: #f0f9ff;
}

.avatar-option.selected {
  border-color: #667eea;
  background: #f0f9ff;
}

.avatar-upload {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .right-section {
    order: -1;
  }
  
  .preferences-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
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
  
  .card-content {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .preferences-grid {
    grid-template-columns: 1fr;
  }
}
</style>
