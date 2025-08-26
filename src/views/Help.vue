<template>
  <div class="help-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">
            <el-icon class="title-icon"><QuestionFilled /></el-icon>
            帮助中心
          </h1>
          <p class="page-subtitle">找到您需要的帮助和支持</p>
        </div>

        <!-- 主要内容 -->
        <div class="main-layout">
          <!-- 左侧：帮助导航 -->
          <div class="left-section">
            <div class="help-nav">
              <div 
                v-for="section in helpSections" 
                :key="section.key"
                class="nav-item"
                :class="{ active: activeSection === section.key }"
                @click="activeSection = section.key"
              >
                <el-icon class="nav-icon"><component :is="section.icon" /></el-icon>
                <span class="nav-text">{{ section.title }}</span>
                <el-icon class="nav-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>

          <!-- 右侧：帮助内容 -->
          <div class="right-section">
            <!-- 快速开始 -->
            <div v-if="activeSection === 'getting-started'" class="help-content">
              <div class="content-header">
                <h2 class="content-title">快速开始</h2>
                <p class="content-subtitle">新用户快速上手指南</p>
              </div>
              
              <div class="help-steps">
                <div class="step-item">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h3>注册账户</h3>
                    <p>使用邮箱注册启明星学习平台账户，设置密码和个人信息。</p>
                    <div class="step-actions">
                      <el-button type="primary" size="small" @click="goToAuth">立即注册</el-button>
                    </div>
                  </div>
                </div>
                
                <div class="step-item">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h3>完善个人资料</h3>
                    <p>设置学习偏好、目标，上传头像，让AI更好地为您推荐课程。</p>
                    <div class="step-actions">
                      <el-button type="primary" size="small" @click="goToProfile">完善资料</el-button>
                    </div>
                  </div>
                </div>
                
                <div class="step-item">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h3>浏览课程</h3>
                    <p>探索丰富的课程库，找到适合您的学习内容。</p>
                    <div class="step-actions">
                      <el-button type="primary" size="small" @click="goToCourses">浏览课程</el-button>
                    </div>
                  </div>
                </div>
                
                <div class="step-item">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <h3>开始学习</h3>
                    <p>选择课程开始学习，AI导师将全程陪伴您的学习之旅。</p>
                    <div class="step-actions">
                      <el-button type="primary" size="small" @click="goToAITutor">AI导师</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 常见问题 -->
            <div v-if="activeSection === 'faq'" class="help-content">
              <div class="content-header">
                <h2 class="content-title">常见问题</h2>
                <p class="content-subtitle">用户最常遇到的问题和解答</p>
              </div>
              
              <div class="faq-list">
                <el-collapse v-model="activeNames" accordion>
                  <el-collapse-item 
                    v-for="faq in faqList" 
                    :key="faq.id"
                    :title="faq.question"
                    :name="faq.id"
                  >
                    <div class="faq-answer">
                      <p>{{ faq.answer }}</p>
                      <div v-if="faq.relatedLinks" class="related-links">
                        <span>相关链接：</span>
                        <el-button 
                          v-for="link in faq.relatedLinks" 
                          :key="link.text"
                          type="text" 
                          size="small"
                          @click="handleRelatedLink(link)"
                        >
                          {{ link.text }}
                        </el-button>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>

            <!-- 使用指南 -->
            <div v-if="activeSection === 'guides'" class="help-content">
              <div class="content-header">
                <h2 class="content-title">使用指南</h2>
                <p class="content-subtitle">详细的功能使用说明</p>
              </div>
              
              <div class="guides-grid">
                <div v-for="guide in guides" :key="guide.id" class="guide-card">
                  <div class="guide-icon">
                    <el-icon :size="32"><component :is="guide.icon" /></el-icon>
                  </div>
                  <h3 class="guide-title">{{ guide.title }}</h3>
                  <p class="guide-description">{{ guide.description }}</p>
                  <div class="guide-actions">
                    <el-button type="primary" size="small" @click="viewGuide(guide)">
                      查看指南
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 联系支持 -->
            <div v-if="activeSection === 'support'" class="help-content">
              <div class="content-header">
                <h2 class="content-title">联系支持</h2>
                <p class="content-subtitle">多种方式获取帮助和支持</p>
              </div>
              
              <div class="support-options">
                <div class="support-card">
                  <div class="support-icon">
                    <el-icon size="32"><Message /></el-icon>
                  </div>
                  <h3>在线客服</h3>
                  <p>工作时间：周一至周五 9:00-18:00</p>
                  <el-button type="primary" @click="openChat">开始对话</el-button>
                </div>
                
                <div class="support-card">
                  <div class="support-icon">
                    <el-icon size="32"><Message /></el-icon>
                  </div>
                  <h3>邮件支持</h3>
                  <p>24小时内回复您的邮件咨询</p>
                  <el-button type="primary" @click="sendEmail">发送邮件</el-button>
                </div>
                
                <div class="support-card">
                  <div class="support-icon">
                    <el-icon size="32"><Phone /></el-icon>
                  </div>
                  <h3>电话支持</h3>
                  <p>工作时间：周一至周五 9:00-18:00</p>
                  <el-button type="primary" @click="callSupport">拨打电话</el-button>
                </div>
              </div>
              
              <div class="feedback-section">
                <h3>反馈建议</h3>
                <p>您的反馈是我们改进的动力，请告诉我们您的想法和建议。</p>
                <el-button type="success" @click="submitFeedback">提交反馈</el-button>
              </div>
            </div>

            <!-- 系统状态 -->
            <div v-if="activeSection === 'status'" class="help-content">
              <div class="content-header">
                <h2 class="content-title">系统状态</h2>
                <p class="content-subtitle">实时监控平台运行状态</p>
              </div>
              
              <div class="status-overview">
                <div class="status-card">
                  <div class="status-header">
                    <h3>平台状态</h3>
                    <el-tag type="success">运行正常</el-tag>
                  </div>
                  <p>所有服务运行正常，无已知问题。</p>
                </div>
                
                <div class="status-card">
                  <div class="status-header">
                    <h3>数据库</h3>
                    <el-tag type="success">正常</el-tag>
                  </div>
                  <p>数据库连接稳定，响应时间正常。</p>
                </div>
                
                <div class="status-card">
                  <div class="status-header">
                    <h3>AI服务</h3>
                    <el-tag type="success">正常</el-tag>
                  </div>
                  <p>AI导师服务运行正常，响应迅速。</p>
                </div>
              </div>
              
              <div class="maintenance-info">
                <h3>维护信息</h3>
                <p>暂无计划维护，如有维护安排将提前通知。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 反馈模态框 -->
    <el-dialog v-model="feedbackModal" title="提交反馈" width="500px">
      <el-form :model="feedbackForm" label-position="top">
        <el-form-item label="反馈类型" required>
          <el-select v-model="feedbackForm.type" placeholder="选择反馈类型" style="width: 100%">
            <el-option label="功能建议" value="feature" />
            <el-option label="问题反馈" value="bug" />
            <el-option label="使用咨询" value="question" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="反馈标题" required>
          <el-input v-model="feedbackForm.title" placeholder="简要描述您的反馈" />
        </el-form-item>
        
        <el-form-item label="详细描述" required>
          <el-input 
            v-model="feedbackForm.description" 
            type="textarea" 
            :rows="4"
            placeholder="请详细描述您的反馈内容..."
          />
        </el-form-item>
        
        <el-form-item label="联系方式">
          <el-input v-model="feedbackForm.contact" placeholder="邮箱或电话（可选）" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="feedbackModal = false">取消</el-button>
        <el-button type="primary" @click="submitFeedbackForm">提交反馈</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'
import { 
  QuestionFilled, 
  House, 
  ChatDotRound, 
  Document, 
  Service, 
  Monitor,
  ArrowRight,
  Message,
  Phone
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const activeSection = ref('getting-started')
const activeNames = ref(['1'])
const feedbackModal = ref(false)

// 帮助分类
const helpSections = [
  { key: 'getting-started', title: '快速开始', icon: 'House' },
  { key: 'faq', title: '常见问题', icon: 'QuestionFilled' },
  { key: 'guides', title: '使用指南', icon: 'Document' },
  { key: 'support', title: '联系支持', icon: 'Service' },
  { key: 'status', title: '系统状态', icon: 'Monitor' }
]

// 常见问题列表
const faqList = [
  {
    id: '1',
    question: '如何开始我的第一门课程？',
    answer: '注册登录后，在课程页面浏览感兴趣的课程，点击"开始学习"即可进入学习。建议先完成个人资料设置，这样AI能更好地为您推荐合适的课程。',
    relatedLinks: [
      { text: '浏览课程', action: 'courses' },
      { text: '完善资料', action: 'profile' }
    ]
  },
  {
    id: '2',
    question: 'AI导师如何使用？',
    answer: 'AI导师是您的智能学习伙伴，可以帮您制定学习计划、解答问题、管理学习目标。在AI导师页面，您可以直接与AI对话，获得个性化的学习指导。',
    relatedLinks: [
      { text: 'AI导师', action: 'ai-tutor' }
    ]
  },
  {
    id: '3',
    question: '如何跟踪学习进度？',
    answer: '在"学习进度"页面，您可以查看所有课程的学习进度、完成情况、学习时长等详细数据。系统会自动记录您的学习活动，生成可视化的进度报告。',
    relatedLinks: [
      { text: '学习进度', action: 'progress' }
    ]
  },
  {
    id: '4',
    question: '忘记密码怎么办？',
    answer: '如果忘记密码，可以在登录页面点击"忘记密码"，通过邮箱验证码重置密码。如果邮箱无法访问，请联系客服协助处理。',
    relatedLinks: [
      { text: '联系支持', action: 'support' }
    ]
  },
  {
    id: '5',
    question: '如何加入学习社区？',
    answer: '在"学习社区"页面，您可以发布学习动态、参与讨论、加入学习小组。社区是与其他学习者交流经验、分享心得的好地方。',
    relatedLinks: [
      { text: '学习社区', action: 'community' }
    ]
  }
]

// 使用指南
const guides = [
  {
    id: 1,
    title: '课程学习指南',
    description: '了解如何高效地学习课程，包括视频观看、练习完成、测试参与等。',
    icon: 'Reading',
    action: 'courses'
  },
  {
    id: 2,
    title: 'AI导师使用指南',
    description: '掌握AI导师的各项功能，让AI成为您的学习助手。',
    icon: 'ChatDotRound',
    action: 'ai-tutor'
  },
  {
    id: 3,
    title: '学习目标管理',
    description: '学习如何设定和管理学习目标，提高学习效率。',
    icon: 'Document',
    action: 'progress'
  },
  {
    id: 4,
    title: '社区互动指南',
    description: '了解如何在社区中与其他学习者互动，分享学习经验。',
    icon: 'Service',
    action: 'community'
  }
]

// 反馈表单
const feedbackForm = reactive({
  type: '',
  title: '',
  description: '',
  contact: ''
})

// 方法
const goToAuth = () => {
  router.push('/auth')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToCourses = () => {
  router.push('/courses')
}

const goToAITutor = () => {
  router.push('/ai-tutor')
}

const goToProgress = () => {
  router.push('/progress')
}

const goToCommunity = () => {
  router.push('/community')
}

const handleRelatedLink = (link) => {
  switch (link.action) {
    case 'courses':
      goToCourses()
      break
    case 'profile':
      goToProfile()
      break
    case 'ai-tutor':
      goToAITutor()
      break
    case 'progress':
      goToProgress()
      break
    case 'community':
      goToCommunity()
      break
    case 'support':
      activeSection.value = 'support'
      break
  }
}

const viewGuide = (guide) => {
  switch (guide.action) {
    case 'courses':
      goToCourses()
      break
    case 'ai-tutor':
      goToAITutor()
      break
    case 'progress':
      goToProgress()
      break
    case 'community':
      goToCommunity()
      break
  }
}

const openChat = () => {
  ElMessage.info('在线客服功能开发中...')
}

const sendEmail = () => {
  ElMessage.info('邮件支持功能开发中...')
}

const callSupport = () => {
  ElMessage.info('电话支持功能开发中...')
}

const submitFeedback = () => {
  feedbackModal.value = true
}

const submitFeedbackForm = () => {
  if (!feedbackForm.type || !feedbackForm.title || !feedbackForm.description) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  ElMessage.success('反馈提交成功！我们会认真处理您的建议。')
  feedbackModal.value = false
  
  // 重置表单
  feedbackForm.type = ''
  feedbackForm.title = ''
  feedbackForm.description = ''
  feedbackForm.contact = ''
}

// 组件挂载时
onMounted(() => {
  console.log('帮助中心页面已加载')
})
</script>

<style scoped>
.help-page {
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

/* 页面标题 */
.page-header {
  margin-bottom: 40px;
  padding: 40px 0;
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
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
  line-height: 1.6;
}

/* 主布局 */
.main-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  align-items: start;
}

/* 左侧导航 */
.left-section {
  position: sticky;
  top: 100px;
}

.help-nav {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f5f5f5;
}

.nav-item:last-child {
  border-bottom: none;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  flex: 1;
  font-weight: 500;
}

.nav-arrow {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 右侧内容 */
.right-section {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.help-content {
  padding: 30px;
}

.content-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.content-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.content-subtitle {
  color: #666;
  line-height: 1.6;
}

/* 快速开始步骤 */
.help-steps {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.step-item {
  display: flex;
  gap: 20px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.step-item:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
}

.step-content p {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.6;
}

.step-actions {
  display: flex;
  gap: 10px;
}

/* 常见问题 */
.faq-list {
  max-width: 800px;
}

.faq-answer {
  padding: 20px 0;
}

.faq-answer p {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.6;
}

.related-links {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.related-links span {
  color: #999;
  font-size: 0.9rem;
}

/* 使用指南 */
.guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.guide-card {
  padding: 25px;
  border: 1px solid #f0f0f0;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.guide-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
  transform: translateY(-5px);
}

.guide-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 20px;
}

.guide-title {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.2rem;
}

.guide-description {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}

/* 联系支持 */
.support-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.support-card {
  padding: 25px;
  border: 1px solid #f0f0f0;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.support-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
}

.support-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 20px;
}

.support-card h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
}

.support-card p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}

.feedback-section {
  padding: 30px;
  background: #f8f9fa;
  border-radius: 15px;
  text-align: center;
}

.feedback-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.3rem;
}

.feedback-section p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}

/* 系统状态 */
.status-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.status-card {
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  background: #f8f9fa;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.status-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.maintenance-info {
  padding: 20px;
  background: #fff7e6;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
}

.maintenance-info h3 {
  margin: 0 0 10px 0;
  color: #d63031;
  font-size: 1.1rem;
}

.maintenance-info p {
  margin: 0;
  color: #d63031;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .left-section {
    position: static;
    order: -1;
  }
  
  .help-nav {
    display: flex;
    overflow-x: auto;
    border-radius: 15px;
  }
  
  .nav-item {
    flex-shrink: 0;
    min-width: 120px;
    justify-content: center;
    padding: 15px 20px;
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-arrow {
    display: none;
  }
  
  .guides-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  .support-options {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  
  .page-title {
    font-size: 2.2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .help-content {
    padding: 20px;
  }
  
  .content-title {
    font-size: 1.5rem;
  }
  
  .step-item {
    flex-direction: column;
    text-align: center;
  }
  
  .guides-grid {
    grid-template-columns: 1fr;
  }
  
  .support-options {
    grid-template-columns: 1fr;
  }
  
  .status-overview {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .nav-item {
    min-width: 80px;
    padding: 12px 15px;
  }
  
  .step-item {
    padding: 20px;
  }
  
  .guide-card,
  .support-card {
    padding: 20px;
  }
}
</style>
