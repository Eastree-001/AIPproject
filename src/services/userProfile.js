import { supabase } from '@/lib/supabase'

// 用户资料服务
export const userProfileService = {
  // 创建用户资料（在认证后调用）
  async createProfile(authUser, profileData = {}) {
    try {
      console.log('创建用户资料:', authUser.id, profileData)
      
      const profile = {
        id: authUser.id,
        email: authUser.email,
        name: profileData.name || authUser.email.split('@')[0],
        avatar: profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email}`,
        role: 'student',
        created_at: new Date().toISOString(),
        ...profileData
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert([profile])
        .select()
        .single()
      
      if (error) {
        console.error('创建用户资料失败:', error)
        throw error
      }
      
      console.log('用户资料创建成功:', data)
      return data
    } catch (err) {
      console.error('创建用户资料时出错:', err)
      throw err
    }
  },

  // 获取用户资料
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null // 用户资料不存在
        }
        throw error
      }
      
      return data
    } catch (err) {
      console.error('获取用户资料失败:', err)
      throw err
    }
  },

  // 更新用户资料
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('更新用户资料失败:', err)
      throw err
    }
  },

  // 确保用户资料存在（如果不存在则创建）
  async ensureProfile(authUser, profileData = {}) {
    try {
      // 先尝试获取现有资料
      let profile = await this.getProfile(authUser.id)
      
      if (!profile) {
        // 如果不存在，创建新资料
        console.log('用户资料不存在，正在创建...')
        profile = await this.createProfile(authUser, profileData)
      }
      
      return profile
    } catch (err) {
      console.error('确保用户资料存在时出错:', err)
      throw err
    }
  },

  // 使用 upsert 方式创建或更新用户资料
  async upsertProfile(authUser, profileData = {}) {
    try {
      console.log('Upsert 用户资料:', authUser.id)
      
      const profile = {
        id: authUser.id,
        email: authUser.email,
        name: profileData.name || authUser.email.split('@')[0],
        avatar: profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email}`,
        role: 'student',
        updated_at: new Date().toISOString(),
        ...profileData
      }
      
      // 如果是新用户，设置创建时间
      if (!profile.created_at) {
        profile.created_at = new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('users')
        .upsert([profile], {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single()
      
      if (error) {
        console.error('Upsert 用户资料失败:', error)
        throw error
      }
      
      console.log('用户资料 upsert 成功:', data)
      return data
    } catch (err) {
      console.error('Upsert 用户资料时出错:', err)
      throw err
    }
  }
}

// 导出默认实例
export default userProfileService
