import { supabase, db } from '@/lib/supabase'

// 用户相关服务
export const userService = {
  // 获取用户资料
  async getProfile(userId) {
    const { data, error } = await db.users
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // 更新用户资料
  async updateProfile(userId, updates) {
    const { data, error } = await db.users
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 获取用户学习统计
  async getLearningStats(userId) {
    const { data, error } = await db.progress
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  }
}

// 课程相关服务
export const courseService = {
  // 获取所有课程
  async getAllCourses() {
    const { data, error } = await db.courses
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 获取单个课程详情
  async getCourse(courseId) {
    const { data, error } = await db.courses
      .select(`
        *,
        lessons (*)
      `)
      .eq('id', courseId)
      .single()
    
    if (error) throw error
    return data
  },

  // 获取课程进度
  async getCourseProgress(userId, courseId) {
    const { data, error } = await db.progress
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data || { progress: 0, completed_lessons: [] }
  }
}

// OKR相关服务
export const okrService = {
  // 获取用户OKR
  async getUserOKRs(userId) {
    const { data, error } = await db.okrs
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 创建OKR
  async createOKR(okrData) {
    const { data, error } = await db.okrs
      .insert([okrData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 更新OKR进度
  async updateOKRProgress(okrId, progress) {
    const { data, error } = await db.okr_progress
      .upsert([{ okr_id: okrId, ...progress }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// 社区相关服务
export const communityService = {
  // 获取社区帖子
  async getPosts(limit = 20, offset = 0) {
    const { data, error } = await db.posts
      .select(`
        *,
        users (id, name, avatar),
        comments (count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // 创建帖子
  async createPost(postData) {
    const { data, error } = await db.posts
      .insert([postData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 添加评论
  async addComment(commentData) {
    const { data, error } = await db.comments
      .insert([commentData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// AI导师相关服务
export const aiTutorService = {
  // 创建AI会话
  async createSession(userId, topic) {
    const { data, error } = await db.ai_sessions
      .insert([{
        user_id: userId,
        topic,
        status: 'active'
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 保存AI消息
  async saveMessage(sessionId, messageData) {
    const { data, error } = await db.ai_messages
      .insert([{
        session_id: sessionId,
        ...messageData
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 获取会话历史
  async getSessionHistory(sessionId) {
    const { data, error } = await db.ai_messages
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  }
}

// 实时订阅服务
export const realtimeService = {
  // 订阅用户进度更新
  subscribeToProgress(userId, callback) {
    return db.progress
      .on('*', payload => {
        if (payload.new && payload.new.user_id === userId) {
          callback(payload)
        }
      })
      .subscribe()
  },

  // 订阅社区更新
  subscribeToCommunity(callback) {
    return db.posts
      .on('INSERT', callback)
      .subscribe()
  },

  // 取消订阅
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}
