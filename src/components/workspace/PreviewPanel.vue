<template>
  <div class="preview-panel">
    <!-- 进度展示 -->
    <div v-if="isGenerating" class="progress-section">
      <div class="progress-header">
        <h3>生成进度</h3>
        <el-progress :percentage="progress" :stroke-width="8" />
      </div>
      
      <div class="current-step">
        <el-icon class="loading-icon is-loading"><Loading /></el-icon>
        <div class="step-info">
          <h4>{{ currentStep?.name }}</h4>
          <p>{{ progressMessage }}</p>
        </div>
      </div>

      <el-divider />
    </div>

    <!-- 中间结果展示 -->
    <div v-if="hasIntermediateResults" class="results-section">
      <!-- 用户画像 -->
      <div v-if="intermediateResults.userProfile" class="result-card">
        <div class="card-header">
          <el-icon><User /></el-icon>
          <h4>目标用户画像</h4>
        </div>
        <div class="card-content">
          <p class="user-profile">{{ intermediateResults.userProfile }}</p>
        </div>
      </div>

      <!-- 共情点 -->
      <div v-if="intermediateResults.empathyPoints" class="result-card">
        <div class="card-header">
          <el-icon><MagicStick /></el-icon>
          <h4>核心共情点</h4>
        </div>
        <div class="card-content">
          <el-tag
            v-for="(point, index) in getEmpathyPoints"
            :key="index"
            class="empathy-tag"
            type="info"
          >
            {{ point.point }}
          </el-tag>
        </div>
      </div>

      <!-- 标题候选 -->
      <div v-if="intermediateResults.titleOptions" class="result-card">
        <div class="card-header">
          <el-icon><Tickets /></el-icon>
          <h4>标题候选 (点击选择)</h4>
        </div>
        <div class="card-content">
          <div
            v-for="(title, index) in getTitleOptions"
            :key="index"
            class="title-option"
            @click="$emit('select-title', title.title)"
          >
            <span class="title-index">{{ index + 1 }}</span>
            <span class="title-text">{{ title.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最终结果 -->
    <div v-if="hasFinalResult" class="final-result">
      <div class="result-header">
        <h2>
          <el-icon><Document /></el-icon>
          生成结果
        </h2>
        <div class="result-actions">
          <el-button :icon="CopyDocument" @click="$emit('copy')">
            复制
          </el-button>
          <el-button type="primary" :icon="Download" @click="$emit('export')">
            导出HTML
          </el-button>
        </div>
      </div>

      <div class="result-content">
        <h1 class="final-title">{{ finalResult.title }}</h1>
        <div class="final-content">{{ finalResult.content }}</div>
        
        <div v-if="finalResult.metadata" class="result-metadata">
          <el-tag size="small">
            耗时: {{ Math.round(finalResult.metadata.duration / 1000) }}秒
          </el-tag>
          <el-tag size="small" type="info">
            {{ finalResult.metadata.modelUsed }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!isGenerating && !hasIntermediateResults && !hasFinalResult"
      description="填写参数后开始生成文章"
      :image-size="200"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Loading, User, MagicStick, Tickets, Document,
  CopyDocument, Download
} from '@element-plus/icons-vue'

const props = defineProps({
  isGenerating: Boolean,
  currentStep: Object,
  progress: Number,
  intermediateResults: Object,
  finalResult: Object,
  progressMessage: String
})

defineEmits(['export', 'copy', 'select-title'])

const hasIntermediateResults = computed(() => {
  return props.intermediateResults && (
    props.intermediateResults.userProfile ||
    props.intermediateResults.empathyPoints ||
    props.intermediateResults.titleOptions
  )
})

const hasFinalResult = computed(() => {
  return props.finalResult && props.finalResult.title && props.finalResult.content
})

const getEmpathyPoints = computed(() => {
  const points = props.intermediateResults?.empathyPoints
  if (!points) return []
  return points.empathyPoints || []
})

const getTitleOptions = computed(() => {
  const options = props.intermediateResults?.titleOptions
  if (!options) return []
  return options.titles || []
})
</script>

<style scoped>
.preview-panel {
  min-height: 100%;
}

.progress-section {
  margin-bottom: 24px;
}

.progress-header {
  margin-bottom: 20px;
}

.progress-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}

.current-step {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.loading-icon {
  font-size: 32px;
  color: #409eff;
  flex-shrink: 0;
}

.step-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}

.step-info p {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.results-section {
  margin-bottom: 24px;
}

.result-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.card-content {
  color: #606266;
  line-height: 1.8;
}

.user-profile {
  margin: 0;
  white-space: pre-wrap;
}

.empathy-tag {
  margin: 4px 8px 4px 0;
  font-size: 13px;
}

.title-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.title-option:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.title-index {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.title-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.6;
}

.final-result {
  background: white;
  border: 2px solid #67c23a;
  border-radius: 12px;
  padding: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.result-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-content {
  background: #f9fafb;
  border-radius: 8px;
  padding: 24px;
}

.final-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 20px;
  line-height: 1.4;
}

.final-content {
  font-size: 16px;
  line-height: 2;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.result-metadata {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
}
</style>

