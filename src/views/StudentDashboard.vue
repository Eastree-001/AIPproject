<template>
  <div class="student-dashboard">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">🌟 启明星</div>
        <div class="user-info">
          <el-avatar :src="userInfo.avatar" size="small" />
          <span class="username">{{ userInfo.name }}</span>
          <span class="user-role">{{ userInfo.major }} · {{ userInfo.grade }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button @click="showOKRModal = true" type="primary" :icon="Aim">
            设定OKR
          </el-button>
          <el-button @click="showPlanModal = true" type="success" :icon="Calendar">
            学习计划
          </el-button>
        </el-button-group>
        <el-dropdown @command="handleCommand">
          <el-button :icon="Setting" circle />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 欢迎区域 -->
      <div class="welcome-section fade-in-up">
        <div class="welcome-card">
          <div class="welcome-content">
            <h1>欢迎回来，{{ userInfo.name }}！</h1>
            <p>今天是 {{ currentDate }}，让我们继续你的学习之旅吧！</p>
            <div class="quick-stats">
              <div class="stat-item">
                <div class="stat-number">{{ currentOKR ? '1' : '0' }}</div>
                <div class="stat-label">进行中的OKR</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ todayTasks.length }}</div>
                <div class="stat-label">今日任务</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ completedTasks.length }}</div>
                <div class="stat-label">已完成任务</div>
              </div>
            </div>
          </div>
          <div class="welcome-illustration">
            <el-icon class="illustration-icon"><Star /></el-icon>
          </div>
        </div>
      </div>

      <!-- 主要内容网格 -->
      <div class="content-grid">
        <!-- 左侧：OKR管理 -->
        <div class="left-column">
          <!-- OKR概览卡片 -->
          <div class="card okr-overview-card fade-in-up">
            <div class="card-header">
              <el-icon class="card-icon"><Aim /></el-icon>
              <h3>学习目标概览</h3>
              <el-button @click="showOKRModal = true" type="text" :icon="Plus">
                新建
              </el-button>
            </div>
            <div class="card-content">
              <div v-if="!currentOKR" class="empty-state">
                <el-empty description="还没有设定学习目标">
                  <el-button type="primary" @click="showOKRModal = true">
                    立即设定OKR
                  </el-button>
                </el-empty>
              </div>
              <div v-else class="okr-display">
                <div class="okr-tree">
                  <div class="okr-level">
                    <div class="level-label">学院目标</div>
                    <div class="okr-item college-okr">
                      <strong>{{ collegeOKR.objective }}</strong>
                      <div class="progress-bar">
                        <el-progress :percentage="collegeOKR.progress" :stroke-width="8" />
                      </div>
                    </div>
                  </div>
                  <div class="okr-level">
                    <div class="level-label">课程目标</div>
                    <div class="okr-item course-okr">
                      <strong>{{ courseOKR.objective }}</strong>
                      <div class="progress-bar">
                        <el-progress :percentage="courseOKR.progress" :stroke-width="8" />
                      </div>
                    </div>
                  </div>
                  <div class="okr-level">
                    <div class="level-label">个人目标</div>
                    <div class="okr-item personal-okr">
                      <strong>{{ currentOKR.objective }}</strong>
                      <div class="progress-bar">
                        <el-progress :percentage="currentOKR.progress" :stroke-width="8" />
                      </div>
                      <div class="key-results">
                        <div v-for="(kr, index) in currentOKR.keyResults" :key="index" class="kr-item">
                          <span>{{ kr.text }}</span>
                          <el-tag :type="kr.status === 'completed' ? 'success' : kr.status === 'in_progress' ? 'warning' : 'info'">
                            {{ getStatusText(kr.status) }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 今日任务卡片 -->
          <div class="card today-tasks-card fade-in-up">
            <div class="card-header">
              <el-icon class="card-icon"><Calendar /></el-icon>
              <h3>今日任务</h3>
              <el-button @click="refreshTasks" type="text" :icon="Refresh">
                刷新
              </el-button>
            </div>
            <div class="card-content">
              <div v-if="todayTasks.length === 0" class="empty-state">
                <el-empty description="今天没有安排任务">
                  <el-button type="primary" @click="generateTasks">
                    生成学习计划
                  </el-button>
                </el-empty>
              </div>
              <div v-else class="tasks-list">
                <div v-for="(task, index) in todayTasks" :key="index" class="task-item">
                  <div class="task-header">
                    <el-checkbox 
                      v-model="task.completed" 
                      @change="updateTaskStatus(task)"
                      :disabled="task.status === 'blocked'"
                    />
                    <span class="task-title" :class="{ completed: task.completed }">
                      {{ task.title }}
                    </span>
                    <el-tag :type="getTaskTagType(task.priority)" size="small">
                      {{ getPriorityText(task.priority) }}
                    </el-tag>
                  </div>
                  <div class="task-details">
                    <span class="task-duration">{{ task.duration }}分钟</span>
                    <span class="task-course">{{ task.course }}</span>
                    <span class="task-kr">KR: {{ task.relatedKR }}</span>
                  </div>
                  <div class="task-actions">
                    <el-button 
                      v-if="task.status === 'blocked'"
                      @click="diagnoseTask(task)" 
                      type="warning" 
                      size="small"
                    >
                      诊断障碍
                    </el-button>
                    <el-button 
                      @click="viewTaskDetails(task)" 
                      type="text" 
                      size="small"
                    >
                      查看详情
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间：AI助手和主要功能 -->
        <div class="center-column">
          <!-- AI学习助手卡片 -->
          <div class="card ai-assistant-card fade-in-up">
            <div class="card-header">
              <el-icon class="card-icon"><ChatDotRound /></el-icon>
              <h3>AI学习助手</h3>
              <div class="ai-status">
                <el-tag type="success" size="small">在线</el-tag>
              </div>
            </div>
            <div class="card-content">
              <div class="chat-container">
                <div class="chat-messages" ref="chatMessages">
                  <div v-for="(message, index) in chatMessages" :key="index" 
                       :class="['message', message.role]">
                    <div class="message-avatar">
                      <el-avatar 
                        :src="message.role === 'assistant' ? '/ai-avatar.png' : userInfo.avatar" 
                        size="small" 
                      />
                    </div>
                    <div class="message-bubble">
                      <div class="message-content" v-html="formatMessage(message.content)"></div>
                      <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="chat-input">
                  <el-input 
                    v-model="chatInput" 
                    placeholder="向AI助手提问，例如：今天我该做什么？如何理解B+树？"
                    @keyup.enter="sendMessage"
                    :disabled="chatLoading"
                  >
                    <template #prepend>
                      <el-button @click="showQuickActions = !showQuickActions" :icon="More" />
                    </template>
                    <template #append>
                      <el-button 
                        type="primary" 
                        @click="sendMessage"
                        :loading="chatLoading"
                        :disabled="!chatInput.trim()"
                      >
                        发送
                      </el-button>
                    </template>
                  </el-input>
                  
                  <!-- 快速操作面板 -->
                  <div v-if="showQuickActions" class="quick-actions">
                    <el-button @click="askQuestion('今天我该做什么？')" size="small">
                      今日任务
                    </el-button>
                    <el-button @click="askQuestion('帮我分析学习进度')" size="small">
                      进度分析
                    </el-button>
                    <el-button @click="askQuestion('推荐学习资源')" size="small">
                      资源推荐
                    </el-button>
                    <el-button @click="askQuestion('遇到学习障碍怎么办？')" size="small">
                      障碍诊断
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 学习进度卡片 -->
          <div class="card progress-card fade-in-up">
            <div class="card-header">
              <el-icon class="card-icon"><TrendCharts /></el-icon>
              <h3>学习进度追踪</h3>
              <el-button @click="showProgressModal = true" type="text" :icon="View">
                详细报告
              </el-button>
            </div>
            <div class="card-content">
              <div class="progress-overview">
                <div class="progress-item">
                  <div class="progress-label">本周完成度</div>
                  <el-progress 
                    :percentage="weeklyProgress" 
                    :stroke-width="12" 
                    :color="getProgressColor(weeklyProgress)"
                  />
                </div>
                <div class="progress-item">
                  <div class="progress-label">月度目标达成</div>
                  <el-progress 
                    :percentage="monthlyProgress" 
                    :stroke-width="12" 
                    :color="getProgressColor(monthlyProgress)"
                  />
                </div>
              </div>
              
              <div class="progress-chart">
                <div class="chart-title">近7天学习时长</div>
                <div class="chart-container">
                  <!-- 这里可以集成图表库，如ECharts -->
                  <div class="mock-chart">
                    <div v-for="(day, index) in weeklyStudyHours" :key="index" class="chart-bar">
                      <div class="bar-value" :style="{ height: (day.hours / 8) * 100 + '%' }"></div>
                      <div class="bar-label">{{ day.day }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：资源推荐和成长画像 -->
        <div class="right-column">
          <!-- 学习资源推荐卡片 -->
          <div class="card resources-card fade-in-up">
            <div class="card-header">
              <el-icon class="card-icon"><Reading /></el-icon>
              <h3>推荐资源</h3>
              <el-button @click="refreshResources" type="text" :icon="Refresh">
                刷新
              </el-button>
            </div>
            <div class="card-content">
              <div class="resources-list">
                <div v-for="(resource, index) in recommendedResources" :key="index" class="resource-item">
                  <div class="resource-icon">
                    <el-icon v-if="resource.type === 'video'"><VideoPlay /></el-icon>
                    <el-icon v-else-if="resource.type === 'article'"><Document /></el-icon>
                    <el-icon v-else-if="resource.type === 'course'"><School /></el-icon>
                    <el-icon v-else><Link /></el-icon>
                  </div>
                  <div class="resource-content">
                    <div class="resource-title">{{ resource.title }}</div>
                    <div class="resource-source">{{ resource.source }}</div>
                    <div class="resource-tags">
                      <el-tag v-for="tag in resource.tags" :key="tag" size="small" type="info">
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <el-button @click="openResource(resource)" type="primary" size="small">
                      查看
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 个人成长画像卡片 -->
          <div class="card growth-card fade-in-up">
            <div class="card-header">
              <el-icon class="card-icon"><User /></el-icon>
              <h3>成长画像</h3>
              <el-button @click="showGrowthModal = true" type="text" :icon="View">
                详细分析
              </el-button>
            </div>
            <div class="card-content">
              <div class="growth-overview">
                <div class="skill-radar">
                  <div class="skill-item">
                    <div class="skill-name">编程基础</div>
                    <el-progress :percentage="skillLevels.programming" :stroke-width="8" />
                  </div>
                  <div class="skill-item">
                    <div class="skill-name">数据结构</div>
                    <el-progress :percentage="skillLevels.dataStructure" :stroke-width="8" />
                  </div>
                  <div class="skill-item">
                    <div class="skill-name">算法设计</div>
                    <el-progress :percentage="skillLevels.algorithm" :stroke-width="8" />
                  </div>
                  <div class="skill-item">
                    <div class="skill-name">软件工程</div>
                    <el-progress :percentage="skillLevels.softwareEngineering" :stroke-width="8" />
                  </div>
                </div>
                
                <div class="growth-insights">
                  <div class="insight-item">
                    <el-icon class="insight-icon"><Light /></el-icon>
                    <span>你的数据结构掌握得很好，建议继续深入学习算法设计</span>
                  </div>
                  <div class="insight-item">
                    <el-icon class="insight-icon"><Warning /></el-icon>
                    <span>软件工程实践需要加强，建议多参与项目开发</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 模态框 -->
    <!-- OKR设置模态框 -->
    <el-dialog v-model="showOKRModal" title="设定学习目标" width="600px">
      <OKRModal @okr-saved="handleOKRSaved" />
    </el-dialog>

    <!-- 学习计划模态框 -->
    <el-dialog v-model="showPlanModal" title="学习计划详情" width="800px">
      <PlanModal :tasks="todayTasks" @plan-updated="refreshTasks" />
    </el-dialog>

    <!-- 进度详情模态框 -->
    <el-dialog v-model="showProgressModal" title="学习进度报告" width="900px">
      <PlanModal :tasks="todayTasks" @plan-updated="refreshTasks" />
    </el-dialog>

    <!-- 成长分析模态框 -->
    <el-dialog v-model="showGrowthModal" title="个人成长分析" width="800px">
      <PlanModal :tasks="todayTasks" @plan-updated="refreshTasks" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Aim, Calendar, ChatDotRound, Setting, Plus, Refresh, 
  View, TrendCharts, Reading, User, VideoPlay, Document, 
  School, Link, More, Star, Light, Warning
} from '@element-plus/icons-vue'

// 组件导入
import OKRModal from '../components/OKRModal.vue'
import PlanModal from '../components/PlanModal.vue'

const router = useRouter()

// 响应式数据
const showOKRModal = ref(false)
const showPlanModal = ref(false)
const showProgressModal = ref(false)
const showGrowthModal = ref(false)
const showQuickActions = ref(false)
const chatInput = ref('')
const chatLoading = ref(false)
const chatMessages = ref([
  {
    role: 'assistant',
    content: '你好！我是你的AI学习助手。我可以帮你制定学习计划、解答问题、推荐资源，让学习更高效！',
    timestamp: new Date()
  }
])

// 用户信息
const userInfo = reactive({
  id: 1,
  name: '小明',
  email: 'xiaoming@example.com',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  studentId: '2023001',
  major: '软件工程',
  grade: '大二',
  class: '软工2班'
})

// OKR数据
const currentOKR = ref({
  objective: '掌握数据结构与算法基础，为进入大厂做准备',
  progress: 65,
  keyResults: [
    { text: '完成数据结构课程所有作业', status: 'completed' },
    { text: '掌握常见算法的时间复杂度分析', status: 'in_progress' },
    { text: '独立完成3个编程项目', status: 'not_started' }
  ]
})

const collegeOKR = ref({
  objective: '提升全院学生编程实践能力',
  progress: 78
})

const courseOKR = ref({
  objective: '数据结构课程优秀率提升至85%',
  progress: 82
})

// 任务数据
const todayTasks = ref([
  {
    id: 1,
    title: '复习B+树的概念和实现',
    duration: 60,
    course: '数据结构',
    priority: 'high',
    relatedKR: '掌握常见算法的时间复杂度分析',
    completed: false,
    status: 'normal'
  },
  {
    id: 2,
    title: '完成算法作业第5题',
    duration: 90,
    course: '算法设计',
    priority: 'medium',
    relatedKR: '完成数据结构课程所有作业',
    completed: false,
    status: 'normal'
  },
  {
    id: 3,
    title: '阅读软件工程相关论文',
    duration: 45,
    course: '软件工程',
    priority: 'low',
    relatedKR: '独立完成3个编程项目',
    completed: false,
    status: 'blocked'
  }
])

const completedTasks = computed(() => todayTasks.value.filter(task => task.completed))

// 进度数据
const weeklyProgress = ref(72)
const monthlyProgress = ref(68)
const weeklyStudyHours = ref([
  { day: '周一', hours: 6.5 },
  { day: '周二', hours: 7.2 },
  { day: '周三', hours: 5.8 },
  { day: '周四', hours: 8.1 },
  { day: '周五', hours: 6.9 },
  { day: '周六', hours: 4.5 },
  { day: '周日', hours: 3.2 }
])

// 技能水平
const skillLevels = reactive({
  programming: 85,
  dataStructure: 78,
  algorithm: 65,
  softwareEngineering: 45
})

// 推荐资源
const recommendedResources = ref([
  {
    id: 1,
    title: 'B+树详解与实现',
    source: 'Bilibili - 王道考研',
    type: 'video',
    tags: ['数据结构', 'B+树', '数据库']
  },
  {
    id: 2,
    title: '算法复杂度分析实战',
    source: 'CSDN博客',
    type: 'article',
    tags: ['算法', '复杂度', '实战']
  },
  {
    id: 3,
    title: '软件工程最佳实践',
    source: '慕课网',
    type: 'course',
    tags: ['软件工程', '项目管理', '最佳实践']
  }
])

// 计算属性
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 方法
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中...')
      break
    case 'settings':
      ElMessage.info('设置功能开发中...')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        ElMessage.success('已退出登录')
        router.push('/auth')
      } catch {
        // 用户取消
      }
      break
  }
}

const handleOKRSaved = (okrData) => {
  currentOKR.value = okrData
  showOKRModal.value = false
  ElMessage.success('OKR设置成功！')
  refreshTasks()
}

const refreshTasks = () => {
  ElMessage.success('任务已刷新')
}

const generateTasks = () => {
  ElMessage.success('已生成个性化学习计划')
}

const updateTaskStatus = (task) => {
  if (task.completed) {
    ElMessage.success(`任务"${task.title}"已完成！`)
  }
}

const diagnoseTask = (task) => {
  ElMessage.info(`正在分析任务"${task.title}"的障碍...`)
}

const viewTaskDetails = (task) => {
  ElMessage.info(`查看任务"${task.title}"的详细信息`)
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
  
  // 模拟AI回复
  const aiResponse = await generateAIResponse(chatInput.value)
  chatMessages.value.push({
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date()
  })

  chatInput.value = ''
  chatLoading.value = false
  
  // 滚动到底部
  await nextTick()
  const chatContainer = document.querySelector('.chat-messages')
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight
  }
}

const generateAIResponse = async (userInput) => {
  await new Promise(resolve => setTimeout(resolve, 1000))

  if (userInput.includes('今天') && userInput.includes('做什么')) {
    if (todayTasks.value.length > 0) {
      const taskList = todayTasks.value.map(task => `• ${task.title} (${task.duration}分钟)`).join('\n')
      return `根据你的OKR和学习计划，今天需要完成以下任务：\n\n${taskList}\n\n建议按照优先级顺序执行，遇到问题随时找我！`
    } else {
      return '今天没有安排具体任务，建议你：\n\n1. 复习昨天的学习内容\n2. 预习明天的课程\n3. 或者告诉我你想学习什么，我来帮你制定计划！'
    }
  } else if (userInput.includes('B+树') || userInput.includes('数据结构')) {
    return `B+树是一种平衡的多路搜索树，常用于数据库和文件系统的索引结构。\n\n**主要特点：**\n• 所有叶子节点都在同一层\n• 非叶子节点只存储键值，不存储数据\n• 叶子节点通过链表相连，便于范围查询\n\n**推荐学习资源：**\n• �� B站：王道考研数据结构\n• �� 教材：严蔚敏《数据结构》\n• 💻 实践：尝试实现简单的B+树\n\n需要我详细解释某个概念吗？`
  } else if (userInput.includes('进度') || userInput.includes('分析')) {
    return `根据你的学习数据，我来分析一下：\n\n**本周进度：**${weeklyProgress.value}%\n**月度目标：**${monthlyProgress.value}%\n\n**优势领域：**\n• 编程基础掌握得很好 (${skillLevels.programming}%)\n• 数据结构理解深入 (${skillLevels.dataStructure}%)\n\n**需要加强：**\n• 软件工程实践 (${skillLevels.softwareEngineering}%)\n• 算法设计应用 (${skillLevels.algorithm}%)\n\n建议多参与项目开发，将理论知识应用到实践中！`
  } else if (userInput.includes('资源') || userInput.includes('推荐')) {
    return `基于你当前的学习重点，我推荐以下资源：\n\n**�� 数据结构与算法：**\n• 王道考研数据结构视频\n• LeetCode刷题平台\n• 《算法导论》经典教材\n\n**🚀 编程实践：**\n• GitHub开源项目\n• 慕课网实战课程\n• 牛客网编程练习\n\n**�� 软件工程：**\n• 《代码整洁之道》\n• 敏捷开发实践\n• 项目管理工具使用\n\n你想深入了解哪个方面？`
  } else if (userInput.includes('障碍') || userInput.includes('问题')) {
    return `遇到学习障碍是很正常的！让我帮你分析一下：\n\n**常见障碍类型：**\n1. **概念理解困难** - 建议多角度学习，画图理解\n2. **实践应用不足** - 多做项目，理论结合实践\n3. **时间管理问题** - 制定详细计划，番茄工作法\n4. **学习动力不足** - 设定小目标，及时奖励\n\n**我的建议：**\n• 把大问题拆分成小问题\n• 寻求同学和老师的帮助\n• 利用在线资源补充学习\n• 保持学习的连续性\n\n告诉我具体遇到了什么问题，我来帮你解决！`
  } else {
    return `我理解你的问题。作为你的AI学习助手，我可以帮你：\n\n• �� **制定学习计划** - 基于OKR生成个性化任务\n• 🔍 **解答技术问题** - 7x24小时知识库问答\n• �� **推荐学习资源** - 多平台优质内容整合\n• �� **分析学习进度** - 实时监控和预警\n• �� **诊断学习障碍** - 智能分析和解决方案\n\n请告诉我你具体需要什么帮助，或者试试上面的快速操作按钮！`
  }
}

const askQuestion = (question) => {
  chatInput.value = question
  sendMessage()
}

const refreshResources = () => {
  ElMessage.success('资源推荐已刷新')
}

const openResource = (resource) => {
  ElMessage.info(`正在打开：${resource.title}`)
}

const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'not_started': '未开始'
  }
  return statusMap[status] || '未知'
}

const getTaskTagType = (priority) => {
  const typeMap = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority) => {
  const textMap = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || '未知'
}

const getProgressColor = (progress) => {
  if (progress >= 80) return '#67C23A'
  if (progress >= 60) return '#E6A23C'
  return '#F56C6C'
}

const formatMessage = (content) => {
  return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\n/g, '<br>')
               .replace(/•/g, '•')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  ElMessage.success('欢迎使用启明星学习平台！')
})
</script>

<style scoped>
.student-dashboard {
  min-height: 100vh;
  background: #ffffff;
}

.header {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 30px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  font-size: 2rem;
  color: #409EFF;
  font-weight: 700;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 1.1rem;
  color: #303133;
  font-weight: 600;
}

.user-role {
  font-size: 0.9rem;
  color: #909399;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.main-content {
  padding: 30px;
  max-width: 1600px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 40px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content h1 {
  font-size: 2.2rem;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.welcome-content p {
  font-size: 1.1rem;
  margin: 0 0 30px 0;
  opacity: 0.9;
}

.quick-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.illustration-icon {
  font-size: 6rem;
  opacity: 0.3;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 30px;
}

.left-column,
.center-column,
.right-column {
  display: flex;
  flex-direction: column;
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
  justify-content: space-between;
}

.card-header h3 {
  margin: 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
}

.card-icon {
  font-size: 1.5rem;
  color: #409EFF;
  margin-right: 12px;
}

.card-content {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.okr-tree {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.okr-level {
  border-left: 3px solid #e4e7ed;
  padding-left: 20px;
  position: relative;
}

.okr-level::before {
  content: '';
  position: absolute;
  left: -3px;
  top: 0;
  width: 3px;
  height: 100%;
  background: #409EFF;
}

.level-label {
  font-size: 0.9rem;
  color: #909399;
  margin-bottom: 10px;
  font-weight: 500;
}

.okr-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
}

.okr-item strong {
  color: #303133;
  display: block;
  margin-bottom: 10px;
}

.progress-bar {
  margin-bottom: 10px;
}

.key-results {
  margin-top: 15px;
}

.kr-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.kr-item:last-child {
  border-bottom: none;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
}

.task-item:hover {
  border-color: #409EFF;
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.1);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.task-title {
  flex: 1;
  font-weight: 500;
}

.task-title.completed {
  text-decoration: line-through;
  color: #909399;
}

.task-details {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #606266;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.chat-container {
  height: 600px;
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
  max-height: 450px;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-bubble {
  max-width: 80%;
}

.message-content {
  background: #409EFF;
  color: white;
  padding: 12px 18px;
  border-radius: 20px;
  word-wrap: break-word;
  line-height: 1.5;
}

.message.assistant .message-content {
  background: white;
  color: #333;
  border: 1px solid #e4e7ed;
}

.message-time {
  font-size: 0.8rem;
  color: #909399;
  margin-top: 5px;
  text-align: center;
}

.chat-input {
  margin-top: auto;
}

.quick-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.progress-overview {
  margin-bottom: 30px;
}

.progress-item {
  margin-bottom: 20px;
}

.progress-label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.progress-chart {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.chart-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}

.mock-chart {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 120px;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-value {
  width: 100%;
  background: #409EFF;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
}

.bar-label {
  font-size: 0.8rem;
  color: #606266;
}

.resources-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.resource-item:hover {
  border-color: #409EFF;
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.1);
}

.resource-icon {
  font-size: 1.5rem;
  color: #409EFF;
  flex-shrink: 0;
}

.resource-content {
  flex: 1;
}

.resource-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.resource-source {
  font-size: 0.9rem;
  color: #606266;
  margin-bottom: 8px;
}

.resource-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.growth-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-radar {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.skill-name {
  font-weight: 500;
  color: #303133;
  min-width: 80px;
}

.growth-insights {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.insight-icon {
  color: #409EFF;
  font-size: 1.2rem;
}

.insight-item:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .left-column,
  .center-column,
  .right-column {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 20px;
    height: 70px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .welcome-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .quick-stats {
    justify-content: center;
  }
  
  .header-left {
    gap: 15px;
  }
  
  .logo {
    font-size: 1.5rem;
  }
}

/* 动画效果 */
.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
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
