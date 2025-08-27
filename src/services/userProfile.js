// 用户资料服务 - 已迁移到 n8n API
// 此文件保留用于向后兼容，但功能已通过 n8n 工作流实现
import { userService } from './database.js'

// 兼容性包装，将旧的API调用重定向到新的n8n服务
export const userProfileService = {
  // 获取用户资料
  async getProfile(userId) {
    console.warn('userProfileService.getProfile 已废弃，请使用 userService.getProfile')
    return await userService.getProfile(userId)
  },

  // 更新用户资料  
  async updateProfile(userId, updates) {
    console.warn('userProfileService.updateProfile 已废弃，请使用 userService.updateProfile')
    return await userService.updateProfile(userId, updates)
  },

  // 兼容性方法，实际通过n8n注册流程处理
  async createProfile(authUser, profileData = {}) {
    console.warn('userProfileService.createProfile 已废弃，用户创建现在通过n8n注册流程处理')
    return {
      id: authUser.id,
      email: authUser.email,
      name: profileData.name || authUser.email.split('@')[0],
      ...profileData
    }
  },

  // 兼容性方法
  async ensureProfile(authUser, profileData = {}) {
    console.warn('userProfileService.ensureProfile 已废弃')
    try {
      return await this.getProfile(authUser.id)
    } catch (err) {
      return await this.createProfile(authUser, profileData)
    }
  },

  // 兼容性方法
  async upsertProfile(authUser, profileData = {}) {
    console.warn('userProfileService.upsertProfile 已废弃，请使用 userService.updateProfile')
    return await this.updateProfile(authUser.id, profileData)
  }
}

// 导出默认实例
export default userProfileService
