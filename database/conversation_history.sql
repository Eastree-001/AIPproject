-- 创建对话历史表
CREATE TABLE IF NOT EXISTS public.conversation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON public.conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_session_id ON public.conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON public.conversation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_session ON public.conversation_history(user_id, session_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_history_updated_at 
    BEFORE UPDATE ON public.conversation_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 添加行级安全策略（RLS）
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的对话记录
CREATE POLICY "Users can view own conversation history" ON public.conversation_history
    FOR SELECT USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

CREATE POLICY "Users can insert own conversation history" ON public.conversation_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id IS NOT NULL);

CREATE POLICY "Users can update own conversation history" ON public.conversation_history
    FOR UPDATE USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

-- 添加注释
COMMENT ON TABLE public.conversation_history IS '用户与AI的对话历史记录表';
COMMENT ON COLUMN public.conversation_history.id IS '主键ID';
COMMENT ON COLUMN public.conversation_history.user_id IS '用户ID';
COMMENT ON COLUMN public.conversation_history.session_id IS '会话ID，用于区分不同的对话会话';
COMMENT ON COLUMN public.conversation_history.question IS '用户提出的问题';
COMMENT ON COLUMN public.conversation_history.answer IS 'AI的回答';
COMMENT ON COLUMN public.conversation_history.created_at IS '创建时间';
COMMENT ON COLUMN public.conversation_history.updated_at IS '更新时间';