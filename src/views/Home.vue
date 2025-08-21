<template>
  <div class="home-page">
    <!-- 导航栏 -->
    <Header />
    
    <!-- 主要内容区域 -->
    <main class="main-content">

      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-content">
            <h1 class="hero-title">
              欢迎来到
              <span class="highlight">启明星</span>
            </h1>
            <p class="hero-subtitle">
              AI驱动的智慧学习平台，让学习更智能、更高效、更有趣。
            </p>
            <div class="hero-actions">
              <el-button 
                type="primary" 
                size="large" 
                class="cta-button"
                @click="startLearning"
              >
                开始学习
              </el-button>
              <el-button 
                type="info" 
                size="large" 
                class="demo-button"
                @click="watchDemo"
              >
                观看演示
              </el-button>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-image">
              <div class="floating-card card-1">
                <el-icon size="24"><Reading /></el-icon>
                <span>智能课程推荐</span>
              </div>
              <div class="floating-card card-2">
                <el-icon size="24"><ChatDotRound /></el-icon>
                <span>AI导师辅导</span>
              </div>
              <div class="floating-card card-3">
                <el-icon size="24"><TrendCharts /></el-icon>
                <span>学习进度追踪</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 特色功能区域 -->
      <section class="features-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">平台特色</h2>
            <p class="section-subtitle">探索启明星平台的独特优势</p>
          </div>
          
          <div class="features-grid">
            <div class="feature-card" v-for="feature in features" :key="feature.id">
              <div class="feature-icon">
                <el-icon :size="32"><component :is="feature.icon" /></el-icon>
              </div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 统计数据区域 -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item" v-for="stat in stats" :key="stat.id">
              <div class="stat-number">{{ stat.number }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 快速开始区域 -->
      <section class="quick-start-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">快速开始</h2>
            <p class="section-subtitle">三步开启您的智慧学习之旅</p>
          </div>
          
          <div class="steps-grid">
            <div class="step-item" v-for="step in steps" :key="step.id">
              <div class="step-number">{{ step.number }}</div>
              <div class="step-content">
                <h3 class="step-title">{{ step.title }}</h3>
                <p class="step-description">{{ step.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- 开发工具区域 -->
          <div class="dev-tools" v-if="showDevTools">
            <div class="section-header">
              <h3 class="section-title">开发工具</h3>
              <p class="section-subtitle">用于开发和调试的实用工具</p>
            </div>
            
            <div class="dev-tools-grid">
              <div class="dev-tool-card" @click="goToSupabaseTest">
                <div class="tool-icon">
                  <el-icon size="32"><Database /></el-icon>
                </div>
                <h4>Supabase 测试</h4>
                <p>测试数据库连接和基本功能</p>
              </div>
              
              <div class="dev-tool-card" @click="goToAuth">
                <div class="tool-icon">
                  <el-icon size="32"><UserFilled /></el-icon>
                </div>
                <h4>认证测试</h4>
                <p>测试用户注册和登录功能</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo">
              <span class="logo-icon">🌟</span>
              <span class="logo-text">启明星</span>
            </div>
            <p class="footer-description">
              AI驱动的智慧学习平台，致力于为每一位学习者提供个性化的学习体验
            </p>
          </div>
          
          <div class="footer-links">
            <div class="footer-column">
              <h4>产品</h4>
              <ul>
                <li><a href="#">课程学习</a></li>
                <li><a href="#">AI导师</a></li>
                <li><a href="#">学习进度</a></li>
                <li><a href="#">学习社区</a></li>
              </ul>
            </div>
            
            <div class="footer-column">
              <h4>支持</h4>
              <ul>
                <li><a href="#">帮助中心</a></li>
                <li><a href="#">联系我们</a></li>
                <li><a href="#">用户反馈</a></li>
                <li><a href="#">常见问题</a></li>
              </ul>
            </div>
            
            <div class="footer-column">
              <h4>关于</h4>
              <ul>
                <li><a href="#">公司介绍</a></li>
                <li><a href="#">团队介绍</a></li>
                <li><a href="#">加入我们</a></li>
                <li><a href="#">隐私政策</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2024 启明星平台. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import { 
  Reading, 
  ChatDotRound, 
  TrendCharts, 
  UserFilled,
  Star,
  Lightning,
  Aim,
  Histogram,
  Database
} from '@element-plus/icons-vue'

const router = useRouter()

// 特色功能数据
const features = ref([
  {
    id: 1,
    icon: 'Star',
    title: '智能推荐',
    description: '基于AI算法的个性化课程推荐，让学习更精准'
  },
  {
    id: 2,
    icon: 'Lightning',
    title: '快速学习',
    description: '优化的学习路径和智能复习提醒，提升学习效率'
  },
  {
    id: 3,
    icon: 'Aim',
    title: '目标导向',
    description: '清晰的学习目标和进度追踪，让学习更有方向'
  },
  {
    id: 4,
    icon: 'Histogram',
    title: '数据分析',
    description: '详细的学习数据分析和可视化报告'
  }
])

// 统计数据
const stats = ref([
  { id: 1, number: '10,000+', label: '注册用户' },
  { id: 2, number: '500+', label: '精品课程' },
  { id: 3, number: '95%', label: '用户满意度' },
  { id: 4, number: '24/7', label: 'AI导师服务' }
])

// 快速开始步骤
const steps = ref([
  {
    id: 1,
    number: '01',
    title: '注册账号',
    description: '简单几步，快速创建您的学习账号'
  },
  {
    id: 2,
    number: '02',
    title: '选择课程',
    description: '浏览丰富的课程库，选择感兴趣的学习内容'
  },
  {
    id: 3,
    number: '03',
    title: '开始学习',
    description: '跟随AI导师，开启您的智慧学习之旅'
  }
])

// 方法
const startLearning = () => {
  router.push('/courses')
}

const watchDemo = () => {
  // 显示演示视频
  console.log('显示演示视频')
}

// 开发工具相关
const showDevTools = ref(true) // 开发阶段显示开发工具

const goToSupabaseTest = () => {
  router.push('/supabase-test')
}

const goToAuth = () => {
  router.push('/auth')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  padding-top: 80px; /* 为固定导航栏留出空间 */
}

/* 英雄区域 */
.hero-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-content {
  animation: fadeInLeft 1s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 20px;
}

.cta-button {
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 30px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  border: none;
  color: #333;
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
}

.demo-button {
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 30px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s ease;
}

.demo-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
}

.hero-visual {
  position: relative;
  animation: fadeInRight 1s ease-out 0.3s both;
}

.hero-image {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 20px;
  left: 20px;
  animation-delay: 0s;
}

.card-2 {
  top: 50%;
  right: 20px;
  animation-delay: 2s;
}

.card-3 {
  bottom: 20px;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 特色功能区域 */
.features-section {
  padding: 100px 0;
  background: white;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
}

.feature-card {
  text-align: center;
  padding: 40px 30px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.feature-description {
  color: #666;
  line-height: 1.6;
}

/* 统计数据区域 */
.stats-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
}

.stat-item {
  animation: fadeInUp 0.8s ease-out both;
}

.stat-item:nth-child(1) { animation-delay: 0.1s; }
.stat-item:nth-child(2) { animation-delay: 0.2s; }
.stat-item:nth-child(3) { animation-delay: 0.3s; }
.stat-item:nth-child(4) { animation-delay: 0.4s; }

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* 快速开始区域 */
.quick-start-section {
  padding: 100px 0;
  background: #f8f9fa;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.step-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.step-number {
  width: 60px;
  height: 60px;
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

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.step-description {
  color: #666;
  line-height: 1.6;
}

/* 开发工具区域 */
.dev-tools {
  margin-top: 80px;
  padding: 60px 0;
  background: #e0e0e0;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.dev-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.dev-tool-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.dev-tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.tool-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.dev-tool-card h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.dev-tool-card p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* 页脚 */
.footer {
  background: #2c3e50;
  color: white;
  padding: 60px 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  margin-bottom: 40px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.footer-logo .logo-icon {
  font-size: 24px;
}

.footer-logo .logo-text {
  font-size: 1.5rem;
  font-weight: 700;
}

.footer-description {
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-column h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ecf0f1;
}

.footer-column ul {
  list-style: none;
}

.footer-column li {
  margin-bottom: 10px;
}

.footer-column a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-column a:hover {
  color: #3498db;
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding-top: 20px;
  text-align: center;
  color: #bdc3c7;
}

/* 动画 */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 0;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
}
</style>
