<template>
  <div class="config-panel">
    <el-form 
      ref="formRef"
      :model="formData" 
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item
        v-for="param in config.parameters"
        :key="param.key"
        :label="param.label"
        :prop="param.key"
      >
        <!-- 选择框 -->
        <el-select
          v-if="param.type === 'select'"
          v-model="formData[param.key]"
          :placeholder="param.placeholder"
          style="width: 100%"
        >
          <el-option
            v-for="option in param.options"
            :key="option"
            :label="option"
            :value="option"
          />
        </el-select>

        <!-- 文本框 -->
        <el-input
          v-else-if="param.type === 'input'"
          v-model="formData[param.key]"
          :placeholder="param.placeholder"
        />

        <!-- 文本域 -->
        <el-input
          v-else-if="param.type === 'textarea'"
          v-model="formData[param.key]"
          :placeholder="param.placeholder"
          :rows="param.rows || 3"
          type="textarea"
        />

        <!-- 数字输入框 -->
        <el-input-number
          v-else-if="param.type === 'number'"
          v-model="formData[param.key]"
          :placeholder="param.placeholder"
          :min="param.min"
          :max="param.max"
          :step="param.step || 50"
          style="width: 100%"
        />

        <!-- 开关 -->
        <div v-else-if="param.type === 'switch'" class="switch-wrapper">
          <el-switch
            v-model="formData[param.key]"
            active-text="启用"
            inactive-text="禁用"
          />
          <span v-if="param.description" class="switch-description">
            {{ param.description }}
          </span>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          style="width: 100%"
          size="large"
        >
          <el-icon><Promotion /></el-icon>
          开始生成文章
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Promotion } from '@element-plus/icons-vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const formData = reactive({})

// 动态生成验证规则
const rules = reactive({})

// 初始化表单数据和验证规则
function initForm() {
  props.config.parameters.forEach(param => {
    // 根据类型设置初始值
    if (param.type === 'switch') {
      formData[param.key] = param.default !== undefined ? param.default : false
    } else if (param.type === 'number') {
      formData[param.key] = param.default !== undefined ? param.default : null
    } else {
      formData[param.key] = param.default !== undefined ? param.default : ''
    }
    
    if (param.required) {
      rules[param.key] = [
        { required: true, message: `请填写${param.label}`, trigger: 'blur' }
      ]
    }
  })
}

initForm()

watch(() => props.config, () => {
  initForm()
}, { deep: true })

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...formData })
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}
</script>

<style scoped>
.config-panel {
  padding: 16px 0;
}

.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-description {
  color: #909399;
  font-size: 12px;
}
</style>

