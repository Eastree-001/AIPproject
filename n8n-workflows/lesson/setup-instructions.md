# 快速设置指南

## 1. 环境变量设置

### Docker 环境
在您的 `docker-compose.yml` 文件中添加：

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_IGNORE_TYPE_ERRORS=true
      - N8N_NODES_CONTINUE_ON_FAIL=true
      - N8N_LOG_LEVEL=info
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
```

### 直接运行
```bash
export N8N_IGNORE_TYPE_ERRORS=true
export N8N_NODES_CONTINUE_ON_FAIL=true
n8n start
```

## 2. 导入工作流步骤

### 步骤1：创建Supabase凭据
1. 在n8n中点击"Credentials" → "Add Credential"
2. 选择"Supabase"
3. 填写信息：
   - **Name**: `supabase-credentials`
   - **Host**: 您的Supabase项目URL
   - **Service Role Secret**: 您的service_role密钥

### 步骤2：导入工作流文件
1. 在n8n中点击"Import from File"
2. 依次导入以下文件：
   - `create-course.json`
   - `get-course-stats.json`
   - `recommend-courses.json`
   - `get-course-list.json`
   - `get-course-details.json`

### 步骤3：配置每个工作流
对于每个导入的工作流：

1. **打开工作流**
2. **检查Supabase节点**：确保使用`supabase-credentials`
3. **打开设置** (Ctrl/Cmd + ,)
4. **启用以下选项**：
   ```
   ✅ Continue on Fail
   ✅ Ignore Type Conversion Errors
   ✅ Save Data on Error
   ✅ Save Data on Success
   ```
5. **保存并激活工作流**

## 3. 验证设置

### 检查工作流状态
```bash
# 访问n8n管理界面
http://localhost:5678

# 检查工作流列表，确保所有工作流都显示为"Active"
```

### 测试API端点
```bash
# 测试课程统计API
curl -X GET "http://localhost:5678/webhook/course-stats/"

# 测试课程列表API
curl -X GET "http://localhost:5678/webhook/course-list"

# 测试创建课程API
curl -X POST "http://localhost:5678/webhook/create-course" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试课程",
    "description": "这是一个测试课程",
    "instructor": "测试讲师",
    "duration": 60,
    "difficulty": 1,
    "category": "测试分类",
    "price": 0
  }'
```

## 4. 故障排除

### 常见错误及解决方案

#### 错误1：类型转换错误
```
TypeError: Cannot read property 'xxx' of undefined
```
**解决方案**：
- 确保启用了"Ignore Type Conversion Errors"
- 在Code节点中添加空值检查

#### 错误2：Supabase连接失败
```
Error: Invalid API key
```
**解决方案**：
- 检查Supabase凭据配置
- 确保使用正确的API密钥
- 验证数据库表是否存在

#### 错误3：Webhook未找到
```
Error: Workflow not found
```
**解决方案**：
- 确保工作流已激活
- 检查Webhook路径是否正确
- 重启n8n服务

## 5. 完整的设置检查清单

- [ ] n8n环境变量已设置
- [ ] Supabase数据库表已创建
- [ ] Supabase凭据已配置
- [ ] 所有工作流已导入
- [ ] 工作流设置已配置
- [ ] 所有工作流已激活
- [ ] API端点测试通过
- [ ] 前端测试页面正常

## 6. 下一步

设置完成后，您可以：

1. **使用前端测试页面**：访问 `/course-workflow-test`
2. **在课程页面创建课程**：点击"创建课程"按钮
3. **查看执行日志**：在n8n中监控工作流执行情况
4. **根据需要调整配置**：优化性能和错误处理

---

如果遇到问题，请查看：
- n8n执行日志
- Supabase数据库日志  
- 浏览器控制台错误
- 网络请求状态