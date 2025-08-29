<template>
  <div class="n8n-test-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">
            <el-icon><Setting /></el-icon>
            N8N工作流测试
          </h1>
          <p class="page-subtitle">测试新创建的学习进度跟踪和智能分析工作流</p>
        </div>

        <!-- 测试面板 -->
        <div class="test-panels">
          <!-- 学习进度跟踪测试 -->
          <el-card class="test-card">
            <template #header>
              <div class="card-header">
                <span>📊 学习进度跟踪工作流测试</span>
              </div>
            </template>
            
            <div class="test-form">
              <el-form :model="progressTestForm" label-width="120px">
                <el-form-item label="用户ID">
                  <el-input v-model="progressTestForm.userId" placeholder="输入用户ID" />
                </el-form-item>
                
                <el-form-item label="课程ID">
                  <el-input v-model="progressTestForm.courseId" placeholder="输入课程ID" />
                </el-form-item>
                
                <el-form-item label="章节ID">
                  <el-input v-model="progressTestForm.lessonId" placeholder="输入章节ID" />
                </el-form-item>
                
                <el-form-item label="学习进度">
                  <el-slider 
                    v-model="progressTestForm.progress"
                    :min="0"
                    :max="100"
                    show-input
                  />
                </el-form-item>
                
                <el-form-item label="学习时长(秒)">
                  <el-input-number 
                    v-model="progressTestForm.timeSpent"
                    :min="0"
                    :max="7200"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="testProgressTracking"
                    :loading="progressLoading"
                  >
                    测试进度跟踪
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="progressResult" class="test-result">
              <h4>测试结果:</h4>
              <pre>{{ JSON.stringify(progressResult, null, 2) }}</pre>
            </div>
          </el-card>

          <!-- 智能学习分析测试 -->
          <el-card class="test-card">
            <template #header>
              <div class="card-header">
                <span>🧠 智能学习分析工作流测试</span>
              </div>
            </template>
            
            <div class="test-form">
              <el-form :model="analyticsTestForm" label-width="120px">
                <el-form-item label="用户ID">
                  <el-input v-model="analyticsTestForm.userId" placeholder="输入用户ID" />
                </el-form-item>
                
                <el-form-item label="分析类型">
                  <el-select v-model="analyticsTestForm.analysisType" style="width: 100%">
                    <el-option label="综合分析" value="comprehensive" />
                    <el-option label="学习效率" value="efficiency" />
                    <el-option label="进度跟踪" value="progress" />
                    <el-option label="目标达成" value="goals" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="时间范围(天)">
                  <el-select v-model="analyticsTestForm.timeRange" style="width: 100%">
                    <el-option label="7天" :value="7" />
                    <el-option label="30天" :value="30" />
                    <el-option label="90天" :value="90" />
                  </el-select>
                </el-form-item>
                
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="testSmartAnalytics"
                    :loading="analyticsLoading"
                  >
                    测试智能分析
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="analyticsResult" class="test-result">
              <h4>分析结果:</h4>
              <pre>{{ JSON.stringify(analyticsResult, null, 2) }}</pre>
            </div>
          </el-card>

          <!-- OKR自动更新测试 -->
          <el-card class="test-card">
            <template #header>
              <div class="card-header">
                <span>🎯 OKR自动更新工作流测试</span>
              </div>
            </template>
            
            <div class="test-form">
              <el-form :model="okrTestForm" label-width="120px">
                <el-form-item label="用户ID">
                  <el-input v-model="okrTestForm.userId" placeholder="输入用户ID" />
                </el-form-item>
                
                <el-form-item label="触发类型">
                  <el-select v-model="okrTestForm.triggerType" style="width: 100%">
                    <el-option label="学习活动" value="learning_activity" />
                    <el-option label="手动重算" value="manual_recalculation" />
                    <el-option label="课程完成" value="course_completion" />
                  </el-select>
                </el-form-item>
                
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="testOKRUpdate"
                    :loading="okrLoading"
                  >
                    测试OKR更新
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="okrResult" class="test-result">
              <h4>更新结果:</h4>
              <pre>{{ JSON.stringify(okrResult, null, 2) }}</pre>
            </div>
          </el-card>

          <!-- API端点信息 -->
          <el-card class="test-card">
            <template #header>
              <div class="card-header">
                <span>🔗 API端点信息</span>
              </div>
            </template>
            
            <div class="api-info">
              <div class="api-item">
                <h4>学习进度跟踪</h4>
                <code>POST /webhook-test/api/learning/progress</code>
                <p>记录和更新用户学习进度，自动计算课程完成度</p>
              </div>
              
              <div class="api-item">
                <h4>智能学习分析</h4>
                <code>POST /webhook-test/api/ai/learning-analytics</code>
                <p>生成AI驱动的学习分析报告和个性化建议</p>
              </div>
              
              <div class="api-item">
                <h4>OKR自动更新</h4>
                <code>POST /webhook-test/api/okr/auto-update</code>
                <p>基于学习活动自动更新OKR进度</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import Header from '@/components/Header.vue'
import { learningAPI, okrAPI } from '@/services/n8n-api'

// 响应式数据
const progressLoading = ref(false)
const analyticsLoading = ref(false)
const okrLoading = ref(false)

const progressResult = ref(null)
const analyticsResult = ref(null)
const okrResult = ref(null)

// 测试表单数据
const progressTestForm = reactive({
  userId: 'test-user-123',
  courseId: 'course-001',
  lessonId: 'lesson-001',
  progress: 75,
  timeSpent: 1800 // 30分钟
})

const analyticsTestForm = reactive({
  userId: 'test-user-123',
  analysisType: 'comprehensive',
  timeRange: 7
})

const okrTestForm = reactive({
  userId: 'test-user-123',
  triggerType: 'learning_activity'
})

// 测试方法
const testProgressTracking = async () => {
  progressLoading.value = true
  progressResult.value = null
  
  try {
    const result = await learningAPI.recordProgress(progressTestForm)
    progressResult.value = result
    
    if (result.success) {
      ElMessage.success('学习进度跟踪测试成功！')
    } else {
      ElMessage.error('测试失败: ' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('进度跟踪测试失败:', error)
    ElMessage.error('测试失败: ' + error.message)
    progressResult.value = { error: error.message }
  } finally {
    progressLoading.value = false
  }
}

const testSmartAnalytics = async () => {
  analyticsLoading.value = true
  analyticsResult.value = null
  
  try {
    const result = await learningAPI.getSmartAnalytics(
      analyticsTestForm.userId,
      analyticsTestForm.analysisType,
      analyticsTestForm.timeRange
    )
    analyticsResult.value = result
    
    if (result.success) {
      ElMessage.success('智能分析测试成功！')
    } else {
      ElMessage.error('测试失败: ' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('智能分析测试失败:', error)
    ElMessage.error('测试失败: ' + error.message)
    analyticsResult.value = { error: error.message }
  } finally {
    analyticsLoading.value = false
  }
}

const testOKRUpdate = async () => {
  okrLoading.value = true
  okrResult.value = null
  
  try {
    const result = await okrAPI.autoUpdateProgress(
      okrTestForm.userId,
      okrTestForm.triggerType
    )
    okrResult.value = result
    
    if (result.success) {
      ElMessage.success('OKR更新测试成功！')
    } else {
      ElMessage.error('测试失败: ' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('OKR更新测试失败:', error)
    ElMessage.error('测试失败: ' + error.message)
    okrResult.value = { error: error.message }
  } finally {
    okrLoading.value = false
  }
}
</script>

<style scoped>
.n8n-test-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5em;
  color: #303133;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-subtitle {
  font-size: 1.1em;
  color: #606266;
  margin: 0;
}

.test-panels {
  display: grid;
  gap: 30px;
}

.test-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: 600;
  font-size: 1.1em;
  color: #303133;
}

.test-form {
  margin-bottom: 20px;
}

.test-result {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.test-result h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.test-result pre {
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  font-size: 0.9em;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.api-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.api-item {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.api-item h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.api-item code {
  background: #e6f7ff;
  color: #1890ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.api-item p {
  margin: 8px 0 0 0;
  color: #606266;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2em;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .test-panels {
    gap: 20px;
  }
}
</style>
