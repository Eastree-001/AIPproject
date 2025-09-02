# 学习社区 API 文档

## 概述
学习社区功能包括发布动态、查询讨论贴、热门话题、学习小组管理等功能。

## API 端点

### 1. 发布动态
**POST** `/community/posts`

**请求体：**
```json
{
  "author_id": "用户ID",
  "content": "动态内容",
  "images": ["图片URL1", "图片URL2"], // 可选
  "type": "text", // 可选: text, image, video, link
  "visibility": "public" // 可选: public, friends, private
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "动态ID",
    "content": "动态内容",
    "images": ["图片URL"],
    "type": "text",
    "like_count": 0,
    "comment_count": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "author": {
      "id": "用户ID",
      "username": "用户名",
      "avatar_url": "头像URL",
      "full_name": "全名"
    }
  }
}
```

### 2. 查询全部讨论贴
**GET** `/community/discussions`

**查询参数：**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `group_id`: 小组ID (可选)
- `sort_by`: 排序字段 (created_at, hot, like_count)
- `order`: 排序方向 (asc, desc)
- `search`: 搜索关键词 (可选)

**响应：**
```json
{
  "success": true,
  "data": {
    "discussions": [
      {
        "id": "讨论ID",
        "title": "讨论标题",
        "content": "讨论内容",
        "tags": ["标签1", "标签2"],
        "view_count": 100,
        "like_count": 10,
        "reply_count": 5,
        "is_pinned": false,
        "is_hot": true,
        "created_at": "2024-01-01T00:00:00Z",
        "author": {
          "id": "用户ID",
          "username": "用户名",
          "avatar_url": "头像URL",
          "full_name": "全名"
        },
        "group": {
          "id": "小组ID",
          "name": "小组名称",
          "avatar_url": "小组头像"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 3. 查询热门话题
**GET** `/community/trending-topics`

**查询参数：**
- `limit`: 返回数量 (默认: 10)
- `time_range`: 时间范围 (1d, 7d, 30d, all)

**响应：**
```json
{
  "success": true,
  "data": {
    "topics": [
      {
        "id": "话题ID",
        "name": "话题名称",
        "description": "话题描述",
        "post_count": 50,
        "discussion_count": 30,
        "heat_score": 85.5,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-02T00:00:00Z"
      }
    ],
    "total": 10
  }
}
```

### 4. 查询全部学习小组
**GET** `/community/study-groups`

**查询参数：**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `search`: 搜索关键词 (可选)
- `sort_by`: 排序字段 (created_at, member_count, name)
- `order`: 排序方向 (asc, desc)
- `user_id`: 用户ID (用于检查是否已加入)

**响应：**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "小组ID",
        "name": "小组名称",
        "description": "小组描述",
        "avatar_url": "小组头像",
        "member_count": 25,
        "max_members": 100,
        "tags": ["标签1", "标签2"],
        "is_full": false,
        "is_joined": false,
        "created_at": "2024-01-01T00:00:00Z",
        "creator": {
          "id": "创建者ID",
          "username": "创建者用户名",
          "avatar_url": "创建者头像",
          "full_name": "创建者全名"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 5. 加入学习小组
**POST** `/community/study-groups/join`

**请求体：**
```json
{
  "group_id": "小组ID",
  "user_id": "用户ID"
}
```

**响应：**
```json
{
  "success": true,
  "message": "成功加入学习小组",
  "data": {
    "group": {
      "id": "小组ID",
      "name": "小组名称",
      "description": "小组描述",
      "avatar_url": "小组头像",
      "member_count": 26,
      "max_members": 100,
      "tags": ["标签1", "标签2"],
      "created_at": "2024-01-01T00:00:00Z",
      "creator": {
        "id": "创建者ID",
        "username": "创建者用户名",
        "avatar_url": "创建者头像",
        "full_name": "创建者全名"
      }
    }
  }
}
```

## 错误响应
所有API在出错时都会返回以下格式：
```json
{
  "success": false,
  "error": "错误信息"
}
```

常见错误码：
- 400: 请求参数无效
- 404: 资源不存在
- 409: 冲突（如已加入小组、小组已满等）
- 500: 服务器内部错误

## 数据库表结构说明

### 主要表：
1. **study_groups**: 学习小组信息
2. **study_group_members**: 小组成员关系
3. **discussions**: 讨论贴
4. **discussion_replies**: 讨论回复
5. **community_posts**: 社区动态
6. **post_comments**: 动态评论
7. **trending_topics**: 热门话题
8. **topic_relations**: 话题关联
9. **likes**: 点赞记录

### 特性：
- 支持嵌套回复和评论
- 自动计算热度分数
- 触发器自动更新计数
- 支持话题标签提取
- 完整的权限控制 