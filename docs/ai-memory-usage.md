# AI 问答记忆功能使用指南

## 概述

AI 问答系统现在支持记忆功能，可以记住用户的对话历史，提供更加连贯和个性化的对话体验。

## 功能特性

### 1. 对话记忆
- 自动保存用户与 AI 的对话历史
- 支持会话级别的记忆管理
- 在后续对话中自动引用历史上下文

### 2. 会话管理
- 支持多个独立的对话会话
- 每个会话有独立的记忆空间
- 可以按会话查询和清除历史

### 3. 数据库集成
- 使用 Supabase 数据库存储对话历史
- 支持行级安全策略（RLS）
- 自动索引优化查询性能

## API 使用方法

### 1. 带记忆的智能问答

```javascript
import { aiAPI } from '@/services/n8n-api'

// 使用记忆功能的问答
const response = await aiAPI.askQuestionWithMemory(
  "什么是机器学习？",           // 问题
  "user-123",                   // 用户ID
  "session-abc",                // 会话ID（可选）
  "我想学习AI相关知识"          // 额外上下文（可选）
)

console.log(response)
// {
//   "success": true,
//   "question": "什么是机器学习？",
//   "answer": "机器学习是人工智能的一个分支...",
//   "sessionId": "session-abc",
//   "useMemory": true,
//   "timestamp": "2024-01-01T12:00:00.000Z"
// }
```

### 2. 不带记忆的问答

```javascript
// 传统问答方式（不保存历史）
const response = await aiAPI.askQuestion(
  "什么是机器学习？",
  "user-123",
  "我想学习AI相关知识"
)
```

### 3. 获取对话历史

```javascript
// 获取用户所有对话历史
const history = await aiAPI.getConversationHistory("user-123")

// 获取特定会话的历史
const sessionHistory = await aiAPI.getConversationHistory(
  "user-123", 
  "session-abc", 
  20  // 限制返回条数
)

console.log(history)
// {
//   "success": true,
//   "userId": "user-123",
//   "sessionId": null,
//   "totalCount": 15,
//   "conversations": [
//     {
//       "id": "uuid-1",
//       "question": "什么是机器学习？",
//       "answer": "机器学习是...",
//       "sessionId": "session-abc",
//       "createdAt": "2024-01-01T12:00:00.000Z"
//     }
//   ]
// }
```

### 4. 清除对话历史

```javascript
// 清除用户所有对话历史
const result = await aiAPI.clearConversationHistory("user-123")

// 清除特定会话的历史
const sessionResult = await aiAPI.clearConversationHistory(
  "user-123", 
  "session-abc"
)

console.log(result)
// {
//   "success": true,
//   "userId": "user-123",
//   "sessionId": "session-abc",
//   "message": "已清除用户 user-123 在会话 session-abc 中的对话历史",
//   "deletedCount": 5
// }
```

## 数据库表结构

### conversation_history 表

```sql
CREATE TABLE conversation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 索引

- `idx_conversation_history_user_id`: 用户ID索引
- `idx_conversation_history_session_id`: 会话ID索引
- `idx_conversation_history_created_at`: 创建时间索引
- `idx_conversation_history_user_session`: 用户+会话复合索引

## 工作流配置

### 1. 主要工作流

- **ai-question-with-memory.json**: 带记忆功能的智能问答
- **conversation-history.json**: 获取对话历史
- **clear-conversation-history.json**: 清除对话历史

### 2. Supabase 配置

确保在 n8n 中配置了 Supabase 凭据：

```json
{
  "name": "Supabase API",
  "type": "supabaseApi",
  "data": {
    "host": "your-project.supabase.co",
    "serviceRole": "your-service-role-key"
  }
}
```

## 最佳实践

### 1. 会话管理
- 为不同的对话主题使用不同的会话ID
- 定期清理过期的对话历史
- 限制单个会话的历史记录数量

### 2. 性能优化
- 使用适当的历史记录限制（建议10-20条）
- 定期清理超过30天的历史记录
- 监控数据库存储使用情况

### 3. 隐私保护
- 实施行级安全策略
- 定期审计对话数据
- 提供用户数据删除功能

## 错误处理

```javascript
try {
  const response = await aiAPI.askQuestionWithMemory(
    question, 
    userId, 
    sessionId
  )
  
  if (response.success) {
    // 处理成功响应
    console.log('AI回答:', response.answer)
  } else {
    // 处理业务错误
    console.error('AI服务错误:', response.error)
  }
} catch (error) {
  // 处理网络或系统错误
  console.error('请求失败:', error.message)
}
```

## 监控和维护

### 1. 数据库监控
- 监控表大小和增长趋势
- 检查查询性能
- 定期备份重要数据

### 2. 工作流监控
- 检查 n8n 工作流执行状态
- 监控 API 响应时间
- 记录错误日志

### 3. 定期维护
```sql
-- 清理30天前的历史记录
DELETE FROM conversation_history 
WHERE created_at < NOW() - INTERVAL '30 days';

-- 重建索引（如需要）
REINDEX TABLE conversation_history;
```

## 故障排除

### 常见问题

1. **记忆功能不工作**
   - 检查 `useMemory` 参数是否为 true
   - 验证 Supabase 连接配置
   - 确认数据库表已正确创建

2. **历史记录查询失败**
   - 检查用户ID格式
   - 验证数据库权限
   - 确认索引是否存在

3. **性能问题**
   - 减少历史记录查询数量
   - 优化数据库查询
   - 考虑添加缓存层

通过以上配置和使用方法，您可以充分利用 AI 问答系统的记忆功能，为用户提供更智能、更连贯的对话体验。