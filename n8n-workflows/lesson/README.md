# 课程学习系统 n8n 工作流

## 概述

本目录包含了完整的课程学习系统的 n8n 工作流文件，用于处理课程的创建、查询、推荐等功能，并与 Supabase 数据库集成。

## 工作流文件

### 1. create-course.json
**功能**: 创建新课程
- **触发方式**: POST `/webhook/create-course`
- **输入数据**:
  ```json
  {
    "title": "课程标题",
    "description": "课程描述",
    "instructor": "讲师姓名",
    "duration": 120,
    "difficulty": 2,
    "category": "前端开发",
    "price": 199.00,
    "tags": ["Vue.js", "JavaScript"],
    "requirements": ["HTML基础", "CSS基础"],
    "learningObjectives": ["掌握Vue.js", "理解组件化"]
  }
  ```
- **输出**: 创建结果和课程ID

### 2. get-course-stats.json
**功能**: 获取课程统计信息
- **触发方式**: GET `/webhook/course-stats/{userId}`
- **参数**: userId (可选)
- **输出**: 
  ```json
  {
    "globalStats": {
      "totalCourses": 156,
      "totalHours": 2840,
      "completedCourses": 8,
      "avgRating": 4.7
    },
    "userStats": { ... },
    "categoryStats": [ ... ]
  }
  ```

### 3. recommend-courses.json
**功能**: 智能课程推荐
- **触发方式**: GET `/webhook/recommend-courses/{userId}`
- **查询参数**: 
  - `limit`: 推荐数量 (默认6)
  - `category`: 指定分类
- **输出**: 推荐课程列表和推荐理由

### 4. get-course-list.json
**功能**: 获取课程列表（支持分页、搜索、过滤）
- **触发方式**: GET `/webhook/course-list`
- **查询参数**:
  - `page`: 页码 (默认1)
  - `limit`: 每页数量 (默认12)
  - `category`: 分类过滤
  - `search`: 搜索关键词
  - `difficulty`: 难度过滤
  - `sortBy`: 排序字段
  - `sortOrder`: 排序方向
- **输出**: 分页的课程列表和统计信息

### 5. get-course-details.json
**功能**: 获取课程详细信息
- **触发方式**: GET `/webhook/course-details/{courseId}`
- **查询参数**: `userId` (可选)
- **输出**: 完整的课程信息，包括章节、评分、用户进度等

## 数据库表结构

请参考 `supabase-schema.md` 文件中的完整数据库设计。

### 主要表：
- **courses**: 课程基本信息
- **course_lessons**: 课程章节
- **user_progress**: 用户学习进度
- **course_ratings**: 课程评分和评论

## 部署步骤

### 1. 创建 Supabase 数据库
1. 在 Supabase 项目中执行 `supabase-schema.md` 中的 SQL 语句
2. 创建所有必要的表和索引
3. 插入示例数据（可选）

### 2. 配置 n8n
1. 在 n8n 中创建 Supabase 凭据：
   - 凭据名称: `supabase-credentials`
   - Supabase URL: 您的项目URL
   - Supabase Key: anon key 或 service_role key

2. 导入工作流文件：
   - 将每个 JSON 文件导入到 n8n 中
   - 确保所有工作流都使用相同的 Supabase 凭据
   - 激活所有工作流

### 3. 配置前端
1. 更新环境变量：
   ```env
   VITE_N8N_BASE_URL=http://your-n8n-instance:5678
   ```

2. 测试连接：
   - 访问 `/course-workflow-test` 页面
   - 运行各项测试确保连接正常

## API 端点

所有工作流提供以下 REST API 端点：

| 方法 | 端点 | 功能 |
|------|------|------|
| POST | `/webhook/create-course` | 创建课程 |
| GET | `/webhook/course-stats/{userId}` | 获取统计信息 |
| GET | `/webhook/recommend-courses/{userId}` | 获取推荐课程 |
| GET | `/webhook/course-list` | 获取课程列表 |
| GET | `/webhook/course-details/{courseId}` | 获取课程详情 |

## 前端集成

### 使用 CreateCourseModal 组件
```vue
<template>
  <CreateCourseModal 
    v-model="showModal" 
    @success="handleCreateSuccess"
  />
</template>

<script setup>
import CreateCourseModal from '@/components/CreateCourseModal.vue'

const showModal = ref(false)

const handleCreateSuccess = () => {
  // 处理创建成功
  console.log('课程创建成功')
}
</script>
```

### 使用 API 服务
```javascript
import { courseAPI } from '@/services/n8n-api.js'

// 创建课程
const result = await courseAPI.createCourse(courseData)

// 获取课程列表
const courses = await courseAPI.getAllCourses({ page: 1, limit: 12 })

// 获取推荐课程
const recommendations = await courseAPI.getRecommendedCourses(userId)
```

## 测试

### 使用测试页面
访问 `/course-workflow-test` 页面进行完整的功能测试：

1. **创建课程测试**: 测试课程创建工作流
2. **统计信息测试**: 测试数据统计功能
3. **课程列表测试**: 测试列表查询功能
4. **推荐系统测试**: 测试智能推荐算法
5. **课程详情测试**: 测试详情查询功能
6. **连接状态检查**: 验证 n8n 和 Supabase 连接

### 手动测试
您也可以直接使用 HTTP 客户端（如 Postman）测试各个端点。

## 故障排除

### 常见问题

1. **工作流无法触发**
   - 检查 n8n 实例是否运行
   - 确认 webhook URL 配置正确
   - 查看 n8n 日志

2. **数据库连接失败**
   - 验证 Supabase 凭据配置
   - 检查数据库表是否存在
   - 确认 RLS 策略设置

3. **前端调用失败**
   - 检查 CORS 设置
   - 验证 API 端点 URL
   - 查看浏览器控制台错误

### 调试建议

1. 使用测试页面逐个测试功能
2. 查看 n8n 工作流执行日志
3. 检查 Supabase 数据库日志
4. 使用浏览器开发者工具检查网络请求

## 扩展功能

### 可以添加的功能
- 课程评论系统
- 学习进度跟踪
- 课程收藏功能
- 学习证书生成
- 课程分享功能

### 性能优化
- 添加 Redis 缓存
- 实现数据分页优化
- 添加 CDN 支持
- 数据库查询优化

## 支持

如果您在使用过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查 n8n 和 Supabase 的官方文档
3. 使用测试页面进行诊断
4. 查看相关日志文件

---

**注意**: 请确保在生产环境中设置适当的安全策略和访问控制。