module.exports = {
  // 基本配置
  N8N_BASIC_AUTH_ACTIVE: true,
  N8N_BASIC_AUTH_USER: 'admin',
  N8N_BASIC_AUTH_PASSWORD: 'your-secure-password',
  
  // 数据库配置 (使用SQLite作为默认数据库)
  DB_TYPE: 'sqlite',
  DB_SQLITE_VACUUM_ON_STARTUP: true,
  DB_SQLITE_DATABASE: './n8n-database.sqlite',
  
  // 执行配置
  EXECUTIONS_PROCESS: 'main',
  EXECUTIONS_MODE: 'regular',
  
  // 安全配置
  N8N_ENCRYPTION_KEY: 'your-32-character-encryption-key-here',
  
  // 端口配置
  PORT: 5678,
  
  // 日志配置
  LOG_LEVEL: 'info',
  
  // 文件存储配置
  N8N_PERSISTENCE_TEMPDIR: './n8n-temp',
  
  // 环境配置
  NODE_ENV: 'development',
  
  // 允许的域名
  N8N_HOST: 'localhost',
  
  // 时区
  GENERIC_TIMEZONE: 'Asia/Shanghai'
};
