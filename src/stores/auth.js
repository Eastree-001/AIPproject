import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email, password) => {
    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟成功登录
      const mockUser = {
        id: 1,
        email,
        name: email.split('@')[0],
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, confirmPassword) => {
    try {
      if (password !== confirmPassword) {
        throw new Error('两次输入的密码不一致')
      }
      
      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟成功注册
      const mockUser = {
        id: 1,
        email,
        name: email.split('@')[0],
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    initAuth
  }
})
