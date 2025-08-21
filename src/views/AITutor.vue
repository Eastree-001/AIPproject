<template>
  <div class="ai-tutor-page">
    <Header />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">AI导师</h1>
          <p class="page-subtitle">您的智能学习伙伴，提供个性化学习指导和目标管理</p>
        </div>

        <!-- 功能卡片网格 -->
        <div class="content-grid">
          <!-- OKR管理卡片 -->
          <div class="feature-card okr-card fade-in-up">
            <div class="card-header">
              <div class="header-icon">
                <el-icon size="24"><Aim /></el-icon>
              </div>
              <div class="header-content">
                <h3 class="card-title">学习目标管理</h3>
                <p class="card-subtitle">设定和追踪您的学习目标</p>
              </div>
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
                      class="form-input"
                    />
                  </el-form-item>
                  <el-form-item label="关键结果">
                    <el-input 
                      v-model="okrForm.keyResult1" 
                      placeholder="关键结果1"
                      class="form-input"
                      style="margin-bottom: 16px;"
                    />
                    <el-button 
                      type="primary" 
                      @click="saveOKR" 
                      class="submit-btn"
                      size="large"
                    >
                      保存OKR
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              
              <div v-else class="okr-display">
                <div class="okr-header">
                  <h4>当前OKR</h4>
                  <el-button type="primary" link @click="editOKR">编辑</el-button>
                </div>
                <div class="okr-item">
                  <div class="okr-label">目标：</div>
                  <div class="okr-value">{{ currentOKR.objective }}</div>
                </div>
                <div v-if="currentOKR.keyResults && currentOKR.keyResults.length" class="okr-item">
                  <div class="okr-label">关键结果：</div>
                  <div class="okr-value">{{ currentOKR.keyResults[0] }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI聊天卡片 -->
          <div class="feature-card chat-card fade-in-up">
            <div class="card-header">
              <div class="header-icon">
                <el-icon size="24"><ChatDotRound /></el-icon>
              </div>
              <div class="header-content">
                <h3 class="card-title">AI学习助手</h3>
                <p class="card-subtitle">智能对话，个性化学习指导</p>
              </div>
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
                    size="large"
                    class="input-field"
                  >
                    <template #append>
                      <el-button 
                        type="primary" 
                        @click="sendMessage"
                        :disabled="!chatInput.trim()"
                        :loading="chatLoading"
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
          <div class="feature-card history-card fade-in-up">
            <div class="card-header">
              <div class="header-icon">
                <el-icon size="24"><Clock /></el-icon>
              </div>
              <div class="header-content">
                <h3 class="card-title">聊天历史</h3>
                <p class="card-subtitle">查看历史对话记录</p>
              </div>
            </div>
            
            <div class="card-content">
              <div class="history-list">
                <div v-if="chatHistory.length === 0" class="empty-state">
                  <el-icon size="48" class="empty-icon"><ChatDotRound /></el-icon>
                  <p>暂无聊天记录</p>
                </div>
                <div v-else v-for="(session, index) in chatHistory" :key="index" 
                     class="history-item"
                     @click="loadSession(session)">
                  <div class="history-date">{{ session.date }}</div>
                  <div class="history-preview">{{ session.preview }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 学习统计卡片 -->
          <div class="feature-card stats-card fade-in-up">
            <div class="card-header">
              <div class="header-icon">
                <el-icon size="24"><TrendCharts /></el-icon>
              </div>
              <div class="header-content">
                <h3 class="card-title">学习统计</h3>
                <p class="card-subtitle">查看您的学习进度</p>
              </div>
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
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import { 
  Aim, 
  ChatDotRound, 
  Clock, 
  TrendCharts 
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const okrForm = reactive({
  objective: '',
  keyResult1: ''
})

const currentOKR = ref(null)
const chatInput = ref('')
const chatLoading = ref(false)
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

const stats = reactive({
  totalSessions: 15,
  totalQuestions: 48,
  completedGoals: 3,
  learningDays: 12
})

const chatMessages_ref = ref(null)

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
  if (!chatInput.value.trim() || chatLoading.value) return

  const userMessage = {
    role: 'user',
    content: chatInput.value
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
      content: aiResponse
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
  await new Promise(resolve => setTimeout(resolve, 1500))

  const responses = {
    greeting: ['你好', '您好', 'hello', 'hi'],
    todayTask: ['今天', '做什么', '任务'],
    learning: ['学习', '怎么学', '方法'],
    goal: ['目标', '计划', 'okr']
  }

  const input = userInput.toLowerCase()

  if (responses.greeting.some(keyword => input.includes(keyword))) {
    return '你好！很高兴为您服务。我可以帮助您制定学习计划、回答学习问题，或者提供个性化的学习建议。'
  }

  if (responses.todayTask.some(keyword => input.includes(keyword))) {
    if (currentOKR.value) {
      return `基于您的学习目标"${currentOKR.value.objective}"，我建议今天：
1. 复习相关基础概念
2. 完成实践练习
3. 总结今天的学习收获
您觉得这个安排如何？`
    } else {
      return '建议您先设定一个明确的学习目标，这样我就能为您推荐更具体的学习任务了！'
    }
  }

  if (responses.learning.some(keyword => input.includes(keyword))) {
    return `关于学习方法，我建议：
1. 制定明确的学习目标
2. 分解大目标为小任务
3. 定期复习和总结
4. 多做实践练习
5. 保持持续学习的习惯

您想了解哪个方面的具体方法吗？`
  }

  if (responses.goal.some(keyword => input.includes(keyword))) {
    return `目标设定很重要！建议您：
1. 使用SMART原则设定目标
2. 将大目标分解为可执行的小目标
3. 设定明确的时间节点
4. 定期回顾和调整目标

需要我帮您制定具体的学习目标吗？`
  }

  return `我理解您的问题。作为您的AI学习助手，我可以帮您：
• 制定学习计划和目标
• 解答学习相关问题
• 提供学习方法建议
• 追踪学习进度

请告诉我您具体想了解什么，我会尽力帮助您！`
}

const scrollToBottom = () => {
  if (chatMessages_ref.value) {
    chatMessages_ref.value.scrollTop = chatMessages_ref.value.scrollHeight
  }
}

const loadSession = (session) => {
  ElMessage.info('加载聊天记录功能开发中...')
}

onMounted(() => {
  // 初始化时滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
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
  padding: 40px 24px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

/* 功能卡片 */
.feature-card {
  background: white;
  border-radius: 20px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.card-content {
  padding: 24px;
}

/* OKR表单 */
.form-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.form-input :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  width: 100%;
  border-radius: 12px;
  font-weight: 500;
}

/* OKR显示 */
.okr-display {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 20px;
}

.okr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.okr-header h4 {
  margin: 0;
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 600;
}

.okr-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.okr-item:last-child {
  margin-bottom: 0;
}

.okr-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.okr-value {
  color: #666;
  line-height: 1.5;
}

/* 聊天容器 */
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
  border-radius: 16px;
  max-height: 380px;
}

.message {
  margin-bottom: 16px;
}

.message.user {
  text-align: right;
}

.message-bubble {
  display: inline-block;
  max-width: 80%;
  padding: 12px 18px;
  border-radius: 18px;
  word-wrap: break-word;
  line-height: 1.4;
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 6px;
}

.message.assistant .message-bubble {
  background: white;
  color: #333;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 6px;
}

.chat-input {
  margin-top: auto;
}

.input-field :deep(.el-input-group__append) {
  border-radius: 0 12px 12px 0;
}

.input-field :deep(.el-input__wrapper) {
  border-radius: 12px 0 0 12px;
}

/* 历史记录 */
.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.history-item {
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.history-item:hover {
  background: #f8f9fa;
  border-color: #667eea;
  transform: translateY(-2px);
}

.history-date {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 4px;
}

.history-preview {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #667eea;
}

.stat-item:hover .stat-number {
  color: white;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.stat-item:hover .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

/* 动画效果 */
.fade-in-up {
  animation: fadeInUp 0.8s ease-out;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .container {
    padding: 30px 16px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: 1.1rem;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .card-header {
    padding: 20px;
  }
  
  .card-content {
    padding: 20px;
  }
  
  .chat-container {
    height: 400px;
  }
  
  .chat-messages {
    max-height: 280px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 20px 12px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>