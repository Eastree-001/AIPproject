# 查询全部课程工作流 - 设置指南

## 快速设置步骤

### 1. 导入工作流
1. 登录您的 n8n 实例
2. 点击 "Import from file" 或 "从文件导入"
3. 选择 `get-all-courses.json` 文件
4. 确认导入设置

### 2. 配置 Supabase 凭据
确保以下 Supabase 节点都使用正确的凭据：
- **获取所有课程** 节点
- **获取课程评分** 节点  
- **获取注册统计** 节点
- **获取课程章节** 节点

#### 凭据配置步骤：
1. 点击任一 Supabase 节点
2. 在 "Credentials" 下拉菜单中选择现有的 `supabase-credentials`
3. 如果没有现有凭据，创建新的：
   - **Name**: `supabase-credentials`
   - **Host**: 您的 Supabase 项目 URL
   - **Service Role Secret**: 您的 Supabase service_role 密钥

### 3. 验证数据库表结构
确保您的 Supabase 数据库包含以下表：

#### courses 表
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  duration INTEGER, -- 秒数
  difficulty TEXT,
  category TEXT,
  thumbnail TEXT,
  price DECIMAL(10,2),
  tags TEXT[],
  prerequisites TEXT[],
  learning_objectives TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);
```

#### course_ratings 表
```sql
CREATE TABLE course_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  user_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_progress 表
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES courses(id),
  lesson_id UUID,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### lessons 表
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  content TEXT,
  duration INTEGER,
  order_index INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 配置 Webhook
1. 激活工作流
2. 复制生成的 Webhook URL
3. 确认 URL 格式为：`https://your-n8n-instance.com/webhook/all-courses`

### 5. 测试工作流

#### 基本测试
```bash
# 测试基本功能
curl "https://your-n8n-instance.com/webhook/all-courses"

# 测试带参数
curl "https://your-n8n-instance.com/webhook/all-courses?category=programming&format=simple"
```

#### 使用 JavaScript 测试
```javascript
// 在浏览器控制台或 Node.js 中测试
const testAPI = async () => {
  try {
    const response = await fetch('https://your-n8n-instance.com/webhook/all-courses?includeStats=true');
    const data = await response.json();
    console.log('API 响应:', data);
  } catch (error) {
    console.error('测试失败:', error);
  }
};

testAPI();
```

## 高级配置

### 1. 性能优化设置

#### 数据库索引
为了提高查询性能，建议创建以下索引：

```sql
-- 课程表索引
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_created_at ON courses(created_at);

-- 评分表索引
CREATE INDEX idx_course_ratings_course_id ON course_ratings(course_id);

-- 进度表索引
CREATE INDEX idx_user_progress_course_id ON user_progress(course_id);

-- 章节表索引
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
```

#### n8n 工作流设置
1. 在工作流设置中启用 "Save execution progress"
2. 设置合适的超时时间（建议 60 秒）
3. 启用错误处理和重试机制

### 2. 安全配置

#### API 访问控制
如果需要限制访问，可以添加认证节点：

1. 在 "提取请求参数" 节点前添加 "HTTP Request Auth" 节点
2. 配置 API Key 或 JWT 验证
3. 验证失败时返回 401 错误

#### 数据过滤
确保敏感数据不会被意外暴露：
- 检查课程状态过滤逻辑
- 验证用户权限（如果需要）
- 过滤掉草稿状态的课程（除非明确请求）

### 3. 监控和日志

#### 添加日志节点
在关键步骤后添加日志记录：

```javascript
// 在 "处理全部课程数据" 节点中添加日志
console.log(`处理了 ${enhancedCourses.length} 门课程`);
console.log(`应用的过滤器:`, params);
```

#### 性能监控
监控以下指标：
- 响应时间
- 返回的课程数量
- 错误率
- 并发请求数

## 故障排除

### 常见问题

#### 1. Supabase 连接失败
**症状**: 工作流执行失败，显示数据库连接错误
**解决方案**:
- 检查 Supabase 凭据配置
- 验证网络连接
- 确认 service_role 密钥权限

#### 2. 数据格式错误
**症状**: 返回的数据结构不正确
**解决方案**:
- 检查数据库表结构
- 验证字段名称匹配
- 确认数据类型正确

#### 3. 性能问题
**症状**: 响应时间过长
**解决方案**:
- 添加数据库索引
- 优化查询逻辑
- 考虑数据缓存
- 使用更简单的数据格式

#### 4. 参数验证失败
**症状**: 返回 400 错误
**解决方案**:
- 检查参数值是否在允许范围内
- 验证参数类型
- 查看错误消息详情

### 调试步骤

1. **检查工作流执行历史**
   - 查看每个节点的输入输出
   - 识别失败的节点
   - 检查错误消息

2. **验证数据库查询**
   - 直接在 Supabase 控制台执行查询
   - 检查返回的数据格式
   - 验证数据完整性

3. **测试单个节点**
   - 手动执行单个 Supabase 节点
   - 检查返回的数据
   - 验证节点配置

## 维护建议

### 定期检查
- 每周检查工作流执行状态
- 监控响应时间趋势
- 检查错误日志

### 数据清理
- 定期清理过期的评分数据
- 归档旧的课程记录
- 优化数据库性能

### 版本管理
- 备份工作流配置
- 记录重要变更
- 测试新功能后再部署

## 扩展功能

### 可能的增强
1. **缓存机制**: 添加 Redis 缓存层
2. **搜索功能**: 集成全文搜索
3. **推荐算法**: 基于用户行为的智能推荐
4. **实时更新**: WebSocket 支持实时数据更新
5. **批量操作**: 支持批量课程操作

### 集成建议
- 与现有的个性化推荐工作流集成
- 连接到分析和报告系统
- 集成到前端应用的状态管理中