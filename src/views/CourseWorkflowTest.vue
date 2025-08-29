<template>
  <div class="workflow-test-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <div class="test-header">
          <h1>课程工作流测试页面</h1>
          <p>测试n8n工作流与Supabase数据库的连接</p>
        </div>

        <div class="test-sections">
          <!-- 创建课程测试 -->
          <div class="test-section">
            <h2>1. 创建课程测试</h2>
            <el-button 
              type="primary" 
              @click="testCreateCourse"
              :loading="loading.create"
            >
              测试创建课程
            </el-button>
            <div v-if="results.create" class="result-box">
              <pre>{{ JSON.stringify(results.create, null, 2) }}</pre>
            </div>
          </div>

          <!-- 获取课程统计测试 -->
          <div class="test-section">
            <h2>2. 课程统计测试</h2>
            <el-input 
              v-model="testUserId" 
              placeholder="输入用户ID（可选）"
              style="width: 300px; margin-right: 10px;"
            />
            <el-button 
              type="primary" 
              @click="testCourseStats"
              :loading="loading.stats"
            >
              测试获取统计
            </el-button>
            <div v-if="results.stats" class="result-box">
              <pre>{{ JSON.stringify(results.stats, null, 2) }}</pre>
            </div>
          </div>

          <!-- 获取课程列表测试 -->
          <div class="test-section">
            <h2>3. 课程列表测试</h2>
            <el-button 
              type="primary" 
              @click="testCourseList"
              :loading="loading.list"
            >
              测试获取课程列表
            </el-button>
            <div v-if="results.list" class="result-box">
              <pre>{{ JSON.stringify(results.list, null, 2) }}</pre>
            </div>
          </div>

          <!-- 课程推荐测试 -->
          <div class="test-section">
            <h2>4. 课程推荐测试</h2>
            <el-input 
              v-model="testUserId" 
              placeholder="输入用户ID"
              style="width: 300px; margin-right: 10px;"
            />
            <el-button 
              type="primary" 
              @click="testRecommendCourses"
              :loading="loading.recommend"
            >
              测试课程推荐
            </el-button>
            <div v-if="results.recommend" class="result-box">
              <pre>{{ JSON.stringify(results.recommend, null, 2) }}</pre>
            </div>
          </div>

          <!-- 课程详情测试 -->
          <div class="test-section">
            <h2>5. 课程详情测试</h2>
            <el-input 
              v-model="testCourseId" 
              placeholder="输入课程ID"
              style="width: 300px; margin-right: 10px;"
            />
            <el-button 
              type="primary" 
              @click="testCourseDetails"
              :loading="loading.details"
            >
              测试获取详情
            </el-button>
            <div v-if="results.details" class="result-box">
              <pre>{{ JSON.stringify(results.details, null, 2) }}</pre>
            </div>
          </div>

          <!-- 数据库连接状态 -->
          <div class="test-section">
            <h2>6. 数据库连接状态</h2>
            <div class="status-indicators">
              <div class="status-item">
                <span class="status-label">n8n连接:</span>
                <span :class="['status-indicator', connectionStatus.n8n ? 'success' : 'error']">
                  {{ connectionStatus.n8n ? '正常' : '异常' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">Supabase连接:</span>
                <span :class="['status-indicator', connectionStatus.supabase ? 'success' : 'error']">
                  {{ connectionStatus.supabase ? '正常' : '异常' }}
                </span>
              </div>
            </div>
            <el-button @click="checkConnections" :loading="loading.connection">
              检查连接状态
            </el-button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'
import { courseAPI } from '@/services/n8n-api.js'

// 响应式数据
const testUserId = ref('')
const testCourseId = ref('')

const loading = reactive({
  create: false,
  stats: false,
  list: false,
  recommend: false,
  details: false,
  connection: false
})

const results = reactive({
  create: null,
  stats: null,
  list: null,
  recommend: null,
  details: null
})

const connectionStatus = reactive({
  n8n: false,
  supabase: false
})

// 测试方法
const testCreateCourse = async () => {
  loading.create = true
  try {
    const testCourseData = {
      title: '测试课程 - ' + new Date().toLocaleString(),
      description: '这是一个用于测试n8n工作流的课程',
      instructor: '测试讲师',
      duration: 120,
      difficulty: 2,
      category: '前端开发',
      price: 99.00,
      tags: ['测试', 'n8n', 'Vue.js'],
      requirements: ['基础编程知识'],
      learningObjectives: ['掌握工作流测试', '理解API调用']
    }

    const result = await courseAPI.createCourse(testCourseData)
    results.create = result
    
    if (result.success) {
      ElMessage.success('课程创建测试成功！')
      connectionStatus.n8n = true
      connectionStatus.supabase = true
    } else {
      ElMessage.error('课程创建测试失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('创建课程测试失败:', error)
    results.create = { error: error.message }
    ElMessage.error('创建课程测试失败：' + error.message)
  } finally {
    loading.create = false
  }
}

const testCourseStats = async () => {
  loading.stats = true
  try {
    const result = await courseAPI.getCourseStats(testUserId.value)
    results.stats = result
    
    if (result.success) {
      ElMessage.success('课程统计测试成功！')
    } else {
      ElMessage.error('课程统计测试失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('课程统计测试失败:', error)
    results.stats = { error: error.message }
    ElMessage.error('课程统计测试失败：' + error.message)
  } finally {
    loading.stats = false
  }
}

const testCourseList = async () => {
  loading.list = true
  try {
    const result = await courseAPI.getAllCourses({
      page: 1,
      limit: 5
    })
    results.list = result
    
    if (result.success) {
      ElMessage.success('课程列表测试成功！')
    } else {
      ElMessage.error('课程列表测试失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('课程列表测试失败:', error)
    results.list = { error: error.message }
    ElMessage.error('课程列表测试失败：' + error.message)
  } finally {
    loading.list = false
  }
}

const testRecommendCourses = async () => {
  if (!testUserId.value) {
    ElMessage.warning('请输入用户ID')
    return
  }

  loading.recommend = true
  try {
    const result = await courseAPI.getRecommendedCourses(testUserId.value, {
      limit: 3
    })
    results.recommend = result
    
    if (result.success) {
      ElMessage.success('课程推荐测试成功！')
    } else {
      ElMessage.error('课程推荐测试失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('课程推荐测试失败:', error)
    results.recommend = { error: error.message }
    ElMessage.error('课程推荐测试失败：' + error.message)
  } finally {
    loading.recommend = false
  }
}

const testCourseDetails = async () => {
  if (!testCourseId.value) {
    ElMessage.warning('请输入课程ID')
    return
  }

  loading.details = true
  try {
    const result = await courseAPI.getCourse(testCourseId.value, testUserId.value)
    results.details = result
    
    if (result.success) {
      ElMessage.success('课程详情测试成功！')
    } else {
      ElMessage.error('课程详情测试失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('课程详情测试失败:', error)
    results.details = { error: error.message }
    ElMessage.error('课程详情测试失败：' + error.message)
  } finally {
    loading.details = false
  }
}

const checkConnections = async () => {
  loading.connection = true
  try {
    // 尝试获取课程统计来检查连接
    const result = await courseAPI.getCourseStats()
    
    if (result.success) {
      connectionStatus.n8n = true
      connectionStatus.supabase = true
      ElMessage.success('连接检查成功！')
    } else {
      connectionStatus.n8n = false
      connectionStatus.supabase = false
      ElMessage.error('连接检查失败')
    }
  } catch (error) {
    connectionStatus.n8n = false
    connectionStatus.supabase = false
    ElMessage.error('连接检查失败：' + error.message)
  } finally {
    loading.connection = false
  }
}

// 组件挂载时检查连接
onMounted(() => {
  checkConnections()
})
</script>

<style scoped>
.workflow-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  padding-top: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.test-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
}

.test-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
}

.test-header p {
  font-size: 1.1rem;
  color: #666;
}

.test-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.test-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.test-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.result-box {
  margin-top: 20px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.result-box pre {
  margin: 0;
  font-size: 0.9rem;
  color: #495057;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.status-indicators {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-label {
  font-weight: 500;
  color: #333;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-indicator.success {
  background: #d4edda;
  color: #155724;
}

.status-indicator.error {
  background: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .test-header h1 {
    font-size: 2rem;
  }
  
  .status-indicators {
    flex-direction: column;
    gap: 15px;
  }
}
</style>