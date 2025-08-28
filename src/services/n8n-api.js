import { ref } from 'vue'

// n8n API配置
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678'

// 通用API请求函数
async function n8nRequest(endpoint, options = {}) {
  const url = `${N8N_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('n8n API请求失败:', error)
    throw error
  }
}

// 用户认证由Supabase处理，此处保留作为占位符
export const authAPI = {
  // 注意: 认证功能已迁移回Supabase Auth
  // 这些方法保留用于向后兼容，但不再使用
}

// 课程管理相关API
export const courseAPI = {
  // 获取所有课程
  async getAllCourses() {
    return await n8nRequest('/webhook/courses')
  },

  // 获取单个课程
  async getCourse(courseId) {
    return await n8nRequest(`/webhook/courses/${courseId}`)
  },

  // 创建课程
  async createCourse(courseData) {
    return await n8nRequest('/webhook/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    })
  },

  // 更新课程
  async updateCourse(courseId, updates) {
    return await n8nRequest(`/webhook/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },

  // 删除课程
  async deleteCourse(courseId) {
    return await n8nRequest(`/webhook/courses/${courseId}`, {
      method: 'DELETE'
    })
  }
}

// 学习记录相关API
export const learningAPI = {
  // 获取学习记录
  async getLearningRecords(userId, filters = {}) {
    const queryParams = new URLSearchParams({
      userId,
      ...filters
    })
    return await n8nRequest(`/webhook/learning-records?${queryParams}`)
  },

  // 记录学习进度
  async recordProgress(progressData) {
    return await n8nRequest('/webhook/learning-progress', {
      method: 'POST',
      body: JSON.stringify(progressData)
    })
  },

  // 获取学习统计
  async getLearningStats(userId) {
    return await n8nRequest(`/webhook/learning-stats/${userId}`)
  },

  // 导出学习记录
  async exportRecords(userId, format = 'csv') {
    return await n8nRequest(`/webhook/export-records/${userId}?format=${format}`)
  }
}

// AI导师相关API
export const aiTutorAPI = {
  // 发送问题
  async askQuestion(questionData) {
    return await n8nRequest('/webhook-test/api/ai/question', {
      method: 'POST',
      body: JSON.stringify(questionData)
    })
  },

  // 获取学习建议
  async getLearningAdvice(userId) {
    return await n8nRequest(`/webhook/api/ai/learning-advice/${userId}`)
  },

  // 获取个性化推荐
  async getPersonalizedRecommendations(userId) {
    return await n8nRequest(`/webhook/api/ai/recommendations/${userId}`)
  }
}

// 社区互动相关API
export const communityAPI = {
  // 获取帖子列表
  async getPosts(filters = {}) {
    const queryParams = new URLSearchParams(filters)
    return await n8nRequest(`/webhook/posts?${queryParams}`)
  },

  // 创建帖子
  async createPost(postData) {
    return await n8nRequest('/webhook/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  },

  // 获取评论
  async getComments(postId) {
    return await n8nRequest(`/webhook/posts/${postId}/comments`)
  },

  // 添加评论
  async addComment(postId, commentData) {
    return await n8nRequest(`/webhook/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData)
    })
  }
}

// 通知系统相关API
export const notificationAPI = {
  // 获取用户通知
  async getUserNotifications(userId) {
    return await n8nRequest(`/webhook/notifications/${userId}`)
  },

  // 标记通知为已读
  async markAsRead(notificationId) {
    return await n8nRequest(`/webhook/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  },

  // 发送通知
  async sendNotification(notificationData) {
    return await n8nRequest('/webhook/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    })
  }
}

// 数据分析相关API
export const analyticsAPI = {
  // 获取学习分析数据
  async getLearningAnalytics(userId, dateRange) {
    const queryParams = new URLSearchParams({
      userId,
      startDate: dateRange.start,
      endDate: dateRange.end
    })
    return await n8nRequest(`/webhook/analytics/learning?${queryParams}`)
  },

  // 获取用户行为分析
  async getUserBehaviorAnalytics(userId) {
    return await n8nRequest(`/webhook/analytics/behavior/${userId}`)
  },

  // 生成学习报告
  async generateLearningReport(userId, reportType) {
    return await n8nRequest(`/webhook/analytics/report/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ reportType })
    })
  }
}

// 导出所有API
export default {
  auth: authAPI,
  course: courseAPI,
  learning: learningAPI,
  aiTutor: aiTutorAPI,
  community: communityAPI,
  notification: notificationAPI,
  analytics: analyticsAPI
}
