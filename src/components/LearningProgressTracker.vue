<template>
  <div class="progress-tracker">
    <!-- 快速记录面板 -->
    <el-card class="quick-record-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Timer /></el-icon>
            快速记录学习进度
          </span>
        </div>
      </template>
      
      <el-form :model="progressForm" :rules="rules" ref="progressFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程" prop="courseId">
              <el-select 
                v-model="progressForm.courseId" 
                placeholder="选择课程"
                style="width: 100%"
                @change="onCourseChange"
              >
                <el-option 
                  v-for="course in courses" 
                  :key="course.id"
                  :label="course.title"
                  :value="course.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="章节" prop="lessonId">
              <el-select 
                v-model="progressForm.lessonId" 
                placeholder="选择章节"
                style="width: 100%"
                :disabled="!progressForm.courseId"
              >
                <el-option 
                  v-for="lesson in availableLessons" 
                  :key="lesson.id"
                  :label="lesson.title"
                  :value="lesson.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学习进度" prop="progress">
              <el-slider 
                v-model="progressForm.progress"
                :min="0"
                :max="100"
                :step="5"
                show-input
                :format-tooltip="formatProgressTooltip"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="学习时长" prop="timeSpent">
              <el-input-number
                v-model="progressForm.timeSpent"
                :min="0"
                :max="600"
                placeholder="分钟"
                style="width: 100%"
              />
              <span class="time-unit">分钟</span>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="学习笔记">
          <el-input
            v-model="progressForm.notes"
            type="textarea"
            :rows="3"
            placeholder="记录学习心得、重点内容或疑问..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="submitProgress"
            :loading="submitting"
            size="large"
          >
            <el-icon><Check /></el-icon>
            {{ submitting ? '记录中...' : '记录进度' }}
          </el-button>
          
          <el-button @click="resetForm" size="large">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          
          <el-button 
            type="success" 
            @click="quickComplete"
            :disabled="!progressForm.lessonId"
            size="large"
          >
            <el-icon><CircleCheck /></el-icon>
            标记完成
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 今日学习统计 -->
    <el-card class="daily-stats-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Calendar /></el-icon>
            今日学习统计
          </span>
          <el-button text @click="refreshStats">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon study-time">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatTime(dailyStats.totalTime) }}</div>
            <div class="stat-label">学习时长</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon lessons">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dailyStats.lessonsCompleted }}</div>
            <div class="stat-label">完成课程</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon courses">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dailyStats.coursesCompleted }}</div>
            <div class="stat-label">完成课程</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon streak">
            <el-icon><Lightning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dailyStats.streak || 0 }}</div>
            <div class="stat-label">连续天数</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 最近学习记录 -->
    <el-card class="recent-records-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><List /></el-icon>
            最近学习记录
          </span>
          <el-button text @click="$emit('view-all-records')">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      
      <div v-if="recentRecords.length > 0" class="records-list">
        <div 
          v-for="record in recentRecords" 
          :key="record.id"
          class="record-item"
        >
          <div class="record-icon">
            <el-icon v-if="record.progress >= 100"><CircleCheck /></el-icon>
            <el-icon v-else><Clock /></el-icon>
          </div>
          
          <div class="record-content">
            <div class="record-title">{{ record.lessonTitle }}</div>
            <div class="record-meta">
              <span class="course-name">{{ record.courseTitle }}</span>
              <span class="progress">{{ record.progress }}%</span>
              <span class="time">{{ formatTime(record.timeSpent * 60) }}</span>
            </div>
          </div>
          
          <div class="record-time">
            {{ formatRelativeTime(record.timestamp) }}
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无学习记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Timer, 
  Check, 
  Refresh, 
  CircleCheck, 
  Calendar, 
  Clock, 
  Reading, 
  Trophy, 
  Lightning,
  List,
  ArrowRight
} from '@element-plus/icons-vue'
import { learningAPI, okrAPI } from '@/services/n8n-api'

// Props
const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['progress-updated', 'view-all-records'])

// 响应式数据
const progressFormRef = ref()
const submitting = ref(false)
const courses = ref([])
const lessons = ref([])
const dailyStats = ref({
  totalTime: 0,
  lessonsCompleted: 0,
  coursesCompleted: 0,
  streak: 0
})
const recentRecords = ref([])

const progressForm = reactive({
  courseId: '',
  lessonId: '',
  progress: 0,
  timeSpent: 0,
  notes: ''
})

// 表单验证规则
const rules = {
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  lessonId: [
    { required: true, message: '请选择章节', trigger: 'change' }
  ],
  progress: [
    { required: true, message: '请设置学习进度', trigger: 'change' }
  ],
  timeSpent: [
    { required: true, message: '请输入学习时长', trigger: 'blur' },
    { type: 'number', min: 1, message: '学习时长至少1分钟', trigger: 'blur' }
  ]
}

// 计算属性
const availableLessons = computed(() => {
  if (!progressForm.courseId) return []
  return lessons.value.filter(lesson => lesson.courseId === progressForm.courseId)
})

// 监听课程变化
const onCourseChange = () => {
  progressForm.lessonId = ''
  progressForm.progress = 0
}

// 提交进度
const submitProgress = async () => {
  if (!progressFormRef.value) return
  
  try {
    await progressFormRef.value.validate()
    
    submitting.value = true
    
    const progressData = {
      userId: props.userId,
      courseId: progressForm.courseId,
      lessonId: progressForm.lessonId,
      progress: progressForm.progress,
      timeSpent: progressForm.timeSpent * 60, // 转换为秒
      actionType: 'update'
    }
    
    const result = await learningAPI.recordProgress(progressData)
    
    if (result.success) {
      ElMessage.success('学习进度记录成功！')
      
      // 如果课程完成，触发OKR更新
      if (result.data.isLessonCompleted || result.data.isCourseCompleted) {
        await triggerOKRUpdate()
      }
      
      // 刷新统计数据
      await refreshStats()
      await loadRecentRecords()
      
      // 通知父组件
      emit('progress-updated', result.data)
      
      // 重置表单
      resetForm()
    } else {
      throw new Error(result.error || '记录失败')
    }
  } catch (error) {
    console.error('记录进度失败:', error)
    ElMessage.error('记录失败: ' + error.message)
  } finally {
    submitting.value = false
  }
}

// 快速完成
const quickComplete = async () => {
  progressForm.progress = 100
  if (!progressForm.timeSpent) {
    progressForm.timeSpent = 30 // 默认30分钟
  }
  await submitProgress()
}

// 触发OKR更新
const triggerOKRUpdate = async () => {
  try {
    await okrAPI.autoUpdateProgress(props.userId, 'learning_activity', {
      courseId: progressForm.courseId,
      lessonId: progressForm.lessonId,
      progress: progressForm.progress
    })
  } catch (error) {
    console.error('OKR更新失败:', error)
    // 不影响主流程，只记录错误
  }
}

// 重置表单
const resetForm = () => {
  if (progressFormRef.value) {
    progressFormRef.value.resetFields()
  }
  Object.assign(progressForm, {
    courseId: '',
    lessonId: '',
    progress: 0,
    timeSpent: 0,
    notes: ''
  })
}

// 刷新统计
const refreshStats = async () => {
  try {
    // 这里应该调用获取今日统计的API
    // 暂时使用模拟数据
    dailyStats.value = {
      totalTime: 3600, // 1小时
      lessonsCompleted: 3,
      coursesCompleted: 1,
      streak: 5
    }
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

// 加载最近记录
const loadRecentRecords = async () => {
  try {
    // 这里应该调用获取最近记录的API
    // 暂时使用模拟数据
    recentRecords.value = [
      {
        id: 1,
        lessonTitle: 'Vue 3 基础语法',
        courseTitle: '前端开发入门',
        progress: 100,
        timeSpent: 45,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
      },
      {
        id: 2,
        lessonTitle: 'JavaScript ES6',
        courseTitle: '前端开发入门',
        progress: 75,
        timeSpent: 30,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4小时前
      }
    ]
  } catch (error) {
    console.error('获取最近记录失败:', error)
  }
}

// 工具函数
const formatTime = (seconds) => {
  if (!seconds) return '0分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

const formatProgressTooltip = (value) => {
  return `${value}%`
}

const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const diff = now - new Date(timestamp)
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

// 初始化
onMounted(async () => {
  // 加载课程列表
  courses.value = [
    { id: '1', title: '前端开发入门' },
    { id: '2', title: 'Vue 3 进阶' },
    { id: '3', title: 'Node.js 后端开发' }
  ]
  
  // 加载章节列表
  lessons.value = [
    { id: '1-1', courseId: '1', title: 'HTML 基础' },
    { id: '1-2', courseId: '1', title: 'CSS 样式' },
    { id: '1-3', courseId: '1', title: 'JavaScript 基础' },
    { id: '2-1', courseId: '2', title: 'Vue 3 组件' },
    { id: '2-2', courseId: '2', title: 'Composition API' },
    { id: '3-1', courseId: '3', title: 'Express 框架' }
  ]
  
  await refreshStats()
  await loadRecentRecords()
})

// 暴露方法
defineExpose({
  refreshStats,
  resetForm
})
</script>

<style scoped>
.progress-tracker {
  display: grid;
  gap: 20px;
}

.quick-record-card,
.daily-stats-card,
.recent-records-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.time-unit {
  margin-left: 8px;
  color: #909399;
  font-size: 0.9em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2em;
}

.stat-icon.study-time { background: #409eff; }
.stat-icon.lessons { background: #67c23a; }
.stat-icon.courses { background: #e6a23c; }
.stat-icon.streak { background: #f56c6c; }

.stat-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 0.9em;
  color: #606266;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.record-item:hover {
  background: #f0f9ff;
  border-color: #409eff;
}

.record-icon {
  color: #67c23a;
  font-size: 1.2em;
}

.record-content {
  flex: 1;
}

.record-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.record-meta {
  display: flex;
  gap: 12px;
  font-size: 0.9em;
  color: #909399;
}

.record-time {
  font-size: 0.8em;
  color: #c0c4cc;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .record-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .record-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
