import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWorkflowStore = defineStore('workflow', () => {
  // 当前步骤
  const currentStep = ref(0)
  
  // 步骤列表
  const steps = ref([
    { id: 'params', name: '参数收集', status: 'pending', description: '填写创作参数' },
    { id: 'knowledge', name: '知识库检索', status: 'pending', description: 'AI生成模拟数据' },
    { id: 'profile', name: '用户画像', status: 'pending', description: '生成目标用户' },
    { id: 'empathy', name: '共情点提取', status: 'pending', description: '提取核心痛点' },
    { id: 'article', name: '文章生成', status: 'pending', description: '撰写文案内容' },
    { id: 'titles', name: '标题优化', status: 'pending', description: '生成标题候选' },
    { id: 'compliance', name: '违禁词审核', status: 'pending', description: '合规性检查' },
    { id: 'formatting', name: '格式调整', status: 'pending', description: '优化排版' }
  ])
  
  // 用户输入的参数
  const parameters = ref({})
  
  // 中间结果
  const intermediateResults = ref({
    popularArticles: null,      // 爆文库
    keywords: null,              // 关键词库
    rtb: null,                   // RTB话术库
    userProfile: '',             // 用户画像
    empathyPoints: null,         // 共情点
    article: '',                 // 文章正文
    titleOptions: null,          // 标题候选
    selectedTitle: '',           // 选中的标题
    complianceResult: null,      // 违禁词审核结果
    formattedResult: null        // 格式化结果
  })
  
  // 最终结果
  const finalResult = ref({
    title: '',
    content: '',
    metadata: {
      generatedAt: null,
      duration: 0,
      modelUsed: 'claude-sonnet-4.5'
    }
  })
  
  // 生成开始时间
  const startTime = ref(null)
  
  // 设置参数
  function setParameters(params) {
    parameters.value = { ...parameters.value, ...params }
  }
  
  // 更新步骤状态
  function updateStepStatus(stepId, status) {
    const step = steps.value.find(s => s.id === stepId)
    if (step) {
      step.status = status
    }
  }
  
  // 前进到下一步
  function nextStep() {
    if (currentStep.value < steps.value.length - 1) {
      currentStep.value++
    }
  }
  
  // 设置当前步骤
  function setCurrentStep(stepIndex) {
    currentStep.value = stepIndex
  }
  
  // 保存中间结果
  function saveIntermediateResult(key, value) {
    intermediateResults.value[key] = value
  }
  
  // 设置最终结果
  function setFinalResult(result) {
    finalResult.value = {
      ...finalResult.value,
      ...result,
      metadata: {
        ...finalResult.value.metadata,
        generatedAt: new Date().toISOString(),
        duration: startTime.value ? Date.now() - startTime.value : 0
      }
    }
  }
  
  // 开始生成流程
  function startGeneration() {
    startTime.value = Date.now()
    currentStep.value = 0
    steps.value.forEach(step => {
      step.status = 'pending'
    })
  }
  
  // 重置工作流
  function resetWorkflow() {
    currentStep.value = 0
    parameters.value = {}
    intermediateResults.value = {
      popularArticles: null,
      keywords: null,
      rtb: null,
      userProfile: '',
      empathyPoints: null,
      article: '',
      titleOptions: null,
      selectedTitle: '',
      complianceResult: null,
      formattedResult: null
    }
    finalResult.value = {
      title: '',
      content: '',
      metadata: {
        generatedAt: null,
        duration: 0,
        modelUsed: 'claude-sonnet-4.5'
      }
    }
    steps.value.forEach(step => {
      step.status = 'pending'
    })
    startTime.value = null
  }
  
  // Computed
  const currentStepInfo = computed(() => steps.value[currentStep.value])
  const isWorkflowComplete = computed(() => 
    steps.value.every(step => step.status === 'completed')
  )
  const completedStepsCount = computed(() => 
    steps.value.filter(step => step.status === 'completed').length
  )
  const workflowProgress = computed(() => 
    Math.round((completedStepsCount.value / steps.value.length) * 100)
  )
  
  return {
    // State
    currentStep,
    steps,
    parameters,
    intermediateResults,
    finalResult,
    startTime,
    
    // Getters
    currentStepInfo,
    isWorkflowComplete,
    completedStepsCount,
    workflowProgress,
    
    // Actions
    setParameters,
    updateStepStatus,
    nextStep,
    setCurrentStep,
    saveIntermediateResult,
    setFinalResult,
    startGeneration,
    resetWorkflow
  }
})

