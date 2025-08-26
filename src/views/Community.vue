<template>
  <div class="community-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">
            <el-icon class="title-icon"><UserFilled /></el-icon>
            学习社区
          </h1>
          <p class="page-subtitle">与志同道合的学习者交流，分享经验，共同成长</p>
          <el-button type="primary" size="large" @click="showPostModal = true">
            <el-icon><Plus /></el-icon>
            发布动态
          </el-button>
        </div>

        <!-- 主要内容 -->
        <div class="main-layout">
          <!-- 左侧：社区动态 -->
          <div class="left-section">
            <!-- 动态筛选 -->
            <div class="filter-section">
              <el-tabs v-model="activeTab" @tab-click="handleTabChange">
                <el-tab-pane label="全部" name="all" />
                <el-tab-pane label="讨论" name="discussion" />
                <el-tab-pane label="问答" name="qa" />
                <el-tab-pane label="分享" name="share" />
              </el-tabs>
            </div>

            <!-- 动态列表 -->
            <div class="posts-section">
              <div v-for="post in filteredPosts" :key="post.id" class="post-card">
                <div class="post-header">
                  <div class="post-author">
                    <el-avatar :src="post.author.avatar" :size="40" />
                    <div class="author-info">
                      <div class="author-name">{{ post.author.name }}</div>
                      <div class="post-time">{{ formatTime(post.createTime) }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="post-content">
                  <div class="post-type" :class="post.type">
                    {{ getPostTypeText(post.type) }}
                  </div>
                  <h3 class="post-title">{{ post.title }}</h3>
                  <p class="post-text">{{ post.content }}</p>
                  
                  <!-- 标签 -->
                  <div v-if="post.tags && post.tags.length > 0" class="post-tags">
                    <el-tag 
                      v-for="tag in post.tags" 
                      :key="tag"
                      size="small"
                      class="tag-item"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="post-footer">
                  <div class="post-stats">
                    <div class="stat-item" @click="toggleLike(post)">
                      <el-icon :class="{ 'liked': post.isLiked }"><Star /></el-icon>
                      <span>{{ post.likes }}</span>
                    </div>
                    <div class="stat-item" @click="showComments(post)">
                      <el-icon><ChatDotRound /></el-icon>
                      <span>{{ post.comments.length }}</span>
                    </div>
                    <div class="stat-item">
                      <el-icon><Share /></el-icon>
                      <span>分享</span>
                    </div>
                  </div>
                </div>
                
                <!-- 评论区 -->
                <div v-if="post.showComments" class="comments-section">
                  <div class="comment-input">
                    <el-input
                      v-model="post.commentText"
                      placeholder="写下你的评论..."
                      size="small"
                      @keyup.enter="addComment(post)"
                    >
                      <template #append>
                        <el-button type="primary" size="small" @click="addComment(post)">
                          发送
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                  
                  <div class="comments-list">
                    <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                      <el-avatar :src="comment.author.avatar" :size="32" />
                      <div class="comment-content">
                        <div class="comment-author">{{ comment.author.name }}</div>
                        <div class="comment-text">{{ comment.content }}</div>
                        <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：侧边栏 -->
          <div class="right-section">
            <!-- 热门话题 -->
            <div class="sidebar-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><TrendCharts /></el-icon>
                  热门话题
                </h3>
              </div>
              <div class="card-content">
                <div class="topic-list">
                  <div v-for="topic in hotTopics" :key="topic.id" class="topic-item">
                    <div class="topic-rank">{{ topic.rank }}</div>
                    <div class="topic-info">
                      <div class="topic-name">#{{ topic.name }}</div>
                      <div class="topic-count">{{ topic.count }}个讨论</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 学习小组 -->
            <div class="sidebar-card">
              <div class="card-header">
                <h3 class="card-title">
                  <el-icon class="card-icon"><UserFilled /></el-icon>
                  学习小组
                </h3>
              </div>
              <div class="card-content">
                <div class="group-list">
                  <div v-for="group in studyGroups" :key="group.id" class="group-item">
                    <div class="group-avatar">
                      <el-avatar :src="group.avatar" :size="50" />
                    </div>
                    <div class="group-info">
                      <div class="group-name">{{ group.name }}</div>
                      <div class="group-desc">{{ group.description }}</div>
                      <div class="group-members">{{ group.memberCount }}人</div>
                    </div>
                    <el-button 
                      type="primary" 
                      size="small" 
                      :disabled="group.isJoined"
                      @click="joinGroup(group)"
                    >
                      {{ group.isJoined ? '已加入' : '加入' }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 发布动态模态框 -->
    <el-dialog v-model="showPostModal" title="发布动态" width="600px">
      <el-form :model="postForm" label-position="top" :rules="postRules" ref="postFormRef">
        <el-form-item label="动态类型" prop="type">
          <el-select v-model="postForm.type" placeholder="选择动态类型" style="width: 100%">
            <el-option label="讨论" value="discussion" />
            <el-option label="问答" value="qa" />
            <el-option label="分享" value="share" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="postForm.title" 
            placeholder="输入动态标题"
          />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input 
            v-model="postForm.content" 
            type="textarea"
            :rows="4"
            placeholder="分享你的想法、问题或经验..."
          />
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select
            v-model="postForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或创建标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showPostModal = false">取消</el-button>
        <el-button type="primary" @click="publishPost">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import { 
  UserFilled, 
  Plus, 
  Star, 
  ChatDotRound, 
  Share,
  TrendCharts
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('all')
const showPostModal = ref(false)
const postFormRef = ref()

// 动态表单
const postForm = reactive({
  type: 'discussion',
  title: '',
  content: '',
  tags: []
})

// 表单验证规则
const postRules = {
  type: [
    { required: true, message: '请选择动态类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 5, message: '标题长度不能少于5个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, message: '内容长度不能少于10个字符', trigger: 'blur' }
  ]
}

// 可用标签
const availableTags = ref([
  'Vue.js', 'React', 'JavaScript', 'Python', 'Java', '设计', '算法', '数据结构',
  '前端开发', '后端开发', '移动开发', '人工智能', '机器学习', '深度学习'
])

// 社区动态数据
const posts = ref([
  {
    id: 1,
    type: 'discussion',
    title: 'Vue.js 3.0 组合式API的最佳实践',
    content: '最近在学习Vue.js 3.0的组合式API，想和大家分享一下使用心得和一些最佳实践。组合式API相比选项式API有哪些优势？在实际项目中如何更好地组织代码？',
    author: {
      name: '张小明',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang'
    },
    createTime: '2024-01-27 14:30:00',
    likes: 25,
    isLiked: false,
    comments: [
      {
        id: 1,
        content: '组合式API确实更灵活，代码组织更清晰',
        author: { name: '李华', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li' },
        createTime: '2024-01-27 15:00:00'
      }
    ],
    tags: ['Vue.js', '前端开发'],
    showComments: false,
    commentText: ''
  },
  {
    id: 2,
    type: 'qa',
    title: 'React Hooks 中如何处理复杂的副作用逻辑？',
    content: '在使用React Hooks时，遇到了一些复杂的副作用逻辑处理问题。比如需要在多个useEffect之间协调，或者需要处理异步操作的状态管理。有什么好的解决方案吗？',
    author: {
      name: '王小红',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang'
    },
    createTime: '2024-01-27 13:15:00',
    likes: 18,
    isLiked: true,
    comments: [],
    tags: ['React', 'Hooks', '前端开发'],
    showComments: false,
    commentText: ''
  },
  {
    id: 3,
    type: 'share',
    title: '分享一个学习Python数据分析的心得',
    content: '经过几个月的学习，终于掌握了Python数据分析的基础技能。想和大家分享一下学习路径和遇到的坑，希望对初学者有帮助。',
    author: {
      name: '陈大力',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen'
    },
    createTime: '2024-01-27 11:45:00',
    likes: 32,
    isLiked: false,
    comments: [],
    tags: ['Python', '数据分析', '学习心得'],
    showComments: false,
    commentText: ''
  }
])

// 热门话题
const hotTopics = ref([
  { id: 1, rank: 1, name: 'Vue.js 3.0', count: 156 },
  { id: 2, rank: 2, name: 'React 18', count: 142 },
  { id: 3, rank: 3, name: 'Python数据分析', count: 98 },
  { id: 4, rank: 4, name: '前端工程化', count: 87 },
  { id: 5, rank: 5, name: '机器学习', count: 76 }
])

// 学习小组
const studyGroups = ref([
  {
    id: 1,
    name: 'Vue.js学习小组',
    description: '专注于Vue.js技术的学习和交流',
    avatar: 'https://picsum.photos/100/100?random=1',
    memberCount: 156,
    isJoined: true
  },
  {
    id: 2,
    name: 'React技术交流',
    description: 'React技术深度讨论和实践分享',
    avatar: 'https://picsum.photos/100/100?random=2',
    memberCount: 203,
    isJoined: false
  },
  {
    id: 3,
    name: 'Python数据分析',
    description: 'Python数据分析技术学习和项目实践',
    avatar: 'https://picsum.photos/100/100?random=3',
    memberCount: 98,
    isJoined: false
  }
])

// 计算属性
const filteredPosts = computed(() => {
  if (activeTab.value === 'all') {
    return posts.value
  }
  return posts.value.filter(post => post.type === activeTab.value)
})

// 方法
const handleTabChange = () => {
  // 切换标签页
}

const toggleLike = (post) => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }
  
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
  
  ElMessage.success(post.isLiked ? '点赞成功' : '取消点赞')
}

const showComments = (post) => {
  post.showComments = !post.showComments
}

const addComment = (post) => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (!post.commentText.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  const newComment = {
    id: Date.now(),
    content: post.commentText,
    author: {
      name: authStore.user?.name || '匿名用户',
      avatar: authStore.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous'
    },
    createTime: new Date().toISOString()
  }
  
  post.comments.push(newComment)
  post.commentText = ''
  
  ElMessage.success('评论发布成功')
}

const publishPost = async () => {
  try {
    await postFormRef.value.validate()
    
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      return
    }
    
    const newPost = {
      id: Date.now(),
      type: postForm.type,
      title: postForm.title,
      content: postForm.content,
      author: {
        name: authStore.user?.name || '匿名用户',
        avatar: authStore.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous'
      },
      createTime: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      comments: [],
      tags: postForm.tags,
      showComments: false,
      commentText: ''
    }
    
    posts.value.unshift(newPost)
    
    ElMessage.success('动态发布成功')
    showPostModal.value = false
    
    // 重置表单
    postForm.type = 'discussion'
    postForm.title = ''
    postForm.content = ''
    postForm.tags = []
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const joinGroup = (group) => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }
  
  group.isJoined = true
  group.memberCount += 1
  
  ElMessage.success(`成功加入${group.name}`)
}

const getPostTypeText = (type) => {
  const typeMap = {
    'discussion': '讨论',
    'qa': '问答',
    'share': '分享'
  }
  return typeMap[type] || '动态'
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 组件挂载时
onMounted(() => {
  console.log('学习社区页面已加载')
})
</script>

<style scoped>
.community-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  padding-top: 80px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 2.5rem;
  color: #667eea;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

/* 主布局 */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
  align-items: start;
}

/* 左侧区域 */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 筛选区域 */
.filter-section {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

/* 动态列表 */
.posts-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.post-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.post-time {
  font-size: 0.85rem;
  color: #999;
}

.post-content {
  margin-bottom: 20px;
}

.post-type {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 15px;
}

.post-type.discussion {
  background: #e3f2fd;
  color: #1976d2;
}

.post-type.qa {
  background: #f3e5f5;
  color: #7b1fa2;
}

.post-type.share {
  background: #e8f5e8;
  color: #388e3c;
}

.post-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
}

.post-text {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* 标签 */
.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.tag-item {
  border-radius: 16px;
}

/* 动态底部 */
.post-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.post-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  color: #666;
}

.stat-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.stat-item .el-icon {
  font-size: 1.1rem;
}

.stat-item .el-icon.liked {
  color: #f56c6c;
}

/* 评论区 */
.comments-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
  margin-top: 20px;
}

.comment-input {
  margin-bottom: 20px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
}

.comment-content {
  flex: 1;
}

.comment-author {
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.comment-text {
  color: #666;
  line-height: 1.5;
  margin-bottom: 6px;
}

.comment-time {
  font-size: 0.8rem;
  color: #999;
}

/* 右侧边栏 */
.right-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.sidebar-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px 25px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.card-icon {
  color: #667eea;
}

.card-content {
  padding: 25px;
}

/* 热门话题 */
.topic-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.topic-item:hover {
  background: #f8f9fa;
}

.topic-rank {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.topic-info {
  flex: 1;
}

.topic-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.topic-count {
  font-size: 0.85rem;
  color: #666;
}

/* 学习小组 */
.group-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.group-item:hover {
  border-color: #667eea;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
}

.group-info {
  flex: 1;
}

.group-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.group-desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.group-members {
  font-size: 0.8rem;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .right-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .page-header {
    padding: 20px 0;
    margin-bottom: 20px;
  }
  
  .page-title {
    font-size: 2.2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .post-card {
    padding: 20px;
  }
  
  .card-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .post-stats {
    gap: 20px;
  }
  
  .stat-item {
    padding: 6px 8px;
  }
}
</style>
