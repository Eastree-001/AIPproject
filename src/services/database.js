import n8nAPI from './n8n-api.js'

// 用户相关服务 - 现在通过n8n API
export const userService = {
  // 获取用户资料
  async getProfile(userId) {
    const response = await fetch(`${import.meta.env.VITE_N8N_BASE_URL}/webhook/user-profile/${userId}`)
    const result = await response.json()
    
    if (!result.success) throw new Error(result.message)
    return result.data
  },

  // 更新用户资料
  async updateProfile(userId, updates) {
    const response = await fetch(`${import.meta.env.VITE_N8N_BASE_URL}/webhook/user-profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const result = await response.json()
    
    if (!result.success) throw new Error(result.message)
    return result.data
  },

  // 获取用户学习统计
  async getLearningStats(userId) {
    return await n8nAPI.analytics.getLearningAnalytics(userId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    })
  }
}

// 课程相关服务 - 现在通过n8n API
export const courseService = {
  // 获取所有课程
  async getAllCourses() {
    return await n8nAPI.course.getAllCourses()
  },

  // 获取单个课程详情
  async getCourse(courseId) {
    return await n8nAPI.course.getCourse(courseId)
  },

  // 获取课程进度
  async getCourseProgress(userId, courseId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_N8N_BASE_URL}/webhook/course-progress?userId=${userId}&courseId=${courseId}`)
      const result = await response.json()
      
      if (!result.success) {
        return { progress: 0, completed_lessons: [] }
      }
      return result.data || { progress: 0, completed_lessons: [] }
    } catch (error) {
      console.error('获取课程进度失败:', error)
      return { progress: 0, completed_lessons: [] }
    }
  }
}

// OKR相关服务 - 现在通过n8n API
export const okrService = {
  // 获取用户OKR
  async getUserOKRs(userId) {
    const response = await fetch(`${import.meta.env.VITE_N8N_BASE_URL}/webhook/user-okrs/${userId}`)
    const result = await response.json()
    
    if (!result.success) throw new Error(result.message)
    return result.data
  },

  // 创建OKR
  async createOKR(okrData) {
    const response = await fetch(`${import.meta.env.VITE_N8N_BASE_URL}/webhook/okrs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(okrData)
    })
    const result = await response.json()
    
    if (!result.success) throw new Error(result.message)
    return result.data
  },

  // 更新OKR进度
  async updateOKRProgress(okrId, progress) {
    const response = await fetch(`${import.meta.env.VITE_N8N_BASE_URL}/webhook/okr-progress/${okrId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress)
    })
    const result = await response.json()
    
    if (!result.success) throw new Error(result.message)
    return result.data
  }
}

// 社区相关服务 - 现在通过n8n API
export const communityService = {
  // 获取社区帖子
  async getPosts(limit = 20, offset = 0) {
    return await n8nAPI.community.getPosts({ limit, offset })
  },

  // 创建帖子
  async createPost(postData) {
    return await n8nAPI.community.createPost(postData)
  },

  // 添加评论
  async addComment(postId, commentData) {
    return await n8nAPI.community.addComment(postId, commentData)
  }
}

// AI导师相关服务 - 现在通过n8n API
export const aiTutorService = {
  // 发送AI问题并获取回答
  async askQuestion(questionData) {
    return await n8nAPI.aiTutor.askQuestion(questionData)
  },

  // 获取学习建议
  async getLearningAdvice(userId) {
    return await n8nAPI.aiTutor.getLearningAdvice(userId)
  },

  // 获取个性化推荐
  async getPersonalizedRecommendations(userId) {
    return await n8nAPI.aiTutor.getPersonalizedRecommendations(userId)
  }
}

// 实时订阅服务 - 可以通过WebSocket或长轮询实现
export const realtimeService = {
  // 订阅用户进度更新（通过定期轮询实现）
  subscribeToProgress(userId, callback) {
    const intervalId = setInterval(async () => {
      try {
        const stats = await n8nAPI.learning.getLearningStats(userId)
        callback({ new: stats })
      } catch (error) {
        console.error('获取进度更新失败:', error)
      }
    }, 30000) // 30秒轮询一次

    return {
      unsubscribe: () => clearInterval(intervalId)
    }
  },

  // 订阅社区更新
  subscribeToCommunity(callback) {
    const intervalId = setInterval(async () => {
      try {
        const posts = await n8nAPI.community.getPosts({ limit: 5 })
        callback({ new: posts[0] }) // 假设返回最新的帖子
      } catch (error) {
        console.error('获取社区更新失败:', error)
      }
    }, 60000) // 60秒轮询一次

    return {
      unsubscribe: () => clearInterval(intervalId)
    }
  },

  // 取消订阅
  unsubscribe(subscription) {
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe()
    }
  }
}
