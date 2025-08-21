// 环境变量检查工具
export const checkEnvironmentVariables = () => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  const missingVars = []
  const envInfo = {}
  
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName]
    envInfo[varName] = {
      exists: !!value,
      value: value ? `${value.substring(0, 20)}...` : 'undefined',
      length: value ? value.length : 0
    }
    
    if (!value) {
      missingVars.push(varName)
    }
  })
  
  console.log('🌍 环境变量检查结果:', envInfo)
  
  if (missingVars.length > 0) {
    console.error('❌ 缺少以下环境变量:', missingVars)
    console.error('请确保在项目根目录创建 .env 文件')
    return false
  }
  
  console.log('✅ 所有必需的环境变量都已配置')
  return true
}

// 验证 Supabase 配置
export const validateSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    return { valid: false, error: '环境变量未配置' }
  }
  
  try {
    new URL(url)
    return { valid: true }
  } catch (error) {
    return { valid: false, error: `无效的 URL: ${url}` }
  }
}

// 获取环境信息
export const getEnvironmentInfo = () => {
  return {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    base: import.meta.env.BASE_URL,
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  }
}
