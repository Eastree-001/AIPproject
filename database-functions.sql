-- =====================================================
-- 启明星平台数据库函数集合
-- 创建日期: 2025-01-02
-- 描述: 包含课程管理、用户管理等核心功能的数据库函数
-- =====================================================

-- 1. 用户管理相关函数
-- =====================================================

-- 创建或更新用户档案函数
CREATE OR REPLACE FUNCTION upsert_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_avatar TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'student'
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  avatar TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 插入或更新用户记录
  RETURN QUERY
  INSERT INTO users (id, email, name, avatar, role, created_at, updated_at)
  VALUES (
    p_user_id, 
    p_email, 
    COALESCE(p_name, split_part(p_email, '@', 1)), 
    p_avatar, 
    p_role, 
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    avatar = COALESCE(EXCLUDED.avatar, users.avatar),
    role = COALESCE(EXCLUDED.role, users.role),
    updated_at = NOW()
  RETURNING users.id, users.email, users.name, users.avatar, users.role, users.created_at, users.updated_at;
END;
$$;

-- 获取用户统计信息函数
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_courses', COALESCE(COUNT(DISTINCT cp.course_id), 0),
    'completed_courses', COALESCE(COUNT(DISTINCT CASE WHEN cp.progress >= 100 THEN cp.course_id END), 0),
    'total_study_time', COALESCE(SUM(cp.study_time), 0),
    'avg_progress', COALESCE(AVG(cp.progress), 0)
  ) INTO result
  FROM course_progress cp
  WHERE cp.user_id = p_user_id;
  
  RETURN result;
END;
$$;

-- 2. 课程管理相关函数
-- =====================================================

-- 创建课程函数
CREATE OR REPLACE FUNCTION create_course(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT DEFAULT 'general',
  p_difficulty TEXT DEFAULT 'beginner',
  p_creator_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  creator_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO courses (title, description, category, difficulty, creator_id, created_at, updated_at)
  VALUES (p_title, p_description, p_category, p_difficulty, p_creator_id, NOW(), NOW())
  RETURNING courses.id, courses.title, courses.description, courses.category, courses.difficulty, courses.creator_id, courses.created_at;
END;
$$;

-- 更新课程进度函数
CREATE OR REPLACE FUNCTION update_course_progress(
  p_user_id UUID,
  p_course_id UUID,
  p_progress INTEGER DEFAULT 0,
  p_study_time INTEGER DEFAULT 0
)
RETURNS TABLE(
  user_id UUID,
  course_id UUID,
  progress INTEGER,
  study_time INTEGER,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 插入或更新课程进度
  RETURN QUERY
  INSERT INTO course_progress (user_id, course_id, progress, study_time, created_at, updated_at)
  VALUES (p_user_id, p_course_id, p_progress, p_study_time, NOW(), NOW())
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    progress = GREATEST(course_progress.progress, EXCLUDED.progress),
    study_time = course_progress.study_time + EXCLUDED.study_time,
    updated_at = NOW()
  RETURNING course_progress.user_id, course_progress.course_id, course_progress.progress, course_progress.study_time, course_progress.updated_at;
END;
$$;

-- 获取用户课程列表函数
CREATE OR REPLACE FUNCTION get_user_courses(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  course_id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  progress INTEGER,
  study_time INTEGER,
  last_accessed TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as course_id,
    c.title,
    c.description,
    c.category,
    c.difficulty,
    COALESCE(cp.progress, 0) as progress,
    COALESCE(cp.study_time, 0) as study_time,
    cp.updated_at as last_accessed
  FROM courses c
  LEFT JOIN course_progress cp ON c.id = cp.course_id AND cp.user_id = p_user_id
  ORDER BY cp.updated_at DESC NULLS LAST, c.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 3. 学习记录相关函数
-- =====================================================

-- 记录学习活动函数
CREATE OR REPLACE FUNCTION log_learning_activity(
  p_user_id UUID,
  p_course_id UUID DEFAULT NULL,
  p_activity_type TEXT DEFAULT 'study',
  p_duration INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO learning_activities (user_id, course_id, activity_type, duration, metadata, created_at)
  VALUES (p_user_id, p_course_id, p_activity_type, p_duration, p_metadata, NOW())
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- 获取学习统计函数
CREATE OR REPLACE FUNCTION get_learning_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_activities', COUNT(*),
    'total_duration', COALESCE(SUM(duration), 0),
    'avg_daily_duration', COALESCE(SUM(duration) / GREATEST(p_days, 1), 0),
    'activity_types', json_agg(DISTINCT activity_type),
    'most_active_day', (
      SELECT DATE(created_at)
      FROM learning_activities
      WHERE user_id = p_user_id 
        AND created_at >= NOW() - INTERVAL '%s days'
      GROUP BY DATE(created_at)
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  ) INTO result
  FROM learning_activities
  WHERE user_id = p_user_id 
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  RETURN result;
END;
$$;

-- 4. 权限管理
-- =====================================================

-- 授予执行权限给认证用户
GRANT EXECUTE ON FUNCTION upsert_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_course(TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_course_progress(UUID, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_courses(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_learning_activity(UUID, UUID, TEXT, INTEGER, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_learning_stats(UUID, INTEGER) TO authenticated;

-- 授予执行权限给匿名用户（仅限只读函数）
GRANT EXECUTE ON FUNCTION get_user_courses(UUID, INTEGER, INTEGER) TO anon;

-- =====================================================
-- 函数说明文档
-- =====================================================

COMMENT ON FUNCTION upsert_user_profile IS '创建或更新用户档案信息';
COMMENT ON FUNCTION get_user_stats IS '获取用户学习统计数据';
COMMENT ON FUNCTION create_course IS '创建新课程';
COMMENT ON FUNCTION update_course_progress IS '更新用户课程学习进度';
COMMENT ON FUNCTION get_user_courses IS '获取用户的课程列表及进度';
COMMENT ON FUNCTION log_learning_activity IS '记录用户学习活动';
COMMENT ON FUNCTION get_learning_stats IS '获取用户学习统计信息';