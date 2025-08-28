<template>
  <div class="smart-analytics">
    <!-- 分析控制面板 -->
    <div class="analytics-controls">
      <el-card class="control-card">
        <div class="control-header">
          <h3>
            <el-icon><TrendCharts /></el-icon>
            智能学习分析
          </h3>
          <el-button 
            type="primary" 
            @click="generateAnalysis"
            :loading="loading"
            :disabled="!userId"
          >
            <el-icon><Refresh /></el-icon>
            {{ loading ? '分析中...' : '生成分析' }}
          </el-button>
        </div>
        
        <div class="control-options">
          <el-form :model="analysisConfig" inline>
            <el-form-item label="分析类型">
              <el-select v-model="analysisConfig.type" style="width: 150px">
                <el-option label="综合分析" value="comprehensive" />
                <el-option label="学习效率" value="efficiency" />
                <el-option label="进度跟踪" value="progress" />
                <el-option label="目标达成" value="goals" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="时间范围">
              <el-select v-model="analysisConfig.timeRange" style="width: 120px">
                <el-option label="7天" :value="7" />
                <el-option label="30天" :value="30" />
                <el-option label="90天" :value="90" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>

    <!-- 分析结果展示 -->
    <div v-if="analysisResult" class="analytics-results">
      <!-- 学习概览 -->
      <el-card class="summary-card">
        <template #header>
          <div class="card-header">
            <span>学习概览</span>
            <el-tag :type="getSummaryType(analysisResult.summary)">
              {{ getSummaryStatus(analysisResult.summary) }}
            </el-tag>
          </div>
        </template>
        
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-value">{{ formatTime(analysisResult.summary.totalStudyTime) }}</div>
            <div class="summary-label">总学习时长</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">{{ analysisResult.summary.totalLessonsCompleted }}</div>
            <div class="summary-label">完成课程</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">{{ formatTime(analysisResult.summary.avgDailyStudyTime) }}</div>
            <div class="summary-label">日均学习</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">{{ analysisResult.summary.activeCourses }}</div>
            <div class="summary-label">进行中课程</div>
          </div>
        </div>
      </el-card>

      <!-- AI洞察 -->
      <el-card class="insights-card">
        <template #header>
          <div class="card-header">
            <span>
              <el-icon><TrendCharts /></el-icon>
              AI智能洞察
            </span>
          </div>
        </template>
        
        <div class="ai-insights">
          <div class="insights-content" v-html="formatAIInsights(analysisResult.aiInsights)"></div>
        </div>
      </el-card>

      <!-- 改进建议 -->
      <el-card v-if="analysisResult.suggestions && analysisResult.suggestions.length > 0" class="suggestions-card">
        <template #header>
          <div class="card-header">
            <span>
              <el-icon><Star /></el-icon>
              改进建议
            </span>
          </div>
        </template>
        
        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in analysisResult.suggestions" 
            :key="index"
            class="suggestion-item"
            :class="`priority-${suggestion.priority}`"
          >
            <div class="suggestion-icon">
              <el-icon v-if="suggestion.priority === 'high'"><Warning /></el-icon>
              <el-icon v-else-if="suggestion.priority === 'medium'"><InfoFilled /></el-icon>
              <el-icon v-else><Check /></el-icon>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-type">{{ getSuggestionTypeText(suggestion.type) }}</div>
              <div class="suggestion-message">{{ suggestion.message }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 课程进度详情 -->
      <el-card class="progress-card">
        <template #header>
          <div class="card-header">
            <span>
              <el-icon><Reading /></el-icon>
              课程进度详情
            </span>
          </div>
        </template>
        
        <div class="progress-list">
          <div 
            v-for="course in analysisResult.courseProgress" 
            :key="course.courseId"
            class="progress-item"
          >
            <div class="progress-header">
              <h4 class="course-title">{{ course.title }}</h4>
              <el-tag :type="getDifficultyType(course.difficulty)" size="small">
                {{ course.difficulty }}
              </el-tag>
            </div>
            
            <div class="progress-details">
              <div class="progress-bar-container">
                <el-progress 
                  :percentage="course.completionRate" 
                  :color="getProgressColor(course.completionRate)"
                  :show-text="false"
                />
                <span class="progress-text">{{ course.completionRate }}%</span>
              </div>
              
              <div class="progress-stats">
                <span class="stat">{{ course.completedLessons }}/{{ course.lessonsCount }} 课程</span>
                <span class="stat category">{{ course.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- OKR进度 -->
      <el-card v-if="analysisResult.okrProgress && analysisResult.okrProgress.length > 0" class="okr-card">
        <template #header>
          <div class="card-header">
            <span>
              <el-icon><Aim /></el-icon>
              OKR目标进度
            </span>
          </div>
        </template>
        
        <div class="okr-list">
          <div 
            v-for="okr in analysisResult.okrProgress" 
            :key="okr.id"
            class="okr-item"
          >
            <div class="okr-header">
              <h4 class="okr-title">{{ okr.title }}</h4>
              <div class="okr-meta">
                <el-tag v-if="okr.daysRemaining !== null" 
                        :type="okr.daysRemaining < 7 ? 'danger' : 'info'" 
                        size="small">
                  {{ okr.daysRemaining > 0 ? `${okr.daysRemaining}天后到期` : '已过期' }}
                </el-tag>
              </div>
            </div>
            
            <div class="okr-progress">
              <el-progress 
                :percentage="okr.progress" 
                :color="getOKRProgressColor(okr.progress, okr.daysRemaining)"
              />
            </div>
            
            <div class="okr-objective">
              <p>{{ okr.objective }}</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!loading" class="empty-state">
      <el-empty description="点击生成分析开始智能学习分析" />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="8" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  TrendCharts,
  Refresh,
  Warning,
  InfoFilled,
  Check,
  Reading,
  Aim,
  Star
} from '@element-plus/icons-vue'
import { learningAPI } from '@/services/n8n-api'

// Props
const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// 响应式数据
const loading = ref(false)
const analysisResult = ref(null)

const analysisConfig = reactive({
  type: 'comprehensive',
  timeRange: 7
})

// 生成分析
const generateAnalysis = async () => {
  if (!props.userId) {
    ElMessage.warning('请先登录')
    return
  }

  loading.value = true
  
  try {
    const result = await learningAPI.getSmartAnalytics(
      props.userId, 
      analysisConfig.type, 
      analysisConfig.timeRange
    )
    
    if (result.success) {
      analysisResult.value = result.data
      ElMessage.success('分析完成！')
    } else {
      throw new Error(result.error || '分析失败')
    }
  } catch (error) {
    console.error('智能分析失败:', error)
    ElMessage.error('分析失败: ' + error.message)
  } finally {
    loading.value = false
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

const getSummaryType = (summary) => {
  const avgDaily = summary.avgDailyStudyTime
  if (avgDaily >= 3600) return 'success'  // 1小时以上
  if (avgDaily >= 1800) return 'warning'  // 30分钟以上
  return 'info'
}

const getSummaryStatus = (summary) => {
  const avgDaily = summary.avgDailyStudyTime
  if (avgDaily >= 3600) return '学习状态优秀'
  if (avgDaily >= 1800) return '学习状态良好'
  return '需要加强学习'
}

const formatAIInsights = (insights) => {
  if (!insights) return '暂无AI洞察'
  return insights.replace(/\n/g, '<br>')
}

const getSuggestionTypeText = (type) => {
  const typeMap = {
    'time_management': '时间管理',
    'focus': '学习专注',
    'okr_urgent': 'OKR紧急',
    'efficiency': '学习效率',
    'motivation': '学习动力'
  }
  return typeMap[type] || '其他建议'
}

const getDifficultyType = (difficulty) => {
  const typeMap = {
    'beginner': 'success',
    'intermediate': 'warning', 
    'advanced': 'danger'
  }
  return typeMap[difficulty] || 'info'
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  if (percentage >= 40) return '#f56c6c'
  return '#909399'
}

const getOKRProgressColor = (progress, daysRemaining) => {
  if (progress >= 100) return '#67c23a'
  if (daysRemaining !== null && daysRemaining < 7 && progress < 80) return '#f56c6c'
  if (progress >= 70) return '#e6a23c'
  return '#409eff'
}

// 暴露方法给父组件
defineExpose({
  generateAnalysis
})
</script>

<style scoped>
.smart-analytics {
  padding: 20px;
}

.analytics-controls {
  margin-bottom: 20px;
}

.control-card {
  border-radius: 12px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.control-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}

.control-options {
  margin-top: 16px;
}

.analytics-results {
  display: grid;
  gap: 20px;
}

.summary-card,
.insights-card,
.suggestions-card,
.progress-card,
.okr-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-item {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.summary-value {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 0.9em;
  opacity: 0.9;
}

.ai-insights {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.insights-content {
  line-height: 1.6;
  color: #606266;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.suggestion-item.priority-high {
  background: #fef0f0;
  border-left-color: #f56c6c;
}

.suggestion-item.priority-medium {
  background: #fdf6ec;
  border-left-color: #e6a23c;
}

.suggestion-item.priority-low {
  background: #f0f9ff;
  border-left-color: #409eff;
}

.suggestion-icon {
  margin-top: 2px;
}

.suggestion-type {
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}

.suggestion-message {
  color: #606266;
  line-height: 1.5;
}

.progress-list,
.okr-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-item,
.okr-item {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.progress-header,
.okr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.course-title,
.okr-title {
  margin: 0;
  color: #303133;
  font-size: 1.1em;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.progress-text {
  font-weight: 600;
  color: #606266;
  min-width: 40px;
}

.progress-stats {
  display: flex;
  gap: 16px;
  font-size: 0.9em;
  color: #909399;
}

.okr-objective {
  margin-top: 12px;
  color: #606266;
  font-style: italic;
}

.empty-state,
.loading-state {
  padding: 60px 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .smart-analytics {
    padding: 16px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .control-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .progress-header,
  .okr-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
