# AI导师工作流配置指南

## 🎯 概述
已为你创建完整的Coze集成AI导师工作流，包含智能问答、学习建议和个性化推荐功能。

## 🔑 配置信息
- **Coze API Key**: `pat_36EOIz2ZT3miJ3CkNx3XGzPgfJ9Cbp0bMssy9IhUMIJrE0fH2YJOtdxw6mSJ9WyR`
- **Coze Bot ID**: `7543148227772989481`
- **已配置到**: `.env.local` 文件

## 📦 已创建的工作流文件

### 1. AI问答工作流
**文件**: `n8n-workflows/ai-tutor/ai-question.json`
- **功能**: 智能问答和对话
- **API端点**: `POST /webhook/ai-question`
- **特性**: 
  - 会话管理和历史记录
  - 错误处理和重试机制
  - 自动保存对话到Supabase

### 2. 学习建议工作流  
**文件**: `n8n-workflows/ai-tutor/learning-advice.json`
- **功能**: 基于学习数据的个性化建议
- **API端点**: `GET /webhook/learning-advice/:userId`
- **特性**:
  - 分析用户学习进度
  - 识别薄弱环节
  - 生成针对性建议

### 3. 个性化推荐工作流
**文件**: `n8n-workflows/ai-tutor/personalized-recommendations.json` 
- **功能**: 智能课程和资源推荐
- **API端点**: `GET /webhook/recommendations/:userId`
- **特性**:
  - 多维度用户画像分析
  - 智能推荐算法
  - 支持不同推荐类型

## 🚀 快速启动步骤

### 第一步: 安装依赖
```bash
npm install
```

### 第二步: 测试Coze API连接
```bash
npm run test:coze
```

### 第三步: 启动n8n服务
```bash
npm run n8n:dev
```

### 第四步: 导入工作流
1. 访问 http://localhost:5678
2. 使用默认登录信息:
   - 用户名: `admin`
   - 密码: `your-secure-password`
3. 点击右上角 "Import from file"
4. 依次导入以下文件:
   - `n8n-workflows/ai-tutor/ai-question.json`
   - `n8n-workflows/ai-tutor/learning-advice.json`
   - `n8n-workflows/ai-tutor/personalized-recommendations.json`

### 第五步: 配置Supabase凭据
在n8n中添加Supabase凭据:
1. 点击 "Credentials"
2. 添加 "Supabase" 类型凭据
3. 配置:
   - **Name**: `supabase-credentials`
   - **URL**: `https://wrhxapaucaaymolnyhyf.supabase.co`
   - **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaHhhcGF1Y2FheW1vbG55aHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NzI2OTQsImV4cCI6MjA3MTE0ODY5NH0.3ow4sKlDMBujGJyMyb2A5H5g83DlxbFWImmQNBu4Mvw`

### 第六步: 激活工作流
1. 在每个工作流页面点击右上角的开关
2. 确保状态显示为 "Active"

## 🔧 API使用示例

### 智能问答
```bash
curl -X POST http://localhost:5678/webhook/ai-question \
  -H "Content-Type: application/json" \
  -d '{
    "question": "什么是机器学习？",
    "userId": "user123",
    "context": "我是一个编程初学者"
  }'
```

### 获取学习建议
```bash
curl -X GET http://localhost:5678/webhook/learning-advice/user123
```

### 获取个性化推荐
```bash
curl -X GET "http://localhost:5678/webhook/recommendations/user123?type=courses&limit=3"
```

## 📊 数据库表结构要求

确保Supabase中存在以下表：

### ai_sessions 表
```sql
CREATE TABLE ai_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  messages JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### users 表 (如果不存在)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### progress 表 (如果不存在)  
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID,
  progress INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 前端集成

AI导师功能已集成到前端API中:

```javascript
// 使用示例
import n8nAPI from '@/services/n8n-api'

// 发送AI问题
const response = await n8nAPI.aiTutor.askQuestion({
  question: "如何学习JavaScript？",
  userId: "user123"
})

// 获取学习建议
const advice = await n8nAPI.aiTutor.getLearningAdvice("user123")

// 获取个性化推荐
const recommendations = await n8nAPI.aiTutor.getPersonalizedRecommendations("user123")
```

## 🐛 故障排除

### 常见问题:

1. **Coze API调用失败**
   - 检查API Key是否正确
   - 确认Bot ID是否有效
   - 查看n8n执行日志

2. **数据库连接错误**
   - 验证Supabase凭据
   - 确认表结构正确
   - 检查权限设置

3. **工作流不激活**
   - 确认所有凭据已配置
   - 检查环境变量是否正确加载
   - 查看n8n错误日志

## 📞 支持
如有问题，请检查:
1. n8n执行历史 (Executions页面)
2. 浏览器控制台错误
3. Coze API文档: https://www.coze.cn/docs

---

🎉 **恭喜！你的AI导师功能已准备就绪！** 🎉