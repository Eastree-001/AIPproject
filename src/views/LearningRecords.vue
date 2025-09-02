<template>
  <div class="learning-records-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">
            <el-icon class="title-icon"><Document /></el-icon>
            学习记录
          </h1>
          <p class="page-subtitle">详细查看您的学习历程和成就轨迹</p>
          <div class="header-actions">
            <!-- 记录进度功能已移除 -->
            <!-- 智能分析功能已移除 -->
            <el-button @click="exportRecords">
              <el-icon><Download /></el-icon>
              导出记录
            </el-button>
            <el-button @click="showFilterModal = true">
              <el-icon><Filter /></el-icon>
              高级筛选
            </el-button>
          </div>
        </div>

        <!-- 统计概览 -->
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ totalStudyTime }}</h3>
              <p class="stat-label">总学习时长</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ totalCourses }}</h3>
              <p class="stat-label">学习课程数</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ totalAchievements }}</h3>
              <p class="stat-label">获得成就</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ averageScore }}%</h3>
              <p class="stat-label">平均成绩</p>
            </div>
          </div>
        </div>

        <!-- 主要内容 -->
        <div class="main-layout">
          <!-- 左侧：筛选和图表 -->
          <div class="left-section">
            <!-- 时间范围选择 -->
            <div class="filter-section">
              <h3 class="section-title">时间范围</h3>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleDateChange"
                style="width: 100%"
              />
            </div>

            <!-- 学习时长趋势图 -->
            <div class="chart-section">
              <h3 class="section-title">学习时长趋势</h3>
              <div class="chart-container">
                <div class="chart-placeholder">
                  <el-icon size="48"><TrendCharts /></el-icon>
                  <p>学习时长趋势图</p>
                  <small>显示每日学习时长变化</small>
                </div>
              </div>
            </div>

            <!-- 学习分布 -->
            <div class="chart-section">
              <h3 class="section-title">学习分布</h3>
              <div class="chart-container">
                <div class="chart-placeholder">
                  <el-icon size="48"><PieChart /></el-icon>
                  <p>学习分布饼图</p>
                  <small>按课程类型和难度分布</small>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：学习记录列表 -->
          <div class="right-section">
            <div class="records-header">
              <h2 class="section-title">学习记录</h2>
              <div class="view-actions">
                <el-radio-group v-model="viewMode" size="small">
                  <el-radio-button label="list">列表视图</el-radio-button>
                  <el-radio-button label="timeline">时间线</el-radio-button>
                </el-radio-group>
              </div>
            </div>

            <!-- 记录列表 -->
            <div class="records-list">
              <div v-if="filteredRecords.length === 0" class="empty-state">
                <el-icon size="64"><Document /></el-icon>
                <h3>暂无学习记录</h3>
                <p>开始学习课程后，您的学习记录将在这里显示</p>
              </div>

              <!-- 列表视图 -->
              <div v-else-if="viewMode === 'list'" class="list-view">
                <div 
                  v-for="record in paginatedRecords" 
                  :key="record.id" 
                  class="record-item"
                  @click="showRecordDetail(record)"
                >
                  <div class="record-icon">
                    <el-icon :size="24"><component :is="getRecordIcon(record.type)" /></el-icon>
                  </div>
                  
                  <div class="record-content">
                    <div class="record-header">
                      <h4 class="record-title">{{ record.title }}</h4>
                      <div class="record-meta">
                        <el-tag :type="getStatusType(record.status)" size="small">
                          {{ getStatusText(record.status) }}
                        </el-tag>
                        <span class="record-time">{{ formatTime(record.startTime) }}</span>
                      </div>
                    </div>
                    
                    <p class="record-description">{{ record.description }}</p>
                    
                    <div class="record-stats">
                      <span class="stat-item">
                        <el-icon><Clock /></el-icon>
                        {{ record.duration }}分钟
                      </span>
                      <span v-if="record.score" class="stat-item">
                        <el-icon><Star /></el-icon>
                        成绩: {{ record.score }}分
                      </span>
                      <span v-if="record.progress" class="stat-item">
                        <el-icon><TrendCharts /></el-icon>
                        进度: {{ record.progress }}%
                      </span>
                    </div>
                  </div>
                  
                  <div class="record-actions">
                    <el-button type="text" size="small" @click.stop="continueLearning(record)">
                      <el-icon><VideoPlay /></el-icon>
                      继续学习
                    </el-button>
                    <el-button type="text" size="small" @click.stop="viewDetails(record)">
                      <el-icon><View /></el-icon>
                      查看详情
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- 时间线视图 -->
              <div v-else class="timeline-view">
                <div class="timeline">
                  <div 
                    v-for="record in paginatedRecords" 
                    :key="record.id" 
                    class="timeline-item"
                    @click="showRecordDetail(record)"
                  >
                    <div class="timeline-marker">
                      <el-icon :size="16"><component :is="getRecordIcon(record.type)" /></el-icon>
                    </div>
                    
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <h4 class="timeline-title">{{ record.title }}</h4>
                        <span class="timeline-time">{{ formatTime(record.startTime) }}</span>
                      </div>
                      
                      <p class="timeline-description">{{ record.description }}</p>
                      
                      <div class="timeline-stats">
                        <el-tag :type="getStatusType(record.status)" size="small">
                          {{ getStatusText(record.status) }}
                        </el-tag>
                        <span class="duration">{{ record.duration }}分钟</span>
                        <span v-if="record.score" class="score">{{ record.score }}分</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="totalPages > 1" class="pagination-section">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="filteredRecords.length"
                layout="total, prev, pager, next, jumper"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 筛选模态框 -->
    <el-dialog
      v-model="showFilterModal"
      title="高级筛选"
      width="500px"
      :before-close="handleCloseFilter"
    >
      <div class="filter-form">
        <el-form :model="filterForm" label-width="100px">
          <el-form-item label="课程类型">
            <el-select v-model="filterForm.courseType" placeholder="选择课程类型" style="width: 100%">
              <el-option label="全部" value="" />
              <el-option label="前端开发" value="frontend" />
              <el-option label="后端开发" value="backend" />
              <el-option label="移动开发" value="mobile" />
              <el-option label="数据科学" value="data" />
              <el-option label="人工智能" value="ai" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="学习状态">
            <el-select v-model="filterForm.status" placeholder="选择学习状态" style="width: 100%">
              <el-option label="全部" value="" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
              <el-option label="已暂停" value="paused" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时长范围">
            <el-input-number
              v-model="filterForm.minDuration"
              placeholder="最小时长(分钟)"
              :min="0"
              style="width: 45%"
            />
            <span class="duration-separator">-</span>
            <el-input-number
              v-model="filterForm.maxDuration"
              placeholder="最大时长(分钟)"
              :min="0"
              style="width: 45%"
            />
          </el-form-item>
          
          <el-form-item label="成绩范围">
            <el-input-number
              v-model="filterForm.minScore"
              placeholder="最低分"
              :min="0"
              :max="100"
              style="width: 45%"
            />
            <span class="duration-separator">-</span>
            <el-input-number
              v-model="filterForm.maxScore"
              placeholder="最高分"
              :min="0"
              :max="100"
              style="width: 45%"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="applyFilter">应用筛选</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 记录详情模态框 -->
    <el-dialog
      v-model="showDetailModal"
      title="学习记录详情"
      width="700px"
      :before-close="handleCloseDetail"
    >
      <div v-if="selectedRecord" class="record-detail">
        <div class="detail-header">
          <h3>{{ selectedRecord.title }}</h3>
          <el-tag :type="getStatusType(selectedRecord.status)" size="large">
            {{ getStatusText(selectedRecord.status) }}
          </el-tag>
        </div>
        
        <div class="detail-content">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">开始时间:</span>
                <span class="value">{{ formatTime(selectedRecord.startTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">结束时间:</span>
                <span class="value">{{ formatTime(selectedRecord.endTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">学习时长:</span>
                <span class="value">{{ selectedRecord.duration }}分钟</span>
              </div>
              <div class="detail-item">
                <span class="label">学习进度:</span>
                <span class="value">{{ selectedRecord.progress }}%</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>学习内容</h4>
            <p>{{ selectedRecord.description }}</p>
          </div>
          
          <div v-if="selectedRecord.notes" class="detail-section">
            <h4>学习笔记</h4>
            <p>{{ selectedRecord.notes }}</p>
          </div>
          
          <div v-if="selectedRecord.achievements && selectedRecord.achievements.length > 0" class="detail-section">
            <h4>获得成就</h4>
            <div class="achievements-list">
              <el-tag 
                v-for="achievement in selectedRecord.achievements" 
                :key="achievement.id"
                type="success"
                size="large"
              >
                {{ achievement.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDetailModal = false">关闭</el-button>
          <el-button type="primary" @click="continueLearning(selectedRecord)">继续学习</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 学习进度记录功能已移除 -->
    <!-- 智能学习分析功能已移除 -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'
// 已移除学习进度追踪和智能分析组件的引用
import {
  Document,
  Download,
  Filter,
  Clock,
  Reading,
  Star,
  TrendCharts,
  VideoPlay,
  View,
  PieChart,
  Plus
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const dateRange = ref([])
const viewMode = ref('list')
const currentPage = ref(1)
const pageSize = ref(10)
const showFilterModal = ref(false)
const showDetailModal = ref(false)
// 已移除进度追踪和智能分析相关变量
const selectedRecord = ref(null)
const smartAnalyticsRef = ref()

// 用户ID - 从认证状态获取
const currentUserId = ref('user-123') // 这里应该从实际的认证状态获取

// 筛选表单
const filterForm = reactive({
  courseType: '',
  status: '',
  minDuration: null,
  maxDuration: null,
  minScore: null,
  maxScore: null
})

// 统计数据
const totalStudyTime = ref('127小时32分钟')
const totalCourses = ref(24)
const totalAchievements = ref(18)
const averageScore = ref(87)

// 学习记录数据
const learningRecords = ref([
  {
    id: 1,
    title: 'Vue.js 3.0 基础入门',
    description: '学习了Vue.js 3.0的基础语法、组件系统和响应式原理',
    type: 'course',
    status: 'completed',
    startTime: '2024-01-27 09:00:00',
    endTime: '2024-01-27 11:30:00',
    duration: 150,
    progress: 100,
    score: 95,
    notes: 'Vue 3的Composition API比Options API更灵活，响应式系统也更加高效。'
  },
  {
    id: 2,
    title: 'JavaScript 高级特性',
    description: '深入学习了闭包、原型链、异步编程等高级概念',
    type: 'course',
    status: 'in_progress',
    startTime: '2024-01-26 14:00:00',
    endTime: '2024-01-26 16:00:00',
    duration: 120,
    progress: 75,
    score: null,
    notes: '闭包的概念需要多练习才能理解透彻。'
  },
  {
    id: 3,
    title: 'CSS Grid 布局实战',
    description: '掌握了CSS Grid布局的核心概念和实际应用技巧',
    type: 'course',
    status: 'completed',
    startTime: '2024-01-25 10:00:00',
    endTime: '2024-01-25 12:00:00',
    duration: 120,
    progress: 100,
    score: 88,
    notes: 'Grid布局比Flexbox更适合二维布局，配合媒体查询效果更佳。'
  },
  {
    id: 4,
    title: 'React Hooks 深度解析',
    description: '学习了React Hooks的使用规则和最佳实践',
    type: 'course',
    status: 'paused',
    startTime: '2024-01-24 15:00:00',
    endTime: '2024-01-24 16:30:00',
    duration: 90,
    progress: 45,
    score: null,
    notes: 'useEffect的依赖数组需要仔细考虑，避免无限循环。'
  },
  {
    id: 5,
    title: 'Node.js 后端开发',
    description: '学习了Express框架和RESTful API设计',
    type: 'course',
    status: 'completed',
    startTime: '2024-01-23 09:00:00',
    endTime: '2024-01-23 17:00:00',
    duration: 480,
    progress: 100,
    score: 92,
    notes: '中间件的概念很重要，可以很好地组织代码结构。',
    achievements: [
      { id: 1, name: '后端新手' },
      { id: 2, name: 'API设计师' }
    ]
  }
])

// 计算属性
const filteredRecords = computed(() => {
  let filtered = learningRecords.value

  // 按课程类型筛选
  if (filterForm.courseType) {
    filtered = filtered.filter(r => r.type === filterForm.courseType)
  }

  // 按状态筛选
  if (filterForm.status) {
    filtered = filtered.filter(r => r.status === filterForm.status)
  }

  // 按时长筛选
  if (filterForm.minDuration !== null) {
    filtered = filtered.filter(r => r.duration >= filterForm.minDuration)
  }
  if (filterForm.maxDuration !== null) {
    filtered = filtered.filter(r => r.duration <= filterForm.maxDuration)
  }

  // 按成绩筛选
  if (filterForm.minScore !== null) {
    filtered = filtered.filter(r => r.score && r.score >= filterForm.minScore)
  }
  if (filterForm.maxScore !== null) {
    filtered = filtered.filter(r => r.score && r.score <= filterForm.maxScore)
  }

  return filtered
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize.value))

// 方法
const handleDateChange = (dates) => {
  console.log('日期范围变化:', dates)
  // 这里可以根据日期范围筛选记录
}

const getRecordIcon = (type) => {
  const iconMap = {
    course: 'Reading',
    practice: 'VideoPlay',
    exam: 'Document'
  }
  return iconMap[type] || 'Document'
}

const getStatusType = (status) => {
  const typeMap = {
    completed: 'success',
    in_progress: 'primary',
    paused: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    in_progress: '进行中',
    paused: '已暂停'
  }
  return textMap[status] || '未知'
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

const showRecordDetail = (record) => {
  selectedRecord.value = record
  showDetailModal.value = true
}

const continueLearning = (record) => {
  if (record.status === 'completed') {
    ElMessage.info('该课程已完成，可以复习或学习新课程')
  } else {
    router.push('/courses')
    ElMessage.success('正在跳转到课程页面')
  }
}

const viewDetails = (record) => {
  showRecordDetail(record)
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const applyFilter = () => {
  currentPage.value = 1
  showFilterModal.value = false
  ElMessage.success('筛选条件已应用')
}

const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = key.includes('Type') || key.includes('status') ? '' : null
  })
  currentPage.value = 1
}

const handleCloseFilter = () => {
  showFilterModal.value = false
}

const handleCloseDetail = () => {
  showDetailModal.value = false
  selectedRecord.value = null
}

const exportRecords = () => {
  ElMessage.success('学习记录导出功能开发中...')
}

// 🆕 新增方法
// 已移除进度追踪和智能分析相关函数

const handleProgressUpdated = (progressData) => {
  ElMessage.success('学习进度已更新！')
  console.log('进度更新:', progressData)

  // 刷新学习记录列表
  loadLearningRecords()

  // 如果有课程完成，可以显示祝贺信息
  if (progressData.isLessonCompleted) {
    ElMessage({
      message: '恭喜完成一个课程！',
      type: 'success',
      duration: 3000
    })
  }

  if (progressData.isCourseCompleted) {
    ElMessage({
      message: '🎉 恭喜完成整门课程！',
      type: 'success',
      duration: 5000
    })
  }
}

const loadLearningRecords = () => {
  // 重新加载学习记录数据
  console.log('重新加载学习记录...')
  // 这里应该调用API重新获取数据
}

// 组件挂载时
onMounted(() => {
  console.log('学习记录页面已加载')
})
</script>

<style scoped>
.learning-records-page {
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

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

/* 主布局 */
.main-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
  align-items: start;
}

/* 左侧区域 */
.left-section {
  position: sticky;
  top: 100px;
}

.filter-section,
.chart-section {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-placeholder .el-icon {
  margin-bottom: 15px;
  opacity: 0.5;
}

.chart-placeholder p {
  margin: 0 0 5px 0;
  font-size: 1rem;
}

.chart-placeholder small {
  font-size: 0.85rem;
  opacity: 0.7;
}

/* 右侧区域 */
.right-section {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.records-header {
  padding: 25px 30px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-actions {
  display: flex;
  gap: 15px;
}

/* 记录列表 */
.records-list {
  padding: 0;
}

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

/* 列表视图 */
.list-view .record-item {
  display: flex;
  gap: 20px;
  padding: 25px 30px;
  border-bottom: 1px solid #f5f5f5;
  transition: all 0.3s ease;
  cursor: pointer;
}

.list-view .record-item:last-child {
  border-bottom: none;
}

.list-view .record-item:hover {
  background: #f8f9fa;
}

.record-icon {
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

.record-content {
  flex: 1;
  min-width: 0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.record-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.record-time {
  font-size: 0.85rem;
  color: #999;
}

.record-description {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.6;
}

.record-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #666;
}

.record-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

/* 时间线视图 */
.timeline-view {
  padding: 30px;
}

.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  position: relative;
  padding-left: 60px;
  margin-bottom: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-item:hover {
  transform: translateX(5px);
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.timeline-content {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.timeline-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.timeline-time {
  font-size: 0.85rem;
  color: #999;
}

.timeline-description {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.6;
}

.timeline-stats {
  display: flex;
  gap: 15px;
  align-items: center;
}

.duration,
.score {
  font-size: 0.9rem;
  color: #666;
}

/* 分页 */
.pagination-section {
  padding: 25px 30px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

/* 模态框样式 */
.filter-form {
  padding: 20px 0;
}

.duration-separator {
  display: inline-block;
  width: 10%;
  text-align: center;
  color: #999;
}

.record-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
}

.detail-item .value {
  color: #333;
}

.achievements-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  
  .stats-overview {
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
  
  .header-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .records-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .list-view .record-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .record-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .timeline-item {
    padding-left: 50px;
  }
  
  .timeline-marker {
    width: 30px;
    height: 30px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .filter-section,
  .chart-section {
    padding: 20px;
  }
  
  .records-header {
    padding: 20px;
  }
  
  .list-view .record-item {
    padding: 20px;
  }
  
  .timeline-view {
    padding: 20px;
  }
}
</style>
