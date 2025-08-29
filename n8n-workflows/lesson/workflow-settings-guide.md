# n8n 工作流设置指南

## 忽略类型转换错误设置

为了确保我们的课程工作流能够正常运行，需要在n8n中配置"忽略类型转换错误"选项。

### 1. 全局设置（推荐）

#### 环境变量方式
在n8n服务器的环境配置中添加：
```bash
# Docker 环境
N8N_IGNORE_TYPE_ERRORS=true
N8N_NODES_CONTINUE_ON_FAIL=true

# 或在 docker-compose.yml 中
environment:
  - N8N_IGNORE_TYPE_ERRORS=true
  - N8N_NODES_CONTINUE_ON_FAIL=true
```

#### 配置文件方式
创建或修改 n8n 配置文件：
```json
{
  "nodes": {
    "ignoreTypeErrors": true,
    "continueOnFail": true
  },
  "workflows": {
    "defaultSettings": {
      "saveDataErrorExecution": "all",
      "saveDataSuccessExecution": "all",
      "saveManualExecutions": true
    }
  }
}
```

### 2. 工作流级别设置

对于每个导入的工作流，请按以下步骤设置：

#### 步骤1：打开工作流设置
1. 在n8n工作流编辑器中
2. 点击右上角的"Settings"（设置）按钮
3. 或使用快捷键 `Ctrl/Cmd + ,`

#### 步骤2：配置错误处理
在设置面板中找到以下选项并启用：

```
✅ Continue on Fail (失败时继续)
✅ Ignore Type Conversion Errors (忽略类型转换错误)
✅ Save Data on Error (错误时保存数据)
✅ Save Data on Success (成功时保存数据)
```

#### 步骤3：保存设置
点击"Save"保存工作流设置

### 3. 关键节点设置

对于以下类型的节点，特别需要启用错误忽略：

#### Code 节点
```javascript
// 在 JavaScript 代码中添加错误处理
try {
  // 您的代码逻辑
  const result = processData(inputData);
  return result;
} catch (error) {
  console.error('Code node error:', error);
  return {
    error: true,
    message: error.message,
    data: null
  };
}
```

#### Set 节点
- 启用"Continue on Fail"
- 启用"Ignore Type Errors"
- 设置默认值以防数据缺失

#### Supabase 节点
- 启用"Continue on Fail"
- 配置重试机制
- 设置超时时间

### 4. 具体工作流配置

#### 创建课程工作流 (create-course.json)
```json
{
  "settings": {
    "continueOnFail": true,
    "ignoreTypeErrors": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

#### 课程统计工作流 (get-course-stats.json)
```json
{
  "settings": {
    "continueOnFail": true,
    "ignoreTypeErrors": true,
    "timeout": 30000
  }
}
```

### 5. 导入工作流后的检查清单

导入每个工作流文件后，请检查：

- [ ] 工作流设置中已启用"Continue on Fail"
- [ ] 工作流设置中已启用"Ignore Type Conversion Errors"
- [ ] 所有Supabase节点都配置了正确的凭据
- [ ] 所有Code节点都有适当的错误处理
- [ ] Webhook节点的URL路径正确
- [ ] 工作流已激活

### 6. 测试验证

#### 使用n8n内置测试
1. 在工作流编辑器中点击"Test workflow"
2. 提供测试数据
3. 检查执行结果和错误日志

#### 使用前端测试页面
访问 `/course-workflow-test` 页面：
1. 测试每个API端点
2. 检查返回数据格式
3. 验证错误处理机制

### 7. 常见问题解决

#### 问题1：类型转换错误
```
Error: Cannot convert undefined to string
```
**解决方案**：
- 在Code节点中添加类型检查
- 使用默认值处理undefined数据
- 启用"Ignore Type Errors"

#### 问题2：数据库连接失败
```
Error: Connection to Supabase failed
```
**解决方案**：
- 检查Supabase凭据配置
- 验证网络连接
- 检查数据库表是否存在

#### 问题3：Webhook触发失败
```
Error: Webhook not found
```
**解决方案**：
- 确认工作流已激活
- 检查Webhook URL路径
- 验证HTTP方法匹配

### 8. 监控和日志

#### 启用详细日志
```bash
# 环境变量
N8N_LOG_LEVEL=debug
N8N_LOG_OUTPUT=console,file
```

#### 查看执行历史
1. 在n8n界面中点击"Executions"
2. 查看成功和失败的执行记录
3. 分析错误模式和性能指标

### 9. 生产环境建议

#### 安全设置
- 使用service_role key而不是anon key
- 配置适当的RLS策略
- 限制API访问频率

#### 性能优化
- 设置合理的超时时间
- 启用结果缓存
- 监控资源使用情况

#### 备份和恢复
- 定期导出工作流配置
- 备份数据库结构和数据
- 测试恢复流程

---

**重要提示**：
1. 在修改全局设置前，请备份现有配置
2. 建议先在测试环境中验证所有设置
3. 定期检查工作流执行状态和错误日志
4. 保持n8n和相关依赖的版本更新

按照以上设置，您的课程工作流应该能够正常处理各种数据类型转换和错误情况。