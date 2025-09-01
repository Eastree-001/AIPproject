# 查询全部课程工作流 - 使用示例

## 概述

新的查询全部课程工作流支持用户ID参数，可以在用户进入课程学习界面时自动触发，提供个性化的课程展示。

## API 端点

- **带用户ID**: `/webhook/api/courses/all/{userId}`
- **匿名访问**: `/webhook/api/courses/all/anonymous`

## 前端集成示例

### 1. Vue 3 组合式 API 示例

```vue
<template>
  <div class="course-learning-page">
    <div class="course-header">
      <h1>课程学习中心</h1>
      <div v-if="userStats" class="user-stats">
        <span>已注册: {{ userStats.enrolledCourses }}</span>
        <span>已完成: {{ userStats.completedCourses }}</span>
        <span>完成率: {{ userStats.completionRate }}%</span>
      </div>
    </div>

    <div class="course-filters">
      <select v-model="filters.category" @change="loadCourses">
        <option value="">所有类别</option>
        <option v-for="cat in availableCategories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
      
      <select v-model="filters.difficulty" @change="loadCourses">
        <option value="">所有难度</option>
        <option v-for="diff in availableDifficulties" :key="diff" :value="diff">
          {{ diff }}
        </option>
      </select>
      
      <select v-model="filters.format" @change="loadCourses">
        <option value="detailed">详细信息</option>
        <option value="simple">简化信息</option>
        <option value="minimal">最少信息</option>
      </select>
    </div>

    <div class="course-grid">
      <div 
        v-for="course in courses" 
        :key="course.id" 
        class="course-card"
        :class="{ 'enrolled': course.isEnrolled }"
      >
        <img :src="course.thumbnail" :alt="course.title" />
        <div class="course-info">
          <h3>{{ course.title }}</h3>
          <p>{{ course.description }}</p>
          <div class="course-meta">
            <span class="rating">⭐ {{ course.avgRating }}</span>
            <span class="enrollment">👥 {{ course.enrollmentCount }}</span>
            <span class="duration">⏱️ {{ formatDuration(course.duration) }}</span>
          </div>
          
          <!-- 用户个人进度显示 -->
          <div v-if="course.isEnrolled" class="user-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: course.userProgress + '%' }"
              ></div>
            </div>
            <span>进度: {{ course.userProgress }}%</span>
            <span class="last-accessed">
              最后学习: {{ formatDate(course.lastAccessed) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { courseAPI } from '@/services/n8n-api.js'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const courses = ref([])
const userStats = ref(null)
const availableCategories = ref([])
const availableDifficulties = ref([])

const filters = reactive({
  category: '',
  difficulty: '',
  format: 'detailed',
  sortBy: 'created_at',
  sortOrder: 'desc',
  includeStats: true
})

// 计算当前用户ID
const currentUserId = computed(() => {
  return userStore.user?.id || 'anonymous'
})

// 加载课程数据
const loadCourses = async () => {
  loading.value = true
  try {
    const response = await courseAPI.getAllCoursesForUser(
      currentUserId.value, 
      filters
    )
    
    if (response.success) {
      courses.value = response.data.courses
      userStats.value = response.data.userStats
      availableCategories.value = response.data.filters.available.categories
      availableDifficulties.value = response.data.filters.available.difficulties
    }
  } catch (error) {
    console.error('加载课程失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化时长
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 页面加载时自动获取课程
onMounted(() => {
  loadCourses()
})

// 监听用户登录状态变化
watch(() => userStore.user, () => {
  loadCourses()
}, { deep: true })
</script>

<style scoped>
.course-learning-page {
  padding: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-stats {
  display: flex;
  gap: 15px;
}

.user-stats span {
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
}

.course-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.course-filters select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.course-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.course-card.enrolled {
  border-color: #4CAF50;
  background: #f8fff8;
}

.course-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.course-info {
  padding: 15px;
}

.course-meta {
  display: flex;
  gap: 10px;
  margin: 10px 0;
  font-size: 14px;
  color: #666;
}

.user-progress {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}

.last-accessed {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
```

### 2. React Hook 示例

```jsx
import React, { useState, useEffect, useCallback } from 'react'
import { courseAPI } from '../services/n8n-api.js'
import { useUser } from '../hooks/useUser'

const CourseLearningPage = () => {
  const { user } = useUser()
  const [courses, setCourses] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    format: 'detailed',
    sortBy: 'created_at',
    sortOrder: 'desc',
    includeStats: true
  })

  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const userId = user?.id || 'anonymous'
      const response = await courseAPI.getAllCoursesForUser(userId, filters)
      
      if (response.success) {
        setCourses(response.data.courses)
        setUserStats(response.data.userStats)
      }
    } catch (error) {
      console.error('加载课程失败:', error)
    } finally {
      setLoading(false)
    }
  }, [user, filters])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="course-learning-page">
      <div className="course-header">
        <h1>课程学习中心</h1>
        {userStats && (
          <div className="user-stats">
            <span>已注册: {userStats.enrolledCourses}</span>
            <span>已完成: {userStats.completedCourses}</span>
            <span>完成率: {userStats.completionRate}%</span>
          </div>
        )}
      </div>

      <div className="course-filters">
        <select 
          value={filters.category} 
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">所有类别</option>
          {/* 动态选项 */}
        </select>
        
        <select 
          value={filters.format} 
          onChange={(e) => handleFilterChange('format', e.target.value)}
        >
          <option value="detailed">详细信息</option>
          <option value="simple">简化信息</option>
          <option value="minimal">最少信息</option>
        </select>
      </div>

      <div className="course-grid">
        {courses.map(course => (
          <div 
            key={course.id} 
            className={`course-card ${course.isEnrolled ? 'enrolled' : ''}`}
          >
            <img src={course.thumbnail} alt={course.title} />
            <div className="course-info">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              
              {course.isEnrolled && (
                <div className="user-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${course.userProgress}%` }}
                    />
                  </div>
                  <span>进度: {course.userProgress}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="loading">加载中...</div>}
    </div>
  )
}

export default CourseLearningPage
```

### 3. 自动触发机制

```javascript
// 在路由守卫中自动触发
// router/index.js
import { courseAPI } from '@/services/n8n-api.js'
import { useUserStore } from '@/stores/user'

router.beforeEach(async (to, from, next) => {
  if (to.path === '/courses' || to.path === '/learning') {
    const userStore = useUserStore()
    const userId = userStore.user?.id || 'anonymous'
    
    // 预加载课程数据
    try {
      await courseAPI.getAllCoursesForUser(userId, {
        format: 'simple',
        includeStats: true
      })
    } catch (error) {
      console.warn('预加载课程数据失败:', error)
    }
  }
  next()
})
```

### 4. 状态管理集成 (Pinia)

```javascript
// stores/courses.js
import { defineStore } from 'pinia'
import { courseAPI } from '@/services/n8n-api.js'
import { useUserStore } from './user'

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [],
    userStats: null,
    loading: false,
    filters: {
      category: '',
      difficulty: '',
      format: 'detailed',
      sortBy: 'created_at',
      sortOrder: 'desc',
      includeStats: true
    }
  }),

  actions: {
    async loadAllCourses() {
      this.loading = true
      try {
        const userStore = useUserStore()
        const userId = userStore.user?.id || 'anonymous'
        
        const response = await courseAPI.getAllCoursesForUser(userId, this.filters)
        
        if (response.success) {
          this.courses = response.data.courses
          this.userStats = response.data.userStats
        }
      } catch (error) {
        console.error('加载课程失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.loadAllCourses()
    },

    // 自动触发加载
    async autoLoad() {
      if (this.courses.length === 0) {
        await this.loadAllCourses()
      }
    }
  },

  getters: {
    enrolledCourses: (state) => {
      return state.courses.filter(course => course.isEnrolled)
    },
    
    recommendedCourses: (state) => {
      return state.courses
        .filter(course => !course.isEnrolled)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 6)
    }
  }
})
```

## 主要特性

### 1. 个性化显示
- 已注册课程会显示学习进度
- 已注册课程优先排序
- 显示用户学习统计信息

### 2. 自动触发
- 进入课程页面时自动加载
- 用户登录状态变化时重新加载
- 支持预加载机制

### 3. 灵活配置
- 支持多种数据格式
- 丰富的过滤和排序选项
- 可选的统计信息

### 4. 性能优化
- 并行数据查询
- 智能缓存策略
- 按需加载统计信息

## 部署建议

1. **导入新工作流**: 将 `get-all-courses-with-user.json` 导入到 n8n
2. **更新前端代码**: 使用新的 API 方法
3. **测试用户体验**: 验证登录和匿名用户的不同体验
4. **监控性能**: 关注响应时间和数据量