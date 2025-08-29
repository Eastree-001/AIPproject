<template>
  <el-dialog
    v-model="visible"
    title="创建新课程"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="课程标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入课程标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="课程描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入课程描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="讲师姓名" prop="instructor">
            <el-input
              v-model="form.instructor"
              placeholder="请输入讲师姓名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程时长" prop="duration">
            <el-input-number
              v-model="form.duration"
              :min="1"
              :max="9999"
              placeholder="分钟"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="难度等级" prop="difficulty">
            <el-select
              v-model="form.difficulty"
              placeholder="请选择难度等级"
              style="width: 100%"
            >
              <el-option label="入门 (1级)" :value="1" />
              <el-option label="初级 (2级)" :value="2" />
              <el-option label="中级 (3级)" :value="3" />
              <el-option label="高级 (4级)" :value="4" />
              <el-option label="专家 (5级)" :value="5" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程分类" prop="category">
            <el-select
              v-model="form.category"
              placeholder="请选择课程分类"
              style="width: 100%"
            >
              <el-option label="前端开发" value="前端开发" />
              <el-option label="后端开发" value="后端开发" />
              <el-option label="移动开发" value="移动开发" />
              <el-option label="数据科学" value="数据科学" />
              <el-option label="人工智能" value="人工智能" />
              <el-option label="云计算" value="云计算" />
              <el-option label="网络安全" value="网络安全" />
              <el-option label="产品设计" value="产品设计" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="课程价格" prop="price">
        <el-input-number
          v-model="form.price"
          :min="0"
          :max="9999"
          :precision="2"
          placeholder="元"
          style="width: 200px"
        />
        <span style="margin-left: 10px; color: #909399;">元</span>
      </el-form-item>

      <el-form-item label="课程标签">
        <el-tag
          v-for="tag in form.tags"
          :key="tag"
          closable
          @close="removeTag(tag)"
          style="margin-right: 8px; margin-bottom: 8px;"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="tagInputVisible"
          ref="tagInputRef"
          v-model="tagInputValue"
          size="small"
          style="width: 100px;"
          @keyup.enter="addTag"
          @blur="addTag"
        />
        <el-button
          v-else
          size="small"
          @click="showTagInput"
        >
          + 添加标签
        </el-button>
      </el-form-item>

      <el-form-item label="先修要求">
        <div v-for="(req, index) in form.requirements" :key="index" style="margin-bottom: 8px;">
          <el-input
            v-model="form.requirements[index]"
            placeholder="请输入先修要求"
            style="width: calc(100% - 40px); margin-right: 8px;"
          />
          <el-button
            type="danger"
            size="small"
            @click="removeRequirement(index)"
            :icon="Delete"
          />
        </div>
        <el-button
          type="primary"
          size="small"
          @click="addRequirement"
          :icon="Plus"
        >
          添加要求
        </el-button>
      </el-form-item>

      <el-form-item label="学习目标">
        <div v-for="(obj, index) in form.learningObjectives" :key="index" style="margin-bottom: 8px;">
          <el-input
            v-model="form.learningObjectives[index]"
            placeholder="请输入学习目标"
            style="width: calc(100% - 40px); margin-right: 8px;"
          />
          <el-button
            type="danger"
            size="small"
            @click="removeLearningObjective(index)"
            :icon="Delete"
          />
        </div>
        <el-button
          type="primary"
          size="small"
          @click="addLearningObjective"
          :icon="Plus"
        >
          添加目标
        </el-button>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="loading"
        >
          创建课程
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { courseAPI } from '@/services/n8n-api.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref()
const tagInputRef = ref()
const tagInputVisible = ref(false)
const tagInputValue = ref('')

// 表单数据
const form = reactive({
  title: '',
  description: '',
  instructor: '',
  duration: 60,
  difficulty: 1,
  category: '',
  price: 0,
  tags: [],
  requirements: [''],
  learningObjectives: ['']
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入课程标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入课程描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  instructor: [
    { required: true, message: '请输入讲师姓名', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入课程时长', trigger: 'blur' },
    { type: 'number', min: 1, message: '课程时长至少为1分钟', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择课程分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入课程价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能为负数', trigger: 'blur' }
  ]
}

// 监听父组件传入的 modelValue
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 标签相关方法
const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const addTag = () => {
  const value = tagInputValue.value.trim()
  if (value && !form.tags.includes(value)) {
    form.tags.push(value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const removeTag = (tag) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

// 先修要求相关方法
const addRequirement = () => {
  form.requirements.push('')
}

const removeRequirement = (index) => {
  if (form.requirements.length > 1) {
    form.requirements.splice(index, 1)
  }
}

// 学习目标相关方法
const addLearningObjective = () => {
  form.learningObjectives.push('')
}

const removeLearningObjective = (index) => {
  if (form.learningObjectives.length > 1) {
    form.learningObjectives.splice(index, 1)
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    instructor: '',
    duration: 60,
    difficulty: 1,
    category: '',
    price: 0,
    tags: [],
    requirements: [''],
    learningObjectives: ['']
  })
  formRef.value?.resetFields()
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    // 过滤空的要求和目标
    const filteredRequirements = form.requirements.filter(req => req.trim())
    const filteredObjectives = form.learningObjectives.filter(obj => obj.trim())

    // 准备提交数据
    const submitData = {
      ...form,
      requirements: filteredRequirements,
      learningObjectives: filteredObjectives
    }

    // 调用 n8n 工作流 API
    const response = await courseAPI.createCourse(submitData)

    if (response.success) {
      ElMessage.success('课程创建成功！')
      emit('success')
      handleClose()
    } else {
      throw new Error(response.error || '创建失败')
    }
  } catch (error) {
    console.error('创建课程失败:', error)
    ElMessage.error(error.response?.data?.error || error.message || '创建课程失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-tag) {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>