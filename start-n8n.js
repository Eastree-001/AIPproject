const { spawn } = require('child_process')
const path = require('path')

console.log('启动n8n服务...')

// Windows兼容性：使用cmd来执行npx
const isWindows = process.platform === 'win32'
const command = isWindows ? 'cmd' : 'npx'
const args = isWindows ? ['/c', 'npx', 'n8n', 'start'] : ['n8n', 'start']

const n8nProcess = spawn(command, args, {
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    N8N_SKIP_OWNER_SETUP: 'false',
    DB_TYPE: 'sqlite',
    DB_SQLITE_DATABASE: './n8n-fresh.sqlite',
    N8N_DEFAULT_PASSWORD: '123123ABC',
    PORT: '5678',
    N8N_HOST: 'localhost',
    GENERIC_TIMEZONE: 'Asia/Shanghai',
    N8N_PERSONALIZATION_ENABLED: 'false',
    COZE_API_KEY: 'pat_36EOIz2ZT3miJ3CkNx3XGzPgfJ9Cbp0bMssy9IhUMIJrE0fH2YJOtdxw6mSJ9WyR',
    COZE_BOT_ID: '7543148227772989481'
  }
})

n8nProcess.on('close', (code) => {
  console.log(`n8n进程退出，退出码：${code}`)
})

n8nProcess.on('error', (err) => {
  console.error('启动n8n失败:', err)
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭n8n服务...')
  n8nProcess.kill('SIGINT')
  process.exit()
})