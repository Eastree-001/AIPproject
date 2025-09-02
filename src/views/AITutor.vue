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
          <!-- 左侧：学习目标区域 -->
          <div class="goals-section">
            <!-- 学习目标卡片 -->
            <div class="sidebar-card goal-card">
              <div class="card-header">
                <el-icon class="card-icon"><Aim /></el-icon>
                <h3>学习目标</h3>
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
                  <div class="goal-item">
                    <h4>{{ currentGoal.objective }}</h4>
                    <div class="progress-info">
                      <el-progress :percentage="currentGoal.progress || 0" />
                      <span class="progress-text">{{ currentGoal.progress || 0 }}% 完成</span>
                    </div>
                  </div>
                  
                  <!-- 关键结果列表 -->
                  <div class="key-results">
                    <h5>关键结果</h5>
                    <div class="results-list">
                      <div v-for="(result, index) in currentGoal.keyResults" :key="index" class="result-item">
                        <el-checkbox 
                          v-model="result.completed" 
                          @change="updateProgress"
                          :class="{ 'completed': result.completed }"
                        >
                          {{ result.description }}
                        </el-checkbox>
                      </div>
                    </div>
                    <el-button type="success" size="small" @click="saveProgress" class="save-btn">
                      保存进度
                    </el-button>
                  </div>
                  
                  <div class="goal-actions">
                    <el-button type="text" size="small" @click="editGoal">编辑目标</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 中间：对话区域 -->
          <div class="chat-section">
            <div class="chat-container">
              <div class="chat-header">
                <div class="chat-info">
                  <h3>AI学习助手</h3>
                  <p>随时为您答疑解惑</p>
                </div>
                <div class="chat-actions">
                  <el-button type="text" @click="clearChat">
                    <el-icon><Delete /></el-icon>
                    清空对话
                  </el-button>
                </div>
              </div>

              <div class="chat-messages" ref="chatMessagesRef">
                <div v-for="(message, index) in chatMessages" :key="index"
                     :class="['message', message.role]">
                  <div class="message-avatar">
                    <el-icon v-if="message.role === 'assistant'"><ChatDotRound /></el-icon>
                    <el-icon v-else><User /></el-icon>
                  </div>
                  <div class="message-content">
                    <div class="message-text">{{ message.content }}</div>
                    <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                  </div>
                </div>
                
                <!-- 加载指示器 -->
                <div v-if="chatLoading" class="message assistant">
                  <div class="message-avatar">
                    <el-icon><ChatDotRound /></el-icon>
                  </div>
                  <div class="message-content">
                    <div class="loading-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="chat-input-area">
                <div class="input-container">
                  <el-input
                    v-model="chatInput"
                    placeholder="向AI导师提问，例如：'帮我制定今天的学习计划'"
                    type="textarea"
                    size="large"
                    class="chat-input-field"
                    :rows="3"
                    @keyup.enter.ctrl="sendMessage"
                  />
                  <div class="input-actions">
                    <el-button 
                      type="primary" 
                      @click="sendMessage"
                      :disabled="!chatInput.trim() || chatLoading"
                      :loading="chatLoading"
                      size="large"
                    >
                      发送
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：统计和历史 -->
          <div class="sidebar">
            <!-- 学习统计卡片 -->
            <div class="sidebar-card stats-card">
              <div class="card-header">
                <el-icon class="card-icon"><TrendCharts /></el-icon>
                <h3>学习统计</h3>
              </div>
              <div class="card-content">
                <div class="stat-item">
                  <span class="stat-label">今日学习时间</span>
                  <span class="stat-value">2.5小时</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">本周目标完成</span>
                  <span class="stat-value">75%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">累计对话</span>
                  <span class="stat-value">{{ chatMessages.length }}条</span>
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
                       @click="loadChatHistory(session)">
                    <div class="history-title">{{ session.topic || '学习对话' }}</div>
                    <div class="history-time">{{ formatTime(session.created_at) }}</div>
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
      <el-form :model="goalForm" label-position="top">
        <el-form-item label="学习目标" required>
          <el-input
            v-model="goalForm.objective"
            placeholder="请输入您的学习目标"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item label="关键结果" required>
          <div v-for="(result, index) in goalForm.keyResults" :key="index" class="key-result-item">
            <el-input
              v-model="goalForm.keyResults[index]"
              :placeholder="`关键结果 ${index + 1}`"
              style="width: calc(100% - 40px); margin-right: 8px;"
            />
            <el-button 
              v-if="goalForm.keyResults.length > 1"
              type="danger" 
              size="small" 
              @click="removeKeyResult(index)"
              :icon="Delete"
            />
          </div>
          <el-button type="primary" size="small" @click="addKeyResult" :icon="Plus">
            添加关键结果
          </el-button>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelGoalModal">取消</el-button>
          <el-button type="primary" @click="saveGoal">保存目标</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'
import { aiAPI } from '@/services/n8n-api'
import { 
  Aim, 
  ChatDotRound, 
  Clock, 
  TrendCharts,
  Plus,
  Delete,
  User
} from '@element-plus/icons-vue'

// 响应式数据
const currentGoal = ref(null)
const showGoalModal = ref(false)
const chatInput = ref('')
const chatLoading = ref(false)
const chatMessages = ref([
  {
    role: 'assistant',
    content: '你好！我是你的AI学习助手。我可以帮你制定学习计划、解答问题、管理学习目标。请告诉我你今天想学习什么？',
    timestamp: new Date()
  }
])
const chatHistory = ref([])
const chatMessagesRef = ref(null)

// 目标表单
const goalForm = reactive({
  objective: '',
  keyResults: ['', '']
})



// 保存目标（使用本地存储模拟）
const saveGoal = () => {
  if (!goalForm.objective.trim()) {
    ElMessage.warning('请输入学习目标')
    return
  }

  const validKeyResults = goalForm.keyResults.filter(kr => kr.trim())
  if (validKeyResults.length === 0) {
    ElMessage.warning('请至少添加一个关键结果')
    return
  }

  // 创建新目标
  currentGoal.value = {
    id: Date.now().toString(),
    objective: goalForm.objective,
    keyResults: validKeyResults.map(kr => ({
      description: kr,
      completed: false
    })),
    progress: 0
  }
  
  // 保存到本地存储
  localStorage.setItem('learningGoal', JSON.stringify(currentGoal.value))
  
  ElMessage.success('学习目标保存成功！')
  showGoalModal.value = false
  resetGoalForm()
}

// 更新进度
const updateProgress = () => {
  if (currentGoal.value && currentGoal.value.keyResults) {
    const completed = currentGoal.value.keyResults.filter(kr => kr.completed).length
    const total = currentGoal.value.keyResults.length
    currentGoal.value.progress = Math.round((completed / total) * 100)
  }
}

// 保存进度到本地存储
const saveProgress = () => {
  if (!currentGoal.value) return
  
  localStorage.setItem('learningGoal', JSON.stringify(currentGoal.value))
  ElMessage.success('进度保存成功！')
}

// 添加关键结果
const addKeyResult = () => {
  goalForm.keyResults.push('')
}

// 删除关键结果
const removeKeyResult = (index) => {
  goalForm.keyResults.splice(index, 1)
}

// 重置表单
const resetGoalForm = () => {
  goalForm.objective = ''
  goalForm.keyResults = ['', '']
}

// 取消模态框
const cancelGoalModal = () => {
  showGoalModal.value = false
  resetGoalForm()
}

// 编辑目标
const editGoal = () => {
  if (currentGoal.value) {
    goalForm.objective = currentGoal.value.objective
    goalForm.keyResults = currentGoal.value.keyResults.map(kr => kr.description)
    showGoalModal.value = true
  }
}

// 加载本地存储的目标
const loadLocalGoal = () => {
  try {
    const savedGoal = localStorage.getItem('learningGoal')
    if (savedGoal) {
      currentGoal.value = JSON.parse(savedGoal)
    }
  } catch (error) {
    console.error('加载本地目标失败:', error)
  }
}

// 发送消息
const sendMessage = async () => {
  if (!chatInput.value.trim() || chatLoading.value) return

  const userMessage = {
    role: 'user',
    content: chatInput.value,
    timestamp: new Date()
  }

  chatMessages.value.push(userMessage)
  chatLoading.value = true

  const userInput = chatInput.value
  chatInput.value = ''

  try {
    console.log('正在发送消息到n8n:', userInput)
    
    // 调用n8n的AI问答接口
    const response = await aiAPI.askQuestion(userInput, 'user-123', '学习助手对话')
    
    console.log('n8n响应:', response)
    
    // 处理响应
    let assistantMessage = ''
    if (response && response.answer) {
      assistantMessage = response.answer
    } else if (response && response.response) {
      assistantMessage = response.response
    } else if (response && typeof response === 'string') {
      assistantMessage = response
    } else {
      assistantMessage = '抱歉，我现在无法回答您的问题，请稍后再试。'
    }

    chatMessages.value.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date()
    })
    
    chatLoading.value = false
    scrollToBottom()
    
  } catch (error) {
    console.error('发送消息失败:', error)
    
    // 显示具体的错误信息
    let errorMessage = '发送消息失败'
    if (error.message) {
      errorMessage += `: ${error.message}`
    }
    
    ElMessage.error(errorMessage)
    
    // 添加错误提示消息
    chatMessages.value.push({
      role: 'assistant',
      content: '抱歉，我现在无法连接到服务器。请检查网络连接或稍后再试。',
      timestamp: new Date()
    })
    
    chatLoading.value = false
  }

  scrollToBottom()
}

// 清空对话
const clearChat = () => {
  chatMessages.value = [
    {
      role: 'assistant',
      content: '你好！我是你的AI学习助手。有什么可以帮助您的吗？',
      timestamp: new Date()
    }
  ]
}

// 开始新会话
const startNewSession = () => {
  clearChat()
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 加载对话历史
const loadChatHistory = (session) => {
  console.log('加载对话历史:', session)
}

// 页面加载时的初始化
onMounted(() => {
  // 加载本地保存的学习目标
  loadLocalGoal()
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
  max-width: 1900px;
  margin: 0 auto;
  padding: 0 24px;
}

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
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  color: #667eea;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr 420px;
  gap: 36px;
  height: 900px;
}

/* 学习目标区域 */
.goals-section {
  display: flex;
  flex-direction: column;
}

.sidebar-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 24px;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-content {
  padding: 29px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.empty-goal {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  color: #bdc3c7;
  margin-bottom: 16px;
}

.goal-display h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.progress-info {
  margin-bottom: 24px;
}

.progress-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 8px;
  display: block;
}

.key-results h5 {
  margin: 0 0 16px 0;
  color: #34495e;
  font-size: 1rem;
}

.results-list {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.result-item {
  margin-bottom: 12px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-item .el-checkbox {
  width: 100%;
}

.result-item.completed {
  opacity: 0.7;
}

.save-btn {
  width: 100%;
}

.goal-actions {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
}

/* 对话区域 */
.chat-section {
  background: white;
  border-radius: 24px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-container {
  height: 900px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-info h3 {
  margin: 0;
  font-size: 1.2rem;
}

.chat-info p {
  margin: 4px 0 0 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.chat-actions .el-button {
  color: white;
  border: none;
}

.chat-messages {
  flex: 1;
  padding: 29px;
  overflow-y: auto;
  background: #fafbfc;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #667eea;
  color: white;
}

.message.assistant .message-avatar {
  background: #e8f4fd;
  color: #667eea;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 52px);
}

.message-text {
  background: white;
  padding: 16px 20px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
  word-wrap: break-word;
}

.message.user .message-text {
  background: #667eea;
  color: white;
}

.message-time {
  font-size: 0.8rem;
  color: #95a5a6;
  margin-top: 8px;
  padding-left: 20px;
}

.loading-dots {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #bdc3c7;
  animation: loading 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-input-area {
  padding: 29px;
  background: white;
  border-top: 1px solid #ecf0f1;
}

.input-container {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.chat-input-field {
  flex: 1;
}

/* 右侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-card .card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ecf0f1;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #e9ecef;
}

.history-title {
  font-size: 0.9rem;
  color: #2c3e50;
  margin-bottom: 4px;
}

.history-time {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.empty-history {
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
}

/* 模态框样式 */
.key-result-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 24px;
    height: auto;
  }
  
  .goals-section,
  .chat-section,
  .sidebar {
    height: auto;
    min-height: 400px;
  }
}
</style>