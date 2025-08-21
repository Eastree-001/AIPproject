# Supabase 设置指南

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账户
2. 点击 "New Project" 创建新项目
3. 选择组织并输入项目名称（如：morning-star-platform）
4. 设置数据库密码（请记住这个密码）
5. 选择地区（建议选择离用户最近的地区）
6. 等待项目创建完成（约 1-2 分钟）

### 2. 获取项目配置

项目创建完成后，在项目仪表板中：

1. 进入 **Settings** → **API**
2. 复制以下信息：
   - **Project URL** (例如：`https://your-project.supabase.co`)
   - **anon public** key (以 `eyJ...` 开头的长字符串)

### 3. 配置环境变量

1. 在项目根目录创建 `.env` 文件：
```bash
cp env.example .env
```

2. 编辑 `.env` 文件，填入您的 Supabase 配置：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_TITLE=启明星平台
VITE_APP_VERSION=1.0.0
```

### 4. 创建数据库表

1. 在 Supabase 项目仪表板中，进入 **SQL Editor**
2. 复制 `database-schema.sql` 文件中的所有内容
3. 粘贴到 SQL 编辑器中并点击 "Run" 执行

这将创建所有必要的表、索引、触发器和安全策略。

### 5. 配置身份验证

1. 在 Supabase 仪表板中，进入 **Authentication** → **Settings**
2. 配置以下设置：
   - **Site URL**: 您的应用域名（开发时可以是 `http://localhost:3000`）
   - **Redirect URLs**: 添加 `http://localhost:3000/auth/callback`
   - **Enable email confirmations**: 根据需要开启或关闭

### 6. 配置存储（可选）

如果需要文件上传功能：

1. 进入 **Storage** → **Policies**
2. 创建新的存储桶（如：`avatars`, `course-materials`）
3. 设置适当的访问策略

## 🔧 高级配置

### 自定义 RLS 策略

您可以根据需要修改 `database-schema.sql` 中的 RLS 策略：

```sql
-- 示例：允许教师查看所有学生进度
CREATE POLICY "Teachers can view all progress" ON user_progress 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'teacher'
  )
);
```

### 启用实时功能

Supabase 的实时功能默认启用，您可以在代码中使用：

```javascript
import { realtimeService } from '@/services/database'

// 订阅用户进度更新
const subscription = realtimeService.subscribeToProgress(userId, (payload) => {
  console.log('进度更新:', payload)
})

// 取消订阅
realtimeService.unsubscribe(subscription)
```

### 配置 Webhooks（可选）

如果需要与其他服务集成：

1. 进入 **Database** → **Hooks**
2. 创建新的 webhook
3. 选择触发事件（如：INSERT, UPDATE, DELETE）
4. 设置目标 URL 和认证信息

## 🧪 测试配置

### 1. 测试连接

在浏览器控制台中测试：

```javascript
import { supabase } from '@/lib/supabase'

// 测试连接
const { data, error } = await supabase.from('users').select('count')
console.log('连接测试:', data, error)
```

### 2. 测试身份验证

```javascript
// 测试注册
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
})
console.log('注册测试:', data, error)
```

## 🚨 常见问题

### 1. 环境变量未加载

确保：
- `.env` 文件在项目根目录
- 变量名以 `VITE_` 开头
- 重启开发服务器

### 2. RLS 策略阻止访问

检查：
- 用户是否已认证
- RLS 策略是否正确设置
- 用户是否有相应权限

### 3. 实时订阅不工作

确保：
- 表已启用 RLS
- 有适当的 SELECT 权限
- 网络连接正常

## 📚 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Vue.js 集成指南](https://supabase.com/docs/guides/getting-started/tutorials/with-vue-3)
- [RLS 策略示例](https://supabase.com/docs/guides/auth/row-level-security)
- [实时功能文档](https://supabase.com/docs/guides/realtime)

## 🔐 安全注意事项

1. **永远不要**在客户端代码中暴露 `service_role` key
2. 只使用 `anon` key 进行客户端操作
3. 始终启用 RLS 并设置适当的策略
4. 定期审查和更新安全策略
5. 监控异常访问模式

## 📞 获取帮助

如果遇到问题：

1. 查看 [Supabase 社区论坛](https://github.com/supabase/supabase/discussions)
2. 检查 [GitHub Issues](https://github.com/supabase/supabase/issues)
3. 加入 [Discord 社区](https://discord.supabase.com)
4. 查看项目日志和错误信息
