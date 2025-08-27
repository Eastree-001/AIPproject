import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { userService } from '@/services/database'

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
      }
      
      console.log('登录成功，用户数据:', data)
      
      // 设置用户和会话
      user.value = data.user
      session.value = data.session
      
      console.log('认证状态已更新:', {
        user: !!user.value,
        session: !!session.value,
        isAuthenticated: isAuthenticated.value
      })
      
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

  // 初始化认证状态监听
  const initAuth = () => {
    console.log('初始化认证状态监听...')
    
    // 获取当前会话
    getCurrentSession()
    
    // 获取当前用户
    getCurrentUser()
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('认证状态变化:', event, session)
      
      if (event === 'SIGNED_IN' && session) {
        user.value = session.user
        session.value = session
        console.log('用户已登录:', session.user)
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        session.value = null
        console.log('用户已登出')
      } else if (event === 'TOKEN_REFRESHED' && session) {
        session.value = session
        console.log('令牌已刷新')
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
      
      const updatedProfile = await userService.updateProfile(user.value.id, updates)
      
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
