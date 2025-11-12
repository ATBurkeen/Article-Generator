<template>
  <div class="workspace">
    <!-- 头部 -->
    <div class="workspace-header">
      <div class="header-content">
        <h1 class="title">
          <el-icon><EditPen /></el-icon>
          {{ appStore.businessConfig?.businessName || 'Bayestone Creator' }}
        </h1>
        <div class="header-actions">
          <el-upload
            v-if="!appStore.excelLoaded"
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            @change="handleExcelUpload"
          >
            <el-button type="primary" :icon="Upload">
              上传Excel数据
            </el-button>
          </el-upload>
          <el-tag v-else type="success" :icon="SuccessFilled">
            数据已加载 ({{appStore.excelData.length}}条)
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="workspace-body">
      <!-- 左侧配置区 -->
      <div class="left-panel">
        <el-scrollbar height="100%">
          <div class="panel-content">
            <!-- 参数配置 -->
            <el-collapse v-model="activeCollapse" accordion>
              <el-collapse-item name="params" title="📝 步骤1: 参数配置">
                <ConfigPanel 
                  v-if="appStore.businessConfig"
                  :config="appStore.businessConfig"
                  @submit="handleParametersSubmit"
                />
              </el-collapse-item>
            </el-collapse>

            <!-- 历史记录 -->
            <div class="history-section">
              <h3 class="section-title">
                <el-icon><Clock /></el-icon>
                历史记录
              </h3>
              <HistoryList 
                @load="handleLoadHistory"
                @delete="handleDeleteHistory"
              />
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 右侧预览区 -->
      <div class="right-panel">
        <el-scrollbar height="100%">
          <div class="panel-content">
            <PreviewPanel 
              :is-generating="isGenerating"
              :current-step="workflowStore.currentStepInfo"
              :progress="workflowStore.workflowProgress"
              :intermediate-results="workflowStore.intermediateResults"
              :final-result="workflowStore.finalResult"
              :progress-message="progressMessage"
              @export="handleExport"
              @copy="handleCopy"
              @select-title="handleSelectTitle"
            />
          </div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 全局加载 -->
    <el-dialog 
      v-model="appStore.isLoading" 
      :show-close="false"
      :close-on-click-modal="false"
      width="400px"
    >
      <div class="loading-dialog">
        <el-icon class="loading-icon is-loading"><Loading /></el-icon>
        <p>{{ appStore.loadingText }}</p>
        <el-progress 
          v-if="appStore.excelLoadingProgress > 0"
          :percentage="appStore.excelLoadingProgress" 
          :stroke-width="8"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {EditPen, Upload, SuccessFilled, Clock, Loading  } from '@element-plus/icons-vue'

import { useAppStore } from '../stores/app'
import { useWorkflowStore } from '../stores/workflow'
import { useHistoryStore } from '../stores/history'

import { useExcel } from '../composables/useExcel'
import { useHistory } from '../composables/useHistory'
import { useExport } from '../composables/useExport'

import { WorkflowOrchestrator } from '../utils/workflowOrchestrator'

import ConfigPanel from '../components/workspace/ConfigPanel.vue'
import PreviewPanel from '../components/workspace/PreviewPanel.vue'
import HistoryList from '../components/history/HistoryList.vue'

const appStore = useAppStore()
const workflowStore = useWorkflowStore()
const historyStore = useHistoryStore()

const { loadExcel, initializeSearchIndex } = useExcel()
const { saveRecord } = useHistory()
const { exportToHTML, copyToClipboard } = useExport()

const activeCollapse = ref('params')
const isGenerating = ref(false)
const progressMessage = ref('')

const orchestrator = new WorkflowOrchestrator()

// 设置工作流回调
orchestrator.setProgressCallback((progress) => {
  progressMessage.value = progress.message
})

orchestrator.setStepCompleteCallback((stepId, data) => {
  console.log(`步骤完成: ${stepId}`, data)
})

/**
 * 处理Excel上传
 */
async function handleExcelUpload(file) {
  appStore.setLoading(true, '正在加载Excel文件...')
  
  try {
    const data = await loadExcel(file.raw)
    appStore.setExcelData(data)
    
    // 初始化搜索索引
    const searchFields = appStore.businessConfig.dataSource.searchFields
    initializeSearchIndex(data, searchFields)
    
    ElMessage.success(`成功加载 ${data.length} 条数据`)
  } catch (error) {
    ElMessage.error('Excel加载失败: ' + error.message)
  } finally {
    appStore.setLoading(false)
  }
}

/**
 * 处理参数提交
 */
async function handleParametersSubmit(params) {
  // 检查是否已加载Excel（可选）
  // if (!appStore.excelLoaded) {
  //   ElMessage.warning('请先上传Excel数据文件')
  //   return
  // }
  
  // 保存参数
  workflowStore.setParameters(params)
  
  // 确认开始生成
  try {
    await ElMessageBox.confirm(
      '确认开始生成文章吗？整个流程大约需要2分钟。',
      '开始生成',
      {
        confirmButtonText: '开始',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // 开始生成
    await startGeneration()
  } catch {
    // 用户取消
  }
}

/**
 * 开始生成流程
 */
async function startGeneration() {
  isGenerating.value = true
  progressMessage.value = '正在初始化...'
  
  try {
    await orchestrator.executeWorkflow()
    
    // 保存到历史记录
    const record = {
      businessType: appStore.currentBusiness,
      parameters: workflowStore.parameters,
      result: {
        title: workflowStore.finalResult.title,
        content: workflowStore.finalResult.content,
        userProfile: workflowStore.intermediateResults.userProfile,
        keywords: workflowStore.intermediateResults.keywords,
        empathyPoints: workflowStore.intermediateResults.empathyPoints
      },
      metadata: workflowStore.finalResult.metadata
    }
    
    const recordId = historyStore.addRecord(record)
    await saveRecord(historyStore.getRecord(recordId))
    
    ElMessage.success('🎉 文章生成完成！')
  } catch (error) {
    ElMessage.error('生成失败: ' + error.message)
    console.error(error)
  } finally {
    isGenerating.value = false
  }
}

/**
 * 导出HTML
 */
async function handleExport() {
  try {
    await exportToHTML(workflowStore.finalResult)
    ElMessage.success('导出成功！')
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  }
}

/**
 * 复制到剪贴板
 */
async function handleCopy() {
  const text = `${workflowStore.finalResult.title}\n\n${workflowStore.finalResult.content}`
  const success = await copyToClipboard(text)
  
  if (success) {
    ElMessage.success('已复制到剪贴板')
  } else {
    ElMessage.error('复制失败')
  }
}

/**
 * 选择标题
 */
function handleSelectTitle(title) {
  workflowStore.saveIntermediateResult('selectedTitle', title)
  ElMessage.success('已选择标题')
}

/**
 * 加载历史记录
 */
function handleLoadHistory(record) {
  workflowStore.resetWorkflow()
  workflowStore.setParameters(record.parameters)
  workflowStore.saveIntermediateResult('userProfile', record.result.userProfile)
  workflowStore.saveIntermediateResult('keywords', record.result.keywords)
  workflowStore.saveIntermediateResult('empathyPoints', record.result.empathyPoints)
  workflowStore.setFinalResult({
    title: record.result.title,
    content: record.result.content
  })
  
  ElMessage.success('已加载历史记录')
}

/**
 * 删除历史记录
 */
async function handleDeleteHistory(id) {
  try {
    await ElMessageBox.confirm('确认删除这条历史记录吗？', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    historyStore.deleteRecord(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.workspace {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.workspace-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 16px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.workspace-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 30%;
  min-width: 350px;
  max-width: 450px;
  background: white;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
}

.right-panel {
  flex: 1;
  background: white;
  overflow: hidden;
}

.panel-content {
  padding: 20px;
}

.history-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-dialog {
  text-align: center;
  padding: 20px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.loading-dialog p {
  margin-bottom: 16px;
  color: #606266;
}
</style>

