import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 当前业务类型
  const currentBusiness = ref('bookbag')
  
  // 全局加载状态
  const isLoading = ref(false)
  const loadingText = ref('')
  
  // Excel数据
  const excelData = ref([])
  const excelLoadingProgress = ref(0)
  const excelLoaded = ref(false)
  
  // 业务配置
  const businessConfig = ref(null)
  
  // 设置加载状态
  function setLoading(loading, text = '') {
    isLoading.value = loading
    loadingText.value = text
  }
  
  // 设置Excel加载进度
  function setExcelProgress(progress) {
    excelLoadingProgress.value = progress
  }
  
  // 设置Excel数据
  function setExcelData(data) {
    excelData.value = data
    excelLoaded.value = true
  }
  
  // 设置业务配置
  function setBusinessConfig(config) {
    businessConfig.value = config
  }
  
  // 切换业务类型
  function switchBusiness(businessKey) {
    currentBusiness.value = businessKey
  }
  
  // 重置应用状态
  function resetApp() {
    isLoading.value = false
    loadingText.value = ''
    // 保留excelData，避免重复加载
  }
  
  // Computed
  const hasExcelData = computed(() => excelData.value.length > 0)
  
  return {
    // State
    currentBusiness,
    isLoading,
    loadingText,
    excelData,
    excelLoadingProgress,
    excelLoaded,
    businessConfig,
    
    // Getters
    hasExcelData,
    
    // Actions
    setLoading,
    setExcelProgress,
    setExcelData,
    setBusinessConfig,
    switchBusiness,
    resetApp
  }
})

