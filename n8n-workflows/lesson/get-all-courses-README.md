# 查询全部课程工作流

## 概述

这个工作流专门用于获取系统中的所有课程数据，提供灵活的过滤、排序和数据格式选项。它参考了个性化推荐工作流的架构设计，但专注于全量课程数据的查询和处理。

## 工作流特性

### 🎯 核心功能
- **全量查询**: 获取系统中所有课程，不进行分页
- **数据增强**: 自动关联评分、注册数、章节数等统计信息
- **灵活过滤**: 支持按类别、难度、状态等条件过滤
- **多种格式**: 支持 minimal、simple、detailed 三种数据格式
- **智能排序**: 支持多种排序方式和排序方向
- **统计信息**: 可选择性包含详细的统计分析数据

### 📋 工作流结构
```
Webhook触发器 → 参数提取 → 参数验证 → 并行数据查询 → 数据处理 → 响应返回
                                    ├─ 获取所有课程
                                    ├─ 获取课程评分  
                                    ├─ 获取注册统计
                                    └─ 获取课程章节
```

## API 接口

### 请求信息
- **URL**: `/webhook/all-courses`
- **方法**: GET
- **响应格式**: JSON

### 请求参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `category` | string | - | 课程类别过滤 |
| `difficulty` | string | - | 难度级别过滤 |
| `status` | string | 'active' | 课程状态 (active/inactive/draft/archived) |
| `includeStats` | boolean | true | 是否包含统计信息 |
| `format` | string | 'detailed' | 数据格式 (minimal/simple/detailed) |
| `sortBy` | string | 'created_at' | 排序字段 |
| `sortOrder` | string | 'desc' | 排序方向 (asc/desc) |

### 排序字段选项
- `title`: 按课程标题排序
- `rating`: 按平均评分排序
- `enrollment`: 按注册人数排序
- `duration`: 按课程时长排序
- `price`: 按价格排序
- `difficulty`: 按难度级别排序
- `created_at`: 按创建时间排序 (默认)
- `updated_at`: 按更新时间排序

### 数据格式说明

#### Minimal 格式
仅包含基本信息：
```json
{
  "id": "course-id",
  "title": "课程标题",
  "category": "类别",
  "difficulty": "难度",
  "status": "状态"
}
```

#### Simple 格式
包含常用信息：
```json
{
  "id": "course-id",
  "title": "课程标题",
  "description": "课程描述",
  "instructor": "讲师",
  "duration": 3600,
  "thumbnail": "缩略图URL",
  "price": 99.99,
  "avgRating": 4.5,
  "enrollmentCount": 150,
  "lessonCount": 12,
  "category": "类别",
  "difficulty": "难度",
  "status": "状态"
}
```

#### Detailed 格式 (默认)
包含完整信息和元数据：
```json
{
  // ... simple格式的所有字段
  "ratingCount": 45,
  "tags": ["标签1", "标签2"],
  "prerequisites": ["前置要求"],
  "learningObjectives": ["学习目标"],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T00:00:00.000Z",
  "publishedAt": "2025-01-10T00:00:00.000Z",
  "metadata": {
    "totalRatings": 45,
    "ratingDistribution": {
      "5": 20,
      "4": 15,
      "3": 8,
      "2": 2,
      "1": 0
    },
    "estimatedCompletionTime": 300
  }
}
```

## 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    "courses": [...],
    "totalCount": 150,
    "filters": {
      "applied": {
        "category": "programming",
        "difficulty": "intermediate",
        "status": "active",
        "format": "detailed",
        "sortBy": "rating",
        "sortOrder": "desc"
      },
      "available": {
        "categories": ["programming", "design", "business"],
        "difficulties": ["beginner", "intermediate", "advanced"],
        "statuses": ["active", "inactive", "draft"]
      }
    },
    "stats": {
      "totalCourses": 200,
      "activeCourses": 150,
      "filteredCourses": 45,
      "overallAvgRating": 4.2,
      "totalEnrollments": 5000,
      "totalRatings": 1200,
      "avgEnrollmentsPerCourse": 25,
      "categoryDistribution": {
        "programming": 80,
        "design": 45,
        "business": 25
      },
      "difficultyDistribution": {
        "beginner": 60,
        "intermediate": 70,
        "advanced": 20
      },
      "statusDistribution": {
        "active": 150,
        "inactive": 30,
        "draft": 20
      }
    }
  },
  "timestamp": "2025-08-31T09:00:00.000Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误描述",
  "timestamp": "2025-08-31T09:00:00.000Z",
  "details": {
    "errorType": "ValidationError",
    "errorMessage": "参数验证失败"
  }
}
```

## 使用示例

### 基本查询
```javascript
// 获取所有活跃课程
const response = await courseAPI.getAllCourses();

// 获取编程类别的课程
const programmingCourses = await courseAPI.getAllCourses({
  category: 'programming'
});

// 获取简化格式的课程列表
const simpleCourses = await courseAPI.getAllCourses({
  format: 'simple',
  includeStats: false
});
```

### 高级查询
```javascript
// 获取中级难度的编程课程，按评分排序
const courses = await courseAPI.getAllCourses({
  category: 'programming',
  difficulty: 'intermediate',
  sortBy: 'rating',
  sortOrder: 'desc',
  format: 'detailed'
});

// 获取所有状态的课程（包括草稿）
const allCourses = await courseAPI.getAllCourses({
  status: 'all',
  includeStats: true
});
```

## 性能优化

1. **并行查询**: 同时查询课程、评分、注册和章节数据
2. **数据缓存**: 建议在前端实现适当的缓存策略
3. **格式选择**: 根据需要选择合适的数据格式以减少传输量
4. **统计开关**: 不需要统计信息时可设置 `includeStats=false`

## 与其他工作流的关系

- **课程列表工作流** (`get-course-list.json`): 提供分页查询功能
- **个性化推荐工作流** (`personalized-recommendations.json`): 基于用户画像的智能推荐
- **课程详情工作流** (`get-course-details.json`): 获取单个课程的详细信息

## 部署说明

1. 将工作流导入到 n8n 实例
2. 配置 Supabase 凭据
3. 确保数据库表结构正确
4. 测试 webhook 端点
5. 更新前端 API 调用

## 注意事项

- 该工作流会返回所有匹配的课程，对于大量数据可能影响性能
- 建议在生产环境中监控响应时间和数据量
- 可以根据实际需求调整数据格式和统计信息的计算逻辑