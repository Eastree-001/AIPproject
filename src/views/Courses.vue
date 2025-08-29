<template>
  <div class="courses-page">
    <Header />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 页面标题区域 -->
        <div class="page-header">
          <div class="header-content">
            <div class="title-section">
              <h1 class="page-title">
                <el-icon class="title-icon"><Reading /></el-icon>
                课程学习
              </h1>
              <p class="page-subtitle">探索丰富的学习资源，开启您的智慧学习之旅</p>
            </div>
            <div class="header-actions">
              <el-button type="primary" size="large" @click="showCreateModal = true">
                <el-icon><Plus /></el-icon>
                创建课程
              </el-button>
            </div>
          </div>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="search-filter-section">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索课程、知识点、讲师..."
              prefix-icon="Search"
              size="large"
              clearable
              @input="handleSearch"
            />
          </div>
          
          <div class="filter-options">
            <el-select v-model="selectedCategory" placeholder="选择分类" size="large" @change="handleCategoryChange">
              <el-option label="全部分类" value="" />
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
            
            <el-select v-model="selectedLevel" placeholder="选择难度" size="large" @change="handleLevelChange">
              <el-option label="全部难度" value="" />
              <el-option label="初级" value="beginner" />
              <el-option label="中级" value="intermediate" />
              <el-option label="高级" value="advanced" />
            </el-select>
            
            <el-select v-model="selectedStatus" placeholder="学习状态" size="large" @change="handleStatusChange">
              <el-option label="全部状态" value="" />
              <el-option label="未开始" value="not_started" />
              <el-option label="学习中" value="in_progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </div>
        </div>

        <!-- 课程统计信息 -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card" v-loading="isLoadingStats">
              <div class="stat-icon">
                <el-icon size="32"><Reading /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ courseStats.totalCourses }}</div>
                <div class="stat-label">总课程数</div>
              </div>
            </div>
            
            <div class="stat-card" v-loading="isLoadingStats">
              <div class="stat-icon">
                <el-icon size="32"><Clock /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ courseStats.totalHours }}</div>
                <div class="stat-label">总学时</div>
              </div>
            </div>
            
            <div class="stat-card" v-loading="isLoadingStats">
              <div class="stat-icon">
                <el-icon size="32"><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ courseStats.completedCourses }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
            
            <div class="stat-card" v-loading="isLoadingStats">
              <div class="stat-icon">
                <el-icon size="32"><Star /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ courseStats.avgRating }}</div>
                <div class="stat-label">平均评分</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 推荐课程区域 -->
        <div class="recommendations-section" v-loading="isLoadingRecommendations">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Star /></el-icon>
              为您推荐
            </h2>
            <div class="user-preferences" v-if="userPreferences.preferredCategories.length > 0">
              <span class="preferences-label">基于您的偏好：</span>
              <el-tag 
                v-for="category in userPreferences.preferredCategories" 
                :key="category"
                size="small"
                type="info"
                class="preference-tag"
              >
                {{ category }}
              </el-tag>
            </div>
          </div>

          <div class="recommendations-grid" v-if="recommendedCourses.length > 0">
            <div 
              v-for="course in recommendedCourses" 
              :key="course.id" 
              class="recommendation-card"
              @click="viewCourse(course)"
            >
              <div class="course-image">
                <img :src="course.thumbnail || `https://picsum.photos/400/250?random=${course.id}`" :alt="course.title" />
                <div class="course-overlay">
                  <el-button type="primary" size="small" @click.stop="startLearning(course)">
                    开始学习
                  </el-button>
                </div>
                <div class="recommend-score">
                  <el-icon><TrendCharts /></el-icon>
                  {{ course.recommendScore }}分
                </div>
              </div>
              
              <div class="course-content">
                <div class="course-category">{{ course.category }}</div>
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-description">{{ course.description }}</p>
                <div class="recommend-reason">
                  <el-icon><Star /></el-icon>
                  {{ course.recommendReason }}
                </div>
                
                <div class="course-meta">
                  <div class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ course.duration }}小时</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><User /></el-icon>
                    <span>{{ course.instructor }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Star /></el-icon>
                    <span>{{ course.avgRating || '新课程' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="!isLoadingRecommendations" class="no-recommendations">
            <el-empty description="暂无推荐课程">
              <el-button type="primary" @click="loadRecommendedCourses">
                重新获取推荐
              </el-button>
            </el-empty>
          </div>
        </div>

        <!-- 课程列表 -->
        <div class="courses-section">
          <div class="section-header">
            <h2 class="section-title">全部课程</h2>
            <div class="view-options">
              <el-button-group>
                <el-button 
                  :type="viewMode === 'grid' ? 'primary' : 'default'"
                  @click="viewMode = 'grid'"
                >
                  <el-icon><Grid /></el-icon>
                  网格视图
                </el-button>
                <el-button 
                  :type="viewMode === 'list' ? 'primary' : 'default'"
                  @click="viewMode = 'list'"
                >
                  <el-icon><List /></el-icon>
                  列表视图
                </el-button>
              </el-button-group>
            </div>
          </div>

          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="courses-grid">
            <div 
              v-for="course in filteredCourses" 
              :key="course.id" 
              class="course-card"
              @click="viewCourse(course)"
            >
              <div class="course-image">
                <img :src="course.coverImage" :alt="course.title" />
                <div class="course-overlay">
                  <el-button type="primary" size="small" @click.stop="startLearning(course)">
                    开始学习
                  </el-button>
                </div>
                <div class="course-status" :class="course.status">
                  {{ getStatusText(course.status) }}
                </div>
              </div>
              
              <div class="course-content">
                <div class="course-category">{{ course.category }}</div>
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-description">{{ course.description }}</p>
                
                <div class="course-meta">
                  <div class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ course.duration }}小时</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><User /></el-icon>
                    <span>{{ course.instructor }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Star /></el-icon>
                    <span>{{ course.rating }}</span>
                  </div>
                </div>
                
                <div class="course-progress" v-if="course.progress !== undefined">
                  <el-progress 
                    :percentage="course.progress" 
                    :stroke-width="6"
                    :show-text="false"
                  />
                  <span class="progress-text">{{ course.progress }}% 完成</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="courses-list">
            <div 
              v-for="course in filteredCourses" 
              :key="course.id" 
              class="course-list-item"
              @click="viewCourse(course)"
            >
              <div class="course-list-image">
                <img :src="course.coverImage" :alt="course.title" />
                <div class="course-status" :class="course.status">
                  {{ getStatusText(course.status) }}
                </div>
              </div>
              
              <div class="course-list-content">
                <div class="course-list-header">
                  <div class="course-list-category">{{ course.category }}</div>
                  <h3 class="course-list-title">{{ course.title }}</h3>
                  <p class="course-list-description">{{ course.description }}</p>
                </div>
                
                <div class="course-list-meta">
                  <div class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ course.duration }}小时</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><User /></el-icon>
                    <span>{{ course.instructor }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Star /></el-icon>
                    <span>{{ course.rating }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><TrendCharts /></el-icon>
                    <span>{{ course.students }}人学习</span>
                  </div>
                </div>
                
                <div class="course-list-progress" v-if="course.progress !== undefined">
                  <el-progress 
                    :percentage="course.progress" 
                    :stroke-width="8"
                  />
                  <span class="progress-text">{{ course.progress }}% 完成</span>
                </div>
              </div>
              
              <div class="course-list-actions">
                <el-button 
                  type="primary" 
                  size="large"
                  @click.stop="startLearning(course)"
                >
                  开始学习
                </el-button>
                <el-button 
                  type="text" 
                  size="large"
                  @click.stop="viewCourse(course)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 36, 48]"
              :total="totalCourses"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- 课程详情模态框 -->
    <el-dialog v-model="showCourseModal" title="课程详情" width="800px">
      <div v-if="selectedCourse" class="course-detail">
        <div class="course-detail-header">
          <img :src="selectedCourse.coverImage" :alt="selectedCourse.title" class="detail-cover" />
          <div class="detail-info">
            <h2>{{ selectedCourse.title }}</h2>
            <p class="detail-description">{{ selectedCourse.description }}</p>
            <div class="detail-meta">
              <span class="meta-tag">{{ selectedCourse.category }}</span>
              <span class="meta-tag">{{ selectedCourse.level }}</span>
              <span class="meta-tag">{{ selectedCourse.duration }}小时</span>
            </div>
          </div>
        </div>
        
        <div class="course-detail-content">
          <h3>课程大纲</h3>
          <div class="course-outline">
            <div v-for="(chapter, index) in selectedCourse.chapters" :key="index" class="chapter-item">
              <div class="chapter-header">
                <span class="chapter-number">第{{ index + 1 }}章</span>
                <span class="chapter-title">{{ chapter.title }}</span>
                <span class="chapter-duration">{{ chapter.duration }}分钟</span>
              </div>
              <div class="chapter-lessons">
                <div v-for="lesson in chapter.lessons" :key="lesson.id" class="lesson-item">
                  <el-icon><VideoPlay /></el-icon>
                  <span>{{ lesson.title }}</span>
                  <span class="lesson-duration">{{ lesson.duration }}分钟</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="course-detail-footer">
          <el-button type="primary" size="large" @click="startLearning(selectedCourse)">
            开始学习
          </el-button>
          <el-button size="large" @click="showCourseModal = false">
            关闭
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 创建课程模态框 -->
    <CreateCourseModal 
      v-model="showCreateModal" 
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import CreateCourseModal from '@/components/CreateCourseModal.vue'
import { courseAPI } from '@/services/n8n-api'
import { 
  Reading, 
  Plus, 
  Grid, 
  List, 
  Clock, 
  User, 
  Star, 
  TrendCharts,
  VideoPlay
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedLevel = ref('')
const selectedStatus = ref('')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(12)
const showCourseModal = ref(false)
const selectedCourse = ref(null)
const showCreateModal = ref(false)
const isLoadingStats = ref(false)
const isLoadingRecommendations = ref(false)

// 推荐课程数据
const recommendedCourses = ref([])
const userPreferences = ref({
  preferredCategories: [],
  completedCoursesCount: 0,
  totalProgressCount: 0
})

// 课程分类
const categories = ref([
  { id: 'programming', name: '编程开发' },
  { id: 'design', name: '设计创意' },
  { id: 'business', name: '商业管理' },
  { id: 'language', name: '语言学习' },
  { id: 'science', name: '科学技术' },
  { id: 'art', name: '艺术文化' }
])

// 课程数据
const courses = ref([
  {
    id: 1,
    title: 'Vue.js 3.0 完全指南',
    description: '从零开始学习Vue.js 3.0，掌握现代前端开发技术',
    category: '编程开发',
    level: '中级',
    duration: 24,
    instructor: '张老师',
    rating: 4.8,
    students: 1250,
    coverImage: 'https://picsum.photos/400/250?random=1',
    status: 'in_progress',
    progress: 65,
    chapters: [
      {
        title: 'Vue.js 3.0 基础',
        duration: 120,
        lessons: [
          { id: 1, title: 'Vue.js 3.0 介绍', duration: 15 },
          { id: 2, title: '组合式API', duration: 25 },
          { id: 3, title: '响应式系统', duration: 20 }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'React 18 实战教程',
    description: '学习React 18最新特性，构建现代化Web应用',
    category: '编程开发',
    level: '中级',
    duration: 32,
    instructor: '李老师',
    rating: 4.9,
    students: 2100,
    coverImage: 'https://picsum.photos/400/250?random=2',
    status: 'not_started',
    progress: 0
  },
  {
    id: 3,
    title: 'UI/UX 设计基础',
    description: '掌握现代UI/UX设计原则和工具使用',
    category: '设计创意',
    level: '初级',
    duration: 18,
    instructor: '王老师',
    rating: 4.7,
    students: 890,
    coverImage: 'https://picsum.photos/400/250?random=3',
    status: 'completed',
    progress: 100
  },
  {
    id: 4,
    title: 'Python 数据分析',
    description: '使用Python进行数据分析和可视化',
    category: '科学技术',
    level: '高级',
    duration: 28,
    instructor: '陈老师',
    rating: 4.6,
    students: 1560,
    coverImage: 'https://picsum.photos/400/250?random=4',
    status: 'in_progress',
    progress: 35
  },
  {
    id: 5,
    title: '英语口语提升',
    description: '提升英语口语表达能力，掌握地道表达',
    category: '语言学习',
    level: '初级',
    duration: 20,
    instructor: 'Sarah老师',
    rating: 4.8,
    students: 980,
    coverImage: 'https://picsum.photos/400/250?random=5',
    status: 'not_started',
    progress: 0
  },
  {
    id: 6,
    title: '项目管理实战',
    description: '学习项目管理方法论和实用工具',
    category: '商业管理',
    level: '中级',
    duration: 22,
    instructor: '赵老师',
    rating: 4.7,
    students: 720,
    coverImage: 'https://picsum.photos/400/250?random=6',
    status: 'not_started',
    progress: 0
  }
])

// 课程统计
const courseStats = reactive({
  totalCourses: 0,
  totalHours: 0,
  completedCourses: 0,
  avgRating: 0
})

// 加载课程统计数据
const loadCourseStats = async () => {
  isLoadingStats.value = true
  try {
    // 获取当前用户ID，如果没有登录则使用默认值
    const userId = authStore.user?.id || 'f75fc652-1688-412b-af72-d0caf948b76f'
    console.log('正在获取课程统计数据，用户ID:', userId)
    
    const response = await courseAPI.getCourseStats(userId)
    console.log('课程统计API响应:', response)
    
    // 根据n8n工作流返回的数据结构进行解析
    if (response) {
      // 如果返回的是直接的统计对象
      if (response.globalStats) {
        const globalStats = response.globalStats
        courseStats.totalCourses = globalStats.totalCourses || 0
        courseStats.totalHours = globalStats.totalHours || 0
        courseStats.completedCourses = globalStats.completedCourses || 0
        courseStats.avgRating = globalStats.avgRating ? Number(globalStats.avgRating).toFixed(1) : '0.0'
      } 
      // 如果返回的是包装在data字段中
      else if (response.data && response.data.globalStats) {
        const globalStats = response.data.globalStats
        courseStats.totalCourses = globalStats.totalCourses || 0
        courseStats.totalHours = globalStats.totalHours || 0
        courseStats.completedCourses = globalStats.completedCourses || 0
        courseStats.avgRating = globalStats.avgRating ? Number(globalStats.avgRating).toFixed(1) : '0.0'
      }
      // 如果是直接的数值对象
      else if (typeof response === 'object') {
        courseStats.totalCourses = response.totalCourses || 0
        courseStats.totalHours = response.totalHours || 0
        courseStats.completedCourses = response.completedCourses || 0
        courseStats.avgRating = response.avgRating ? Number(response.avgRating).toFixed(1) : '0.0'
      }
      
      console.log('课程统计数据更新成功:', courseStats)
      ElMessage.success('课程统计数据加载成功')
    } else {
      console.warn('课程统计API返回空数据:', response)
      ElMessage.warning('课程统计数据为空，显示默认数据')
    }
  } catch (error) {
    console.error('获取课程统计失败:', error)
    ElMessage.error(`获取课程统计数据失败: ${error.message || '请检查网络连接和n8n工作流状态'}`)
    // 保持默认值
  } finally {
    isLoadingStats.value = false
  }
}

// 加载推荐课程数据
const loadRecommendedCourses = async () => {
  isLoadingRecommendations.value = true
  try {
    // 获取当前用户ID，如果没有登录则使用默认值
    const userId = authStore.user?.id || 'f75fc652-1688-412b-af72-d0caf948b76f'
    console.log('正在获取推荐课程，用户ID:', userId)
    
    const response = await courseAPI.getRecommendedCourses(userId, {
      limit: 6,
      category: selectedCategory.value || ''
    })
    console.log('推荐课程API响应:', response)
    
    // 根据n8n工作流返回的数据结构进行解析
    if (response && response.success && response.data) {
      const data = response.data
      recommendedCourses.value = data.courses || []
      
      // 更新用户偏好信息
      if (data.userPreferences) {
        userPreferences.value = {
          preferredCategories: data.userPreferences.preferredCategories || [],
          completedCoursesCount: data.userPreferences.completedCoursesCount || 0,
          totalProgressCount: data.userPreferences.totalProgressCount || 0
        }
      }
      
      console.log('推荐课程数据更新成功:', recommendedCourses.value.length, '门课程')
      ElMessage.success(`为您推荐了 ${recommendedCourses.value.length} 门课程`)
    } else {
      console.warn('推荐课程API返回格式异常:', response)
      ElMessage.warning('推荐课程数据异常，显示默认推荐')
      recommendedCourses.value = []
    }
  } catch (error) {
    console.error('获取推荐课程失败:', error)
    ElMessage.error(`获取推荐课程失败: ${error.message || '请检查网络连接和n8n工作流状态'}`)
    recommendedCourses.value = []
  } finally {
    isLoadingRecommendations.value = false
  }
}

// 计算属性
const filteredCourses = computed(() => {
  let filtered = courses.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(course => 
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.instructor.toLowerCase().includes(query)
    )
  }

  // 分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter(course => course.category === selectedCategory.value)
  }

  // 难度过滤
  if (selectedLevel.value) {
    filtered = filtered.filter(course => course.level === selectedLevel.value)
  }

  // 状态过滤
  if (selectedStatus.value) {
    filtered = filtered.filter(course => course.status === selectedStatus.value)
  }

  return filtered
})

const totalCourses = computed(() => filteredCourses.value.length)

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleCategoryChange = () => {
  currentPage.value = 1
  // 重新加载推荐课程（基于新的分类筛选）
  loadRecommendedCourses()
}

const handleLevelChange = () => {
  currentPage.value = 1
}

const handleStatusChange = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const viewCourse = (course) => {
  selectedCourse.value = course
  showCourseModal.value = true
}

const startLearning = (course) => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再开始学习')
    router.push('/auth')
    return
  }
  
  ElMessage.success(`开始学习：${course.title}`)
  // 这里可以跳转到具体的课程学习页面
  router.push(`/course/${course.id}/learn`)
}

const getStatusText = (status) => {
  const statusMap = {
    'not_started': '未开始',
    'in_progress': '学习中',
    'completed': '已完成'
  }
  return statusMap[status] || '未知'
}

const handleCreateSuccess = () => {
  // 刷新课程列表
  ElMessage.success('课程创建成功！')
  // 重新加载课程统计数据和推荐课程
  Promise.all([
    loadCourseStats(),
    loadRecommendedCourses()
  ])
}

// 组件挂载时
onMounted(async () => {
  console.log('课程页面已加载')
  // 并行加载课程统计数据和推荐课程
  await Promise.all([
    loadCourseStats(),
    loadRecommendedCourses()
  ])
})
</script>

<style scoped>
.courses-page {
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

/* 搜索和筛选区域 */
.search-filter-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 25px;
}

.filter-options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-options .el-select {
  min-width: 150px;
}

/* 统计信息区域 */
.stats-section {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  color: #666;
}

/* 课程区域 */
.courses-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

/* 网格视图 */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.course-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.course-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.course-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card:hover .course-overlay {
  opacity: 1;
}

.course-status {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}

.course-status.not_started {
  background: #909399;
}

.course-status.in_progress {
  background: #409eff;
}

.course-status.completed {
  background: #67c23a;
}

.course-content {
  padding: 25px;
}

.course-category {
  display: inline-block;
  background: #f0f9ff;
  color: #0369a1;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  margin-bottom: 15px;
}

.course-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
}

.course-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
}

.course-progress {
  margin-top: 20px;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  margin-top: 8px;
  display: block;
}

/* 列表视图 */
.courses-list {
  margin-bottom: 40px;
}

.course-list-item {
  display: flex;
  gap: 25px;
  padding: 25px;
  border: 1px solid #f0f0f0;
  border-radius: 15px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-list-item:hover {
  border-color: #667eea;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
}

.course-list-image {
  position: relative;
  flex-shrink: 0;
}

.course-list-image img {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
}

.course-list-content {
  flex: 1;
  min-width: 0;
}

.course-list-header {
  margin-bottom: 15px;
}

.course-list-category {
  display: inline-block;
  background: #f0f9ff;
  color: #0369a1;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  margin-bottom: 10px;
}

.course-list-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.course-list-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.course-list-meta {
  display: flex;
  gap: 25px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.course-list-progress {
  margin-top: 15px;
}

.course-list-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

/* 分页 */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* 课程详情模态框 */
.course-detail {
  padding: 20px 0;
}

.course-detail-header {
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
}

.detail-cover {
  width: 300px;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}

.detail-info h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
}

.detail-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.detail-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-tag {
  background: #f0f9ff;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
}

.course-detail-content h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.course-outline {
  margin-bottom: 30px;
}

.chapter-item {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
}

.chapter-header {
  background: #f8f9fa;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.chapter-number {
  font-weight: 600;
  color: #667eea;
}

.chapter-title {
  font-weight: 500;
  color: #333;
}

.chapter-duration {
  color: #666;
  font-size: 0.9rem;
}

.chapter-lessons {
  padding: 20px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.lesson-item:last-child {
  border-bottom: none;
}

.lesson-item .el-icon {
  color: #667eea;
}

.lesson-duration {
  margin-left: auto;
  color: #666;
  font-size: 0.9rem;
}

.course-detail-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-options {
    justify-content: center;
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
  
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .course-list-item {
    flex-direction: column;
    gap: 20px;
  }
  
  .course-list-image img {
    width: 100%;
    height: 200px;
  }
  
  .course-list-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .course-detail-header {
    flex-direction: column;
  }
  
  .detail-cover {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-options {
    flex-direction: column;
  }
  
  .filter-options .el-select {
    min-width: auto;
  }
}

/* 推荐课程区域样式 */
.recommendations-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.recommendations-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.recommendations-section .section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.user-preferences {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.preferences-label {
  font-size: 0.9rem;
  color: #666;
}

.preference-tag {
  margin-right: 8px;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.recommendation-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
}

.recommendation-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.recommendation-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.recommendation-card .course-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.recommendation-card .course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recommendation-card:hover .course-image img {
  transform: scale(1.05);
}

.recommend-score {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.recommendation-card .course-content {
  padding: 20px;
}

.recommendation-card .course-category {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.recommendation-card .course-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
}

.recommendation-card .course-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
}

.recommend-reason {
  background: #f0f9ff;
  color: #0369a1;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.recommendation-card .course-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
}

.recommendation-card .meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
}

.no-recommendations {
  text-align: center;
  padding: 60px 20px;
}

/* 响应式设计 - 推荐课程 */
@media (max-width: 1024px) {
  .recommendations-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .recommendations-section .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .recommendations-section {
    padding: 25px;
    margin-bottom: 20px;
  }
  
  .recommendations-section .section-title {
    font-size: 1.6rem;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .user-preferences {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>