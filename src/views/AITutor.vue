<template>
  <div class="ai-tutor-page">
    <Header />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 页面标题区域 -->
        <div class="page-header">
          <div class="header-content">
            <div class="title-section">
              <h1 class="page-title">
                <el-icon class="title-icon"><ChatDotRound /></el-icon>
                AI智能导师
              </h1>
              <p class="page-subtitle">您的专属学习伙伴，提供个性化指导、目标管理和智能对话</p>
            </div>
            <div class="header-actions">
              <el-button type="primary" size="large" @click="startNewSession">
                <el-icon><Plus /></el-icon>
                开始新对话
              </el-button>
            </div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-layout">
          <!-- 左侧：AI对话区域 -->
          <div class="chat-section">
            <div class="chat-container">
              <div class="chat-header">
                <div class="chat-info">
                  <h3>AI学习助手</h3>
                  <span class="status online">在线</span>
                </div>
                <div class="chat-actions">
                  <el-button type="text" @click="clearChat">
                    <el-icon><Delete /></el-icon>
                    清空对话
                  </el-button>
                </div>
              </div>
              
              <div class="chat-messages" ref="chatMessages">
                <div v-for="(message, index) in chatMessages" :key="index" 
                     :class="['message', message.role]">
                  <div class="message-avatar">
                    <el-avatar v-if="message.role === 'assistant'" :src="aiAvatar" />
                    <el-avatar v-else :src="userAvatar" />
                  </div>
                  <div class="message-content">
                    <div class="message-bubble">
                      <div class="message-text">{{ message.content }}</div>
                      <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                    </div>
                  </div>
                </div>
                
                <!-- 加载指示器 -->
                <div v-if="chatLoading" class="message assistant">
                  <div class="message-avatar">
                    <el-avatar :src="aiAvatar" />
                  </div>
                  <div class="message-content">
                    <div class="message-bubble">
                      <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="chat-input-area">
                <div class="input-container">
                  <el-input 
                    v-model="chatInput" 
                    placeholder="向AI导师提问，例如：'帮我制定今天的学习计划' 或 '解释一下数据结构中的二叉树概念'"
                    @keyup.enter="sendMessage"
                    size="large"
                    class="chat-input-field"
                    :rows="3"
                    type="textarea"
                    resize="none"
                  />
                  <div class="input-actions">
                    <el-button 
                      type="primary" 
                      @click="sendMessage"
                      :disabled="!chatInput.trim() || chatLoading"
                      :loading="chatLoading"
                      size="large"
                      class="send-btn"
                    >
                      <el-icon><Promotion /></el-icon>
                      发送
                    </el-button>
                  </div>
                </div>
                
                <!-- 快捷问题 -->
                <div class="quick-questions">
                  <span class="quick-label">快捷问题：</span>
                  <el-button 
                    v-for="question in quickQuestions" 
                    :key="question"
                    type="text" 
                    size="small"
                    @click="askQuickQuestion(question)"
                  >
                    {{ question }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：功能面板 -->
          <div class="sidebar">
            <!-- 学习目标卡片 -->
            <div class="sidebar-card goal-card">
              <div class="card-header">
                <el-icon class="card-icon"><Aim /></el-icon>
                <h3>学习目标</h3>
              </div>
              <div class="card-content">
                <div v-if="!currentOKR" class="empty-goal">
                                     <el-icon class="empty-icon"><Aim /></el-icon>
                  <p>还没有设定学习目标</p>
                  <el-button type="primary" size="small" @click="showGoalModal = true">
                    设定目标
                  </el-button>
                </div>
                <div v-else class="goal-display">
                  <div class="goal-item">
                    <h4>当前目标</h4>
                    <p>{{ currentOKR.objective }}</p>
                  </div>
                  <div class="goal-progress">
                    <el-progress :percentage="goalProgress" :stroke-width="8" />
                    <span class="progress-text">{{ goalProgress }}% 完成</span>
                  </div>
                  <el-button type="text" size="small" @click="editGoal">
                    编辑目标
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 学习统计卡片 -->
            <div class="sidebar-card stats-card">
              <div class="card-header">
                <el-icon class="card-icon"><TrendCharts /></el-icon>
                <h3>学习统计</h3>
              </div>
              <div class="card-content">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.totalSessions }}</div>
                    <div class="stat-label">对话次数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.totalQuestions }}</div>
                    <div class="stat-label">提问数量</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.completedGoals }}</div>
                    <div class="stat-label">完成目标</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.learningDays }}</div>
                    <div class="stat-label">学习天数</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 最近对话卡片 -->
            <div class="sidebar-card history-card">
              <div class="card-header">
                <el-icon class="card-icon"><Clock /></el-icon>
                <h3>最近对话</h3>
              </div>
              <div class="card-content">
                <div class="history-list">
                  <div v-if="chatHistory.length === 0" class="empty-history">
                    <p>暂无对话记录</p>
                  </div>
                  <div v-else v-for="(session, index) in chatHistory.slice(0, 5)" :key="index" 
                       class="history-item"
                       @click="loadSession(session)">
                    <div class="history-info">
                      <div class="history-title">{{ session.title || '学习对话' }}</div>
                      <div class="history-time">{{ formatDate(session.date) }}</div>
                    </div>
                    <el-icon class="history-arrow"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 目标设定模态框 -->
    <el-dialog v-model="showGoalModal" title="设定学习目标" width="500px">
      <el-form :model="okrForm" label-position="top">
        <el-form-item label="学习目标" required>
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
            style="margin-bottom: 12px;"
          />
          <el-input 
            v-model="okrForm.keyResult2" 
            placeholder="关键结果2"
          />
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
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import { 
  Aim, 
  ChatDotRound, 
  Clock, 
  TrendCharts,
  Plus,
  Delete,
  ArrowRight,
  Promotion
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const okrForm = reactive({
  objective: '',
  keyResult1: '',
  keyResult2: ''
})

const currentOKR = ref(null)
const chatInput = ref('')
const chatLoading = ref(false)
const showGoalModal = ref(false)
const goalProgress = ref(65) // 模拟进度

// 头像
const aiAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=AI'
const userAvatar = computed(() => authStore.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User')

// 聊天消息
const chatMessages = ref([
  {
    role: 'assistant',
    content: '你好！我是你的AI学习助手。我可以帮你制定学习计划、解答问题、管理学习目标。请告诉我你今天想学习什么？',
    timestamp: new Date()
  }
])

// 聊天历史
const chatHistory = ref([
  {
    date: '2025-01-27',
    title: '数据结构学习讨论',
    preview: '关于数据结构的学习讨论...',
    messages: []
  },
  {
    date: '2025-01-26',
    title: '算法优化建议',
    preview: '算法性能优化建议...',
    messages: []
  }
])

// 统计数据
const stats = reactive({
  totalSessions: 15,
  totalQuestions: 48,
  completedGoals: 3,
  learningDays: 12
})

// 快捷问题
const quickQuestions = [
  '制定学习计划',
  '解释概念',
  '复习建议',
  '学习技巧'
]

const chatMessages_ref = ref(null)

// 计算属性
const hasGoal = computed(() => !!currentOKR.value)

// 方法
const startNewSession = () => {
  chatMessages.value = [
    {
      role: 'assistant',
      content: '开始新的学习对话！请告诉我你想学习什么？',
      timestamp: new Date()
    }
  ]
  ElMessage.success('已开始新对话')
}

const clearChat = () => {
  chatMessages.value = [
    {
      role: 'assistant',
      content: '对话已清空，让我们重新开始吧！',
      timestamp: new Date()
    }
  ]
  ElMessage.success('对话已清空')
}

const saveGoal = () => {
  if (!okrForm.objective.trim()) {
    ElMessage.warning('请输入学习目标')
    return
  }

  currentOKR.value = {
    objective: okrForm.objective,
    keyResults: [okrForm.keyResult1, okrForm.keyResult2].filter(kr => kr.trim())
  }

  ElMessage.success('学习目标保存成功！')
  showGoalModal.value = false
  
  // 清空表单
  okrForm.objective = ''
  okrForm.keyResult1 = ''
  okrForm.keyResult2 = ''
}

const editGoal = () => {
  if (currentOKR.value) {
    okrForm.objective = currentOKR.value.objective
    okrForm.keyResult1 = currentOKR.value.keyResults[0] || ''
    okrForm.keyResult2 = currentOKR.value.keyResults[1] || ''
    showGoalModal.value = true
  }
}

const askQuickQuestion = (question) => {
  const questionMap = {
    '制定学习计划': '我来帮你制定一个个性化的学习计划。请告诉我你的学习目标、可用时间和当前水平。',
    '解释概念': '我很乐意为你解释任何概念！请具体说明你想了解哪个概念。',
    '复习建议': '复习是学习的重要环节。请告诉我你想复习什么内容，我会给出相应的建议。',
    '学习技巧': '学习技巧可以帮助你更高效地学习。请告诉我你遇到的具体困难。'
  }
  
  chatInput.value = question
  sendMessage()
}

const sendMessage = async () => {
  if (!chatInput.value.trim() || chatLoading.value) return

  const userMessage = {
    role: 'user',
    content: chatInput.value,
    timestamp: new Date()
  }

  chatMessages.value.push(userMessage)
  chatLoading.value = true
  
  // 清空输入框
  const userInput = chatInput.value
  chatInput.value = ''

  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  // 模拟AI回复
  try {
    const aiResponse = await generateAIResponse(userInput)
    chatMessages.value.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    })
    
    // 滚动到底部
    await nextTick()
    scrollToBottom()
  } catch (error) {
    ElMessage.error('AI回复失败，请重试')
  } finally {
    chatLoading.value = false
  }
}

const generateAIResponse = async (userInput) => {
  // 模拟AI响应延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // 简单的AI响应逻辑
  const responses = [
    '这是一个很好的问题！让我来详细解释一下...',
    '根据你的学习目标，我建议你可以这样安排...',
    '这个问题涉及到几个重要概念，让我为你梳理一下...',
    '你的思路很清晰！我补充几点建议...',
    '这是一个常见的学习难点，我来分享一些解决方法...'
  ]
  
  return responses[Math.floor(Math.random() * responses.length)] + 
         ' ' + userInput + ' 相关内容的学习建议和指导。'
}

const loadSession = (session) => {
  ElMessage.info(`加载对话：${session.title}`)
  // 这里可以实现加载历史对话的逻辑
}

const scrollToBottom = () => {
  if (chatMessages_ref.value) {
    chatMessages_ref.value.scrollTop = chatMessages_ref.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    month: 'short', 
    day: 'numeric' 
  })
}

// 组件挂载时
onMounted(() => {
  // 可以在这里加载用户的学习目标和历史数据
  console.log('AI导师页面已加载')
})
</script>

<style scoped>
.ai-tutor-page {
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

/* 主布局 */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 400px; /* 从350px增加到400px */
  gap: 30px;
  align-items: start;
}

/* 左侧聊天区域 */
.chat-section {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chat-container {
  height: 750px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-info h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 4px;
}

.status.online {
  background: #52c41a;
  color: white;
}

.chat-actions .el-button {
  color: white;
}

.chat-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message.user .message-content {
  max-width: 70%;
}

.message-bubble {
  background: #f5f5f5;
  padding: 16px 20px;
  border-radius: 20px;
  position: relative;
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-text {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 8px;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* 聊天输入区域 */
.chat-input-area {
  padding: 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.input-container {
  margin-bottom: 16px;
}

.chat-input-field :deep(.el-textarea__inner) {
  border-radius: 20px;
  border: 2px solid #e0e0e0;
  padding: 16px 20px;
  font-size: 0.95rem;
  resize: none;
  transition: all 0.3s ease;
}

.chat-input-field :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.send-btn {
  border-radius: 20px;
  padding: 12px 24px;
  font-weight: 600;
}

/* 快捷问题 */
.quick-questions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.quick-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.quick-questions .el-button {
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 16px;
  color: #667eea;
  border: 1px solid #e0e0e0;
}

.quick-questions .el-button:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 右侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 750px; /* 与左侧聊天区域高度保持一致 */
}

.sidebar-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  flex: 1; /* 让卡片平均分配高度 */
  display: flex;
  flex-direction: column;
  /* 确保卡片有足够的最小高度 */
  min-height: 200px;
}

.sidebar-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.sidebar-card .card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0; /* 防止头部被压缩 */
}

.card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.sidebar-card .card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.sidebar-card .card-content {
  padding: 24px; /* 从20px增加到24px */
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止内容溢出 */
  overflow-y: auto; /* 添加垂直滚动条 */
  /* 移除 justify-content: center，让内容自然排列 */
}

/* 学习目标卡片 */
.empty-goal {
  text-align: center;
  padding: 24px 0; /* 从20px增加到24px */
  /* 移除 height: 100% 和 justify-content: center，让内容自然排列 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  color: #ccc;
  margin-bottom: 16px; /* 从12px增加到16px */
  font-size: 2rem;
}

.empty-goal p {
  color: #999;
  margin-bottom: 20px; /* 从16px增加到20px */
  font-size: 0.9rem; /* 增加字体大小 */
}

.goal-display {
  text-align: center;
  /* 移除 height: 100% 和 justify-content: center，让内容自然排列 */
  display: flex;
  flex-direction: column;
  padding: 0 8px; /* 添加左右内边距 */
}

.goal-item h4 {
  margin: 0 0 12px 0; /* 从8px增加到12px */
  color: #333;
  font-size: 1.1rem; /* 从1rem增加到1.1rem */
}

.goal-item p {
  color: #666;
  margin: 0 0 20px 0; /* 从16px增加到20px */
  line-height: 1.6; /* 从1.5增加到1.6 */
  word-wrap: break-word; /* 确保长文本换行 */
}

.goal-progress {
  margin-bottom: 20px; /* 从16px增加到20px */
}

.progress-text {
  font-size: 0.9rem; /* 从0.85rem增加到0.9rem */
  color: #666;
  margin-top: 12px; /* 从8px增加到12px */
  display: block;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px; /* 从16px增加到20px */
  /* 移除 height: 100% 和 align-content: center，让内容自然排列 */
  overflow-y: auto; /* 添加垂直滚动条 */
  /* 添加Element Plus风格的滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #dcdfe6 #f5f7fa;
}

.stats-grid::-webkit-scrollbar {
  width: 8px;
}

.stats-grid::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 4px;
}

.stats-grid::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 4px;
  border: 2px solid #f5f7fa;
}

.stats-grid::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.stat-item {
  text-align: center;
  padding: 20px 16px; /* 从16px增加到20px */
  background: #f8f9fa;
  border-radius: 12px;
  min-width: 0; /* 防止内容溢出 */
  /* 确保统计项目有足够的高度显示完整内容 */
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-number {
  font-size: 2rem; /* 从1.8rem增加到2rem */
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px; /* 从4px增加到8px */
  line-height: 1.2;
  /* 确保数字完全可见 */
  display: block;
  height: auto;
  overflow: visible;
}

.stat-label {
  font-size: 0.85rem; /* 从0.8rem增加到0.85rem */
  color: #666;
  line-height: 1.3;
  word-wrap: break-word; /* 确保长标签换行 */
  /* 确保标签完全可见 */
  display: block;
  height: auto;
  overflow: visible;
}

/* 历史记录卡片 */
.history-list {
  max-height: 200px;
  overflow-y: auto;
  /* 移除 height: 100% 和 justify-content: center，让内容自然排列 */
  display: flex;
  flex-direction: column;
  padding: 0 4px; /* 添加左右内边距 */
  /* 添加Element Plus风格的滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #dcdfe6 #f5f7fa;
}

.history-list::-webkit-scrollbar {
  width: 8px;
}

.history-list::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 4px;
  border: 2px solid #f5f7fa;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.empty-history {
  text-align: center;
  color: #999;
  padding: 24px 0; /* 从20px增加到24px */
  /* 移除 height: 100% 和 justify-content: center，让内容自然排列 */
  display: flex;
  align-items: center;
  font-size: 0.9rem; /* 增加字体大小 */
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px; /* 从12px 16px增加到16px 20px */
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  margin-bottom: 8px; /* 添加底部间距 */
}

.history-item:last-child {
  margin-bottom: 0; /* 最后一个项目不需要底部间距 */
}

.history-item:hover {
  background: #f8f9fa;
  border-color: #e0e0e0;
}

.history-info {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
  margin-right: 12px; /* 添加右侧间距 */
}

.history-title {
  font-size: 0.95rem; /* 从0.9rem增加到0.95rem */
  font-weight: 500;
  color: #333;
  margin-bottom: 6px; /* 从4px增加到6px */
  line-height: 1.3;
  word-wrap: break-word; /* 确保长标题换行 */
}

.history-time {
  font-size: 0.8rem; /* 从0.75rem增加到0.8rem */
  color: #999;
  line-height: 1.2;
}

.history-arrow {
  color: #ccc;
  font-size: 0.9rem; /* 从0.8rem增加到0.9rem */
  flex-shrink: 0; /* 防止箭头被压缩 */
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .sidebar {
    order: -1;
    height: auto;
    max-width: 100%; /* 确保在小屏幕上占满宽度 */
  }
  
  .chat-container {
    height: 500px;
  }
  
  .sidebar-card {
    flex: none;
  }
  
  /* 在小屏幕上调整卡片内容布局 */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-item {
    padding: 16px 12px;
  }
  
  .history-item {
    padding: 14px 16px;
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
  
  .chat-container {
    height: 400px;
  }
  
  .chat-messages {
    padding: 16px;
  }
  
  .chat-input-area {
    padding: 16px;
  }
  
  .sidebar-card .card-content {
    padding: 20px; /* 在小屏幕上保持适当的内边距 */
  }
  
  .stats-grid {
    grid-template-columns: 1fr; /* 在小屏幕上改为单列布局 */
    gap: 12px;
  }
  
  .stat-item {
    padding: 16px;
  }
  
  .history-item {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .chat-container {
    height: 350px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .message.user .message-content {
    max-width: 85%;
  }
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 右侧卡片滚动条样式 - Element Plus风格 */
.sidebar-card .card-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-card .card-content::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 4px;
}

.sidebar-card .card-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 4px;
  border: 2px solid #f5f7fa;
}

.sidebar-card .card-content::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

/* 为Firefox添加滚动条样式 */
.sidebar-card .card-content {
  scrollbar-width: thin;
  scrollbar-color: #dcdfe6 #f5f7fa;
}

/* 动画效果 */
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>