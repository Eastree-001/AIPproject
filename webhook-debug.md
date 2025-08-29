# Webhook 调试指南

## 错误分析
错误信息：`This webhook is not registered for POST requests`

## 解决步骤

### 1. 检查 n8n 工作流配置
在 n8n 界面中：
1. 打开包含 `/api/courses/recommend` 端点的工作流
2. 找到 Webhook 节点
3. 确保配置如下：
   - **HTTP Method**: `POST`（不是 GET）
   - **Path**: `api/courses/recommend`
   - **Response Mode**: `Respond to Webhook`

### 2. 验证工作流状态
- 确保工作流已经**激活**（Active）
- 工作流名称应该包含 webhook 路径信息

### 3. 重新配置 Webhook 节点
如果问题仍然存在，请：
1. 删除现有的 Webhook 节点
2. 添加新的 Webhook 节点
3. 配置参数：
   ```
   HTTP Method: POST
   Path: api/courses/recommend
   Authentication: None (或根据需要)
   Response: 
     - Mode: Respond to Webhook
     - Response Code: 200
   ```

### 4. 测试 Webhook
使用以下命令测试：
```bash
curl -X POST http://localhost:5678/webhook-test/api/courses/recommend \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 5. 检查 n8n 日志
如果问题持续，检查 n8n 控制台日志获取更多信息。