<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">🌟 启明星</div>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar :src="authStore.user?.avatar" size="small" />
            <span class="username">{{ authStore.user?.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="content-grid">
        <!-- OKR管理卡片 -->
        <div class="card okr-card fade-in-up">
          <div class="card-header">
            <el-icon class="card-icon"><Aim /></el-icon>
            <h3>学习目标管理</h3>
          </div>
          
          <div class="card-content">
            <div v-if="!currentOKR" class="okr-form">
              <el-form :model="okrForm" label-position="top">
                <el-form-item label="本周学习目标">
                  <el-input 
                    v-model="okrForm.objective" 
                    placeholder="例如：掌握数据结构基础概念"
                    type="textarea"
                    :rows="3"
                  />
                </el-form-item>
                <el-form-item label="关键结果">
                  <el-input 
                    v-model="okrForm.keyResult1" 
                    placeholder="关键结果1"
                    style="margin-bottom: 10px;"
                  />
                  <el-button type="primary" @click="saveOKR" style="width: 100%;">
                    保存OKR
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-else class="okr-display">
              <div class="okr-header">
                <h4>当前OKR</h4>
                <el-button type="text" @click="editOKR">编辑</el-button>
              </div>
              <div class="okr-item">
                <strong>目标：</strong>{{ currentOKR.objective }}
              </div>
            </div>
          </div>
        </div>

        <!-- AI聊天卡片 -->
        <div class="card chat-card fade-in-up">
          <div class="card-header">
            <el-icon class="card-icon"><ChatDotRound /></el-icon>
            <h3>AI学习助手</h3>
          </div>
          
          <div class="card-content">
            <div class="chat-container">
              <div class="chat-messages" ref="chatMessages">
                <div v-for="(message, index) in chatMessages" :key="index" 
                     :class="['message', message.role]">
                  <div class="message-bubble">
                    {{ message.content }}
                  </div>
                </div>
              </div>
              
              <div class="chat-input">
                <el-input 
                  v-model="chatInput" 
                  placeholder="向AI助手提问，例如：今天我该做什么？"
                  @keyup.enter="sendMessage"
                >
                  <template #append>
                    <el-button 
                      type="primary" 
                      @click="sendMessage"
                      :disabled="!chatInput.trim()"
                    >
                      发送
                    </el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天历史卡片 -->
        <div class="card history-card fade-in-up">
          <div class="card-header">
            <el-icon class="card-icon"><Clock /></el-icon>
            <h3>聊天历史</h3>
          </div>
          
          <div class="card-content">
            <div class="history-list">
              <div v-for="(session, index) in chatHistory" :key="index" 
                   class="history-item"
                   @click="loadSession(session)">
                <div class="history-date">{{ session.date }}</div>
                <div class="history-preview">{{ session.preview }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const okrForm = reactive({
  objective: '',
  keyResult1: ''
})

const currentOKR = ref(null)
const chatInput = ref('')
const chatMessages = ref([
  {
    role: 'assistant',
    content: '你好！我是你的AI学习助手。请先设定你的学习目标，然后我就可以为你提供个性化的学习指导了！'
  }
])
const chatHistory = ref([
  {
    date: '2025-01-27',
    preview: '关于数据结构的学习讨论...',
    messages: []
  }
])

// 方法
const saveOKR = () => {
  if (!okrForm.objective.trim()) {
    ElMessage.warning('请输入学习目标')
    return
  }

  currentOKR.value = {
    objective: okrForm.objective,
    keyResults: [okrForm.keyResult1].filter(kr => kr.trim())
  }

  ElMessage.success('OKR保存成功！')
  okrForm.objective = ''
  okrForm.keyResult1 = ''
}

const editOKR = () => {
  if (currentOKR.value) {
    okrForm.objective = currentOKR.value.objective
    okrForm.keyResult1 = currentOKR.value.keyResults[0] || ''
    currentOKR.value = null
  }
}

const sendMessage = async () => {
  if (!chatInput.value.trim()) return

  const userMessage = {
    role: 'user',
    content: chatInput.value
  }

  chatMessages.value.push(userMessage)
  
  // 模拟AI回复
  const aiResponse = await generateAIResponse(chatInput.value)
  chatMessages.value.push({
    role: 'assistant',
    content: aiResponse
  })

  chatInput.value = ''
}

const generateAIResponse = async (userInput) => {
  await new Promise(resolve => setTimeout(resolve, 1000))

  if (userInput.includes('今天') && userInput.includes('做什么')) {
    if (currentOKR.value) {
      return `基于你的OKR目标"${currentOKR.value.objective}"，建议今天完成相关任务！`
    } else {
      return '请先设定你的学习目标，这样我才能为你推荐合适的任务！'
    }
  } else {
    return '我理解你的问题。作为你的AI学习助手，我可以帮你解答学习疑问！'
  }
}

const loadSession = (session) => {
  ElMessage.info('加载聊天记录功能开发中...')
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/auth')
    } catch {
      // 用户取消
    }
  }
}

onMounted(() => {
  authStore.initAuth()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #ffffff;
}

.header {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 30px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left .logo {
  font-size: 1.8rem;
  color: #409EFF;
  font-weight: 700;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  color: #303133;
  font-weight: 500;
}

.main-content {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 30px;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 1.5rem;
  color: #409EFF;
}

.card-header h3 {
  margin: 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-content {
  padding: 20px;
}

.okr-form {
  margin-bottom: 20px;
}

.okr-display {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 20px;
}

.okr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.okr-header h4 {
  margin: 0;
  color: #409EFF;
  font-size: 1rem;
}

.okr-item {
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  border-left: 4px solid #409EFF;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chat-container {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
  max-height: 350px;
}

.message {
  margin-bottom: 15px;
}

.message.user {
  text-align: right;
}

.message-bubble {
  display: inline-block;
  max-width: 80%;
  padding: 12px 18px;
  border-radius: 20px;
  word-wrap: break-word;
}

.message.user .message-bubble {
  background: #409EFF;
  color: white;
  border-bottom-right-radius: 5px;
}

.message.assistant .message-bubble {
  background: white;
  color: #333;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 5px;
}

.chat-input {
  margin-top: auto;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.history-item:hover {
  background: #f8f9fa;
  border-color: #409EFF;
}

.history-date {
  font-size: 0.9rem;
  color: #606266;
  margin-bottom: 5px;
}

.history-preview {
  font-size: 0.8rem;
  color: #909399;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 20px;
    height: 60px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .header-left .logo {
    font-size: 1.5rem;
  }
}
</style>
