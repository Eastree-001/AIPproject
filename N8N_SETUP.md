# 启明星平台 n8n 后端设置指南

## 概述

本指南将帮助你设置n8n作为"启明星"平台的后端服务。n8n是一个强大的工作流自动化平台，可以处理各种业务逻辑和API请求。

## 前置要求

- Node.js 18+ 
- npm 8+
- 启明星平台前端代码

## 安装步骤

### 1. 安装n8n

```bash
npm install n8n
```

### 2. 配置环境变量

复制 `env.example` 文件为 `.env.local` 并配置：

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，设置必要的环境变量。

### 3. 启动n8n服务

#### 开发环境
```bash
npm run n8n:dev
```

#### 生产环境
```bash
npm run n8n:prod
```

#### 手动启动
```bash
npm run n8n
```

## 访问n8n界面

启动成功后，访问：http://localhost:5678

默认登录信息：
- 用户名：admin
- 密码：your-secure-password

## 工作流配置

### 导入工作流

1. 在n8n界面中，点击"Import from file"
2. 选择 `n8n-workflows/` 目录下的JSON文件
3. 配置必要的凭据（如Supabase连接）

### 配置凭据

在n8n中配置以下凭据：

#### Supabase凭据
- 类型：Supabase
- URL：你的Supabase项目URL
- API Key：你的Supabase服务密钥

#### AI服务凭据
- 类型：HTTP Header Auth
- Name：Authorization
- Value：Bearer your-ai-api-key

#### 邮件服务凭据
- 类型：HTTP Header Auth
- Name：X-API-Key
- Value：your-email-service-key

## 工作流说明

### 认证工作流
- **用户注册**：处理新用户注册请求
- **用户登录**：验证用户登录凭据
- **密码重置**：处理密码重置流程

### 课程管理工作流
- **课程CRUD**：创建、读取、更新、删除课程
- **课程搜索**：根据条件搜索课程
- **课程统计**：生成课程相关统计数据

### 学习记录工作流
- **进度记录**：记录用户学习进度
- **统计分析**：生成学习统计数据
- **报告导出**：导出学习记录报告

### AI导师工作流
- **智能问答**：处理用户问题并返回AI回答
- **学习建议**：基于用户数据生成学习建议
- **个性化推荐**：推荐适合用户的学习内容

### 社区互动工作流
- **内容管理**：管理帖子和评论
- **用户互动**：处理用户间的互动行为
- **内容审核**：自动审核用户生成的内容

### 通知系统工作流
- **消息发送**：发送各种类型的通知
- **邮件通知**：发送邮件通知
- **推送通知**：发送推送通知

### 数据分析工作流
- **数据收集**：收集各种用户行为数据
- **数据分析**：分析用户学习行为
- **报表生成**：生成各种分析报表

## 测试API

### 使用curl测试

```bash
# 测试用户注册
curl -X POST http://localhost:5678/webhook/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","username":"testuser"}'

# 测试获取课程
curl http://localhost:5678/webhook/courses

# 测试AI问答
curl -X POST http://localhost:5678/webhook/ai-question \
  -H "Content-Type: application/json" \
  -d '{"question":"什么是机器学习？","userId":"123"}'
```

### 使用Postman测试

1. 导入Postman集合（如果有）
2. 设置环境变量
3. 测试各个API端点

## 监控和日志

### 查看工作流执行

在n8n界面中：
1. 点击"Executions"查看执行历史
2. 查看每个节点的执行结果
3. 分析执行时间和错误信息

### 日志文件

n8n日志存储在：
- 开发环境：控制台输出
- 生产环境：`./n8n-temp/` 目录

## 故障排除

### 常见问题

1. **端口被占用**
   - 修改 `n8n.config.js` 中的端口配置
   - 或者停止占用端口的其他服务

2. **数据库连接失败**
   - 检查数据库配置
   - 确保数据库服务正在运行

3. **工作流执行失败**
   - 检查节点配置
   - 验证凭据设置
   - 查看错误日志

### 调试技巧

1. 在Code节点中添加console.log
2. 使用Debug节点查看数据流
3. 检查HTTP请求的响应状态

## 部署到生产环境

### Docker部署

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 环境变量配置

生产环境需要设置：
- `NODE_ENV=production`
- `N8N_ENCRYPTION_KEY`：32位加密密钥
- `N8N_BASIC_AUTH_PASSWORD`：强密码
- 数据库连接信息

### 反向代理

使用Nginx配置反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 安全考虑

1. **更改默认密码**：修改admin用户密码
2. **限制访问**：配置防火墙规则
3. **HTTPS**：在生产环境使用HTTPS
4. **定期备份**：备份工作流配置和数据库

## 性能优化

1. **数据库优化**：使用PostgreSQL替代SQLite
2. **缓存策略**：实现适当的缓存机制
3. **负载均衡**：使用多个n8n实例
4. **监控告警**：设置性能监控和告警

## 联系支持

如果遇到问题，请：
1. 查看n8n官方文档
2. 检查GitHub Issues
3. 联系开发团队

---

**注意**：本指南基于n8n最新版本编写，具体操作可能因版本差异而略有不同。
