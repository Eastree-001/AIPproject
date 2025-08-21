<template>
  <div class="auth-debug" v-if="showDebug">
    <div class="debug-panel">
      <h4>🔍 认证调试信息</h4>
      
      <div class="debug-section">
        <h5>用户状态</h5>
        <div class="debug-item">
          <span>用户:</span>
          <code>{{ user ? user.email : 'null' }}</code>
        </div>
        <div class="debug-item">
          <span>认证状态:</span>
          <el-tag :type="isAuthenticated ? 'success' : 'danger'">
            {{ isAuthenticated ? '已认证' : '未认证' }}
          </el-tag>
        </div>
        <div class="debug-item">
          <span>会话:</span>
          <code>{{ session ? '存在' : 'null' }}</code>
        </div>
      </div>
      
      <div class="debug-section">
        <h5>加载状态</h5>
        <div class="debug-item">
          <span>加载中:</span>
          <el-tag :type="loading ? 'warning' : 'info'">
            {{ loading ? '是' : '否' }}
          </el-tag>
        </div>
        <div class="debug-item">
          <span>错误:</span>
          <code>{{ error || '无' }}</code>
        </div>
      </div>
      
      <div class="debug-section">
        <h5>操作</h5>
        <div class="debug-buttons">
          <el-button size="small" @click="refreshAuth">刷新认证</el-button>
          <el-button size="small" @click="checkSession">检查会话</el-button>
          <el-button size="small" @click="clearAuth">清除认证</el-button>
        </div>
      </div>
      
      <div class="debug-section">
        <h5>控制台日志</h5>
        <div class="log-output">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-level" :class="log.level">{{ log.level }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const logs = ref([])
const showDebug = ref(true) // 开发阶段显示

// 从认证存储获取状态
const user = computed(() => authStore.user)
const session = computed(() => authStore.session)
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 添加日志
const addLog = (level, message) => {
  const log = {
    time: new Date().toLocaleTimeString(),
    level,
    message
  }
  logs.value.unshift(log)
  
  // 限制日志数量
  if (logs.value.length > 20) {
    logs.value = logs.value.slice(0, 20)
  }
}

// 刷新认证状态
const refreshAuth = async () => {
  addLog('info', '刷新认证状态...')
  try {
    await authStore.getCurrentUser()
    await authStore.getCurrentSession()
    addLog('success', '认证状态刷新完成')
  } catch (err) {
    addLog('error', `刷新失败: ${err.message}`)
  }
}

// 检查会话
const checkSession = async () => {
  addLog('info', '检查会话状态...')
  try {
    const session = await authStore.getCurrentSession()
    if (session) {
      addLog('success', `会话有效，过期时间: ${new Date(session.expires_at).toLocaleString()}`)
    } else {
      addLog('warning', '未找到有效会话')
    }
  } catch (err) {
    addLog('error', `检查会话失败: ${err.message}`)
  }
}

// 清除认证
const clearAuth = () => {
  addLog('info', '清除认证状态...')
  authStore.user = null
  authStore.session = null
  authStore.error = null
  addLog('success', '认证状态已清除')
}

// 监听认证状态变化
watch([user, session, isAuthenticated], ([newUser, newSession, newAuth], [oldUser, oldSession, oldAuth]) => {
  if (newUser !== oldUser) {
    addLog('info', `用户状态变化: ${oldUser?.email || 'null'} -> ${newUser?.email || 'null'}`)
  }
  if (newSession !== oldSession) {
    addLog('info', `会话状态变化: ${oldSession ? '存在' : 'null'} -> ${newSession ? '存在' : 'null'}`)
  }
  if (newAuth !== oldAuth) {
    addLog('info', `认证状态变化: ${oldAuth} -> ${newAuth}`)
  }
}, { deep: true })

// 监听错误
watch(error, (newError, oldError) => {
  if (newError !== oldError && newError) {
    addLog('error', `认证错误: ${newError}`)
  }
})

onMounted(() => {
  addLog('info', '认证调试组件已加载')
  addLog('info', `当前用户: ${user.value?.email || 'null'}`)
  addLog('info', `认证状态: ${isAuthenticated.value}`)
})
</script>

<style scoped>
.auth-debug {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.debug-panel {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 12px;
  padding: 20px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-panel h4 {
  margin: 0 0 15px 0;
  color: #4facfe;
  font-size: 14px;
}

.debug-panel h5 {
  margin: 15px 0 8px 0;
  color: #ffd700;
  font-size: 12px;
}

.debug-section {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-section:last-child {
  border-bottom: none;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  padding: 3px 0;
}

.debug-item span {
  color: #ccc;
}

.debug-item code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  color: #4facfe;
}

.debug-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.log-output {
  max-height: 150px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 8px;
}

.log-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  align-items: center;
}

.log-time {
  color: #888;
  min-width: 60px;
}

.log-level {
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.log-level.info {
  background: #4facfe;
  color: white;
}

.log-level.success {
  background: #67c23a;
  color: white;
}

.log-level.warning {
  background: #e6a23c;
  color: white;
}

.log-level.error {
  background: #f56c6c;
  color: white;
}

.log-message {
  color: #ddd;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-debug {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .debug-panel {
    font-size: 11px;
  }
}
</style>
