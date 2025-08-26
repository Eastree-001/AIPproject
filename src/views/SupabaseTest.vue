<template>
  <div class="test-container">
    <div class="test-card">
      <h1>🔧 Supabase 连接测试</h1>
      
      <div class="status-section">
        <h3>连接状态</h3>
        <div class="status-item">
          <span>环境变量:</span>
          <el-tag :type="envStatus.type">{{ envStatus.message }}</el-tag>
        </div>
        <div class="status-item">
          <span>数据库连接:</span>
          <el-tag :type="dbStatus.type">{{ dbStatus.message }}</el-tag>
        </div>
      </div>

      <div class="test-section">
        <h3>功能测试</h3>
        
        <div class="test-buttons">
          <el-button 
            type="primary" 
            @click="testConnection"
            :loading="testing"
          >
            测试连接
          </el-button>
          
          <el-button 
            type="success" 
            @click="testAuth"
            :loading="authTesting"
          >
            测试认证
          </el-button>
          
          <el-button 
            type="warning" 
            @click="testDatabase"
            :loading="dbTesting"
          >
            测试数据库
          </el-button>
        </div>
      </div>

      <div class="results-section" v-if="testResults.length > 0">
        <h3>测试结果</h3>
        <div class="result-list">
          <div 
            v-for="(result, index) in testResults" 
            :key="index"
            class="result-item"
            :class="result.type"
          >
            <el-icon>
              <component :is="result.icon" />
            </el-icon>
            <span>{{ result.message }}</span>
            <small>{{ result.time }}</small>
          </div>
        </div>
      </div>

      <div class="actions">
        <el-button @click="$router.push('/')">返回首页</el-button>
        <el-button type="primary" @click="runAllTests">运行所有测试</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Check, 
  Close, 
  Warning, 
  InfoFilled,
  Connection,
  User,
  Database
} from '@element-plus/icons-vue'
import { 
  checkEnvironmentVariables, 
  validateSupabaseConfig, 
  getEnvironmentInfo 
} from '../utils/env-check'
import { supabase, testConnection as testSupabaseConnection } from '../lib/supabase'

// 响应式数据
const testing = ref(false)
const authTesting = ref(false)
const dbTesting = ref(false)

const envStatus = reactive({
  type: 'info',
  message: '检查中...'
})

const dbStatus = reactive({
  type: 'info',
  message: '检查中...'
})

const testResults = ref([])

// 添加测试结果
const addResult = (type, message, icon = InfoFilled) => {
  const result = {
    type,
    message,
    icon,
    time: new Date().toLocaleTimeString()
  }
  testResults.value.unshift(result)
  
  // 限制结果数量
  if (testResults.value.length > 10) {
    testResults.value = testResults.value.slice(0, 10)
  }
}

// 测试环境变量
const testEnvironment = () => {
  try {
    const envCheck = checkEnvironmentVariables()
    const supabaseCheck = validateSupabaseConfig()
    const envInfo = getEnvironmentInfo()
    
    console.log('环境信息:', envInfo)
    
    if (envCheck && supabaseCheck.valid) {
      envStatus.type = 'success'
      envStatus.message = '配置正常'
      addResult('success', '环境变量配置正确', Check)
    } else {
      envStatus.type = 'danger'
      envStatus.message = '配置异常'
      addResult('error', '环境变量配置异常', Close)
    }
  } catch (error) {
    envStatus.type = 'danger'
    envStatus.message = '检查失败'
    addResult('error', `环境检查失败: ${error.message}`, Close)
  }
}

// 测试数据库连接
const testConnection = async () => {
  testing.value = true
  try {
    const isConnected = await testSupabaseConnection()
    
    if (isConnected) {
      dbStatus.type = 'success'
      dbStatus.message = '连接正常'
      addResult('success', '数据库连接成功', Check)
      ElMessage.success('数据库连接正常！')
    } else {
      dbStatus.type = 'danger'
      dbStatus.message = '连接失败'
      addResult('error', '数据库连接失败', Close)
      ElMessage.error('数据库连接失败！')
    }
  } catch (error) {
    dbStatus.type = 'danger'
    dbStatus.message = '连接异常'
    addResult('error', `连接异常: ${error.message}`, Close)
    ElMessage.error(`连接异常: ${error.message}`)
  } finally {
    testing.value = false
  }
}

// 测试认证功能
const testAuth = async () => {
  authTesting.value = true
  try {
    // 测试获取当前用户
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      addResult('warning', `认证检查: ${error.message}`, Warning)
    } else if (user) {
      addResult('success', `当前用户: ${user.email}`, User)
    } else {
      addResult('info', '未登录状态', InfoFilled)
    }
    
    ElMessage.success('认证功能测试完成！')
  } catch (error) {
    addResult('error', `认证测试失败: ${error.message}`, Close)
    ElMessage.error(`认证测试失败: ${error.message}`)
  } finally {
    authTesting.value = false
  }
}

// 测试数据库操作
const testDatabase = async () => {
  dbTesting.value = true
  try {
    // 测试查询用户表
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        addResult('warning', '用户表不存在或为空，需要先创建数据库表', Warning)
      } else {
        addResult('error', `数据库查询失败: ${error.message}`, Close)
      }
    } else {
      addResult('success', '数据库查询成功', Database)
    }
    
    ElMessage.success('数据库功能测试完成！')
  } catch (error) {
    addResult('error', `数据库测试失败: ${error.message}`, Close)
    ElMessage.error(`数据库测试失败: ${error.message}`)
  } finally {
    dbTesting.value = false
  }
}

// 运行所有测试
const runAllTests = async () => {
  testResults.value = []
  
  // 1. 测试环境变量
  testEnvironment()
  
  // 2. 测试数据库连接
  await testConnection()
  
  // 3. 测试认证功能
  await testAuth()
  
  // 4. 测试数据库操作
  await testDatabase()
  
  ElMessage.success('所有测试完成！')
}

// 组件挂载时运行基本检查
onMounted(() => {
  testEnvironment()
})
</script>

<style scoped>
.test-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.test-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #303133;
  margin-bottom: 30px;
  font-size: 2rem;
}

h3 {
  color: #606266;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.status-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #e4e7ed;
}

.status-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.test-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.test-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.results-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.result-list {
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: white;
  border-left: 4px solid #e4e7ed;
}

.result-item.success {
  border-left-color: #67c23a;
  background: #f0f9ff;
}

.result-item.error {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.result-item.warning {
  border-left-color: #e6a23c;
  background: #fdf6ec;
}

.result-item.info {
  border-left-color: #909399;
  background: #f4f4f5;
}

.result-item small {
  margin-left: auto;
  color: #909399;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

@media (max-width: 768px) {
  .test-card {
    padding: 20px;
    margin: 10px;
  }
  
  .test-buttons {
    flex-direction: column;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
