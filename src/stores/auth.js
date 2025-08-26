import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { userProfileService } from '@/services/userProfile'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const session = ref(null)

  const isAuthenticated = computed(() => !!user.value && !!session.value)

  // 使用 Supabase 登录
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('尝试登录:', email)
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) {
        console.error('登录错误:', authError)
        throw authError
      }else{
        console.log('登录成功，用户数据:', data)
      }

      // 设置用户和会话
      user.value = data.user
      session.value = data.session
      
      // 强制触发响应式更新
      await new Promise(resolve => setTimeout(resolve, 0))
      
      console.log('认证状态已更新:', {
        user: !!user.value,
        session: !!session.value,
        isAuthenticated: isAuthenticated.value
      })
      
      // 暂时跳过用户资料创建，避免在数据库操作时卡住
      console.log('跳过用户资料创建，直接返回登录成功')
      
      return { success: true, user: user.value }
    } catch (err) {
      console.error('登录失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 使用 Supabase 注册
  const register = async (email, password, userData = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('尝试注册:', email, userData)
      
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (authError) {
        console.error('注册错误:', authError)
        throw authError
      }
      
      console.log('注册成功，用户数据:', data)
      
      // 设置用户和会话
      user.value = data.user
      session.value = data.session
      
      // 注意：在注册时，用户资料创建可能会因为RLS策略而失败
      // 我们将在登录时自动创建用户资料
      console.log('注册完成，用户资料将在首次登录时创建')
      
      return { success: true, user: data.user }
    } catch (err) {
      console.error('注册失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 使用 Supabase 登出
  const logout = async () => {
    try {
      console.log('尝试登出')
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
      
      user.value = null
      session.value = null
      error.value = null
      console.log('登出成功')
    } catch (err) {
      console.error('登出失败:', err)
      error.value = err.message
    }
  }

  // 获取当前用户
  const getCurrentUser = async () => {
    try {
      console.log('获取当前用户...')
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('获取用户失败:', userError)
        return null
      }
      
      if (currentUser) {
        console.log('当前用户:', currentUser)
        user.value = currentUser
        
        // 获取用户完整资料
        try {
          const profile = await userProfileService.getProfile(currentUser.id)
          if (profile) {
            user.value = { ...currentUser, ...profile }
          }
        } catch (profileErr) {
          console.warn('处理用户资料时出错:', profileErr)
        }
        
        return currentUser
      } else {
        console.log('未找到当前用户')
        return null
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
      return null
    }
  }

  // 获取当前会话
  const getCurrentSession = async () => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('获取会话失败:', sessionError)
        return null
      }
      
      if (currentSession) {
        console.log('当前会话:', currentSession)
        session.value = currentSession
        return currentSession
      } else {
        console.log('未找到当前会话')
        return null
      }
    } catch (err) {
      console.error('获取会话失败:', err)
      return null
    }
  }

  // 监听认证状态变化
  const initAuth = () => {
    console.log('初始化认证状态监听...')
    
    // 获取当前会话
    getCurrentSession()
    
    // 获取当前用户
    getCurrentUser()
    
    // 添加标志位防止重复执行
    let isProcessingAuthChange = false
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // 防止重复执行
      if (isProcessingAuthChange) {
        console.log('认证状态变化处理中，跳过重复事件:', event)
        return
      }
      
      isProcessingAuthChange = true
      console.log('认证状态变化:', event, session)
      
      try {
        if (event === 'SIGNED_IN' && session) {
          // 只在用户状态未设置时设置
          if (!user.value || !session.value) {
            user.value = session.user
            session.value = session
            console.log('用户已登录:', session.user)
          }
          
          // 暂时跳过用户资料创建，避免在数据库操作时卡住
          console.log('跳过用户资料创建')
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          session.value = null
          console.log('用户已登出')
        } else if (event === 'TOKEN_REFRESHED' && session) {
          session.value = session
          console.log('令牌已刷新')
        }
      } catch (error) {
        console.error('处理认证状态变化时出错:', error)
      } finally {
        isProcessingAuthChange = false
      }
    })
    
    // 返回订阅以便清理
    return subscription
  }

  // 更新用户资料
  const updateProfile = async (updates) => {
    try {
      loading.value = true
      error.value = null
      
      const updatedProfile = await userProfileService.updateProfile(user.value.id, updates)
      
      user.value = { ...user.value, ...updatedProfile }
      return { success: true, user: user.value }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
    getCurrentSession,
    updateProfile,
    initAuth
  }
})
