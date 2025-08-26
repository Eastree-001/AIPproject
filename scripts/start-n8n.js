#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// n8n配置
const config = {
  port: process.env.N8N_PORT || 5678,
  host: process.env.N8N_HOST || 'localhost',
  database: process.env.N8N_DB_TYPE || 'sqlite',
  encryptionKey: process.env.N8N_ENCRYPTION_KEY || 'your-32-character-encryption-key-here',
  basicAuth: process.env.N8N_BASIC_AUTH_ACTIVE || 'true',
  basicAuthUser: process.env.N8N_BASIC_AUTH_USER || 'admin',
  basicAuthPassword: process.env.N8N_BASIC_AUTH_PASSWORD || 'your-secure-password'
};

console.log('🚀 启动启明星平台 n8n 后端服务...');
console.log(`📍 服务地址: http://${config.host}:${config.port}`);
console.log(`🔐 管理员账号: ${config.basicAuthUser}`);

// 设置环境变量（对齐 n8n 新版环境变量命名）
const env = {
  ...process.env,
  PORT: config.port.toString(),
  N8N_HOST: config.host,
  DB_TYPE: config.database,
  N8N_ENCRYPTION_KEY: config.encryptionKey,
  N8N_BASIC_AUTH_ACTIVE: config.basicAuth,
  N8N_BASIC_AUTH_USER: config.basicAuthUser,
  N8N_BASIC_AUTH_PASSWORD: config.basicAuthPassword,
  DB_SQLITE_DATABASE: './n8n-database.sqlite',
  N8N_PERSISTENCE_TEMPDIR: './n8n-temp',
  GENERIC_TIMEZONE: 'Asia/Shanghai',
  // 避免弃用警告（推荐配置）
  N8N_RUNNERS_ENABLED: 'true',
  DB_SQLITE_POOL_SIZE: '1'
};

// 启动 n8n（直接调用本地安装的 n8n 可执行文件，避免 npx 差异）
// 直接通过 node 执行入口脚本，避免 .cmd 层兼容差异
const n8nEntry = path.join(process.cwd(), 'node_modules', 'n8n', 'bin', 'n8n');
const n8nProcess = spawn(`${process.execPath} "${n8nEntry}" start`, { env, stdio: 'inherit', shell: true });

// 处理进程退出
n8nProcess.on('close', (code) => {
  console.log(`\n❌ n8n 服务已停止，退出码: ${code}`);
  process.exit(code);
});

// 处理错误
n8nProcess.on('error', (error) => {
  console.error('❌ 启动n8n时发生错误:', error);
  process.exit(1);
});

// 处理SIGINT信号 (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止n8n服务...');
  n8nProcess.kill('SIGINT');
});

// 处理SIGTERM信号
process.on('SIGTERM', () => {
  console.log('\n🛑 正在停止n8n服务...');
  n8nProcess.kill('SIGTERM');
});
