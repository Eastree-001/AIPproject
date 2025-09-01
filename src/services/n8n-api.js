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
  // 获取所有课程 - 使用新的全部课程查询工作流 (POST方式)
  async getAllCourses(params = {}) {
    return await n8nRequest('/webhook/all-courses', {
      method: 'POST',
      body: JSON.stringify(params)
    })
  },

  // 获取所有课程（支持用户ID，用于个性化显示和自动触发）(POST方式)
  async getAllCoursesForUser(userId, params = {}) {
    return await n8nRequest('/webhook/all-courses', {
      method: 'POST',
      body: JSON.stringify({
        userId: userId,
        ...params
      })
    })
  },

  // 获取单个课程 - 使用新的课程详情工作流
  async getCourse(courseId, userId = '') {
    return await n8nRequest(`/webhook/course-details/${courseId}?userId=${userId}`)
  },

  // 创建课程 - 使用新的创建课程工作流
  async createCourse(courseData) {
    return await n8nRequest('/webhook/api/courses/create', {
      method: 'POST',
      body: JSON.stringify(courseData)
    })
  },

  // 获取课程统计信息
  async getCourseStats(userId = 'global') {
    return await n8nRequest('/webhook/api/courses/stats', {
      method: 'POST',
      body: JSON.stringify({
        userId: userId
      })
    })
  },

  // 获取课程推荐
  async getRecommendedCourses(userId, params = {}) {
    return await n8nRequest('/webhook/api/courses/recommend', {
      method: 'POST',
      body: JSON.stringify({
        userId: userId,
        ...params
      })
    })
  },

  // 更新课程 - 保留原有功能
  async updateCourse(courseId, updates) {
    return await n8nRequest(`/webhook/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },

  // 删除课程 - 保留原有功能
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

  // 记录学习进度 - 使用新的进度跟踪工作流
  async recordProgress(progressData) {
    return await n8nRequest('/webhook-test/api/learning/progress', {
      method: 'POST',
      body: JSON.stringify(progressData)
    })
  },

  // 获取学习统计
  async getLearningStats(userId) {
    return await n8nRequest(`/webhook-test/learning-stats/${userId}`)
  },

  // 导出学习记录
  async exportRecords(userId, format = 'csv') {
    return await n8nRequest(`/webhook-test/export-records/${userId}?format=${format}`)
  },

  // 智能学习分析 - 新增功能
  async getSmartAnalytics(userId, analysisType = 'comprehensive', timeRange = 7) {
    return await n8nRequest('/webhook-test/api/ai/learning-analytics', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        analysisType,
        timeRange
      })
    })
  },

  // 批量更新学习进度
  async batchUpdateProgress(progressList) {
    const results = []
    for (const progress of progressList) {
      try {
        const result = await this.recordProgress(progress)
        results.push({ success: true, data: result, progress })
      } catch (error) {
        results.push({ success: false, error: error.message, progress })
      }
    }
    return results
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
    return await n8nRequest(`/webhook-test/api/ai/learning-advice/${userId}`)
  },

  // 获取个性化推荐
  async getPersonalizedRecommendations(userId) {
    return await n8nRequest(`/webhook-test/api/ai/recommendations/${userId}`)
  }
}

// 社区互动相关API
export const communityAPI = {
  // 获取帖子列表
  async getPosts(filters = {}) {
    const queryParams = new URLSearchParams(filters)
    return await n8nRequest(`/webhook-test/posts?${queryParams}`)
  },

  // 创建帖子
  async createPost(postData) {
    return await n8nRequest('/webhook-test/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  },

  // 获取评论
  async getComments(postId) {
    return await n8nRequest(`/webhook-test/posts/${postId}/comments`)
  },

  // 添加评论
  async addComment(postId, commentData) {
    return await n8nRequest(`/webhook-test/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData)
    })
  }
}

// 通知系统相关API
export const notificationAPI = {
  // 获取用户通知
  async getUserNotifications(userId) {
    return await n8nRequest(`/webhook-test/notifications/${userId}`)
  },

  // 标记通知为已读
  async markAsRead(notificationId) {
    return await n8nRequest(`/webhook-test/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  },

  // 发送通知
  async sendNotification(notificationData) {
    return await n8nRequest('/webhook-test/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    })
  }
}

// OKR管理相关API
export const okrAPI = {
  // 自动更新OKR进度
  async autoUpdateProgress(userId, triggerType = 'learning_activity', activityData = {}) {
    return await n8nRequest('/webhook-test/api/okr/auto-update', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        triggerType,
        activityData
      })
    })
  },

  // 手动触发OKR进度计算
  async recalculateProgress(userId) {
    return await this.autoUpdateProgress(userId, 'manual_recalculation')
  },

  // 获取OKR进度历史
  async getProgressHistory(okrId) {
    return await n8nRequest(`/webhook-test/okr/progress-history/${okrId}`)
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
    return await n8nRequest(`/webhook-test/analytics/learning?${queryParams}`)
  },

  // 获取用户行为分析
  async getUserBehaviorAnalytics(userId) {
    return await n8nRequest(`/webhook-test/analytics/behavior/${userId}`)
  },

  // 生成学习报告
  async generateLearningReport(userId, reportType) {
    return await n8nRequest(`/webhook-test/analytics/report/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ reportType })
    })
  },

  // 获取智能学习洞察 - 整合新的分析工作流
  async getSmartInsights(userId, analysisType = 'comprehensive', timeRange = 7) {
    return await learningAPI.getSmartAnalytics(userId, analysisType, timeRange)
  }
}

// AI问答相关API
export const aiAPI = {
  // 智能问答（原版本，不带记忆）
  async askQuestion(question, userId = null, context = '') {
    return await n8nRequest('/webhook/api/ai/question', {
      method: 'POST',
      body: JSON.stringify({
        question,
        userId,
        context,
        useMemory: false
      })
    })
  },

  // 智能问答（带记忆功能）
  async askQuestionWithMemory(question, userId = null, sessionId = null, context = '') {
    return await n8nRequest('/webhook/api/ai/question', {
      method: 'POST',
      body: JSON.stringify({
        question,
        userId,
        sessionId: sessionId || `session-${userId}-${Date.now()}`,
        context,
        useMemory: true
      })
    })
  },

  // 获取对话历史
  async getConversationHistory(userId, sessionId = null, limit = 10) {
    return await n8nRequest('/webhook/api/ai/conversation-history', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        sessionId,
        limit
      })
    })
  },

  // 清除对话历史
  async clearConversationHistory(userId, sessionId = null) {
    return await n8nRequest('/webhook/api/ai/clear-history', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        sessionId
      })
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
  analytics: analyticsAPI,
  okr: okrAPI,
  ai: aiAPI
}