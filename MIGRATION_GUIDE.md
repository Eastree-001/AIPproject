# 启明星平台后端迁移指南

## 迁移概述

本项目已从纯 Supabase 后端架构迁移到 n8n + Supabase 的混合架构：

- **数据库**: 继续使用 Supabase 作为数据存储
- **后端API**: 使用 n8n 工作流处理所有业务逻辑
- **前端**: Vue.js 应用调用 n8n 的 webhook 端点

## 架构变化

### 旧架构
```
前端 (Vue.js) → Supabase API → PostgreSQL
```

### 新混合架构
```
前端 (Vue.js) → { 
  认证: Supabase Auth
  业务逻辑: n8n Webhooks → Supabase → PostgreSQL
}
```

## 主要变更

### 1. API 服务层 (`src/services/`)

- **`n8n-api.js`**: 新增的 n8n API 调用封装
- **`database.js`**: 已更新为使用 n8n API 而非直接调用 Supabase
- **认证服务**: 从 Supabase Auth 迁移到基于 n8n 的自定义认证

### 2. 认证系统 (`src/stores/auth.js`)

- **保持使用 Supabase Auth** 进行登录/注册
- 继续使用 Supabase 的会话管理
- 保留 Supabase Auth 的实时监听

### 3. n8n 工作流

创建了以下工作流文件：

- **课程管理工作流**:
  - `n8n-workflows/courses/course-management.json`

- **学习进度工作流**:
  - `n8n-workflows/learning/progress-tracking.json`

注意：认证工作流已移除，继续使用 Supabase Auth

## n8n 工作流配置

### 1. 启动 n8n

```bash
npm run n8n:dev
```

### 2. 访问 n8n 管理界面

URL: http://localhost:5678
用户名: admin
密码: your-secure-password

### 3. 导入工作流

1. 在 n8n 界面中点击 "Import from file"
2. 选择 `n8n-workflows/` 目录下的 JSON 文件
3. 配置 Supabase 连接凭据

### 4. 配置凭据

在 n8n 中配置以下凭据：

#### Supabase 凭据
- 类型: Supabase
- URL: 你的 Supabase 项目 URL
- API Key: 你的 Supabase 服务密钥（service_role key）

#### AI 服务凭据（如果需要）
- 类型: HTTP Header Auth
- Name: Authorization
- Value: Bearer your-ai-api-key

## API 端点变更

### 认证端点

| 功能 | 旧端点 | 新端点 |
|------|--------|--------|
| 登录 | Supabase Auth | **仍使用 Supabase Auth** |
| 注册 | Supabase Auth | **仍使用 Supabase Auth** |
| 密码重置 | Supabase Auth | **仍使用 Supabase Auth** |

### 课程端点

| 功能 | 旧端点 | 新端点 |
|------|--------|--------|
| 获取课程列表 | Supabase 查询 | `GET /webhook/courses` |
| 获取单个课程 | Supabase 查询 | `GET /webhook/courses/:id` |
| 创建课程 | Supabase 插入 | `POST /webhook/courses` |

### 学习记录端点

| 功能 | 旧端点 | 新端点 |
|------|--------|--------|
| 获取学习记录 | Supabase 查询 | `GET /webhook/learning-records` |
| 记录进度 | Supabase 更新 | `POST /webhook/learning-progress` |
| 获取统计数据 | Supabase 查询 | `GET /webhook/learning-stats/:userId` |

## 测试迁移

### 1. 启动服务

```bash
# 启动 n8n
npm run n8n:dev

# 在另一个终端启动前端
npm run dev
```

### 2. 测试 API 端点

```bash
# 测试课程 API
curl -X GET http://localhost:5678/webhook/courses

# 测试用户注册
curl -X POST http://localhost:5678/webhook/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","username":"testuser"}'

# 测试用户登录
curl -X POST http://localhost:5678/webhook/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### 3. 测试前端功能

1. 访问 http://localhost:5173
2. 测试用户注册和登录
3. 测试课程浏览功能
4. 测试学习进度记录

## 故障排除

### 常见问题

1. **n8n 服务无法启动**
   - 检查端口 5678 是否被占用
   - 确认 Node.js 版本 >= 18

2. **工作流执行失败**
   - 检查 Supabase 凭据配置
   - 查看 n8n 执行日志

3. **前端 API 调用失败**
   - 确认 n8n 服务正在运行
   - 检查 `.env.local` 中的 `VITE_N8N_BASE_URL` 配置

4. **数据库连接错误**
   - 验证 Supabase 项目设置
   - 检查 API 密钥权限

### 调试步骤

1. **查看 n8n 执行历史**
   - 在 n8n 界面中点击 "Executions"
   - 检查失败的工作流执行

2. **检查浏览器控制台**
   - 查看前端 API 调用错误
   - 检查网络请求状态

3. **验证数据库状态**
   - 登录 Supabase Dashboard
   - 检查表结构和数据

## 回滚计划

如果需要回滚到 Supabase 直接连接模式：

1. 恢复 `src/services/database.js` 中的原始 Supabase 调用
2. 恢复 `src/stores/auth.js` 中的 Supabase Auth 集成
3. 停止 n8n 服务
4. 更新环境变量移除 n8n 配置

## 性能优化建议

1. **n8n 工作流优化**
   - 使用批量数据库操作
   - 添加适当的错误处理
   - 实现缓存机制

2. **前端优化**
   - 添加 API 响应缓存
   - 实现乐观更新
   - 添加加载状态指示器

3. **数据库优化**
   - 添加适当的数据库索引
   - 优化查询语句
   - 实现连接池

## 后续开发建议

1. **安全性**
   - 实现 JWT token 验证
   - 添加 API 速率限制
   - 加强输入验证

2. **监控和日志**
   - 集成日志收集
   - 添加性能监控
   - 实现错误报告

3. **测试覆盖**
   - 添加 API 端到端测试
   - 实现工作流单元测试
   - 添加前端集成测试