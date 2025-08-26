<template>
  <div class="progress-page">
    <Header />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 页面标题区域 -->
        <div class="page-header">
          <div class="header-content">
            <div class="title-section">
              <h1 class="page-title">
                <el-icon class="title-icon"><TrendCharts /></el-icon>
                学习进度
              </h1>
              <p class="page-subtitle">跟踪您的学习进度，管理学习目标，获得学习成就</p>
            </div>
            <div class="header-actions">
              <el-button type="primary" size="large" @click="showGoalModal = true">
                <el-icon><Plus /></el-icon>
                设定目标
              </el-button>
            </div>
          </div>
        </div>

        <!-- 学习概览统计 -->
        <div class="overview-section">
          <div class="overview-grid">
            <div class="overview-card primary">
              <div class="overview-icon">
                <el-icon size="32"><Reading /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ overview.totalCourses }}</div>
                <div class="overview-label">总课程数</div>
                <div class="overview-trend positive">
                  <el-icon><ArrowUp /></el-icon>
                  +2 本周
                </div>
              </div>
            </div>
            
            <div class="overview-card success">
              <div class="overview-icon">
                <el-icon size="32"><Check /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ overview.completedCourses }}</div>
                <div class="overview-label">已完成</div>
                <div class="overview-trend positive">
                  <el-icon><ArrowUp /></el-icon>
                  +1 本周
                </div>
              </div>
            </div>
            
            <div class="overview-card warning">
              <div class="overview-icon">
                <el-icon size="32"><Clock /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ overview.totalHours }}</div>
                <div class="overview-label">学习时长</div>
                <div class="overview-trend positive">
                  <el-icon><ArrowUp /></el-icon>
                  +5h 本周
                </div>
              </div>
            </div>
            
            <div class="overview-card info">
              <div class="overview-icon">
                <el-icon size="32"><Star /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ overview.avgScore }}</div>
                <div class="overview-label">平均分数</div>
                <div class="overview-trend positive">
                  <el-icon><ArrowUp /></el-icon>
                  +2 本周
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-layout">
          <!-- 左侧：进度图表和统计 -->
          <div class="left-section">
            <!-- 学习进度图表 -->
            <div class="chart-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><TrendCharts /></el-icon>
                  学习进度趋势
                </h3>
                <div class="chart-actions">
                  <el-select v-model="chartPeriod" size="small" @change="updateChart">
                    <el-option label="最近7天" value="7" />
                    <el-option label="最近30天" value="30" />
                    <el-option label="最近90天" value="90" />
                  </el-select>
                </div>
              </div>
              <div class="chart-content">
                <div class="chart-container" ref="progressChart">
                  <!-- 这里将渲染图表 -->
                  <div class="chart-placeholder">
                    <el-icon size="48"><TrendCharts /></el-icon>
                    <p>学习进度图表</p>
                    <small>显示您的学习趋势和进度变化</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- 学习时间分布 -->
            <div class="chart-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><PieChart /></el-icon>
                  学习时间分布
                </h3>
              </div>
              <div class="chart-content">
                <div class="time-distribution">
                  <div v-for="item in timeDistribution" :key="item.category" class="time-item">
                    <div class="time-info">
                      <div class="time-category">{{ item.category }}</div>
                      <div class="time-hours">{{ item.hours }}小时</div>
                    </div>
                    <div class="time-bar">
                      <div class="time-progress" :style="{ width: item.percentage + '%', backgroundColor: item.color }"></div>
                    </div>
                    <div class="time-percentage">{{ item.percentage }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：学习记录和目标 -->
          <div class="right-section">
            <!-- 当前学习目标 -->
            <div class="goal-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><Aim /></el-icon>
                  当前学习目标
                </h3>
                <el-button type="text" size="small" @click="editCurrentGoal">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </div>
              <div class="card-content">
                <div v-if="!currentGoal" class="empty-goal">
                  <el-icon class="empty-icon"><Aim /></el-icon>
                  <p>还没有设定学习目标</p>
                  <el-button type="primary" size="small" @click="showGoalModal = true">
                    设定目标
                  </el-button>
                </div>
                <div v-else class="goal-display">
                  <div class="goal-header">
                    <h4 class="goal-title">{{ currentGoal.title }}</h4>
                    <div class="goal-deadline">
                      <el-icon><Calendar /></el-icon>
                      <span>截止日期：{{ formatDate(currentGoal.deadline) }}</span>
                    </div>
                  </div>
                  <div class="goal-progress">
                    <div class="progress-info">
                      <span class="progress-label">完成进度</span>
                      <span class="progress-value">{{ currentGoal.progress }}%</span>
                    </div>
                    <el-progress 
                      :percentage="currentGoal.progress" 
                      :stroke-width="10"
                      :color="getProgressColor(currentGoal.progress)"
                    />
                  </div>
                  <div class="goal-milestones">
                    <div v-for="milestone in currentGoal.milestones" :key="milestone.id" 
                         class="milestone-item" :class="{ completed: milestone.completed }">
                      <el-icon class="milestone-icon">
                        <component :is="milestone.completed ? 'Check' : 'CircleCheck'" />
                      </el-icon>
                      <span class="milestone-text">{{ milestone.text }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 最近学习记录 -->
            <div class="history-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><Clock /></el-icon>
                  最近学习记录
                </h3>
                <el-button type="text" size="small" @click="viewAllHistory">
                  查看全部
                </el-button>
              </div>
              <div class="card-content">
                <div class="history-list">
                  <div v-for="record in recentHistory" :key="record.id" class="history-item">
                    <div class="history-icon">
                      <el-icon :size="20"><component :is="record.icon" /></el-icon>
                    </div>
                    <div class="history-content">
                      <div class="history-title">{{ record.title }}</div>
                      <div class="history-info">
                        <span class="history-time">{{ formatTime(record.time) }}</span>
                        <span class="history-duration">{{ record.duration }}分钟</span>
                      </div>
                    </div>
                    <div class="history-status" :class="record.status">
                      {{ getStatusText(record.status) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 学习成就 -->
            <div class="achievement-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><Trophy /></el-icon>
                  学习成就
                </h3>
              </div>
              <div class="card-content">
                <div class="achievement-grid">
                  <div v-for="achievement in achievements" :key="achievement.id" 
                       class="achievement-item" :class="{ unlocked: achievement.unlocked }">
                    <div class="achievement-icon">
                      <el-icon :size="24"><component :is="achievement.icon" /></el-icon>
                    </div>
                    <div class="achievement-info">
                      <div class="achievement-name">{{ achievement.name }}</div>
                      <div class="achievement-desc">{{ achievement.description }}</div>
                    </div>
                    <div class="achievement-status">
                      <el-icon v-if="achievement.unlocked" class="unlocked-icon"><Check /></el-icon>
                      <span v-else class="locked-text">{{ achievement.progress }}/{{ achievement.target }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 目标设定模态框 -->
    <el-dialog v-model="showGoalModal" title="设定学习目标" width="600px">
      <el-form :model="goalForm" label-position="top" :rules="goalRules" ref="goalFormRef">
        <el-form-item label="目标标题" prop="title">
          <el-input 
            v-model="goalForm.title" 
            placeholder="例如：掌握Vue.js 3.0核心概念"
          />
        </el-form-item>
        
        <el-form-item label="目标描述" prop="description">
          <el-input 
            v-model="goalForm.description" 
            type="textarea"
            :rows="3"
            placeholder="详细描述您的学习目标"
          />
        </el-form-item>
        
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="goalForm.deadline"
            type="date"
            placeholder="选择截止日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="关键里程碑">
          <div v-for="(milestone, index) in goalForm.milestones" :key="index" class="milestone-input">
            <el-input 
              v-model="goalForm.milestones[index]" 
              placeholder="里程碑描述"
              style="margin-bottom: 10px;"
            >
              <template #append>
                <el-button @click="removeMilestone(index)" :disabled="goalForm.milestones.length <= 1">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          <el-button type="text" @click="addMilestone">
            <el-icon><Plus /></el-icon>
            添加里程碑
          </el-button>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showGoalModal = false">取消</el-button>
        <el-button type="primary" @click="saveGoal">保存目标</el-button>
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
  TrendCharts, 
  Plus, 
  Reading, 
  Check, 
  Clock, 
  Star, 
  ArrowUp,
  PieChart,
  Aim,
  Edit,
  Calendar,
  Trophy,
  CircleCheck,
  Delete
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const showGoalModal = ref(false)
const chartPeriod = ref('7')
const goalFormRef = ref()

// 学习概览数据
const overview = reactive({
  totalCourses: 12,
  completedCourses: 8,
  totalHours: 156,
  avgScore: 87
})

// 学习时间分布
const timeDistribution = ref([
  { category: '编程开发', hours: 45, percentage: 45, color: '#667eea' },
  { category: '设计创意', hours: 28, percentage: 28, color: '#764ba2' },
  { category: '语言学习', hours: 18, percentage: 18, color: '#f093fb' },
  { category: '其他', hours: 9, percentage: 9, color: '#4facfe' }
])

// 当前学习目标
const currentGoal = ref({
  title: '掌握Vue.js 3.0核心概念',
  description: '深入学习Vue.js 3.0的组合式API、响应式系统等核心概念',
  deadline: '2024-02-28',
  progress: 65,
  milestones: [
    { id: 1, text: '理解组合式API基础', completed: true },
    { id: 2, text: '掌握响应式系统', completed: true },
    { id: 3, text: '学习生命周期钩子', completed: false },
    { id: 4, text: '实践项目开发', completed: false }
  ]
})

// 最近学习记录
const recentHistory = ref([
  {
    id: 1,
    title: 'Vue.js 3.0 组合式API',
    time: '2024-01-27 14:30',
    duration: 45,
    status: 'completed',
    icon: 'Check'
  },
  {
    id: 2,
    title: 'React 18 新特性',
    time: '2024-01-27 10:15',
    duration: 60,
    status: 'in_progress',
    icon: 'Clock'
  },
  {
    id: 3,
    title: 'UI/UX 设计原则',
    time: '2024-01-26 16:20',
    duration: 30,
    status: 'completed',
    icon: 'Check'
  },
  {
    id: 4,
    title: 'Python 数据分析',
    time: '2024-01-26 09:45',
    duration: 75,
    status: 'in_progress',
    icon: 'Clock'
  }
])

// 学习成就
const achievements = ref([
  {
    id: 1,
    name: '初学者',
    description: '完成第一门课程',
    icon: 'Star',
    unlocked: true,
    progress: 1,
    target: 1
  },
  {
    id: 2,
    name: '坚持不懈',
    description: '连续学习7天',
    icon: 'TrendCharts',
    unlocked: true,
    progress: 7,
    target: 7
  },
  {
    id: 3,
    name: '知识探索者',
    description: '完成5门课程',
    icon: 'Reading',
    unlocked: false,
    progress: 3,
    target: 5
  },
  {
    id: 4,
    name: '时间管理大师',
    description: '累计学习100小时',
    icon: 'Clock',
    unlocked: false,
    progress: 78,
    target: 100
  }
])

// 目标表单
const goalForm = reactive({
  title: '',
  description: '',
  deadline: '',
  milestones: ['完成基础理论学习']
})

// 表单验证规则
const goalRules = {
  title: [
    { required: true, message: '请输入目标标题', trigger: 'blur' },
    { min: 5, message: '标题长度不能少于5个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入目标描述', trigger: 'blur' }
  ],
  deadline: [
    { required: true, message: '请选择截止日期', trigger: 'change' }
  ]
}

// 计算属性
const progressChart = ref(null)

// 方法
const updateChart = () => {
  console.log('更新图表，周期:', chartPeriod.value)
  // 这里可以实现图表更新逻辑
}

const editCurrentGoal = () => {
  if (currentGoal.value) {
    goalForm.title = currentGoal.value.title
    goalForm.description = currentGoal.value.description
    goalForm.deadline = currentGoal.value.deadline
    goalForm.milestones = currentGoal.value.milestones.map(m => m.text)
    showGoalModal.value = true
  }
}

const addMilestone = () => {
  goalForm.milestones.push('')
}

const removeMilestone = (index) => {
  goalForm.milestones.splice(index, 1)
}

const saveGoal = async () => {
  try {
    await goalFormRef.value.validate()
    
    if (currentGoal.value) {
      // 更新现有目标
      Object.assign(currentGoal.value, {
        title: goalForm.title,
        description: goalForm.description,
        deadline: goalForm.deadline,
        milestones: goalForm.milestones.map((text, index) => ({
          id: index + 1,
          text,
          completed: false
        }))
      })
      ElMessage.success('学习目标更新成功！')
    } else {
      // 创建新目标
      currentGoal.value = {
        title: goalForm.title,
        description: goalForm.description,
        deadline: goalForm.deadline,
        progress: 0,
        milestones: goalForm.milestones.map((text, index) => ({
          id: index + 1,
          text,
          completed: false
        }))
      }
      ElMessage.success('学习目标创建成功！')
    }
    
    showGoalModal.value = false
    resetGoalForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const resetGoalForm = () => {
  goalForm.title = ''
  goalForm.description = ''
  goalForm.deadline = ''
  goalForm.milestones = ['']
}

const viewAllHistory = () => {
  ElMessage.info('查看全部学习记录')
  // 这里可以跳转到详细的学习记录页面
}

const getProgressColor = (progress) => {
  if (progress >= 80) return '#67c23a'
  if (progress >= 60) return '#409eff'
  if (progress >= 40) return '#e6a23c'
  return '#f56c6c'
}

const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'not_started': '未开始'
  }
  return statusMap[status] || '未知'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时
onMounted(() => {
  console.log('学习进度页面已加载')
})
</script>

<style scoped>
.progress-page {
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

/* 页面标题区域 */
.page-header {
  margin-bottom: 40px;
  padding: 40px 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
}

.title-section {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
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
  max-width: 600px;
  line-height: 1.6;
}

.header-actions {
  flex-shrink: 0;
}

/* 学习概览统计 */
.overview-section {
  margin-bottom: 40px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.overview-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border-left: 4px solid;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.overview-card.primary {
  border-left-color: #667eea;
}

.overview-card.success {
  border-left-color: #67c23a;
}

.overview-card.warning {
  border-left-color: #e6a23c;
}

.overview-card.info {
  border-left-color: #409eff;
}

.overview-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.overview-card.primary .overview-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.overview-card.success .overview-icon {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.overview-card.warning .overview-icon {
  background: linear-gradient(135deg, #e6a23c 0%, #f0ad4e 100%);
}

.overview-card.info .overview-icon {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.overview-content {
  flex: 1;
}

.overview-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.overview-label {
  font-size: 1rem;
  color: #666;
  margin-bottom: 12px;
}

.overview-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.overview-trend.positive {
  color: #67c23a;
}

.overview-trend.negative {
  color: #f56c6c;
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

.chart-card {
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

.chart-content {
  padding: 25px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-placeholder .el-icon {
  margin-bottom: 16px;
}

.chart-placeholder p {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.chart-placeholder small {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 时间分布 */
.time-distribution {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-info {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.time-category {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.time-hours {
  font-size: 0.9rem;
  color: #666;
}

.time-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.time-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.time-percentage {
  min-width: 50px;
  text-align: right;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

/* 右侧区域 */
.right-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.goal-card,
.history-card,
.achievement-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-content {
  padding: 25px;
}

/* 学习目标 */
.empty-goal {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  color: #ccc;
  margin-bottom: 16px;
  font-size: 3rem;
}

.empty-goal p {
  color: #999;
  margin-bottom: 20px;
  font-size: 1rem;
}

.goal-display {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.goal-header {
  margin-bottom: 15px;
}

.goal-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.goal-deadline {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.goal-progress {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label {
  font-size: 0.9rem;
  color: #666;
}

.progress-value {
  font-weight: 600;
  color: #333;
}

.goal-milestones {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.milestone-item.completed {
  background: #f0f9ff;
}

.milestone-icon {
  color: #667eea;
  flex-shrink: 0;
}

.milestone-text {
  flex: 1;
  color: #333;
}

.milestone-item.completed .milestone-text {
  text-decoration: line-through;
  color: #999;
}

/* 学习记录 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.history-item:hover {
  background: #f8f9fa;
  border-color: #e0e0e0;
}

.history-icon {
  width: 40px;
  height: 40px;
  background: #f0f9ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.4;
}

.history-info {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: #666;
}

.history-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  flex-shrink: 0;
}

.history-status.completed {
  background: #f0f9ff;
  color: #67c23a;
}

.history-status.in_progress {
  background: #fff7e6;
  color: #e6a23c;
}

.history-status.not_started {
  background: #f5f5f5;
  color: #999;
}

/* 学习成就 */
.achievement-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.achievement-item:hover {
  border-color: #667eea;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
}

.achievement-item.unlocked {
  background: #f0f9ff;
  border-color: #67c23a;
}

.achievement-icon {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  flex-shrink: 0;
}

.achievement-item.unlocked .achievement-icon {
  background: #67c23a;
  color: white;
}

.achievement-info {
  flex: 1;
  min-width: 0;
}

.achievement-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.achievement-status {
  flex-shrink: 0;
}

.unlocked-icon {
  color: #67c23a;
  font-size: 1.2rem;
}

.locked-text {
  font-size: 0.85rem;
  color: #999;
  font-weight: 500;
}

/* 目标设定模态框 */
.milestone-input {
  margin-bottom: 10px;
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
  
  .overview-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .page-title {
    font-size: 2.2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .overview-card {
    padding: 20px;
  }
  
  .overview-number {
    font-size: 2rem;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .card-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .overview-card {
    flex-direction: column;
    text-align: center;
  }
  
  .overview-icon {
    width: 60px;
    height: 60px;
  }
  
  .overview-number {
    font-size: 1.8rem;
  }
  
  .chart-container {
    height: 200px;
  }
}
</style>
