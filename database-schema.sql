-- 启明星平台数据库表结构
-- 在 Supabase 中执行这些 SQL 语句来创建表

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 课程表
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER, -- 预计学习时长（分钟）
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 课程章节表
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration INTEGER, -- 章节时长（分钟）
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户学习进度表
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- 学习时长（秒）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- OKR目标表
CREATE TABLE okrs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  objective TEXT NOT NULL,
  key_results TEXT[] NOT NULL,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OKR进度更新表
CREATE TABLE okr_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  okr_id UUID REFERENCES okrs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 社区帖子表
CREATE TABLE community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论表
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 支持嵌套评论
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI导师会话表
CREATE TABLE ai_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI消息表
CREATE TABLE ai_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB, -- 存储额外的消息信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 学习统计表
CREATE TABLE learning_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_time INTEGER DEFAULT 0, -- 当日学习总时长（秒）
  courses_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX idx_okrs_user_id ON okrs(user_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX idx_ai_messages_session_id ON ai_messages(session_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要自动更新时间的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_okrs_updated_at BEFORE UPDATE ON okrs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_sessions_updated_at BEFORE UPDATE ON ai_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_stats ENABLE ROW LEVEL SECURITY;

-- 创建基本的RLS策略
-- 用户可以查看自己的数据
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- 课程可以被所有认证用户查看
CREATE POLICY "Authenticated users can view courses" ON courses FOR SELECT USING (auth.role() = 'authenticated');

-- 用户只能查看和修改自己的进度
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- 社区帖子可以被所有用户查看，但只能由作者修改
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);


-- =========================================
-- Views & Indexes for Analytics Performance
-- =========================================

-- View: user_progress_with_course (join user_progress with courses metadata)
CREATE OR REPLACE VIEW user_progress_with_course AS
SELECT
  up.id,
  up.user_id,
  up.course_id,
  up.lesson_id,
  up.progress,
  up.time_spent,
  up.completed_at,
  up.created_at,
  up.updated_at,
  c.title      AS course_title,
  c.category   AS course_category,
  c.difficulty AS course_difficulty
FROM user_progress up
LEFT JOIN courses c ON c.id = up.course_id;

-- Optional (PostgreSQL 15+): ensure view runs with invoker rights so RLS applies as caller
-- ALTER VIEW user_progress_with_course SET (security_invoker = on);

-- Indexes to speed up Analytics queries
-- Composite index for user + date range scans on learning_stats
CREATE INDEX IF NOT EXISTS idx_learning_stats_user_date ON learning_stats(user_id, date);

-- Composite index for OKR lookups by user and status
CREATE INDEX IF NOT EXISTS idx_okrs_user_status ON okrs(user_id, status);

-- Optional: composite index for user_progress combined lookups (if needed in future)
-- CREATE INDEX IF NOT EXISTS idx_user_progress_user_course ON user_progress(user_id, course_id);
