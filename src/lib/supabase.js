import { createClient } from '@supabase/supabase-js'

// 获取环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 调试信息
console.log('Supabase 配置检查:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  envMode: import.meta.env.MODE
})

// 验证环境变量
if (!supabaseUrl) {
  throw new Error('缺少 VITE_SUPABASE_URL 环境变量。请检查 .env 文件。')
}

if (!supabaseAnonKey) {
  throw new Error('缺少 VITE_SUPABASE_ANON_KEY 环境变量。请检查 .env 文件。')
}

// 验证 URL 格式
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`无效的 Supabase URL: ${supabaseUrl}`)
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 导出常用的数据库操作函数
export const db = {
  // 用户相关
  users: supabase.from('users'),
  
  // 课程相关
  courses: supabase.from('courses'),
  lessons: supabase.from('lessons'),
  
  // 学习进度相关
  progress: supabase.from('user_progress'),
  
  // OKR相关
  okrs: supabase.from('okrs'),
  okr_progress: supabase.from('okr_progress'),
  
  // 社区相关
  posts: supabase.from('community_posts'),
  comments: supabase.from('comments'),
  
  // AI导师相关
  ai_sessions: supabase.from('ai_sessions'),
  ai_messages: supabase.from('ai_messages')
}

// 测试连接
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count')
    if (error) {
      console.error('Supabase 连接测试失败:', error)
      return false
    }
    console.log('Supabase 连接测试成功:', data)
    return true
  } catch (err) {
    console.error('Supabase 连接测试异常:', err)
    return false
  }
}
