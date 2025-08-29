# Webhook POST 请求错误修复指南

## 问题诊断
错误：`This webhook is not registered for POST requests`

## 快速修复步骤

### 1. 检查现有工作流
1. 打开 n8n 界面：http://localhost:5678
2. 查找名为 "Course Recommendation" 或包含 `api/courses/recommend` 的工作流
3. 检查工作流是否**已激活**（Active 状态）

### 2. 修复 Webhook 节点配置
在工作流编辑器中：

**Webhook 节点设置：**
- **HTTP Method**: `POST` ✅（不是 GET）
- **Path**: `api/courses/recommend` ✅
- **Authentication**: `None` 或根据需要
- **Response Mode**: `Respond to Webhook` ✅

### 3. 导入修复后的工作流
如果问题仍然存在，可以导入 `recommend-courses-fixed.json`：

1. 在 n8n 界面点击 "Import from File"
2. 选择 `n8n-workflows/lesson/recommend-courses-fixed.json`
3. 配置 Supabase 凭据
4. 激活工作流

### 4. 测试修复结果
```bash
curl -X POST http://localhost:5678/webhook-test/api/courses/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "limit": 5,
    "preferences": {
      "category": "programming",
      "difficulty": "beginner"
    }
  }'
```

### 5. 验证响应
正确的响应应该类似：
```json
{
  "success": true,
  "data": {
    "userId": "test-user",
    "recommendations": [...],
    "total": 5,
    "timestamp": "2025-08-29T09:00:00.000Z"
  },
  "message": "为用户 test-user 推荐了 5 门课程"
}
```

## 常见问题排查

### 问题1：工作流未激活
- 解决：在工作流列表中点击开关激活

### 问题2：Supabase 凭据未配置
- 解决：在工作流中配置 Supabase API 凭据

### 问题3：路径不匹配
- 解决：确保 Webhook 路径为 `api/courses/recommend`（不包含前缀）

### 问题4：仍然报错
- 检查 n8n 控制台日志
- 重启 n8n 服务
- 清除浏览器缓存