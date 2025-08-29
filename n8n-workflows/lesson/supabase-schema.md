# Supabase 数据库表结构设计

## 概述
本文档描述了课程学习系统所需的Supabase数据库表结构。请按照以下步骤在您的Supabase项目中创建这些表。

## 1. 课程表 (courses)

```sql
-- 创建课程表
CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255) NOT NULL,
    instructor_bio TEXT,
    duration INTEGER DEFAULT 0, -- 课程总时长（分钟）
    difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5), -- 难度等级 1-5
    category VARCHAR(100),
    thumbnail TEXT, -- 缩略图URL
    price DECIMAL(10,2) DEFAULT 0.00,
    tags TEXT[], -- 标签数组
    requirements TEXT[], -- 先修要求数组
    learning_objectives TEXT[], -- 学习目标数组
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_created_at ON courses(created_at);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 2. 课程章节表 (course_lessons)

```sql
-- 创建课程章节表
CREATE TABLE course_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER DEFAULT 0, -- 章节时长（分钟）
    order_index INTEGER NOT NULL, -- 章节顺序
    type VARCHAR(50) DEFAULT 'video' CHECK (type IN ('video', 'text', 'quiz', 'assignment')),
    is_preview BOOLEAN DEFAULT FALSE, -- 是否为预览章节
    video_url TEXT,
    content TEXT, -- 文本内容或其他内容
    resources JSONB DEFAULT '[]', -- 资源文件列表
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- 创建索引
CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_course_lessons_order ON course_lessons(course_id, order_index);

-- 创建更新时间触发器
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. 用户进度表 (user_progress)

```sql
-- 创建用户进度表
CREATE TABLE user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- 用户ID（来自认证系统）
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100), -- 进度百分比
    completed_lessons UUID[] DEFAULT '{}', -- 已完成章节ID数组
    time_spent INTEGER DEFAULT 0, -- 学习时长（分钟）
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 创建索引
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX idx_user_progress_progress ON user_progress(progress);

-- 创建更新时间触发器
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. 课程评分表 (course_ratings)

```sql
-- 创建课程评分表
CREATE TABLE course_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- 用户ID
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 评分 1-5
    comment TEXT, -- 评论内容
    user_name VARCHAR(255), -- 用户名（可选，用于显示）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 创建索引
CREATE INDEX idx_course_ratings_course_id ON course_ratings(course_id);
CREATE INDEX idx_course_ratings_rating ON course_ratings(rating);
CREATE INDEX idx_course_ratings_created_at ON course_ratings(created_at);

-- 创建更新时间触发器
CREATE TRIGGER update_course_ratings_updated_at BEFORE UPDATE ON course_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 5. 插入示例数据

```sql
-- 插入示例课程数据
INSERT INTO courses (title, description, instructor, instructor_bio, duration, difficulty, category, price, tags, requirements, learning_objectives) VALUES
('Vue.js 3 完整教程', '从零开始学习Vue.js 3，包括Composition API、响应式系统等核心概念', '张老师', '资深前端开发工程师，5年Vue.js开发经验', 480, 2, '前端开发', 199.00, 
 ARRAY['Vue.js', 'JavaScript', '前端框架'], 
 ARRAY['HTML基础', 'CSS基础', 'JavaScript基础'], 
 ARRAY['掌握Vue.js 3核心概念', '能够独立开发Vue.js应用', '理解响应式编程思想']),

('Python数据分析入门', '使用Python进行数据分析，包括pandas、numpy、matplotlib等库的使用', '李老师', '数据科学家，专注于Python数据分析领域', 360, 1, '数据科学', 299.00,
 ARRAY['Python', '数据分析', 'pandas', 'numpy'],
 ARRAY['Python基础语法'],
 ARRAY['掌握Python数据分析基础', '能够使用pandas处理数据', '学会数据可视化']),

('React Native移动开发', '使用React Native开发跨平台移动应用', '王老师', 'React Native专家，开发过多款移动应用', 600, 3, '移动开发', 399.00,
 ARRAY['React Native', 'JavaScript', '移动开发'],
 ARRAY['React基础', 'JavaScript ES6+'],
 ARRAY['掌握React Native开发', '能够发布移动应用', '理解跨平台开发原理']);

-- 插入示例章节数据
INSERT INTO course_lessons (course_id, title, description, duration, order_index, type, is_preview) 
SELECT 
    c.id,
    '第' || s.chapter_num || '章：' || 
    CASE s.chapter_num
        WHEN 1 THEN '环境搭建'
        WHEN 2 THEN '基础语法'
        WHEN 3 THEN '核心概念'
        WHEN 4 THEN '实战练习'
        WHEN 5 THEN '高级特性'
        WHEN 6 THEN '项目实战'
        WHEN 7 THEN '性能优化'
        WHEN 8 THEN '部署上线'
    END,
    '详细讲解相关内容',
    60,
    s.chapter_num,
    'video',
    s.chapter_num <= 2 -- 前两章设为预览
FROM courses c
CROSS JOIN generate_series(1, 8) AS s(chapter_num);

-- 插入示例用户进度数据（假设用户ID）
INSERT INTO user_progress (user_id, course_id, progress, time_spent) 
SELECT 
    gen_random_uuid(),
    c.id,
    RANDOM() * 100,
    (RANDOM() * 300)::INTEGER
FROM courses c
CROSS JOIN generate_series(1, 5) AS s(user_num); -- 为每门课程生成5个用户的进度

-- 插入示例评分数据
INSERT INTO course_ratings (user_id, course_id, rating, comment, user_name)
SELECT 
    gen_random_uuid(),
    c.id,
    (RANDOM() * 4 + 1)::INTEGER, -- 1-5分
    CASE (RANDOM() * 3)::INTEGER
        WHEN 0 THEN '课程内容很棒，老师讲解清晰！'
        WHEN 1 THEN '学到了很多实用的知识，推荐！'
        WHEN 2 THEN '课程质量不错，值得学习。'
        ELSE '很好的课程，内容丰富。'
    END,
    '学员' || (RANDOM() * 1000)::INTEGER
FROM courses c
CROSS JOIN generate_series(1, 10) AS s(rating_num); -- 为每门课程生成10个评分
```

## 6. 行级安全策略 (RLS)

```sql
-- 启用行级安全
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_ratings ENABLE ROW LEVEL SECURITY;

-- 课程表策略（所有人可读，只有管理员可写）
CREATE POLICY "课程对所有人可见" ON courses FOR SELECT USING (true);
CREATE POLICY "只有管理员可以修改课程" ON courses FOR ALL USING (auth.role() = 'admin');

-- 章节表策略
CREATE POLICY "章节对所有人可见" ON course_lessons FOR SELECT USING (true);
CREATE POLICY "只有管理员可以修改章节" ON course_lessons FOR ALL USING (auth.role() = 'admin');

-- 用户进度表策略（用户只能看到和修改自己的进度）
CREATE POLICY "用户只能查看自己的进度" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能修改自己的进度" ON user_progress FOR ALL USING (auth.uid() = user_id);

-- 评分表策略（所有人可读，用户只能修改自己的评分）
CREATE POLICY "评分对所有人可见" ON course_ratings FOR SELECT USING (true);
CREATE POLICY "用户只能修改自己的评分" ON course_ratings FOR ALL USING (auth.uid() = user_id);
```

## 7. 在n8n中配置Supabase连接

1. 在n8n中添加Supabase凭据：
   - 凭据名称：`supabase-credentials`
   - Supabase URL：您的Supabase项目URL
   - Supabase Key：您的Supabase anon key 或 service_role key

2. 确保您的Supabase项目已启用必要的API访问权限

## 8. 工作流API端点

创建完表结构后，您的n8n工作流将提供以下API端点：

- `POST /api/courses` - 创建课程
- `GET /api/courses/stats/{userId}` - 获取课程统计信息
- `GET /api/courses/recommend/{userId}` - 获取课程推荐
- `GET /api/courses` - 获取课程列表（支持分页、搜索、过滤）
- `GET /api/courses/{courseId}` - 获取课程详情

## 注意事项

1. 请根据您的实际需求调整表结构和字段类型
2. 确保在生产环境中设置适当的行级安全策略
3. 定期备份数据库
4. 监控数据库性能，必要时添加更多索引
5. 考虑实现数据缓存以提高性能

## 测试连接

创建表结构后，您可以通过n8n工作流测试数据库连接是否正常工作。建议先运行课程列表工作流来验证基本的数据库连接功能。