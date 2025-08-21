-- 修复 RLS 策略问题
-- 在 Supabase 中执行这些 SQL 语句

-- 1. 删除现有的有问题的策略
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 2. 创建新的、更灵活的 RLS 策略

-- 允许用户查看自己的资料
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT USING (auth.uid() = id);

-- 允许用户插入自己的资料（新用户注册时）
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- 允许用户更新自己的资料
CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE USING (auth.uid() = id);

-- 允许用户删除自己的资料
CREATE POLICY "Users can delete own profile" ON users 
FOR DELETE USING (auth.uid() = id);

-- 3. 为其他表也创建适当的策略

-- 课程表策略
DROP POLICY IF EXISTS "Authenticated users can view courses" ON courses;
CREATE POLICY "Anyone can view published courses" ON courses 
FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

-- 用户进度表策略
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

CREATE POLICY "Users can view own progress" ON user_progress 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress 
FOR UPDATE USING (auth.uid() = user_id);

-- OKR 表策略
DROP POLICY IF EXISTS "Users can view own progress" ON okrs;
CREATE POLICY "Users can view own OKRs" ON okrs 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own OKRs" ON okrs 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own OKRs" ON okrs 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own OKRs" ON okrs 
FOR DELETE USING (auth.uid() = user_id);

-- 社区帖子策略
DROP POLICY IF EXISTS "Anyone can view posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;

CREATE POLICY "Anyone can view posts" ON community_posts 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON community_posts 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own posts" ON community_posts 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON community_posts 
FOR DELETE USING (auth.uid() = user_id);

-- 评论策略
CREATE POLICY "Anyone can view comments" ON comments 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON comments 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments 
FOR DELETE USING (auth.uid() = user_id);

-- AI 会话策略
CREATE POLICY "Users can view own AI sessions" ON ai_sessions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI sessions" ON ai_sessions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI sessions" ON ai_sessions 
FOR UPDATE USING (auth.uid() = user_id);

-- AI 消息策略
CREATE POLICY "Users can view own AI messages" ON ai_messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ai_sessions 
    WHERE ai_sessions.id = ai_messages.session_id 
    AND ai_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own AI messages" ON ai_messages 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_sessions 
    WHERE ai_sessions.id = ai_messages.session_id 
    AND ai_sessions.user_id = auth.uid()
  )
);

-- 4. 验证策略是否创建成功
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 5. 测试策略是否工作
-- 注意：这些测试需要在认证用户上下文中执行

-- 测试用户资料创建
-- INSERT INTO users (id, email, name, role) VALUES (auth.uid(), 'test@example.com', 'Test User', 'student');

-- 测试用户资料查询
-- SELECT * FROM users WHERE id = auth.uid();
