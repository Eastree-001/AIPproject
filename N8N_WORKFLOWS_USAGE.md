# 🚀 N8N工作流使用指南

## 📋 概述

本文档介绍如何使用新创建的N8N工作流来增强启明星学习平台的功能。我们创建了3个核心工作流：

1. **学习进度跟踪工作流** - 自动记录和分析学习进度
2. **智能学习分析工作流** - AI驱动的学习洞察和建议
3. **OKR自动更新工作流** - 基于学习活动自动更新目标进度

## 🛠️ 安装和配置

### 1. 导入工作流

将以下JSON文件导入到你的N8N实例：

```
n8n-workflows/ai-tutor/
├── learning-progress-tracker.json     # 学习进度跟踪
├── smart-learning-analytics.json      # 智能学习分析  
└── okr-progress-updater.json          # OKR自动更新
```

### 2. 配置环境变量

在N8N中设置以下环境变量：

```bash
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. 前端配置

确保前端环境变量正确配置：

```bash
# .env 文件
VITE_N8N_BASE_URL=https://n8n-yethnxqt.ap-northeast-1.clawcloudrun.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📡 API端点

### 1. 学习进度跟踪

**端点**: `POST /webhook/api/learning/progress`

**请求体**:
```json
{
  "userId": "user-123",
  "courseId": "course-001", 
  "lessonId": "lesson-001",
  "progress": 75,
  "timeSpent": 1800,
  "actionType": "update"
}
```

**响应**:
```json
{
  "success": true,
  "message": "学习进度更新成功",
  "data": {
    "userId": "user-123",
    "courseCompletionRate": 60,
    "isLessonCompleted": false,
    "isCourseCompleted": false,
    "totalLessons": 10,
    "completedLessons": 6
  }
}
```

### 2. 智能学习分析

**端点**: `POST /webhook/api/ai/learning-analytics`

**请求体**:
```json
{
  "userId": "user-123",
  "analysisType": "comprehensive",
  "timeRange": 7
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalStudyTime": 7200,
      "totalLessonsCompleted": 15,
      "avgDailyStudyTime": 1028,
      "activeCourses": 3
    },
    "aiInsights": "基于您的学习数据分析...",
    "suggestions": [
      {
        "type": "time_management",
        "priority": "high", 
        "message": "建议增加每日学习时间"
      }
    ],
    "courseProgress": [...],
    "okrProgress": [...]
  }
}
```

### 3. OKR自动更新

**端点**: `POST /webhook/api/okr/auto-update`

**请求体**:
```json
{
  "userId": "user-123",
  "triggerType": "learning_activity",
  "activityData": {
    "courseId": "course-001",
    "lessonId": "lesson-001"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "totalOKRs": 3,
    "updatedCount": 1,
    "updatedOKRs": [
      {
        "id": "okr-001",
        "title": "完成前端开发课程",
        "oldProgress": 60,
        "newProgress": 75,
        "updateReason": "基于学习活动自动更新"
      }
    ]
  }
}
```

## 🎯 前端集成

### 1. 使用学习进度跟踪组件

```vue
<template>
  <LearningProgressTracker 
    :userId="currentUserId"
    @progress-updated="handleProgressUpdated"
  />
</template>

<script setup>
import LearningProgressTracker from '@/components/LearningProgressTracker.vue'

const handleProgressUpdated = (progressData) => {
  console.log('进度更新:', progressData)
  // 处理进度更新逻辑
}
</script>
```

### 2. 使用智能学习分析组件

```vue
<template>
  <SmartLearningAnalytics 
    :userId="currentUserId"
    ref="analyticsRef"
  />
</template>

<script setup>
import SmartLearningAnalytics from '@/components/SmartLearningAnalytics.vue'

const analyticsRef = ref()

// 手动触发分析
const generateAnalysis = () => {
  analyticsRef.value.generateAnalysis()
}
</script>
```

### 3. 直接调用API

```javascript
import { learningAPI, okrAPI } from '@/services/n8n-api'

// 记录学习进度
const recordProgress = async () => {
  try {
    const result = await learningAPI.recordProgress({
      userId: 'user-123',
      courseId: 'course-001',
      lessonId: 'lesson-001', 
      progress: 100,
      timeSpent: 3600
    })
    
    if (result.success) {
      // 自动触发OKR更新
      await okrAPI.autoUpdateProgress('user-123', 'learning_activity')
    }
  } catch (error) {
    console.error('记录失败:', error)
  }
}

// 获取智能分析
const getAnalysis = async () => {
  try {
    const result = await learningAPI.getSmartAnalytics('user-123', 'comprehensive', 7)
    console.log('分析结果:', result.data)
  } catch (error) {
    console.error('分析失败:', error)
  }
}
```

## 🧪 测试

### 访问测试页面

1. 启动前端应用: `npm run dev`
2. 访问测试页面: `http://localhost:3000/n8n-test`
3. 在测试页面中可以：
   - 测试学习进度跟踪工作流
   - 测试智能学习分析工作流
   - 测试OKR自动更新工作流

### 测试步骤

1. **学习进度跟踪测试**:
   - 填写用户ID、课程ID、章节ID
   - 设置学习进度和时长
   - 点击"测试进度跟踪"
   - 查看返回的结果

2. **智能分析测试**:
   - 填写用户ID
   - 选择分析类型和时间范围
   - 点击"测试智能分析"
   - 查看AI生成的分析报告

3. **OKR更新测试**:
   - 填写用户ID
   - 选择触发类型
   - 点击"测试OKR更新"
   - 查看OKR更新结果

## 🔧 故障排除

### 常见问题

1. **工作流无响应**
   - 检查N8N服务是否运行
   - 确认webhook URL正确
   - 查看N8N执行日志

2. **数据库连接失败**
   - 验证Supabase URL和密钥
   - 检查数据库表是否存在
   - 确认RLS策略配置

3. **AI分析失败**
   - 检查Dify API密钥
   - 确认AI服务可用性
   - 查看API调用限制

### 调试技巧

1. **查看N8N执行日志**:
   - 在N8N界面中查看工作流执行历史
   - 检查每个节点的输入输出数据

2. **前端调试**:
   - 打开浏览器开发者工具
   - 查看Network标签页的API请求
   - 检查Console中的错误信息

3. **数据库调试**:
   - 在Supabase控制台中查看表数据
   - 使用SQL编辑器测试查询
   - 检查RLS策略是否正确

## 📈 性能优化

### 建议

1. **缓存策略**:
   - 对分析结果进行缓存
   - 避免频繁的数据库查询

2. **批量处理**:
   - 批量更新学习进度
   - 定时触发OKR更新

3. **异步处理**:
   - 使用队列处理耗时操作
   - 异步生成分析报告

## 🔮 未来扩展

### 计划功能

1. **学习提醒系统**
2. **社区内容审核**
3. **个性化推荐引擎**
4. **学习效果预测**

---

**启明星平台** - 让AI成为你的学习伙伴 🌟
